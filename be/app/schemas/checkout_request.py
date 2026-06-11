from datetime import date, datetime

from pydantic import BaseModel, Field, field_validator

from app.constants.enums import CheckoutRequestStatus
from app.schemas.common import RoomSummaryResponse, UserSummaryResponse


class CreateCheckoutRequest(BaseModel):
    registration_id: int = Field(ge=1)
    requested_checkout_date: date
    reason: str = Field(min_length=1)

    @field_validator("requested_checkout_date")
    @classmethod
    def validate_requested_checkout_date(cls, value: date):
        if value < date.today():
            raise ValueError("Ngày trả phòng dự kiến không được ở quá khứ")
        return value


class CheckoutRequestResponse(BaseModel):
    id: int
    registration_id: int
    student: UserSummaryResponse
    room: RoomSummaryResponse
    requested_checkout_date: date
    reason: str
    status: CheckoutRequestStatus
    created_at: datetime
    processed_at: datetime | None
