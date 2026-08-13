from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from model.db_model import Client, ClientEmailRecipient
from schema import ClientRequest, ClientResponse

# Missing Client Schema


class ClienteService:
    def __init__(self, db: Session):
        self._db = db

    def is_valid_name(self, name: str) -> str:
        return ""
