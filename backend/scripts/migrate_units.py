"""
Migración para bases ya existentes (SQLite o MySQL).

`Base.metadata.create_all` crea tablas nuevas (unit_assignment), pero NO agrega
columnas ni índices a tablas que ya existen. Este script:

1. Agrega la columna `unit_number` a `unit_truck` si no existe.
2. Crea el índice único `uq_unit_truck_unit_number`.
3. Normaliza `state` a ACTIVA / MANTENIMIENTO / BAJA.

Uso (desde la carpeta backend):
    python -m scripts.migrate_units
"""

from sqlalchemy import inspect, text

from database import engine

INDEX_NAME = "uq_unit_truck_unit_number"


def _normalize_state(raw: str | None) -> str:
    value = (raw or "").strip().lower()
    if "mant" in value:
        return "MANTENIMIENTO"
    if "baja" in value:
        return "BAJA"
    return "ACTIVA"


def migrate() -> None:
    inspector = inspect(engine)
    if "unit_truck" not in inspector.get_table_names():
        print("La tabla unit_truck no existe; create_all la creará. Nada que migrar.")
        return

    columns = {c["name"] for c in inspector.get_columns("unit_truck")}

    with engine.begin() as conn:
        if "unit_number" not in columns:
            conn.execute(text("ALTER TABLE unit_truck ADD COLUMN unit_number VARCHAR(20) NULL"))
            print("Columna unit_number agregada.")
        else:
            print("Columna unit_number ya existe.")

        rows = conn.execute(text("SELECT id, state FROM unit_truck")).fetchall()
        changed = 0
        for row_id, state in rows:
            normalized = _normalize_state(state)
            if normalized != state:
                conn.execute(
                    text("UPDATE unit_truck SET state = :s WHERE id = :id"),
                    {"s": normalized, "id": row_id},
                )
                changed += 1
        print(f"Estados normalizados: {changed} de {len(rows)} unidades.")

    # Índice único: se crea después de la columna. Los NULL no chocan entre sí.
    existing_indexes = {idx["name"] for idx in inspect(engine).get_indexes("unit_truck")}
    if INDEX_NAME not in existing_indexes:
        with engine.begin() as conn:
            conn.execute(text(f"CREATE UNIQUE INDEX {INDEX_NAME} ON unit_truck (unit_number)"))
        print(f"Índice {INDEX_NAME} creado.")
    else:
        print(f"Índice {INDEX_NAME} ya existe.")


if __name__ == "__main__":
    migrate()
