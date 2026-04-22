from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies import AdminUser, PaginationQuery
from app.schemas.auth import CreateUserRequest, UserResponse
from app.schemas.base_response import BaseResponse
from app.schemas.common import PaginatedData
from app.services.auth import AuthService
from app.constants.messages import SuccessMessage
from app.repositories.user import UserRepository

router = APIRouter(prefix="/users", tags=["Users"])


def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    return AuthService(db)


@router.post(
    "",
    response_model=BaseResponse[UserResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Admin tạo tài khoản sinh viên / nhân viên",
)
async def create_user(
    payload: CreateUserRequest,
    _: AdminUser,
    service: AuthService = Depends(get_auth_service),
):
    """
    Admin tạo tài khoản mới.
    - Mật khẩu được tự động sinh ngẫu nhiên.
    - Thông tin đăng nhập (email + mật khẩu) sẽ được gửi qua MailHog.
    - Không hỗ trợ tạo tài khoản admin qua API này.
    """
    user = await service.admin_create_user(payload)
    return BaseResponse.ok(data=user, message=SuccessMessage.USER_CREATED)


@router.get(
    "",
    response_model=BaseResponse[PaginatedData[UserResponse]],
    summary="Admin lấy danh sách người dùng",
)
async def list_users(
    _: AdminUser,
    pagination: PaginationQuery,
    db: AsyncSession = Depends(get_db),
):
    repo = UserRepository(db)
    skip = (pagination.page - 1) * pagination.limit
    users_orm = await repo.get_all(skip=skip, limit=pagination.limit)
    total = await repo.count()

    from app.schemas.common import PaginationMeta
    meta = PaginationMeta.create(page=pagination.page, limit=pagination.limit, total=total)
    users = [UserResponse.model_validate(u) for u in users_orm]
    return BaseResponse.ok(
        data=PaginatedData(items=users, pagination=meta),
        message=SuccessMessage.USER_LIST_LOADED,
    )
