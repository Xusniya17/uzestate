import httpx
from app.config import settings

ESKIZ_TOKEN = None


async def get_eskiz_token() -> str:
    global ESKIZ_TOKEN
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://notify.eskiz.uz/api/auth/login",
            data={"email": settings.ESKIZ_EMAIL, "password": settings.ESKIZ_PASSWORD},
        )
        if response.status_code == 200:
            ESKIZ_TOKEN = response.json()["data"]["token"]
            return ESKIZ_TOKEN
    return ""


SMS_TEMPLATES = {
    "verify_phone": {
        "uz": "UzEstate: Telefon raqamingizni tasdiqlash uchun kod: {code}. Kod 10 daqiqa amal qiladi.",
        "ru": "UzEstate: Код подтверждения номера: {code}. Код действителен 10 минут.",
        "en": "UzEstate: Your phone verification code: {code}. Valid for 10 minutes.",
    },
    "login_otp": {
        "uz": "UzEstate: Kirish kodi: {code}. Kimgadir bermang!",
        "ru": "UzEstate: Код входа: {code}. Никому не сообщайте!",
        "en": "UzEstate: Login code: {code}. Do not share with anyone!",
    },
}


async def send_sms(phone: str, message: str) -> bool:
    token = await get_eskiz_token()
    if not token:
        print(f"[DEV MODE] SMS to {phone}: {message}")
        return True

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://notify.eskiz.uz/api/message/sms/send",
            headers={"Authorization": f"Bearer {token}"},
            data={
                "mobile_phone": phone.replace("+", ""),
                "message": message,
                "from": settings.ESKIZ_FROM,
            },
        )
        return response.status_code == 200


async def send_verification_sms(phone: str, code: str, lang: str = "uz") -> bool:
    template = SMS_TEMPLATES["verify_phone"].get(lang, SMS_TEMPLATES["verify_phone"]["uz"])
    message = template.format(code=code)
    return await send_sms(phone, message)


async def send_login_otp_sms(phone: str, code: str, lang: str = "uz") -> bool:
    template = SMS_TEMPLATES["login_otp"].get(lang, SMS_TEMPLATES["login_otp"]["uz"])
    message = template.format(code=code)
    return await send_sms(phone, message)
