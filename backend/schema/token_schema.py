from pydantic import BaseModel, Field
from typing import Optional


class TokenPayload(BaseModel):
    user_id: int = Field(..., alias="sub")
    email: Optional[str] = None
    is_admin: bool = False

    def check_admin(self):
        return self.is_admin


class InitialTokenPayload(TokenPayload):
    sub: str
    client_ip: str
    is_first_time: str
    exp: str
    jti: str
