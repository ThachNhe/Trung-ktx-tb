from fastapi import APIRouter, Depends, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.constants.messages import SuccessMessage
from app.core.database import get_db
from app.core.exception import UnauthorizedException
from app.core.settings import settings
from app.dependencies.auth import CurrentUser
from app.schemas.auth import AuthResponse, LoginRequest, RefreshTokenRequest, RegisterRequest, TokenResponse, UserResponse
from app.schemas.base_response import BaseResponse
from app.services.auth import AuthService
from app.utils.security import clear_auth_cookies, set_auth_cookies

router = APIRouter(prefix="/auth", tags=["Auth"])


def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    return AuthService(db)


@router.post(
    "/register",
    response_model=BaseResponse[AuthResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Đăng ký tài khoản",
)
async def register(
    payload: RegisterRequest,
    response: Response,
    service: AuthService = Depends(get_auth_service),
):
    data = await service.register(payload)
    set_auth_cookies(response, data.tokens.access_token, data.tokens.refresh_token)
    return BaseResponse.ok(data=data, message=SuccessMessage.REGISTER_SUCCESS)


@router.post(
    "/login",
    response_model=BaseResponse[AuthResponse],
    summary="Đăng nhập",
)
async def login(
    payload: LoginRequest,
    response: Response,
    service: AuthService = Depends(get_auth_service),
):
    data = await service.login(payload)
    set_auth_cookies(response, data.tokens.access_token, data.tokens.refresh_token)
    return BaseResponse.ok(data=data, message=SuccessMessage.LOGIN_SUCCESS)


@router.post(
    "/refresh",
    response_model=BaseResponse[TokenResponse],
    summary="Làm mới access token",
)
async def refresh_token(
    request: Request,
    response: Response,
    payload: RefreshTokenRequest | None = None,
    service: AuthService = Depends(get_auth_service),
):
    token_value = (payload.refresh_token if payload else None) or request.cookies.get(
        settings.REFRESH_TOKEN_COOKIE_NAME
    )
    if not token_value:
        raise UnauthorizedException()

    data = await service.refresh_token(RefreshTokenRequest(refresh_token=token_value))
    set_auth_cookies(response, data.access_token, data.refresh_token)
    return BaseResponse.ok(data=data, message=SuccessMessage.TOKEN_REFRESHED)


@router.get(
    "/me",
    response_model=BaseResponse[UserResponse],
    summary="Lấy thông tin cá nhân",
)
async def get_me(
    current_user: CurrentUser,
    service: AuthService = Depends(get_auth_service),
):
    data = await service.get_me(current_user)
    return BaseResponse.ok(data=data, message=SuccessMessage.PROFILE_LOADED)


@router.post(
    "/logout",
    response_model=BaseResponse,
    summary="Đăng xuất",
)
async def logout(response: Response):
    clear_auth_cookies(response)
    return BaseResponse.ok(message=SuccessMessage.LOGOUT_SUCCESS)
