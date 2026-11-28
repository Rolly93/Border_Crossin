import logging
from pathlib import Path

from jinja2 import Environment, FileSystemLoader
from pydantic import EmailStr, TypeAdapter

from integrations.deps.aws_dep import LambdaClientDep
from schema.email_schema import (
    NotificationType,
    PayloadAssginationNotificationEvent,
    PayloadStatusConsolidate,
    PayloadStatusTrailer,
    UnifyNotification,
)
from schema.shipment_shcema import EventCategory, TypeOperation

logger = logging.getLogger(__name__)
_EMAILS_ADAPTER = TypeAdapter(list[EmailStr])


def _report_email_failure(err: Exception, what: str) -> None:
    """El correo a clientes falló (Lambda/SES): es un error del servidor, se alerta."""
    from service import alerting

    title, detail, _ = alerting.describe_exception(err)
    alerting.report("email_failed", f"Correo de {what} no enviado: {title}", detail, location="email:lambda")


class EmailNotificationDispatcher:
    def __init__(self, lambda_client: LambdaClientDep | None = None) -> None:
        self._lambda_client = lambda_client

        template_path = Path(__file__).parent / "templates"
        self._jinja_env = Environment(
            loader=FileSystemLoader(template_path), autoescape=True
        )

    @staticmethod
    def _validate_emails(emails: list[str]) -> list[str]:
        cleaned = [str(e).strip().lower() for e in emails if e and e.strip()]
        if not cleaned:
            return []

        return [e for e in _EMAILS_ADAPTER.validate_python(emails)]

    def _type_status(self, typeService: TypeOperation) -> str:

        if typeService == TypeOperation.NORTHBOUND:
            return "template_export.html"
        else:
            return "template_Import.html"

    def _preparate_template(self, data_email: UnifyNotification) -> str:
        type_template = ""

        match data_email.notification_type:
            case NotificationType.STATUS:
                type_template = self._type_status(
                    TypeOperation(data_email.type_operation)
                )

            case NotificationType.NOTIFACTION:
                type_template = "template_assignation.html"

        context = data_email.model_dump(mode="json")

        if isinstance(data_email, (PayloadStatusConsolidate, PayloadStatusTrailer)):
            events_dates: dict[str, dict[str, str | None] | None] = {
                EventCategory.PICK_UP.value: None,
                EventCategory.DEPARTURE.value: None,
                EventCategory.DELAY.value: None,
                EventCategory.MEX_INSPECCION.value: None,
                EventCategory.CLEAR_MEX.value: None,
                EventCategory.USA_INSPECCION.value: None,
                EventCategory.CLEAR_USA.value: None,
                EventCategory.SAFETY_YARD.value: None,
                EventCategory.DELIVERY.value: None,
            }
            for e in data_email.events or []:
                events_dates[e.category.value] = {
                    "date": e.dateTime.strftime("%m/%d/%Y %H:%M"),
                    "notes": e.notes,
                }

            context["events_dates"] = events_dates

        template = self._jinja_env.get_template(type_template)

        return template.render(**context)

    def send_assignation(self, payload: PayloadAssginationNotificationEvent) -> None:
        validated_emails = self._validate_emails(payload.target_email)
        if not validated_emails or self._lambda_client is None:
            return

        html_body = self._preparate_template(payload)

        subject = (
            f"{payload.type_operation}: Assignation Notice: f{payload.tracking_number} "
        )

        try:
            logger.info(
                "Preparando notificación de asignacion '%s' para referencia=%s a %d destinatarios",
                payload.type_operation,
                payload.customer_tracking,
                len(validated_emails),
            )
            self._lambda_client.send_notice(
                to=validated_emails, subject=subject, html=html_body
            )

        except Exception as e:
            logger.exception(
                "Error al enviar notificación de asignación vía Lambda para tag=%s",
                payload.tag,
            )
            _report_email_failure(e, f"asignación {payload.tracking_number}")

    def send_status(
        self, payload: PayloadStatusTrailer | PayloadStatusConsolidate
    ) -> None:
        validated_emails = self._validate_emails(payload.target_email)
        if not validated_emails or self._lambda_client is None:
            return

        html_body = self._preparate_template(payload)

        subject = f"{payload.type_operation}: Shipment Notice Reference {payload.tracking_number}"

        try:

            logger.info(
                "Preparando notificación de estatus '%s' para referencia=%s a %d destinatarios",
                payload.type_operation,
                payload.customer_tracking,
                len(validated_emails),
            )

            self._lambda_client.send_notice(
                to=validated_emails, subject=subject, html=html_body
            )

        except Exception as e:
            logger.exception(
                "Error sending status notification for tracking=%s",
                payload.tracking_number,
            )
            _report_email_failure(e, f"estatus {payload.tracking_number}")
