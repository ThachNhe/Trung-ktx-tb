from math import ceil
from typing import Generic, TypeVar
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.constants.enums import BuildingCode, Gender, Nationality, RoomType, UserRole

T = TypeVar("T")


class PaginationParams(BaseModel):
    page: int = 1
    limit: int = 10


class PaginationMeta(BaseModel):
    page: int
    limit: int
    total: int
    total_pages: int

    @classmethod
    def create(cls, page: int, limit: int, total: int) -> "PaginationMeta":
        total_pages = ceil(total / limit) if total else 0
        return cls(page=page, limit=limit, total=total, total_pages=total_pages)


class PaginatedData(BaseModel, Generic[T]):
    items: list[T] = Field(default_factory=list)
    pagination: PaginationMeta


class UserSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    full_name: str
    student_code: str
    email: str
    role: UserRole
    gender: Gender
    nationality: Nationality


class RoomSummaryResponse(BaseModel):
    id: int
    building_id: int
    building_name: BuildingCode
    room_number: str
    floor: int
    room_type: RoomType


class BuildingSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: BuildingCode