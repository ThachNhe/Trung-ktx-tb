from datetime import datetime
import uuid

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator

from app.constants.enums import Gender, Nationality, UserRole


class RegisterRequest(BaseModel):
    full_name: str
    student_code: str
    email: EmailStr
    password: str
    phone: str | None = None
    gender: Gender
    nationality: Nationality = Nationality.VIETNAM

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 2:
            raise ValueError("Họ và tên phải có ít nhất 2 ký tự")
        return value

    @field_validator("student_code")
    @classmethod
    def normalize_student_code(cls, value: str) -> str:
        value = value.strip().upper()
        if len(value) < 3:
            raise ValueError("Mã sinh viên không hợp lệ")
        return value

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Mật khẩu phải có ít nhất 8 ký tự")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()


class RefreshTokenRequest(BaseModel):
    refresh_token: str | None = None


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    full_name: str
    student_code: str
    email: str
    phone: str | None
    role: UserRole
    gender: Gender
    nationality: Nationality
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class AuthResponse(BaseModel):
    user: UserResponse
    tokens: TokenResponse
