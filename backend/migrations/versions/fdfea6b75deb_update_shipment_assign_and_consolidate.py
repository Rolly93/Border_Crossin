"""update shipment_assign and consolidate

Revision ID: fdfea6b75deb
Revises: 3b52b8d90c79
Create Date: 2026-11-18 21:56:29.129771

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "fdfea6b75deb"
down_revision: Union[str, Sequence[str], None] = "3b52b8d90c79"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table("consolidate", schema=None) as batch_op:
        batch_op.alter_column(
            "pieces",
            existing_type=sa.INTEGER(),
            nullable=False,
        )
        batch_op.alter_column(
            "weight",
            existing_type=sa.FLOAT(),
            nullable=False,
        )
        batch_op.create_foreign_key(
            "fk_consolidate_trip_assigned_id",
            "trip_assigned",
            ["trip_assigned_id"],
            ["id"],
        )
        batch_op.create_foreign_key(
            "fk_consolidate_client_id",
            "client",
            ["client_id"],
            ["id"],
        )

    with op.batch_alter_table("trip_assigned", schema=None) as batch_op:
        batch_op.alter_column(
            "trailer_id",
            existing_type=sa.INTEGER(),
            nullable=True,
        )

    with op.batch_alter_table("unit_truck", schema=None) as batch_op:
        batch_op.alter_column(
            "type_unit",
            existing_type=sa.VARCHAR(length=50),
            nullable=False,
        )


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table("unit_truck", schema=None) as batch_op:
        batch_op.alter_column(
            "type_unit",
            existing_type=sa.VARCHAR(length=50),
            nullable=True,
        )

    with op.batch_alter_table("trip_assigned", schema=None) as batch_op:
        batch_op.alter_column(
            "trailer_id",
            existing_type=sa.INTEGER(),
            nullable=False,
        )

    with op.batch_alter_table("consolidate", schema=None) as batch_op:
        batch_op.drop_constraint(
            "fk_consolidate_client_id",
            type_="foreignkey",
        )
        batch_op.drop_constraint(
            "fk_consolidate_trip_assigned_id",
            type_="foreignkey",
        )
        batch_op.alter_column(
            "weight",
            existing_type=sa.FLOAT(),
            nullable=True,
        )
        batch_op.alter_column(
            "pieces",
            existing_type=sa.INTEGER(),
            nullable=True,
        )
