from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field

from app.constants.enums import InvoiceStatus
from app.schemas.common import RoomSummaryResponse, UserSummaryResponse


class CreateInvoiceRequest(BaseModel):
    student_id: UUID
    room_id: int = Field(ge=1)
    month: int = Field(ge=1, le=12)
    year: int = Field(ge=2000)
    electricity_used_kwh: Decimal = Field(ge=0)
    water_used_m3: Decimal = Field(ge=0)
    due_date: date


class InvoiceResponse(BaseModel):
    id: int
    student: UserSummaryResponse
    room: RoomSummaryResponse
    month: int
    year: int
    electricity_used_kwh: Decimal
    water_used_m3: Decimal
    room_fee: Decimal
    electricity_fee: Decimal
    water_fee: Decimal
    total_amount: Decimal
    status: InvoiceStatus
    due_date: date
    paid_at: datetime | None