"""add admin panel fields

Revision ID: 608857eef706
Revises: 76cfdc8fb2fe
Create Date: 2026-09-22 18:06:07.238717

Adds users.is_active/is_admin (suspend accounts, gate /admin access) and
tracks.is_active (hide a track from recommendations without deleting it).
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '608857eef706'
down_revision: Union[str, Sequence[str], None] = '76cfdc8fb2fe'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("users", sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()))
    op.add_column("users", sa.Column("is_admin", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column("tracks", sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("tracks", "is_active")
    op.drop_column("users", "is_admin")
    op.drop_column("users", "is_active")
