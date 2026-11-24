from __future__ import annotations

import logging
import os
from typing import Annotated

import jwt
from fastapi import Depends, Header, HTTPException, Query, Request, status

from config import Env
from integrations.aws_lambda_client import AssignationLambdaClient
from schema.token_schema import InitialTokenPayload, TokenPayload
from service.jwt_service import JWTService

logger = logging.getLogger(__name__)
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
    authorization: str | None = Header(None),
    token: str | None = Query(None),
) -> TokenPayload | InitialTokenPayload:

    print(f"Autorizacion: {authorization}")
    print(f"token: {token}")

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
            print(current_ip, rq)

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


def require_admin(current_user: CurrentUser):
    if not getattr(current_user, "is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requieren privilegios de administrador",
        )
    return current_user


def get_user_id(current_user: CurrentUser) -> int:
    if not str(current_user.sub).isdigit():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inicia sesión con tu usuario",
        )
    return int(current_user.sub)


def get_lambda_client(timeout: float = 10.0) -> AssignationLambdaClient | None:
    endpoint_url = getattr(config, "ENDPOINT_AWS", None) or os.getenv("ENDPOINT_AWS")
    api_key = getattr(config, "APIKEY_AWS", None) or os.getenv("APIKEY_AWS")

    if not endpoint_url or not api_key:
        logger.debug(
            "Notificación omitida: faltan credenciales o servicio Lambda no configurado."
        )
        return None

    return AssignationLambdaClient(
        endpoint_url=endpoint_url,
        api_key=api_key,
        timeout=timeout,
    )


OptionalLambdaClientDep = Annotated[
    AssignationLambdaClient | None, Depends(get_lambda_client)
]

LambdaClientDep = Annotated[AssignationLambdaClient | None, Depends(get_lambda_client)]

CurrentUser = Annotated[TokenPayload | InitialTokenPayload, Depends(get_current_user)]

OptionalCurrentUser = Annotated[
    TokenPayload | InitialTokenPayload | None,
    Depends(get_optional_current_user),
]
