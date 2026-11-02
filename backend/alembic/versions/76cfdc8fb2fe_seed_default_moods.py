"""seed default moods

Revision ID: 76cfdc8fb2fe
Revises: 9ec92c153db6
Create Date: 2026-09-21 15:43:13.141817

Seeds the six Phase 1 mood chips (docs/design-system.md "Screens" §1 /
requirements.md FR-01). Kept as its own migration so schema and data
changes can be reviewed/rolled back independently.
"""
import uuid
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '76cfdc8fb2fe'
down_revision: Union[str, Sequence[str], None] = '9ec92c153db6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

MOODS = ["Chill", "Focus", "Happy", "Workout", "Romantic", "Sad"]

moods_table = sa.table(
    "moods",
    sa.column("id", postgresql.UUID(as_uuid=True)),
    sa.column("slug", sa.String),
    sa.column("name", sa.String),
)


def upgrade() -> None:
    """Upgrade schema."""
    op.bulk_insert(
        moods_table,
        [{"id": uuid.uuid4(), "slug": name.lower(), "name": name} for name in MOODS],
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.execute(
        sa.text("DELETE FROM moods WHERE slug IN :slugs").bindparams(
            sa.bindparam("slugs", value=tuple(m.lower() for m in MOODS), expanding=True)
        )
    )
