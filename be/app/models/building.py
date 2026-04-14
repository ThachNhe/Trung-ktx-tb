from sqlalchemy import Enum as SAEnum, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.constants.enums import BuildingCode, BuildingStatus
from app.core.database import Base, enum_values


class Building(Base):
    __tablename__ = "buildings"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[BuildingCode] = mapped_column(
        SAEnum(BuildingCode, name="building_code", values_callable=enum_values),
        unique=True,
        nullable=False,
    )
    total_floors: Mapped[int] = mapped_column(Integer, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[BuildingStatus] = mapped_column(
        SAEnum(BuildingStatus, name="building_status", values_callable=enum_values),
        nullable=False,
        default=BuildingStatus.ACTIVE,
    )

    rooms = relationship("Room", back_populates="building", cascade="all, delete-orphan")