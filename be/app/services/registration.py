from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.constants.enums import Gender, Nationality, RoomRegistrationStatus, RoomStatus, RoomType, UserRole
from app.core.exception import BadRequestException, ConflictException, NotFoundException
from app.models.building import Building
from app.models.room import Room
from app.models.room_registration import RoomRegistration
from app.models.user import User
from app.schemas.common import PaginatedData, PaginationParams
from app.schemas.registration import CreateRegistrationRequest, RegistrationResponse
from app.services.common import (
    build_paginated_data,
    build_room_summary,
    build_user_summary,
    paginate_scalars,
)


class RegistrationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_registration(
        self,
        student: User,
        payload: CreateRegistrationRequest,
    ) -> RegistrationResponse:
        room = await self._get_room(payload.room_id)

        self._validate_room_for_student(room, student)

        if room.status in {RoomStatus.FULL, RoomStatus.MAINTENANCE} or room.current_occupancy >= room.capacity:
            raise BadRequestException("Phòng đã đầy, không thể đăng ký")

        existing = await self.db.execute(
            select(RoomRegistration.id).where(
                RoomRegistration.student_id == student.id,
                RoomRegistration.status.in_(
                    [RoomRegistrationStatus.PENDING, RoomRegistrationStatus.APPROVED]
                ),
            )
        )
        if existing.scalar_one_or_none() is not None:
            raise ConflictException("Sinh viên đã có phòng hoặc đơn đăng ký đang chờ xử lý")

        registration = RoomRegistration(
            student_id=student.id,
            room_id=payload.room_id,
            start_date=payload.start_date,
            end_date=payload.end_date,
            status=RoomRegistrationStatus.PENDING,
        )
        self.db.add(registration)
        await self.db.flush()
        registration = await self._get_registration(registration.id)
        return self._to_response(registration)

    async def list_registrations(
        self,
        current_user: User,
        pagination: PaginationParams,
    ) -> PaginatedData[RegistrationResponse]:
        statement = (
            select(RoomRegistration)
            .options(
                selectinload(RoomRegistration.student),
                selectinload(RoomRegistration.room).selectinload(Room.building),
            )
            .order_by(RoomRegistration.created_at.desc())
        )

        if current_user.role == UserRole.STUDENT:
            statement = statement.where(RoomRegistration.student_id == current_user.id)

        items, total = await paginate_scalars(
            self.db,
            statement,
            pagination.page,
            pagination.limit,
        )
        data = [self._to_response(item) for item in items]
        return build_paginated_data(data, pagination.page, pagination.limit, total)

    async def approve_registration(self, registration_id: int) -> RegistrationResponse:
        registration = await self._get_registration(registration_id)

        if registration.status != RoomRegistrationStatus.PENDING:
            raise BadRequestException("Chỉ có thể duyệt đơn ở trạng thái chờ xử lý")

        self._validate_room_for_student(registration.room, registration.student)

        if registration.room.status == RoomStatus.MAINTENANCE:
            raise BadRequestException("Phòng đang bảo trì, không thể duyệt")

        if registration.room.current_occupancy >= registration.room.capacity:
            raise BadRequestException("Phòng đã đầy, không thể duyệt đơn")

        existing_approved = await self.db.execute(
            select(RoomRegistration.id).where(
                RoomRegistration.student_id == registration.student_id,
                RoomRegistration.id != registration.id,
                RoomRegistration.status == RoomRegistrationStatus.APPROVED,
            )
        )
        if existing_approved.scalar_one_or_none() is not None:
            raise ConflictException("Sinh viên đã có phòng đang ở")

        # Cập nhật sức chứa ngay khi đơn được duyệt.
        registration.status = RoomRegistrationStatus.APPROVED
        registration.room.current_occupancy += 1
        registration.room.status = (
            RoomStatus.FULL
            if registration.room.current_occupancy >= registration.room.capacity
            else RoomStatus.AVAILABLE
        )

        await self.db.flush()
        return self._to_response(registration)

    async def reject_registration(self, registration_id: int) -> RegistrationResponse:
        registration = await self._get_registration(registration_id)

        if registration.status != RoomRegistrationStatus.PENDING:
            raise BadRequestException("Chỉ có thể từ chối đơn ở trạng thái chờ xử lý")

        registration.status = RoomRegistrationStatus.REJECTED
        await self.db.flush()
        return self._to_response(registration)

    async def checkout_registration(self, registration_id: int) -> RegistrationResponse:
        registration = await self._get_registration(registration_id)

        if registration.status != RoomRegistrationStatus.APPROVED:
            raise BadRequestException("Chỉ có thể trả phòng cho đơn đã được duyệt")

        registration.status = RoomRegistrationStatus.CHECKED_OUT
        if registration.room.current_occupancy > 0:
            registration.room.current_occupancy -= 1

        if registration.room.status != RoomStatus.MAINTENANCE:
            registration.room.status = (
                RoomStatus.FULL
                if registration.room.current_occupancy >= registration.room.capacity
                else RoomStatus.AVAILABLE
            )

        await self.db.flush()
        return self._to_response(registration)

    async def _get_registration(self, registration_id: int) -> RoomRegistration:
        statement = (
            select(RoomRegistration)
            .options(
                selectinload(RoomRegistration.student),
                selectinload(RoomRegistration.room).selectinload(Room.building),
            )
            .where(RoomRegistration.id == registration_id)
        )
        result = await self.db.execute(statement)
        registration = result.scalar_one_or_none()
        if not registration:
            raise NotFoundException("Không tìm thấy đơn đăng ký phòng")
        return registration

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

    def _to_response(self, registration: RoomRegistration) -> RegistrationResponse:
        return RegistrationResponse(
            id=registration.id,
            student=build_user_summary(registration.student),
            room=build_room_summary(registration.room),
            start_date=registration.start_date,
            end_date=registration.end_date,
            status=registration.status,
            created_at=registration.created_at,
        )

    def _validate_room_for_student(self, room: Room, student: User) -> None:
        allowed_room_types = self._allowed_room_types(student.gender, student.nationality)
        if room.room_type not in allowed_room_types:
            raise BadRequestException("Phòng không phù hợp với giới tính hoặc quốc tịch của sinh viên")

    def _allowed_room_types(self, gender: Gender, nationality: Nationality) -> set[RoomType]:
        if nationality == Nationality.LAOS:
            return {RoomType.LAOS_STUDENT}

        if gender == Gender.MALE:
            return {RoomType.MALE}

        if gender == Gender.FEMALE:
            return {RoomType.FEMALE}

        return set()