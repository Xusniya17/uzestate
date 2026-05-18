from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime
import re


class UserRegister(BaseModel):
    email: EmailStr
    phone: Optional[str] = None
    first_name: str
    last_name: str
    password: str
    language: Optional[str] = "uz"

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Parol kamida 8 ta belgidan iborat bo'lishi kerak")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Parolda kamida 1 ta katta harf bo'lishi kerak")
        if not re.search(r"[a-z]", v):
            raise ValueError("Parolda kamida 1 ta kichik harf bo'lishi kerak")
        if not re.search(r"\d", v):
            raise ValueError("Parolda kamida 1 ta raqam bo'lishi kerak")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v):
        if v and not re.match(r"^\+998[0-9]{9}$", v):
            raise ValueError("Telefon raqami +998XXXXXXXXX formatida bo'lishi kerak")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    phone: Optional[str]
    first_name: str
    last_name: str
    avatar_url: Optional[str]
    role: str
    is_email_verified: bool
    is_phone_verified: bool
    language: str
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    language: Optional[str] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Parol kamida 8 ta belgidan iborat bo'lishi kerak")
        return v


class ForgotPassword(BaseModel):
    email: EmailStr


class ResetPassword(BaseModel):
    token: str
    new_password: str


class VerifyEmail(BaseModel):
    email: EmailStr
    code: str


class VerifyPhone(BaseModel):
    phone: str
    code: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class RefreshTokenRequest(BaseModel):
    refresh_token: str
