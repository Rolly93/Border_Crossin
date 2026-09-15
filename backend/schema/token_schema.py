from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class TokenPayload(BaseModel):
    sub: str
    email: Optional[str] = None
    is_admin: bool = False
    client_ip: Optional[str] = None

    def check_admin(self) -> bool:
        return self.is_admin


class InitialTokenPayload(TokenPayload):
    model_config = ConfigDict(populate_by_name=True)
    exp: int | datetime
    is_first_time: bool = True
    iat: Optional[int | datetime] = None
    jti: str
