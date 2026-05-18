import aiosmtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.config import settings


EMAIL_TEMPLATES = {
    "verify_email": {
        "uz": {
            "subject": "UzEstate — Email manzilingizni tasdiqlang",
            "body": """
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9fafb;border-radius:12px">
  <div style="text-align:center;margin-bottom:30px">
    <h1 style="color:#1E40AF;font-size:28px;margin:0">UzEstate</h1>
    <p style="color:#6b7280;margin:5px 0">Ko'chmas mulk narxini baholash tizimi</p>
  </div>
  <div style="background:white;border-radius:8px;padding:30px;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
    <h2 style="color:#111827;margin-top:0">Salom, {name}!</h2>
    <p style="color:#374151">Email manzilingizni tasdiqlash uchun quyidagi kodni kiriting:</p>
    <div style="text-align:center;margin:30px 0">
      <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#1E40AF;background:#EFF6FF;padding:15px 25px;border-radius:8px">{code}</span>
    </div>
    <p style="color:#6b7280;font-size:14px">Bu kod <strong>10 daqiqa</strong> davomida amal qiladi.</p>
    <p style="color:#6b7280;font-size:14px">Agar siz bu so'rovni yubormagan bo'lsangiz, ushbu xatni e'tiborsiz qoldiring.</p>
  </div>
  <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:20px">© 2026 UzEstate. Barcha huquqlar himoyalangan.</p>
</div>
""",
        },
        "ru": {
            "subject": "UzEstate — Подтвердите вашу почту",
            "body": """
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9fafb;border-radius:12px">
  <div style="text-align:center;margin-bottom:30px">
    <h1 style="color:#1E40AF;font-size:28px;margin:0">UzEstate</h1>
    <p style="color:#6b7280;margin:5px 0">Система оценки недвижимости</p>
  </div>
  <div style="background:white;border-radius:8px;padding:30px;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
    <h2 style="color:#111827;margin-top:0">Здравствуйте, {name}!</h2>
    <p style="color:#374151">Введите следующий код для подтверждения email:</p>
    <div style="text-align:center;margin:30px 0">
      <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#1E40AF;background:#EFF6FF;padding:15px 25px;border-radius:8px">{code}</span>
    </div>
    <p style="color:#6b7280;font-size:14px">Код действителен <strong>10 минут</strong>.</p>
  </div>
</div>
""",
        },
        "en": {
            "subject": "UzEstate — Verify your email",
            "body": """
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9fafb;border-radius:12px">
  <div style="text-align:center;margin-bottom:30px">
    <h1 style="color:#1E40AF;font-size:28px;margin:0">UzEstate</h1>
    <p style="color:#6b7280;margin:5px 0">Real Estate Price Estimation System</p>
  </div>
  <div style="background:white;border-radius:8px;padding:30px;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
    <h2 style="color:#111827;margin-top:0">Hello, {name}!</h2>
    <p style="color:#374151">Enter the following code to verify your email:</p>
    <div style="text-align:center;margin:30px 0">
      <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#1E40AF;background:#EFF6FF;padding:15px 25px;border-radius:8px">{code}</span>
    </div>
    <p style="color:#6b7280;font-size:14px">This code is valid for <strong>10 minutes</strong>.</p>
  </div>
</div>
""",
        },
    },
    "reset_password": {
        "uz": {
            "subject": "UzEstate — Parolni tiklash",
            "body": """
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9fafb;border-radius:12px">
  <div style="background:white;border-radius:8px;padding:30px">
    <h2 style="color:#111827">Salom, {name}!</h2>
    <p>Parolni tiklash uchun quyidagi tugmani bosing:</p>
    <div style="text-align:center;margin:30px 0">
      <a href="{reset_url}" style="background:#1E40AF;color:white;padding:14px 30px;border-radius:8px;text-decoration:none;font-weight:bold">Parolni tiklash</a>
    </div>
    <p style="color:#6b7280;font-size:14px">Bu havola <strong>1 soat</strong> davomida amal qiladi.</p>
  </div>
</div>
""",
        },
        "ru": {
            "subject": "UzEstate — Сброс пароля",
            "body": """
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9fafb;border-radius:12px">
  <div style="background:white;border-radius:8px;padding:30px">
    <h2 style="color:#111827">Здравствуйте, {name}!</h2>
    <p>Нажмите кнопку ниже для сброса пароля:</p>
    <div style="text-align:center;margin:30px 0">
      <a href="{reset_url}" style="background:#1E40AF;color:white;padding:14px 30px;border-radius:8px;text-decoration:none;font-weight:bold">Сбросить пароль</a>
    </div>
    <p style="color:#6b7280;font-size:14px">Ссылка действительна <strong>1 час</strong>.</p>
  </div>
</div>
""",
        },
        "en": {
            "subject": "UzEstate — Password Reset",
            "body": """
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9fafb;border-radius:12px">
  <div style="background:white;border-radius:8px;padding:30px">
    <h2 style="color:#111827">Hello, {name}!</h2>
    <p>Click the button below to reset your password:</p>
    <div style="text-align:center;margin:30px 0">
      <a href="{reset_url}" style="background:#1E40AF;color:white;padding:14px 30px;border-radius:8px;text-decoration:none;font-weight:bold">Reset Password</a>
    </div>
    <p style="color:#6b7280;font-size:14px">This link is valid for <strong>1 hour</strong>.</p>
  </div>
</div>
""",
        },
    },
}


async def send_email(to_email: str, subject: str, html_body: str):
    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM}>"
    message["To"] = to_email
    message.attach(MIMEText(html_body, "html", "utf-8"))

    try:
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USERNAME,
            password=settings.SMTP_PASSWORD,
            use_tls=False,
            start_tls=True,
        )
    except Exception as e:
        print(f"Email send error: {e}")


async def send_verification_email(to_email: str, name: str, code: str, lang: str = "uz"):
    template = EMAIL_TEMPLATES["verify_email"].get(lang, EMAIL_TEMPLATES["verify_email"]["uz"])
    body = template["body"].format(name=name, code=code)
    await send_email(to_email, template["subject"], body)


async def send_reset_password_email(to_email: str, name: str, reset_url: str, lang: str = "uz"):
    template = EMAIL_TEMPLATES["reset_password"].get(lang, EMAIL_TEMPLATES["reset_password"]["uz"])
    body = template["body"].format(name=name, reset_url=reset_url)
    await send_email(to_email, template["subject"], body)
