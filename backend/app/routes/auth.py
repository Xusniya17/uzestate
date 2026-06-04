from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, RefreshToken, OTPCode
from app.schemas.user import (
    UserRegister, UserLogin, TokenResponse, UserResponse,
    VerifyEmail, VerifyPhone, ForgotPassword, ResetPassword, RefreshTokenRequest
)
from app.utils.security import (
    hash_password, verify_password, create_access_token,
    create_refresh_token, verify_token, generate_otp, generate_reset_token
)
from app.services.email_service import send_verification_email, send_reset_password_email
from app.services.sms_service import send_verification_sms
from app.config import settings
import uuid

router = APIRouter(prefix="/auth", tags=["Authentication"])


def get_current_user(token: str, db: Session) -> User:
    payload = verify_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    return user


@router.post("/register", response_model=dict, status_code=201)
async def register(
    data: UserRegister,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Bu email allaqachon ro'yxatdan o'tgan")

    if data.phone and db.query(User).filter(User.phone == data.phone).first():
        raise HTTPException(status_code=400, detail="Bu telefon raqami allaqachon ro'yxatdan o'tgan")

    user = User(
        id=str(uuid.uuid4()),
        email=data.email,
        phone=data.phone,
        first_name=data.first_name,
        last_name=data.last_name,
        password_hash=hash_password(data.password),
        language=data.language or "uz",
        role="agent" if getattr(data, "user_type", None) == "seller" else "user",
    )
    db.add(user)
    db.commit()

    otp_code = generate_otp()
    otp = OTPCode(
        id=str(uuid.uuid4()),
        target=data.email,
        code=otp_code,
        type="email",
        purpose="verify",
        expires_at=datetime.utcnow() + timedelta(minutes=10),
    )
    db.add(otp)
    db.commit()

    background_tasks.add_task(
        send_verification_email,
        data.email,
        data.first_name,
        otp_code,
        data.language or "uz",
    )

    response = {
        "message": "Ro'yxatdan o'tish muvaffaqiyatli! Email manzilingizni tasdiqlang.",
        "email": data.email,
        "dev_otp_code": otp_code,
    }

    return response


@router.post("/verify-email", response_model=TokenResponse)
async def verify_email(data: VerifyEmail, db: Session = Depends(get_db)):
    otp = db.query(OTPCode).filter(
        OTPCode.target == data.email,
        OTPCode.code == data.code,
        OTPCode.type == "email",
        OTPCode.purpose == "verify",
        OTPCode.is_used == False,
        OTPCode.expires_at > datetime.utcnow(),
    ).first()

    if not otp:
        raise HTTPException(status_code=400, detail="Noto'g'ri yoki muddati o'tgan kod")

    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")

    user.is_email_verified = True
    otp.is_used = True
    db.commit()

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token_str = create_refresh_token({"sub": str(user.id)})

    refresh_token = RefreshToken(
        id=str(uuid.uuid4()),
        user_id=user.id,
        token=refresh_token_str,
        expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    db.add(refresh_token)
    db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token_str,
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email yoki parol noto'g'ri")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Hisobingiz bloklangan")

    if not user.is_email_verified:
        raise HTTPException(status_code=403, detail="Email manzilingizni tasdiqlang")

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token_str = create_refresh_token({"sub": str(user.id)})

    refresh_token = RefreshToken(
        id=str(uuid.uuid4()),
        user_id=user.id,
        token=refresh_token_str,
        expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    db.add(refresh_token)
    db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token_str,
        user=UserResponse.model_validate(user),
    )


@router.post("/refresh", response_model=dict)
async def refresh_token(data: RefreshTokenRequest, db: Session = Depends(get_db)):
    payload = verify_token(data.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    stored_token = db.query(RefreshToken).filter(
        RefreshToken.token == data.refresh_token,
        RefreshToken.is_revoked == False,
        RefreshToken.expires_at > datetime.utcnow(),
    ).first()

    if not stored_token:
        raise HTTPException(status_code=401, detail="Token topilmadi yoki muddati o'tgan")

    user = db.query(User).filter(User.id == stored_token.user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Foydalanuvchi topilmadi")

    stored_token.is_revoked = True
    new_access_token = create_access_token({"sub": str(user.id)})
    new_refresh_token_str = create_refresh_token({"sub": str(user.id)})

    new_refresh_token = RefreshToken(
        id=str(uuid.uuid4()),
        user_id=user.id,
        token=new_refresh_token_str,
        expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    db.add(new_refresh_token)
    db.commit()

    return {"access_token": new_access_token, "refresh_token": new_refresh_token_str}


@router.post("/logout", response_model=dict)
async def logout(data: RefreshTokenRequest, db: Session = Depends(get_db)):
    token = db.query(RefreshToken).filter(RefreshToken.token == data.refresh_token).first()
    if token:
        token.is_revoked = True
        db.commit()
    return {"message": "Muvaffaqiyatli chiqildi"}


@router.post("/forgot-password", response_model=dict)
async def forgot_password(
    data: ForgotPassword,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        return {"message": "Agar bu email ro'yxatdan o'tgan bo'lsa, xat yuborildi"}

    reset_token = generate_reset_token()
    otp = OTPCode(
        id=str(uuid.uuid4()),
        target=data.email,
        code=reset_token,
        type="email",
        purpose="reset",
        expires_at=datetime.utcnow() + timedelta(hours=1),
    )
    db.add(otp)
    db.commit()

    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
    background_tasks.add_task(
        send_reset_password_email,
        data.email,
        user.first_name,
        reset_url,
        user.language,
    )

    return {"message": "Parolni tiklash havolasi emailga yuborildi"}


@router.post("/reset-password", response_model=dict)
async def reset_password(data: ResetPassword, db: Session = Depends(get_db)):
    otp = db.query(OTPCode).filter(
        OTPCode.code == data.token,
        OTPCode.type == "email",
        OTPCode.purpose == "reset",
        OTPCode.is_used == False,
        OTPCode.expires_at > datetime.utcnow(),
    ).first()

    if not otp:
        raise HTTPException(status_code=400, detail="Token noto'g'ri yoki muddati o'tgan")

    user = db.query(User).filter(User.email == otp.target).first()
    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")

    user.password_hash = hash_password(data.new_password)
    otp.is_used = True
    db.query(RefreshToken).filter(RefreshToken.user_id == user.id).update({"is_revoked": True})
    db.commit()

    return {"message": "Parol muvaffaqiyatli o'zgartirildi"}


@router.post("/send-sms-otp", response_model=dict)
async def send_sms_otp(
    phone: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    otp_code = generate_otp()
    otp = OTPCode(
        id=str(uuid.uuid4()),
        target=phone,
        code=otp_code,
        type="sms",
        purpose="verify",
        expires_at=datetime.utcnow() + timedelta(minutes=10),
    )
    db.add(otp)
    db.commit()

    background_tasks.add_task(send_verification_sms, phone, otp_code)
    return {"message": "SMS kod yuborildi"}


@router.post("/verify-phone", response_model=dict)
async def verify_phone(data: VerifyPhone, db: Session = Depends(get_db)):
    otp = db.query(OTPCode).filter(
        OTPCode.target == data.phone,
        OTPCode.code == data.code,
        OTPCode.type == "sms",
        OTPCode.purpose == "verify",
        OTPCode.is_used == False,
        OTPCode.expires_at > datetime.utcnow(),
    ).first()

    if not otp:
        raise HTTPException(status_code=400, detail="Noto'g'ri yoki muddati o'tgan kod")

    user = db.query(User).filter(User.phone == data.phone).first()
    if user:
        user.is_phone_verified = True
        otp.is_used = True
        db.commit()

    return {"message": "Telefon raqami muvaffaqiyatli tasdiqlandi"}
