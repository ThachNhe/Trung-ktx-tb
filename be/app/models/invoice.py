from datetime import date, datetime
import uuid
from decimal import Decimal

from sqlalchemy import Date, DateTime, Enum as SAEnum, ForeignKey, Integer, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.constants.enums import InvoiceStatus
from app.core.database import Base, enum_values


class Invoice(Base):
    __tablename__ = "invoices"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    student_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    room_id: Mapped[int] = mapped_column(ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False)
    month: Mapped[int] = mapped_column(Integer, nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    electricity_used_kwh: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    water_used_m3: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    room_fee: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    electricity_fee: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    water_fee: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    status: Mapped[InvoiceStatus] = mapped_column(
        SAEnum(InvoiceStatus, name="invoice_status", values_callable=enum_values),
        nullable=False,
        default=InvoiceStatus.UNPAID,
    )
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    student = relationship("User", back_populates="invoices", foreign_keys=[student_id])
    room = relationship("Room", back_populates="invoices")