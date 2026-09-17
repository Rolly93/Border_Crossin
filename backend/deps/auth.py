from typing import Optional, Union, Annotated

import jwt
from fastapi import Depends, Header, HTTPException, Query, Request, status
from schema.token_schema import InitialTokenPayload, TokenPayload
from service.jwt_service import JWTService

jwt_service = JWTService()


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
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Query(None),
) -> Optional[Union[TokenPayload, InitialTokenPayload]]:
    jwt_token = jwt_service.extract_token_from_header(authorization) or token

    if not jwt_token or jwt_token.strip().lower() in ("undefined", "null", "none", ""):
        return None

    try:
        return get_current_user(rq=rq, authorization=authorization, token=token)
    except HTTPException:
        return None


CurrentUser = Annotated[
    Union[TokenPayload, InitialTokenPayload], Depends(get_current_user)
]
OptionalCurrentUser = Annotated[
    Optional[Union[TokenPayload, InitialTokenPayload]],
    Depends(get_optional_current_user),
]
