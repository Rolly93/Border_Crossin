from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from model.db_model import Client

# Missing Client Schema


class ClienteService:
    def __init__(self, db: Session):
        self.db = db
