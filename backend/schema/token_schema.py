from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class InitialTokenPayload(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    sub: str | int
    user_id: Optional[str | int] = Field(None, alias="sub")
    client_ip: Optional[str] = None
    is_first_time: bool = True
    exp: int | datetime
    iat: Optional[int | datetime] = None
    jti: str


class TokenPayload(InitialTokenPayload):
    email: Optional[str] = None
    is_admin: bool = False

    def check_admin(self) -> bool:
        return self.is_admin
