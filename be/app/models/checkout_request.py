from datetime import date, datetime
import uuid

from sqlalchemy import Date, DateTime, Enum as SAEnum, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.constants.enums import CheckoutRequestStatus
from app.core.database import Base, enum_values


class CheckoutRequest(Base):
    __tablename__ = "checkout_requests"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    registration_id: Mapped[int] = mapped_column(
        ForeignKey("room_registrations.id", ondelete="CASCADE"), nullable=False
    )
    student_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    room_id: Mapped[int] = mapped_column(ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False)
    requested_checkout_date: Mapped[date] = mapped_column(Date, nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[CheckoutRequestStatus] = mapped_column(
        SAEnum(CheckoutRequestStatus, name="checkout_request_status", values_callable=enum_values),
        nullable=False,
        default=CheckoutRequestStatus.PENDING,
    )
    processed_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    processed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    registration = relationship("RoomRegistration", back_populates="checkout_requests")
    student = relationship("User", back_populates="checkout_requests", foreign_keys=[student_id])
    room = relationship("Room", back_populates="checkout_requests")
    processor = relationship("User", foreign_keys=[processed_by])
