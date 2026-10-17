from fastapi import HTTPException, status
from sqlalchemy import exists, or_, select
from sqlalchemy.orm import Session

from model.db_model import Client, ClientReferenceRule

OPERATIONS = ("importacion", "exportacion")


def normalize_operation(value: str | None) -> str:
    operation = (value or "").strip().lower()
    if operation not in OPERATIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tipo de operación inválido: {value}",
        )
    return operation


class ReferenceRuleService:
    """
    Reglas de referencia por cliente.

    Un cliente sin reglas acepta cualquier referencia en cualquier operación.
    Un cliente con reglas solo acepta las operaciones y prefijos configurados.
    """

    def __init__(self, db: Session):
        self._db = db

    def rules_for_client(self, client_id: int) -> list[ClientReferenceRule]:
        return (
            self._db.query(ClientReferenceRule)
            .filter(ClientReferenceRule.client_id == client_id)
            .order_by(ClientReferenceRule.operation_type, ClientReferenceRule.prefix)
            .all()
        )

    def clients_for_operation(self, operation: str) -> list[dict]:
        op = normalize_operation(operation)

        has_rule_for_op = exists().where(
            ClientReferenceRule.client_id == Client.id,
            ClientReferenceRule.operation_type == op,
        )
        has_any_rule = exists().where(ClientReferenceRule.client_id == Client.id)

        stmt = (
            select(Client.id, Client.name)
            .where(Client.still_active.is_(True))
            .where(or_(has_rule_for_op, ~has_any_rule))
            .order_by(Client.name)
        )
        return [
            {"id": row.id, "name": row.name} for row in self._db.execute(stmt).all()
        ]

    def validate(self, client_id: int, operation: str, reference: str) -> None:
        rules = self.rules_for_client(client_id)
        if not rules:
            return

        op = normalize_operation(operation)
        op_rules = [r for r in rules if r.operation_type == op]
        if not op_rules:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El cliente no opera {op}",
            )

        ref = (reference or "").strip().lower()
        for rule in op_rules:
            length_ok = (
                rule.reference_length is None or len(ref) == rule.reference_length
            )
            if ref.startswith(rule.prefix.lower()) and length_ok:
                return

        prefixes = " o ".join(sorted({r.prefix.upper() for r in op_rules}))
        lengths = {r.reference_length for r in op_rules if r.reference_length}
        message = f"La referencia debe empezar con {prefixes}"
        if lengths:
            message += f" y tener {lengths.pop()} caracteres"
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)
