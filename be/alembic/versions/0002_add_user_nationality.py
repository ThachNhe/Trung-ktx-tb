"""add user nationality

Revision ID: 0002_add_user_nationality
Revises: 0001_initial_schema
Create Date: 2026-04-15
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "0002_add_user_nationality"
down_revision = "0001_initial_schema"
branch_labels = None
depends_on = None


nationality = sa.Enum("vietnam", "laos", name="nationality")


def upgrade() -> None:
    nationality.create(op.get_bind(), checkfirst=True)
    op.add_column(
        "users",
        sa.Column(
            "nationality",
            nationality,
            nullable=False,
            server_default=sa.text("'vietnam'"),
        ),
    )


def downgrade() -> None:
    op.drop_column("users", "nationality")
    nationality.drop(op.get_bind(), checkfirst=True)