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


SFTP_WIDE_COLUMNS = ("host", "username", "encrypted_password")


def _is_encrypted(value: str | None) -> bool:
    from cryptography.fernet import InvalidToken

    from utility.encryption import decrypt_password

    if not value:
        return False
    try:
        decrypt_password(value)
        return True
    except (InvalidToken, ValueError):
        return False


def upgrade_sftp_schema(engine: Engine) -> None:
    """Columnas nuevas de SFTP y cifrado de host/username guardados en texto plano.

    Idempotente: un valor que ya descifra con FERNET_KEY no se vuelve a cifrar.
    """
    from utility.encryption import encrypt_password

    inspector = inspect(engine)
    tables = inspector.get_table_names()
    dialect = engine.dialect.name

    if "sftp_send" in tables:
        send_columns = {c["name"] for c in inspector.get_columns("sftp_send")}
        if "last_attempt_at" not in send_columns:
            with engine.begin() as conn:
                conn.execute(text("ALTER TABLE sftp_send ADD COLUMN last_attempt_at TIMESTAMP NULL"))
            logger.info("Esquema: columna sftp_send.last_attempt_at agregada")

    if "sftp_service" not in tables:
        return

    columns = {c["name"]: c for c in inspector.get_columns("sftp_service")}
    with engine.begin() as conn:
        if "host_key" not in columns:
            conn.execute(text("ALTER TABLE sftp_service ADD COLUMN host_key VARCHAR(1024) NULL"))
            logger.info("Esquema: columna sftp_service.host_key agregada")

        # Los valores cifrados ocupan ~2x; SQLite no limita el largo de VARCHAR.
        for name in SFTP_WIDE_COLUMNS:
            length = getattr(columns.get(name, {}).get("type"), "length", None)
            if length is not None and length < 512:
                if dialect == "mysql":
                    conn.execute(text(f"ALTER TABLE sftp_service MODIFY {name} VARCHAR(512) NOT NULL"))
                elif dialect == "postgresql":
                    conn.execute(text(f"ALTER TABLE sftp_service ALTER COLUMN {name} TYPE VARCHAR(512)"))
                logger.info("Esquema: columna sftp_service.%s ampliada a 512", name)

        rows = conn.execute(text("SELECT id, host, username FROM sftp_service")).fetchall()
        for row_id, host, username in rows:
            changes = {}
            if host and not _is_encrypted(host):
                changes["host"] = encrypt_password(host)
            if username and not _is_encrypted(username):
                changes["username"] = encrypt_password(username)
            if changes:
                sets = ", ".join(f"{k} = :{k}" for k in changes)
                conn.execute(
                    text(f"UPDATE sftp_service SET {sets} WHERE id = :id"),
                    {**changes, "id": row_id},
                )
                logger.info("Esquema: sftp_service %s cifrado (%s)", row_id, ", ".join(changes))


def upgrade_unit_schema(engine: Engine) -> None:
    inspector = inspect(engine)
    if "unit_truck" not in inspector.get_table_names():
        return  # create_all acaba de crearla con el esquema completo

    columns = {c["name"] for c in inspector.get_columns("unit_truck")}
    with engine.begin() as conn:
        if "unit_number" not in columns:
            conn.execute(text("ALTER TABLE unit_truck ADD COLUMN unit_number VARCHAR(20) NULL"))
            logger.info("Esquema: columna unit_truck.unit_number agregada")

        if "tag_id" not in columns:
            conn.execute(text("ALTER TABLE unit_truck ADD COLUMN tag_id VARCHAR(24) NULL"))
            logger.info("Esquema: columna unit_truck.tag_id agregada")

        if "assigned_to" in columns:
            # Hacer nullable para permitir crear unidades sin asignar
            conn.execute(text("ALTER TABLE unit_truck MODIFY assigned_to INT NULL"))
            logger.info("Esquema: columna unit_truck.assigned_to ahora nullable")

        rows = conn.execute(text("SELECT id, state FROM unit_truck")).fetchall()
        for row_id, state in rows:
            normalized = _normalize_state(state)
            if normalized != state:
                conn.execute(
                    text("UPDATE unit_truck SET state = :s WHERE id = :id"),
                    {"s": normalized, "id": row_id},
                )

    # --- SFTP Service table migrations ---
    if "sftp_service" in inspector.get_table_names():
        sftp_columns = {c["name"] for c in inspector.get_columns("sftp_service")}
        with engine.begin() as conn:
            if "is_active" not in sftp_columns:
                conn.execute(text("ALTER TABLE sftp_service ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE"))
                logger.info("Esquema: columna sftp_service.is_active agregada")

    existing_indexes = {idx["name"] for idx in inspect(engine).get_indexes("unit_truck")}
    if UNIT_NUMBER_INDEX not in existing_indexes:
        # Los NULL no chocan entre sí en un índice único, así que las unidades sin número no bloquean.
        with engine.begin() as conn:
            conn.execute(text(f"CREATE UNIQUE INDEX {UNIT_NUMBER_INDEX} ON unit_truck (unit_number)"))
        logger.info("Esquema: índice %s creado", UNIT_NUMBER_INDEX)
