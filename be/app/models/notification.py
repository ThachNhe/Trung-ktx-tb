from datetime import datetime
import uuid

from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.constants.enums import NotificationTargetRole
from app.core.database import Base, enum_values


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    target_role: Mapped[NotificationTargetRole] = mapped_column(
        SAEnum(NotificationTargetRole, name="notification_target_role", values_callable=enum_values),
        nullable=False,
        default=NotificationTargetRole.ALL,
    )
    created_by: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    creator = relationship("User", back_populates="notifications_created", foreign_keys=[created_by])