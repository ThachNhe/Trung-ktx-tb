from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.constants.enums import Gender, Nationality, RoomStatus, RoomType
from app.core.exception import BadRequestException, ConflictException, NotFoundException
from app.models.building import Building
from app.models.room import Room
from app.schemas.building_room import (
    BuildingResponse,
    CreateBuildingRequest,
    CreateRoomRequest,
    RoomResponse,
    UpdateRoomStatusRequest,
)
from app.schemas.common import PaginatedData, PaginationParams
from app.services.common import build_paginated_data, paginate_scalars


class BuildingRoomService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_buildings(
        self,
        pagination: PaginationParams,
    ) -> PaginatedData[BuildingResponse]:
        statement = select(Building).order_by(Building.id)
        items, total = await paginate_scalars(
            self.db,
            statement,
            pagination.page,
            pagination.limit,
        )
        data = [BuildingResponse.model_validate(item) for item in items]
        return build_paginated_data(data, pagination.page, pagination.limit, total)

    async def list_rooms_by_building(
        self,
        building_id: int,
        pagination: PaginationParams,
    ) -> PaginatedData[RoomResponse]:
        await self._get_building(building_id)

        statement = (
            select(Room)
            .where(Room.building_id == building_id)
            .order_by(Room.floor, Room.room_number)
        )
        items, total = await paginate_scalars(
            self.db,
            statement,
            pagination.page,
            pagination.limit,
        )
        data = [RoomResponse.model_validate(item) for item in items]
        return build_paginated_data(data, pagination.page, pagination.limit, total)

    async def list_available_rooms(
        self,
        pagination: PaginationParams,
        gender: Gender | None = None,
        nationality: Nationality | None = None,
    ) -> PaginatedData[RoomResponse]:
        statement = (
            select(Room)
            .options(selectinload(Room.building))
            .where(
                Room.status == RoomStatus.AVAILABLE,
                Room.current_occupancy < Room.capacity,
            )
            .order_by(Room.building_id, Room.floor, Room.room_number)
        )

        allowed_room_types: list[RoomType] = []
        if nationality == Nationality.LAOS:
            allowed_room_types = [RoomType.LAOS_STUDENT]
        elif gender == Gender.MALE:
            allowed_room_types = [RoomType.MALE]
        elif gender == Gender.FEMALE:
            allowed_room_types = [RoomType.FEMALE]

        if allowed_room_types:
            statement = statement.where(Room.room_type.in_(allowed_room_types))

        items, total = await paginate_scalars(
            self.db,
            statement,
            pagination.page,
            pagination.limit,
        )
        data = [RoomResponse.model_validate(item) for item in items]
        return build_paginated_data(data, pagination.page, pagination.limit, total)

    async def create_building(self, payload: CreateBuildingRequest) -> BuildingResponse:
        existing = await self.db.execute(select(Building).where(Building.name == payload.name))
        if existing.scalar_one_or_none():
            raise ConflictException("Tòa nhà đã tồn tại")

        building = Building(
            name=payload.name,
            total_floors=payload.total_floors,
            description=payload.description,
            status=payload.status,
        )
        self.db.add(building)
        await self.db.flush()
        await self.db.refresh(building)
        return BuildingResponse.model_validate(building)

    async def create_room(self, payload: CreateRoomRequest) -> RoomResponse:
        await self._get_building(payload.building_id)

        existing = await self.db.execute(
            select(Room).where(
                Room.building_id == payload.building_id,
                Room.room_number == payload.room_number,
            )
        )
        if existing.scalar_one_or_none():
            raise ConflictException("Phòng đã tồn tại trong tòa nhà này")

        room = Room(
            building_id=payload.building_id,
            room_number=payload.room_number,
            floor=payload.floor,
            capacity=payload.capacity,
            current_occupancy=0,
            room_type=payload.room_type,
            price_per_month=payload.price_per_month,
            status=payload.status,
        )
        self.db.add(room)
        await self.db.flush()
        await self.db.refresh(room)
        return RoomResponse.model_validate(room)

    async def update_room_status(
        self,
        room_id: int,
        payload: UpdateRoomStatusRequest,
    ) -> RoomResponse:
        room = await self._get_room(room_id)

        if payload.status.value == "available" and room.current_occupancy >= room.capacity:
            raise BadRequestException("Phòng đã đủ người, không thể chuyển sang trạng thái còn chỗ")

        room.status = payload.status
        await self.db.flush()
        await self.db.refresh(room)
        return RoomResponse.model_validate(room)

    async def _get_building(self, building_id: int) -> Building:
        building = await self.db.get(Building, building_id)
        if not building:
            raise NotFoundException("Không tìm thấy tòa nhà")
        return building

    async def _get_room(self, room_id: int) -> Room:
        room = await self.db.get(Room, room_id)
        if not room:
            raise NotFoundException("Không tìm thấy phòng")
        return room