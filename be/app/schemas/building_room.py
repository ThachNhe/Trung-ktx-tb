from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.constants.enums import BuildingCode, BuildingStatus, RoomStatus, RoomType


class CreateBuildingRequest(BaseModel):
    name: BuildingCode
    total_floors: int = Field(ge=1)
    description: str | None = None
    status: BuildingStatus = BuildingStatus.ACTIVE


class BuildingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: BuildingCode
    total_floors: int
    description: str | None
    status: BuildingStatus


class CreateRoomRequest(BaseModel):
    building_id: int = Field(ge=1)
    room_number: str = Field(min_length=1, max_length=20)
    floor: int = Field(ge=1)
    capacity: int = Field(ge=1)
    room_type: RoomType
    price_per_month: Decimal = Field(gt=0)
    status: RoomStatus = RoomStatus.AVAILABLE

    @field_validator("room_number")
    @classmethod
    def normalize_room_number(cls, value: str) -> str:
        return value.strip().upper()


class UpdateRoomStatusRequest(BaseModel):
    status: RoomStatus


class RoomResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    building_id: int
    room_number: str
    floor: int
    capacity: int
    current_occupancy: int
    room_type: RoomType
    price_per_month: Decimal
    status: RoomStatus