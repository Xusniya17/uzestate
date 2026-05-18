from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate, PasswordChange
from app.utils.security import verify_token, verify_password, hash_password

router = APIRouter(prefix="/users", tags=["Users"])


def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token topilmadi")
    token = authorization.split(" ")[1]
    payload = verify_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Token noto'g'ri")
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Foydalanuvchi topilmadi")
    return user


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_me(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if data.first_name:
        current_user.first_name = data.first_name
    if data.last_name:
        current_user.last_name = data.last_name
    if data.phone:
        existing = db.query(User).filter(User.phone == data.phone, User.id != current_user.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Bu telefon raqami band")
        current_user.phone = data.phone
        current_user.is_phone_verified = False
    if data.language:
        current_user.language = data.language
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/me/change-password", response_model=dict)
async def change_password(
    data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Joriy parol noto'g'ri")
    current_user.password_hash = hash_password(data.new_password)
    db.commit()
    return {"message": "Parol muvaffaqiyatli o'zgartirildi"}


@router.delete("/me", response_model=dict)
async def delete_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current_user.is_active = False
    db.commit()
    return {"message": "Hisobingiz o'chirildi"}
