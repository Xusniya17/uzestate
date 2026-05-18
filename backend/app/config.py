from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    APP_NAME: str = "UzEstate"
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "change-this-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/uzestate_db"
    REDIS_URL: str = "redis://localhost:6379/0"

    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = "noreply@uzestate.uz"
    EMAIL_FROM_NAME: str = "UzEstate"

    ESKIZ_EMAIL: str = ""
    ESKIZ_PASSWORD: str = ""
    ESKIZ_FROM: str = "4546"

    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_BUCKET_NAME: str = "uzestate-files"
    AWS_REGION: str = "us-east-1"

    FRONTEND_URL: str = "http://localhost:3000"

    ADMIN_EMAIL: str = "admin@uzestate.uz"
    ADMIN_PASSWORD: str = "Admin@12345"
    CURRENCY_API_URL: str = "https://cbu.uz/uz/arkhiv-kursov-valyut/json/USD/"

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


settings = Settings()
