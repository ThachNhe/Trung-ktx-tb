"""add checkout requests

Revision ID: 0003_add_checkout_requests
Revises: 0002_add_user_nationality
Create Date: 2026-06-11
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import ENUM, UUID


revision = "0003_add_checkout_requests"
down_revision = "0002_add_user_nationality"
branch_labels = None
depends_on = None


checkout_request_status = ENUM(
    "pending",
    "approved",
    "rejected",
    name="checkout_request_status",
    create_type=False,
)


def upgrade() -> None:
    op.execute(
        """
        DO $$
        BEGIN
            CREATE TYPE checkout_request_status AS ENUM ('pending', 'approved', 'rejected');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
        """
    )

    op.create_table(
        "checkout_requests",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column(
            "registration_id",
            sa.Integer(),
            sa.ForeignKey("room_registrations.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "student_id",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "room_id",
            sa.Integer(),
            sa.ForeignKey("rooms.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("requested_checkout_date", sa.Date(), nullable=False),
        sa.Column("reason", sa.Text(), nullable=False),
        sa.Column("status", checkout_request_status, nullable=False),
        sa.Column(
            "processed_by",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("processed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index(
        "ix_checkout_requests_registration_pending",
        "checkout_requests",
        ["registration_id", "status"],
    )


def downgrade() -> None:
    op.drop_index("ix_checkout_requests_registration_pending", table_name="checkout_requests")
    op.drop_table("checkout_requests")
    op.execute("DROP TYPE IF EXISTS checkout_request_status")
