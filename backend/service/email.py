import logging
import os
from typing import Literal

from pydantic import EmailStr, TypeAdapter

from deps.auth import LambdaClientDep
from integrations.aws_lambda_client import AssignationLambdaClient
from schema.email_schema import PayloadAssginationNotificationEvent

logger = logging.getLogger(__name__)
_EMAILS_ADAPTER = TypeAdapter(list[EmailStr])

ShipmentStatusEvent = Literal[
    "recoleccion",
    "salida",
    "modulacion_mex",
    "modulacion_usa",
    "entrega",
]


class EmailNotificationDispatcher:
    def __init__(
        self,
        lambda_client: LambdaClientDep | None = None,
        timeout: float = 10.0,
    ) -> None:
        self._lambda_client = lambda_client
        self._timeout = timeout

    def _get_client(self) -> AssignationLambdaClient | None:
        if self._lambda_client is not None:
            return self._lambda_client

        endpoint_url = os.getenv("ASSIGNATION_LAMBDA_URL")
        api_key = os.getenv("ASSIGNATION_LAMBDA_API_KEY")
        if not endpoint_url or not api_key:
            logger.debug(
                "Notificación omitida: faltan ASSIGNATION_LAMBDA_URL o ASSIGNATION_LAMBDA_API_KEY."
            )
            return None

        self._lambda_client = AssignationLambdaClient(
            endpoint_url=endpoint_url,
            api_key=api_key,
            timeout=self._timeout,
        )
        return self._lambda_client

    @staticmethod
    def _validate_emails(emails: list[str]) -> list[str]:
        return [str(e) for e in _EMAILS_ADAPTER.validate_python(emails)]

    def send_assignation(self, payload: PayloadAssginationNotificationEvent) -> None:
        validated_emails = self._validate_emails(payload.target_email)
        if not validated_emails:
            return

        client = self._get_client()
        if not client:
            return

        try:
            client.send_assignation_notice(payload)
        except Exception:
            logger.exception(
                "Error al enviar notificación de asignación vía Lambda para tag=%s", payload.tag
            )

    def send_status(
        self, reference: str, status_event: ShipmentStatusEvent, emails: list[str]
    ) -> None:
        validated_emails = self._validate_emails(emails)
        if not validated_emails:
            return

        client = self._get_client()
        if not client:
            return

        logger.info(
            "Preparando notificación de estatus '%s' para referencia=%s a %d destinatarios",
            status_event,
            reference,
            len(validated_emails),
        )
