from typing import TypeVar

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.room import Room
from app.models.user import User
from app.schemas.common import PaginatedData, PaginationMeta, RoomSummaryResponse, UserSummaryResponse

T = TypeVar("T")


async def paginate_scalars(
    db: AsyncSession,
    statement,
    page: int,
    limit: int,
):
    total_stmt = select(func.count()).select_from(statement.order_by(None).subquery())
    total = int((await db.execute(total_stmt)).scalar_one())

    result = await db.execute(statement.offset((page - 1) * limit).limit(limit))
    items = list(result.scalars().unique().all())
    return items, total


def build_paginated_data(
    items: list[T],
    page: int,
    limit: int,
    total: int,
) -> PaginatedData[T]:
    return PaginatedData(
        items=items,
        pagination=PaginationMeta.create(page=page, limit=limit, total=total),
    )


def build_user_summary(user: User) -> UserSummaryResponse:
    return UserSummaryResponse.model_validate(user)


def build_room_summary(room: Room) -> RoomSummaryResponse:
    return RoomSummaryResponse(
        id=room.id,
        building_id=room.building_id,
        building_name=room.building.name,
        room_number=room.room_number,
        floor=room.floor,
        room_type=room.room_type,
    )