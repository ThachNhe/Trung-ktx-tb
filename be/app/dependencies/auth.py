from typing import Annotated
from uuid import UUID

from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.constants.enums import TokenType, UserRole
from app.constants.messages import ErrorMessage
from app.core.database import get_db
from app.core.exception import ForbiddenException, UnauthorizedException
from app.core.settings import settings
from app.models.user import User
from app.repositories.user import UserRepository
from app.utils.security import decode_token


def _extract_access_token(request: Request) -> str | None:
    access_token = request.cookies.get(settings.ACCESS_TOKEN_COOKIE_NAME)
    if access_token:
        return access_token

    authorization_header = request.headers.get("Authorization")
    if authorization_header and authorization_header.lower().startswith("bearer "):
        return authorization_header.split(" ", 1)[1].strip()

    return None


async def get_current_user(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    token = _extract_access_token(request)
    if not token:
        raise UnauthorizedException(ErrorMessage.UNAUTHORIZED)

    token_data = decode_token(token)
    if not token_data or token_data.get("type") != TokenType.ACCESS.value:
        raise UnauthorizedException(ErrorMessage.TOKEN_INVALID)

    try:
        user_id = UUID(str(token_data["sub"]))
    except (KeyError, TypeError, ValueError):
        raise UnauthorizedException(ErrorMessage.TOKEN_INVALID) from None

    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(user_id)

    if not user:
        raise UnauthorizedException(ErrorMessage.USER_NOT_FOUND)

    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def require_role(*roles: UserRole):
    async def _check(current_user: CurrentUser) -> User:
        if current_user.role not in roles:
            raise ForbiddenException(ErrorMessage.FORBIDDEN)
        return current_user

    return _check


AdminOnly = Depends(require_role(UserRole.ADMIN))
AdminUser = Annotated[User, Depends(require_role(UserRole.ADMIN))]
AdminOrStaffUser = Annotated[
    User,
    Depends(require_role(UserRole.ADMIN, UserRole.STAFF)),
]
StudentUser = Annotated[User, Depends(require_role(UserRole.STUDENT))]
