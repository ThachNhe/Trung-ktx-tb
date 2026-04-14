from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies import AdminOrStaffUser, CurrentUser, PaginationQuery
from app.schemas.base_response import BaseResponse
from app.schemas.common import PaginatedData
from app.schemas.notification import CreateNotificationRequest, NotificationResponse
from app.services.notification import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notifications"])


def get_notification_service(db: AsyncSession = Depends(get_db)) -> NotificationService:
    return NotificationService(db)


@router.post(
    "",
    response_model=BaseResponse[NotificationResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Tạo thông báo",
)
async def create_notification(
    payload: CreateNotificationRequest,
    current_user: AdminOrStaffUser,
    service: NotificationService = Depends(get_notification_service),
):
    data = await service.create_notification(current_user, payload)
    return BaseResponse.ok(data=data, message="Tạo thông báo thành công")


@router.get(
    "/me",
    response_model=BaseResponse[PaginatedData[NotificationResponse]],
    summary="Lấy danh sách thông báo theo vai trò",
)
async def list_my_notifications(
    pagination: PaginationQuery,
    current_user: CurrentUser,
    service: NotificationService = Depends(get_notification_service),
):
    data = await service.list_for_user(current_user, pagination)
    return BaseResponse.ok(data=data, message="Lấy danh sách thông báo thành công")