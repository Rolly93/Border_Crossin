from sqlalchemy.orm import Session
from model.db_model import Client
from sqlalchemy import and_, exists


class ClienteRepository:
    def __init__(self, db: Session):
        self._db = db
