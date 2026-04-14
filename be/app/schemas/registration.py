from datetime import date, datetime

from pydantic import BaseModel, Field, field_validator

from app.constants.enums import RoomRegistrationStatus
from app.schemas.common import RoomSummaryResponse, UserSummaryResponse


class CreateRegistrationRequest(BaseModel):
    room_id: int = Field(ge=1)
    start_date: date
    end_date: date

    @field_validator("end_date")
    @classmethod
    def validate_end_date(cls, value: date, info):
        start_date = info.data.get("start_date")
        if start_date and value <= start_date:
            raise ValueError("Ngày kết thúc phải lớn hơn ngày bắt đầu")
        return value


class RegistrationResponse(BaseModel):
    id: int
    student: UserSummaryResponse
    room: RoomSummaryResponse
    start_date: date
    end_date: date
    status: RoomRegistrationStatus
    created_at: datetime