from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.constants.enums import MaintenanceRequestStatus, RoomRegistrationStatus, UserRole
from app.core.exception import BadRequestException, NotFoundException
from app.models.maintenance_request import MaintenanceRequest
from app.models.room import Room
from app.models.room_registration import RoomRegistration
from app.models.user import User
from app.schemas.common import PaginatedData, PaginationParams
from app.schemas.maintenance import (
    CreateMaintenanceRequest,
    MaintenanceResponse,
    UpdateMaintenanceStatusRequest,
)
from app.services.common import (
    build_paginated_data,
    build_room_summary,
    build_user_summary,
    paginate_scalars,
)


class MaintenanceService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_request(
        self,
        student: User,
        payload: CreateMaintenanceRequest,
    ) -> MaintenanceResponse:
        room = await self._get_room(payload.room_id)

        registration = await self.db.execute(
            select(RoomRegistration.id).where(
                RoomRegistration.student_id == student.id,
                RoomRegistration.room_id == room.id,
                RoomRegistration.status == RoomRegistrationStatus.APPROVED,
            )
        )
        if registration.scalar_one_or_none() is None:
            raise BadRequestException("Bạn chỉ có thể gửi bảo trì cho phòng đang ở")

        request = MaintenanceRequest(
            student_id=student.id,
            room_id=room.id,
            title=payload.title.strip(),
            description=payload.description.strip(),
            status=MaintenanceRequestStatus.PENDING,
        )
        self.db.add(request)
        await self.db.flush()
        request = await self._get_request(request.id)
        return self._to_response(request)

    async def list_requests(
        self,
        current_user: User,
        pagination: PaginationParams,
    ) -> PaginatedData[MaintenanceResponse]:
        statement = (
            select(MaintenanceRequest)
            .options(
                selectinload(MaintenanceRequest.student),
                selectinload(MaintenanceRequest.room).selectinload(Room.building),
            )
            .order_by(MaintenanceRequest.created_at.desc())
        )

        if current_user.role == UserRole.STUDENT:
            statement = statement.where(MaintenanceRequest.student_id == current_user.id)

        items, total = await paginate_scalars(
            self.db,
            statement,
            pagination.page,
            pagination.limit,
        )
        data = [self._to_response(item) for item in items]
        return build_paginated_data(data, pagination.page, pagination.limit, total)

    async def update_status(
        self,
        maintenance_id: int,
        payload: UpdateMaintenanceStatusRequest,
    ) -> MaintenanceResponse:
        request = await self._get_request(maintenance_id)

        request.status = payload.status
        request.resolved_at = (
            datetime.now(timezone.utc)
            if payload.status == MaintenanceRequestStatus.RESOLVED
            else None
        )

        await self.db.flush()
        return self._to_response(request)

    async def _get_request(self, maintenance_id: int) -> MaintenanceRequest:
        statement = (
            select(MaintenanceRequest)
            .options(
                selectinload(MaintenanceRequest.student),
                selectinload(MaintenanceRequest.room).selectinload(Room.building),
            )
            .where(MaintenanceRequest.id == maintenance_id)
        )
        result = await self.db.execute(statement)
        request = result.scalar_one_or_none()
        if not request:
            raise NotFoundException("Không tìm thấy yêu cầu bảo trì")
        return request

    async def _get_room(self, room_id: int) -> Room:
        statement = (
            select(Room)
            .options(selectinload(Room.building))
            .where(Room.id == room_id)
        )
        result = await self.db.execute(statement)
        room = result.scalar_one_or_none()
        if not room:
            raise NotFoundException("Không tìm thấy phòng")
        return room

    def _to_response(self, request: MaintenanceRequest) -> MaintenanceResponse:
        return MaintenanceResponse(
            id=request.id,
            student=build_user_summary(request.student),
            room=build_room_summary(request.room),
            title=request.title,
            description=request.description,
            status=request.status,
            created_at=request.created_at,
            resolved_at=request.resolved_at,
        )