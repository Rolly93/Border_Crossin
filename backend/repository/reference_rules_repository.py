from sqlalchemy import exists, or_, select
from sqlalchemy.orm import Session

from model.db_model import Client, ClientReferenceRule
from repository.base_repository import BaseRepository


class ClientRuleRepository(BaseRepository[ClientReferenceRule]):
    def __init__(self, db: Session):
        super().__init__(db, ClientReferenceRule)

    def get_rules_for_client(self, client_id: int) -> list[ClientReferenceRule]:
        return (
            self._db.query(ClientReferenceRule)
            .filter(ClientReferenceRule.client_id == client_id)
            .order_by(ClientReferenceRule.operation_type, ClientReferenceRule.prefix)
            .all()
        )

    def clients_for_operation(self, operation: str) -> list[dict[str, str | int]]:
        has_rule_for_op = exists().where(
            ClientReferenceRule.client_id == Client.id,
            ClientReferenceRule.operation_type == operation,
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
