from pydantic import BaseModel
from typing import Text


class ClientModel(BaseModel):
    status: Text
    id: int | None = None
