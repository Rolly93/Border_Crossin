from datetime import datetime, timedelta, timezone
from typing import Optional, Union
import jwt
from config.config import Env
from schema.token_schema import TokenPayload, InitialTokenPayload


class JWTService:
    def __init__(self) -> None:
        self._env = Env()
        self._secrete_key: str = self._env.SECRET_KEY
        self._algorithm: str = self._env.ALGORITHM
        self._token_expire_minutes: int = self._env.ACCESS_TOKEN_EXPIRE_MINUTES

    def extract_token_from_header(self, auth_header: Optional[str]) -> Optional[str]:
        if auth_header and auth_header.startswith("Bearer"):
            parts = auth_header.split(maxsplit=1)
            if len(parts) == 2:
                return parts[1].strip()
        return None

    def create_access_token(
        self,
        user_id: int | str,
        extra_data: Optional[dict] = None,
        expires_delta: Optional[timedelta] = None,
    ) -> str:

        now = datetime.now(timezone.utc)
        expire = now + (
            expires_delta
            if expires_delta
            else timedelta(minutes=self._token_expire_minutes)
        )
        to_encode = {
            "sub": str(user_id),
            "iat": now,
            "exp": now + timedelta(minutes=self._token_expire_minutes),
        }

        if extra_data:
            to_encode.update(extra_data)

        return jwt.encode(to_encode, self._secrete_key, algorithm=self._algorithm)

    def decode_access_token(
        self, token: str
    ) -> Union[TokenPayload, InitialTokenPayload]:

        payload = jwt.decode(token, self._secrete_key, algorithms=[self._algorithm])
        if payload.get("is_first_time") is True:
            return InitialTokenPayload(**payload)
        return TokenPayload(**payload)
