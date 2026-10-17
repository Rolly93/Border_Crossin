from typing import Optional, Union, Annotated

import jwt
from fastapi import Depends, Header, HTTPException, Query, Request, status
from schema.token_schema import InitialTokenPayload, TokenPayload
from service.jwt_service import JWTService
from cryptography.fernet import Fernet
from config import Env

jwt_service = JWTService()
config = Env()


def get_client_ip(rq: Request) -> str:
    x_frwd_for = rq.headers.get("X-Forwarded-For")
    if x_frwd_for:
        return x_frwd_for.split(",")[0].strip()

    if rq.client and rq.client.host:
        return rq.client.host

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Unable to determine client IP address from host context.",
    )


def get_current_user(
    rq: Request,
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Query(None),
) -> Union[TokenPayload, InitialTokenPayload]:
    jwt_token = jwt_service.extract_token_from_header(authorization) or token

    if not jwt_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authorized",
        )

    try:
        payload = jwt_service.decode_access_token(jwt_token)

        if isinstance(payload, InitialTokenPayload):
            current_ip = get_client_ip(rq)
            if payload.client_ip != current_ip:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="IP address mismatch for bootstrap token",
                )

        return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        )


def get_optional_current_user(
    rq: Request,
    authorization: str | None = Header(None),
    token: str | None = Query(None),
) -> TokenPayload | InitialTokenPayload | None:
    jwt_token = jwt_service.extract_token_from_header(authorization) or token

    if not jwt_token or jwt_token.strip().lower() in ("undefined", "null", "none", ""):
        return None

    try:
        return get_current_user(rq=rq, authorization=authorization, token=token)
    except HTTPException:
        return None


CurrentUser = Annotated[TokenPayload | InitialTokenPayload, Depends(get_current_user)]
OptionalCurrentUser = Annotated[
    TokenPayload | InitialTokenPayload | None,
    Depends(get_optional_current_user),
]


def require_admin(current_user: CurrentUser):
    if not getattr(current_user, "is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requieren privilegios de administrador",
        )
    return current_user


def get_user_id(current_user) -> int:
    # El token de primer uso lleva el RFC como sub; no es un usuario de la tabla user.
    if not str(current_user.sub).isdigit():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inicia sesión con tu usuario",
        )
    return int(current_user.sub)


fernet = Fernet(
    config.SECRET_KEY.encode()
    if isinstance(config.SECRET_KEY, str)
    else config.SECRET_KEY
)


def encrypt_password(plan_password: str) -> str:
    encrypted_bytes = fernet.encrypt(plan_password.encode("utf-8"))
    return encrypted_bytes.decode("utf-8")


def decrypt_password(encrypted_password: str) -> str:
    decrypted_bytes = fernet.decrypt(encrypted_password.encode("utf-8"))
    return decrypted_bytes.decode("utf-8")
