import select

from fastapi import HTTPException, status
from sqlalchemy import exists
from sqlalchemy.orm import Session

from model.db_model import Client, ClientReferenceRule
from repository import EmployeeRepository
from repository.base_repository import BaseRepository


class ClientRuleRepository(BaseRepository[ClientReferenceRule]):
    def __init__(self, db: Session):
        super().__init__(db, ClientReferenceRule)
        self._rule_reference_repo = EmployeeRepository(db)

    def get_rules_for_client(self, client_id: int) -> list[ClientReferenceRule]:
        return (
            self._db.query(ClientReferenceRule)
            .filter(ClientReferenceRule.client_id == client_id)
            .order_by(ClientReferenceRule.operation_type, ClientReferenceRule.prefix)
            .all()
        )

    def client_for_operation(self, operation: str) -> list[ClientReferenceRule] | None:
        has_rule_for_op = exists().where(
            ClientReferenceRule.id == Client.id,
            ClientReferenceRule.operation_type == operation,
        )
        has_any_rule = exists().where(ClientReferenceRule.client_id == Client.id)
        return None
