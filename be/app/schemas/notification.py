from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from app.constants.enums import NotificationTargetRole


class CreateNotificationRequest(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    content: str = Field(min_length=1)
    target_role: NotificationTargetRole


class NotificationResponse(BaseModel):
    id: int
    title: str
    content: str
    target_role: NotificationTargetRole
    created_by: UUID
    creator_name: str
    created_at: datetime