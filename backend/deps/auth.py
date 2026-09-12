import jwt
from fastapi import Header, Query, HTTPException, status, Depends
from typing import Optional
from service.jwt_service import JWTService
from schema.token_schema import TokenPayload
from repository import UserRepository

from databse import get_db
from sqlalchemy.orm import Session

jwt_service = JWTService()


def get_current_user(
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Query(None),
    db: Session = Depends(get_db),
) -> TokenPayload:
    user_repo = UserRepository(db)
    user_count = user_repo.get_all_users()

    if not user_count:
        return TokenPayload(sub=0, is_admin=True)

    jwt_token = jwt_service.extract_token_from_header(authorization) or token

    if not jwt_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="user not Authorized"
        )

    try:
        return jwt_service.decode_access_token(jwt_token)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has Expired"
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication Token",
        )
