import logging
from typing import Literal

from pydantic import EmailStr, TypeAdapter

from deps.auth import LambdaClientDep
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
    def __init__(self, lambda_client: LambdaClientDep | None = None) -> None:
        self._lambda_client = lambda_client

    @staticmethod
    def _validate_emails(emails: list[str]) -> list[str]:
        cleaned = [str(e).strip().lower() for e in emails if e and e.strip()]
        if not cleaned:
            return []

        return [e for e in _EMAILS_ADAPTER.validate_python(emails)]

    def send_assignation(self, payload: PayloadAssginationNotificationEvent) -> None:
        validated_emails = self._validate_emails(payload.target_email)
        if not validated_emails or self._lambda_client is None:
            return

        sanitized_payload = payload.model_copy(
            update={"target_email": validated_emails}
        )

        try:
            self._lambda_client.send_assignation_notice(sanitized_payload)
        except Exception:
            logger.exception(
                "Error al enviar notificación de asignación vía Lambda para tag=%s",
                payload.tag,
            )

    def send_status(
        self, reference: str, status_event: ShipmentStatusEvent, emails: list[str]
    ) -> None:
        validated_emails = self._validate_emails(emails)
        if not validated_emails or self._lambda_client is None:
            return

        logger.info(
            "Preparando notificación de estatus '%s' para referencia=%s a %d destinatarios",
            status_event,
            reference,
            len(validated_emails),
        )
