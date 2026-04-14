from decimal import Decimal

from sqlalchemy import Enum as SAEnum, ForeignKey, Integer, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.constants.enums import RoomStatus, RoomType
from app.core.database import Base, enum_values


class Room(Base):
    __tablename__ = "rooms"
    __table_args__ = (
        UniqueConstraint("building_id", "room_number", name="uq_room_building_number"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    building_id: Mapped[int] = mapped_column(ForeignKey("buildings.id", ondelete="CASCADE"), nullable=False)
    room_number: Mapped[str] = mapped_column(String(20), nullable=False)
    floor: Mapped[int] = mapped_column(Integer, nullable=False)
    capacity: Mapped[int] = mapped_column(Integer, nullable=False)
    current_occupancy: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    room_type: Mapped[RoomType] = mapped_column(
        SAEnum(RoomType, name="room_type", values_callable=enum_values),
        nullable=False,
    )
    price_per_month: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    status: Mapped[RoomStatus] = mapped_column(
        SAEnum(RoomStatus, name="room_status", values_callable=enum_values),
        nullable=False,
        default=RoomStatus.AVAILABLE,
    )

    building = relationship("Building", back_populates="rooms")
    registrations = relationship("RoomRegistration", back_populates="room", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="room", cascade="all, delete-orphan")
    maintenance_requests = relationship("MaintenanceRequest", back_populates="room", cascade="all, delete-orphan")