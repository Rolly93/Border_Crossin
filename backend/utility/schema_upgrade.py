"""
Ajustes de esquema que `Base.metadata.create_all` no hace sobre tablas existentes.

`create_all` crea tablas nuevas (por ejemplo unit_assignment), pero no agrega columnas
ni índices a tablas que ya existen. Esta función se ejecuta al arrancar el backend y es
idempotente: en una base nueva o ya actualizada no cambia nada.

1. Agrega `unit_truck.unit_number` si no existe.
2. Crea el índice único `uq_unit_truck_unit_number`.
3. Normaliza `unit_truck.state` a ACTIVA / MANTENIMIENTO / BAJA.
"""

import logging

from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine

logger = logging.getLogger(__name__)

UNIT_NUMBER_INDEX = "uq_unit_truck_unit_number"


def _normalize_state(raw: str | None) -> str:
    value = (raw or "").strip().lower()
    if "mant" in value:
        return "MANTENIMIENTO"
    if "baja" in value:
        return "BAJA"
    return "ACTIVA"


def upgrade_unit_schema(engine: Engine) -> None:
    inspector = inspect(engine)
    if "unit_truck" not in inspector.get_table_names():
        return  # create_all acaba de crearla con el esquema completo

    columns = {c["name"] for c in inspector.get_columns("unit_truck")}
    with engine.begin() as conn:
        if "unit_number" not in columns:
            conn.execute(text("ALTER TABLE unit_truck ADD COLUMN unit_number VARCHAR(20) NULL"))
            logger.info("Esquema: columna unit_truck.unit_number agregada")

        rows = conn.execute(text("SELECT id, state FROM unit_truck")).fetchall()
        for row_id, state in rows:
            normalized = _normalize_state(state)
            if normalized != state:
                conn.execute(
                    text("UPDATE unit_truck SET state = :s WHERE id = :id"),
                    {"s": normalized, "id": row_id},
                )

    existing_indexes = {idx["name"] for idx in inspect(engine).get_indexes("unit_truck")}
    if UNIT_NUMBER_INDEX not in existing_indexes:
        # Los NULL no chocan entre sí en un índice único, así que las unidades sin número no bloquean.
        with engine.begin() as conn:
            conn.execute(text(f"CREATE UNIQUE INDEX {UNIT_NUMBER_INDEX} ON unit_truck (unit_number)"))
        logger.info("Esquema: índice %s creado", UNIT_NUMBER_INDEX)
