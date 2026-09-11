import jwt
from fastapi import HTTPException, Header, Query, status
from typing import Optional

SECRET_KEY = ""
ALGORITHM = "HS256"


def get_current_user(
    authorization: Optional[str] = Header(None), token: Optional[str] = Query(None)
):
    jwt_token = None

    if authorization and authorization.startswith("Bearer "):
        jwt_token = authorization.split(" ")[1]
    elif token:
        jwt_token = token

    if not jwt_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token missing",
        )

    try:
        payload = jwt.decode(jwt_token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
