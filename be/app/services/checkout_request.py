from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.constants.enums import CheckoutRequestStatus, RoomRegistrationStatus, UserRole
from app.core.exception import BadRequestException, ConflictException, NotFoundException
from app.models.checkout_request import CheckoutRequest
from app.models.room import Room
from app.models.room_registration import RoomRegistration
from app.models.user import User
from app.schemas.checkout_request import CreateCheckoutRequest, CheckoutRequestResponse
from app.schemas.common import PaginatedData, PaginationParams
from app.services.common import (
    build_paginated_data,
    build_room_summary,
    build_user_summary,
    paginate_scalars,
)


class CheckoutRequestService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_request(
        self,
        student: User,
        payload: CreateCheckoutRequest,
    ) -> CheckoutRequestResponse:
        reason = payload.reason.strip()
        if not reason:
            raise BadRequestException("Lý do trả phòng là bắt buộc")

        registration = await self._get_student_approved_registration(
            student,
            payload.registration_id,
        )

        existing = await self.db.execute(
            select(CheckoutRequest.id).where(
                CheckoutRequest.registration_id == registration.id,
                CheckoutRequest.status == CheckoutRequestStatus.PENDING,
            )
        )
        if existing.scalar_one_or_none() is not None:
            raise ConflictException("Bạn đã có yêu cầu trả phòng đang chờ xử lý")

        request = CheckoutRequest(
            registration_id=registration.id,
            student_id=student.id,
            room_id=registration.room_id,
            requested_checkout_date=payload.requested_checkout_date,
            reason=reason,
            status=CheckoutRequestStatus.PENDING,
        )
        self.db.add(request)
        await self.db.flush()
        request = await self._get_request(request.id)
        return self._to_response(request)

    async def list_requests(
        self,
        current_user: User,
        pagination: PaginationParams,
    ) -> PaginatedData[CheckoutRequestResponse]:
        statement = (
            select(CheckoutRequest)
            .options(
                selectinload(CheckoutRequest.student),
                selectinload(CheckoutRequest.room).selectinload(Room.building),
            )
            .order_by(CheckoutRequest.created_at.desc())
        )

        if current_user.role == UserRole.STUDENT:
            statement = statement.where(CheckoutRequest.student_id == current_user.id)

        items, total = await paginate_scalars(
            self.db,
            statement,
            pagination.page,
            pagination.limit,
        )
        data = [self._to_response(item) for item in items]
        return build_paginated_data(data, pagination.page, pagination.limit, total)

    async def _get_student_approved_registration(
        self,
        student: User,
        registration_id: int,
    ) -> RoomRegistration:
        statement = (
            select(RoomRegistration)
            .options(selectinload(RoomRegistration.room).selectinload(Room.building))
            .where(
                RoomRegistration.id == registration_id,
                RoomRegistration.student_id == student.id,
                RoomRegistration.status == RoomRegistrationStatus.APPROVED,
            )
        )
        result = await self.db.execute(statement)
        registration = result.scalar_one_or_none()
        if not registration:
            raise BadRequestException("Bạn chỉ có thể gửi yêu cầu trả phòng cho phòng đang ở")
        return registration

    async def _get_request(self, request_id: int) -> CheckoutRequest:
        statement = (
            select(CheckoutRequest)
            .options(
                selectinload(CheckoutRequest.student),
                selectinload(CheckoutRequest.room).selectinload(Room.building),
            )
            .where(CheckoutRequest.id == request_id)
        )
        result = await self.db.execute(statement)
        request = result.scalar_one_or_none()
        if not request:
            raise NotFoundException("Không tìm thấy yêu cầu trả phòng")
        return request

    def _to_response(self, request: CheckoutRequest) -> CheckoutRequestResponse:
        return CheckoutRequestResponse(
            id=request.id,
            registration_id=request.registration_id,
            student=build_user_summary(request.student),
            room=build_room_summary(request.room),
            requested_checkout_date=request.requested_checkout_date,
            reason=request.reason,
            status=request.status,
            created_at=request.created_at,
            processed_at=request.processed_at,
        )
