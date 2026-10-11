"""
Carga las reglas de referencia de Expeditors (12B importación, 82B/92B exportación).

Uso (desde la carpeta backend):
    python -m scripts.seed_reference_rules

Es idempotente: si una regla ya existe, no la duplica.
"""
from sqlalchemy import func, select

from database import SessionLocal
from model.db_model import Client, ClientReferenceRule

CLIENT_NAME = "Expeditors"
RULES = [
    ("importacion", "12B", 10),
    ("exportacion", "82B", 10),
    ("exportacion", "92B", 10),
]


def main() -> None:
    db = SessionLocal()
    try:
        client = db.scalar(
            select(Client).where(func.lower(Client.name) == CLIENT_NAME.lower())
        )
        if client is None:
            print(f"No existe el cliente '{CLIENT_NAME}'. No se cargó nada.")
            return

        added = 0
        for operation, prefix, length in RULES:
            exists = db.scalar(
                select(ClientReferenceRule.id).where(
                    ClientReferenceRule.client_id == client.id,
                    ClientReferenceRule.operation_type == operation,
                    ClientReferenceRule.prefix == prefix,
                )
            )
            if exists is None:
                db.add(
                    ClientReferenceRule(
                        client_id=client.id,
                        operation_type=operation,
                        prefix=prefix,
                        reference_length=length,
                    )
                )
                added += 1
        db.commit()
        print(f"Reglas cargadas para {client.name}: {added} nuevas.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
