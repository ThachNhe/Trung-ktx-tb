from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.constants.enums import NotificationTargetRole, UserRole
from app.core.exception import NotFoundException
from app.models.notification import Notification
from app.models.user import User
from app.schemas.common import PaginatedData, PaginationParams
from app.schemas.notification import CreateNotificationRequest, NotificationResponse
from app.services.common import build_paginated_data, paginate_scalars


class NotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_notification(
        self,
        creator: User,
        payload: CreateNotificationRequest,
    ) -> NotificationResponse:
        notification = Notification(
            title=payload.title.strip(),
            content=payload.content.strip(),
            target_role=payload.target_role,
            created_by=creator.id,
        )
        self.db.add(notification)
        await self.db.flush()
        notification = await self._get_notification(notification.id)
        return self._to_response(notification)

    async def list_for_user(
        self,
        current_user: User,
        pagination: PaginationParams,
    ) -> PaginatedData[NotificationResponse]:
        statement = (
            select(Notification)
            .options(selectinload(Notification.creator))
            .order_by(Notification.created_at.desc())
        )

        if current_user.role == UserRole.STUDENT:
            statement = statement.where(
                Notification.target_role.in_(
                    [NotificationTargetRole.ALL, NotificationTargetRole.STUDENT]
                )
            )
        elif current_user.role == UserRole.STAFF:
            statement = statement.where(
                Notification.target_role.in_(
                    [NotificationTargetRole.ALL, NotificationTargetRole.STAFF]
                )
            )

        items, total = await paginate_scalars(
            self.db,
            statement,
            pagination.page,
            pagination.limit,
        )
        data = [self._to_response(item) for item in items]
        return build_paginated_data(data, pagination.page, pagination.limit, total)

    async def _get_notification(self, notification_id: int) -> Notification:
        statement = (
            select(Notification)
            .options(selectinload(Notification.creator))
            .where(Notification.id == notification_id)
        )
        result = await self.db.execute(statement)
        notification = result.scalar_one_or_none()
        if not notification:
            raise NotFoundException("Không tìm thấy thông báo")
        return notification

    def _to_response(self, notification: Notification) -> NotificationResponse:
        return NotificationResponse(
            id=notification.id,
            title=notification.title,
            content=notification.content,
            target_role=notification.target_role,
            created_by=notification.created_by,
            creator_name=notification.creator.full_name,
            created_at=notification.created_at,
        )