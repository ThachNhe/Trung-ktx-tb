from datetime import date, datetime
import uuid

from sqlalchemy import Date, DateTime, Enum as SAEnum, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.constants.enums import RoomRegistrationStatus
from app.core.database import Base, enum_values


class RoomRegistration(Base):
    __tablename__ = "room_registrations"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    student_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    room_id: Mapped[int] = mapped_column(ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[RoomRegistrationStatus] = mapped_column(
        SAEnum(RoomRegistrationStatus, name="room_registration_status", values_callable=enum_values),
        nullable=False,
        default=RoomRegistrationStatus.PENDING,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    student = relationship("User", back_populates="registrations", foreign_keys=[student_id])
    room = relationship("Room", back_populates="registrations")