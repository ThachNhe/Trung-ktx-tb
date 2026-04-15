from datetime import datetime
import uuid

from sqlalchemy import DateTime, Enum as SAEnum, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.constants.enums import Gender, Nationality, UserRole
from app.core.database import Base, enum_values


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    student_code: Mapped[str] = mapped_column(String(32), unique=True, index=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    role: Mapped[UserRole] = mapped_column(
        SAEnum(UserRole, name="user_role", values_callable=enum_values),
        nullable=False,
        default=UserRole.STUDENT,
    )
    gender: Mapped[Gender] = mapped_column(
        SAEnum(Gender, name="gender", values_callable=enum_values),
        nullable=False,
    )
    nationality: Mapped[Nationality] = mapped_column(
        SAEnum(Nationality, name="nationality", values_callable=enum_values),
        nullable=False,
        default=Nationality.VIETNAM,
        server_default=Nationality.VIETNAM.value,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    registrations = relationship(
        "RoomRegistration",
        back_populates="student",
        cascade="all, delete-orphan",
        foreign_keys="RoomRegistration.student_id",
    )
    invoices = relationship(
        "Invoice",
        back_populates="student",
        cascade="all, delete-orphan",
        foreign_keys="Invoice.student_id",
    )
    maintenance_requests = relationship(
        "MaintenanceRequest",
        back_populates="student",
        cascade="all, delete-orphan",
        foreign_keys="MaintenanceRequest.student_id",
    )
    notifications_created = relationship(
        "Notification",
        back_populates="creator",
        cascade="all, delete-orphan",
        foreign_keys="Notification.created_by",
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email}>"
