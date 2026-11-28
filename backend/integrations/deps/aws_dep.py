import logging
import os
from typing import Annotated

from fastapi import Depends

from config import Env
from integrations.aws_lambda_client import AssignationLambdaClient

logger = logging.getLogger(__name__)
config = Env()


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


LambdaClientDep = Annotated[AssignationLambdaClient | None, Depends(get_lambda_client)]
