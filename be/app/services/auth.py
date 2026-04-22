import secrets
import string
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.constants.enums import TokenType, UserRole
from app.constants.messages import ErrorMessage
from app.core.exception import ConflictException, UnauthorizedException
from app.models.user import User
from app.repositories.user import UserRepository
from app.schemas.auth import AuthResponse, CreateUserRequest, LoginRequest, RefreshTokenRequest, TokenResponse, UserResponse
from app.utils.email import send_account_credentials
from app.utils.security import create_access_token, create_refresh_token, decode_token, hash_password, verify_password


def _generate_password(length: int = 12) -> str:
    """Tự sinh mật khẩu ngẫu nhiên: chữ hoa/thường, số, ký tự đặc biệt."""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    while True:
        password = "".join(secrets.choice(alphabet) for _ in range(length))
        # Đảm bảo có ít nhất 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt
        if (
            any(c.isupper() for c in password)
            and any(c.islower() for c in password)
            and any(c.isdigit() for c in password)
            and any(c in "!@#$%^&*" for c in password)
        ):
            return password


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)

    async def admin_create_user(self, payload: CreateUserRequest) -> UserResponse:
        """Admin tạo tài khoản → tự sinh mật khẩu → gửi email."""
        if await self.user_repo.email_exists(payload.email):
            raise ConflictException(ErrorMessage.EMAIL_ALREADY_EXISTS)

        if await self.user_repo.student_code_exists(payload.student_code):
            raise ConflictException(ErrorMessage.STUDENT_CODE_ALREADY_EXISTS)

        raw_password = _generate_password()

        user = User(
            full_name=payload.full_name,
            student_code=payload.student_code,
            email=payload.email,
            password_hash=hash_password(raw_password),
            phone=payload.phone,
            role=payload.role,
            gender=payload.gender,
            nationality=payload.nationality,
        )
        user = await self.user_repo.create(user)

        # Gửi thông tin đăng nhập qua email (không await - fire-and-forget với log lỗi)
        await send_account_credentials(
            to_email=user.email,
            full_name=user.full_name,
            student_code=user.student_code,
            role=user.role.value,
            password=raw_password,
        )

        return UserResponse.model_validate(user)

    async def login(self, payload: LoginRequest) -> AuthResponse:
        user = await self.user_repo.get_by_email(payload.email)
        if not user or not verify_password(payload.password, user.password_hash):
            raise UnauthorizedException(ErrorMessage.INVALID_CREDENTIALS)

        tokens = self._generate_tokens(user)
        return AuthResponse(user=UserResponse.model_validate(user), tokens=tokens)

    async def refresh_token(self, payload: RefreshTokenRequest) -> TokenResponse:
        token_value = payload.refresh_token
        if not token_value:
            raise UnauthorizedException(ErrorMessage.TOKEN_INVALID)

        token_data = decode_token(token_value)
        if not token_data or token_data.get("type") != TokenType.REFRESH.value:
            raise UnauthorizedException(ErrorMessage.TOKEN_INVALID)

        try:
            user_id = UUID(str(token_data["sub"]))
        except (KeyError, TypeError, ValueError):
            raise UnauthorizedException(ErrorMessage.TOKEN_INVALID) from None

        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise UnauthorizedException(ErrorMessage.USER_NOT_FOUND)

        return self._generate_tokens(user)

    async def get_me(self, user: User) -> UserResponse:
        return UserResponse.model_validate(user)

    def _generate_tokens(self, user: User) -> TokenResponse:
        access_token = create_access_token(
            subject=str(user.id),
            extra={"role": user.role.value, "email": user.email},
        )
        refresh_token = create_refresh_token(subject=str(user.id))
        return TokenResponse(access_token=access_token, refresh_token=refresh_token)

    async def refresh_token(self, payload: RefreshTokenRequest) -> TokenResponse:
        token_value = payload.refresh_token
        if not token_value:
            raise UnauthorizedException(ErrorMessage.TOKEN_INVALID)

        token_data = decode_token(token_value)
        if not token_data or token_data.get("type") != TokenType.REFRESH.value:
            raise UnauthorizedException(ErrorMessage.TOKEN_INVALID)

        try:
            user_id = UUID(str(token_data["sub"]))
        except (KeyError, TypeError, ValueError):
            raise UnauthorizedException(ErrorMessage.TOKEN_INVALID) from None

        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise UnauthorizedException(ErrorMessage.USER_NOT_FOUND)

        return self._generate_tokens(user)

    async def get_me(self, user: User) -> UserResponse:
        return UserResponse.model_validate(user)

    def _generate_tokens(self, user: User) -> TokenResponse:
        access_token = create_access_token(
            subject=str(user.id),
            extra={"role": user.role.value, "email": user.email},
        )
        refresh_token = create_refresh_token(subject=str(user.id))
        return TokenResponse(access_token=access_token, refresh_token=refresh_token)
