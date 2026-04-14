from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.constants.enums import InvoiceStatus, RoomRegistrationStatus, UserRole
from app.core.exception import BadRequestException, ConflictException, NotFoundException
from app.models.invoice import Invoice
from app.models.room import Room
from app.models.room_registration import RoomRegistration
from app.models.user import User
from app.schemas.common import PaginatedData, PaginationParams
from app.schemas.invoice import CreateInvoiceRequest, InvoiceResponse
from app.services.common import (
    build_paginated_data,
    build_room_summary,
    build_user_summary,
    paginate_scalars,
)

ELECTRICITY_RATE = Decimal("3500")
WATER_RATE = Decimal("15000")


class InvoiceService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_invoice(self, payload: CreateInvoiceRequest) -> InvoiceResponse:
        student = await self._get_user(payload.student_id)
        room = await self._get_room(payload.room_id)

        duplicate = await self.db.execute(
            select(Invoice.id).where(
                Invoice.student_id == payload.student_id,
                Invoice.room_id == payload.room_id,
                Invoice.month == payload.month,
                Invoice.year == payload.year,
            )
        )
        if duplicate.scalar_one_or_none() is not None:
            raise ConflictException("Hóa đơn tháng này đã tồn tại")

        valid_registration = await self.db.execute(
            select(RoomRegistration.id).where(
                RoomRegistration.student_id == payload.student_id,
                RoomRegistration.room_id == payload.room_id,
                RoomRegistration.status == RoomRegistrationStatus.APPROVED,
            )
        )
        if valid_registration.scalar_one_or_none() is None:
            raise BadRequestException("Sinh viên chưa có đăng ký phòng hợp lệ")

        electricity_fee = payload.electricity_used_kwh * ELECTRICITY_RATE
        water_fee = payload.water_used_m3 * WATER_RATE
        room_fee = room.price_per_month
        total_amount = room_fee + electricity_fee + water_fee

        invoice = Invoice(
            student_id=student.id,
            room_id=room.id,
            month=payload.month,
            year=payload.year,
            electricity_used_kwh=payload.electricity_used_kwh,
            water_used_m3=payload.water_used_m3,
            room_fee=room_fee,
            electricity_fee=electricity_fee,
            water_fee=water_fee,
            total_amount=total_amount,
            status=InvoiceStatus.UNPAID,
            due_date=payload.due_date,
        )
        self.db.add(invoice)
        await self.db.flush()
        invoice = await self._get_invoice(invoice.id)
        return self._to_response(invoice)

    async def list_invoices(
        self,
        current_user: User,
        pagination: PaginationParams,
    ) -> PaginatedData[InvoiceResponse]:
        statement = (
            select(Invoice)
            .options(
                selectinload(Invoice.student),
                selectinload(Invoice.room).selectinload(Room.building),
            )
            .order_by(Invoice.year.desc(), Invoice.month.desc(), Invoice.id.desc())
        )

        if current_user.role == UserRole.STUDENT:
            statement = statement.where(Invoice.student_id == current_user.id)

        items, total = await paginate_scalars(
            self.db,
            statement,
            pagination.page,
            pagination.limit,
        )
        data = [self._to_response(item) for item in items]
        return build_paginated_data(data, pagination.page, pagination.limit, total)

    async def pay_invoice(self, invoice_id: int) -> InvoiceResponse:
        invoice = await self._get_invoice(invoice_id)

        if invoice.status == InvoiceStatus.PAID:
            raise BadRequestException("Hóa đơn đã được thanh toán")

        invoice.status = InvoiceStatus.PAID
        invoice.paid_at = datetime.now(timezone.utc)
        await self.db.flush()
        return self._to_response(invoice)

    async def _get_invoice(self, invoice_id: int) -> Invoice:
        statement = (
            select(Invoice)
            .options(
                selectinload(Invoice.student),
                selectinload(Invoice.room).selectinload(Room.building),
            )
            .where(Invoice.id == invoice_id)
        )
        result = await self.db.execute(statement)
        invoice = result.scalar_one_or_none()
        if not invoice:
            raise NotFoundException("Không tìm thấy hóa đơn")
        return invoice

    async def _get_user(self, user_id) -> User:
        user = await self.db.get(User, user_id)
        if not user:
            raise NotFoundException("Không tìm thấy người dùng")
        return user

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

    def _to_response(self, invoice: Invoice) -> InvoiceResponse:
        return InvoiceResponse(
            id=invoice.id,
            student=build_user_summary(invoice.student),
            room=build_room_summary(invoice.room),
            month=invoice.month,
            year=invoice.year,
            electricity_used_kwh=invoice.electricity_used_kwh,
            water_used_m3=invoice.water_used_m3,
            room_fee=invoice.room_fee,
            electricity_fee=invoice.electricity_fee,
            water_fee=invoice.water_fee,
            total_amount=invoice.total_amount,
            status=invoice.status,
            due_date=invoice.due_date,
            paid_at=invoice.paid_at,
        )