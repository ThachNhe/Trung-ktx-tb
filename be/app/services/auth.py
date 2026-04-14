from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.constants.enums import TokenType, UserRole
from app.constants.messages import ErrorMessage
from app.core.exception import ConflictException, UnauthorizedException
from app.models.user import User
from app.repositories.user import UserRepository
from app.schemas.auth import AuthResponse, LoginRequest, RefreshTokenRequest, RegisterRequest, TokenResponse, UserResponse
from app.utils.security import create_access_token, create_refresh_token, decode_token, hash_password, verify_password


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)

    async def register(self, payload: RegisterRequest) -> AuthResponse:
        if await self.user_repo.email_exists(payload.email):
            raise ConflictException(ErrorMessage.EMAIL_ALREADY_EXISTS)

        if await self.user_repo.student_code_exists(payload.student_code):
            raise ConflictException(ErrorMessage.STUDENT_CODE_ALREADY_EXISTS)

        user = User(
            full_name=payload.full_name,
            student_code=payload.student_code,
            email=payload.email,
            password_hash=hash_password(payload.password),
            phone=payload.phone,
            role=UserRole.STUDENT,
            gender=payload.gender,
        )
        user = await self.user_repo.create(user)
        tokens = self._generate_tokens(user)
        return AuthResponse(user=UserResponse.model_validate(user), tokens=tokens)

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

        user = await self.user_repo.get_by_id(UUID(str(token_data["sub"])))
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
