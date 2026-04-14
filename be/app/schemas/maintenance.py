from datetime import datetime

from pydantic import BaseModel, Field

from app.constants.enums import MaintenanceRequestStatus
from app.schemas.common import RoomSummaryResponse, UserSummaryResponse


class CreateMaintenanceRequest(BaseModel):
    room_id: int = Field(ge=1)
    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1)


class UpdateMaintenanceStatusRequest(BaseModel):
    status: MaintenanceRequestStatus


class MaintenanceResponse(BaseModel):
    id: int
    student: UserSummaryResponse
    room: RoomSummaryResponse
    title: str
    description: str
    status: MaintenanceRequestStatus
    created_at: datetime
    resolved_at: datetime | None