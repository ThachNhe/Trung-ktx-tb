"""initial ktx schema

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-04-14
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


# revision identifiers, used by Alembic.
revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


user_role = sa.Enum("admin", "staff", "student", name="user_role")
gender = sa.Enum("male", "female", "other", name="gender")
building_code = sa.Enum("K1", "K2", "K3", "K4", "K5", "K6", "K7", "K8", name="building_code")
building_status = sa.Enum("active", "maintenance", name="building_status")
room_type = sa.Enum("male", "female", "laos_student", name="room_type")
room_status = sa.Enum("available", "full", "maintenance", name="room_status")
room_registration_status = sa.Enum(
    "pending", "approved", "rejected", "checked_out", name="room_registration_status"
)
invoice_status = sa.Enum("unpaid", "paid", name="invoice_status")
maintenance_request_status = sa.Enum(
    "pending", "in_progress", "resolved", name="maintenance_request_status"
)
notification_target_role = sa.Enum("all", "student", "staff", name="notification_target_role")


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("student_code", sa.String(length=32), nullable=False, unique=True),
        sa.Column("email", sa.String(length=255), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("phone", sa.String(length=20), nullable=True),
        sa.Column("role", user_role, nullable=False),
        sa.Column("gender", gender, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )

    op.create_table(
        "buildings",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column("name", building_code, nullable=False, unique=True),
        sa.Column("total_floors", sa.Integer(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", building_status, nullable=False),
    )

    op.create_table(
        "rooms",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column("building_id", sa.Integer(), sa.ForeignKey("buildings.id", ondelete="CASCADE"), nullable=False),
        sa.Column("room_number", sa.String(length=20), nullable=False),
        sa.Column("floor", sa.Integer(), nullable=False),
        sa.Column("capacity", sa.Integer(), nullable=False),
        sa.Column("current_occupancy", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("room_type", room_type, nullable=False),
        sa.Column("price_per_month", sa.Numeric(12, 2), nullable=False),
        sa.Column("status", room_status, nullable=False),
        sa.UniqueConstraint("building_id", "room_number", name="uq_room_building_number"),
    )

    op.create_table(
        "room_registrations",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column("student_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("room_id", sa.Integer(), sa.ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column("status", room_registration_status, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )

    op.create_table(
        "invoices",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column("student_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("room_id", sa.Integer(), sa.ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False),
        sa.Column("month", sa.Integer(), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("electricity_used_kwh", sa.Numeric(12, 2), nullable=False),
        sa.Column("water_used_m3", sa.Numeric(12, 2), nullable=False),
        sa.Column("room_fee", sa.Numeric(12, 2), nullable=False),
        sa.Column("electricity_fee", sa.Numeric(12, 2), nullable=False),
        sa.Column("water_fee", sa.Numeric(12, 2), nullable=False),
        sa.Column("total_amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("status", invoice_status, nullable=False),
        sa.Column("due_date", sa.Date(), nullable=False),
        sa.Column("paid_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("student_id", "room_id", "month", "year", name="uq_invoice_period"),
    )

    op.create_table(
        "maintenance_requests",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column("student_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("room_id", sa.Integer(), sa.ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("status", maintenance_request_status, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        "notifications",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("target_role", notification_target_role, nullable=False),
        sa.Column("created_by", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("notifications")
    op.drop_table("maintenance_requests")
    op.drop_table("invoices")
    op.drop_table("room_registrations")
    op.drop_table("rooms")
    op.drop_table("buildings")
    op.drop_table("users")

    notification_target_role.drop(op.get_bind(), checkfirst=True)
    maintenance_request_status.drop(op.get_bind(), checkfirst=True)
    invoice_status.drop(op.get_bind(), checkfirst=True)
    room_registration_status.drop(op.get_bind(), checkfirst=True)
    room_status.drop(op.get_bind(), checkfirst=True)
    room_type.drop(op.get_bind(), checkfirst=True)
    building_status.drop(op.get_bind(), checkfirst=True)
    building_code.drop(op.get_bind(), checkfirst=True)
    gender.drop(op.get_bind(), checkfirst=True)
    user_role.drop(op.get_bind(), checkfirst=True)