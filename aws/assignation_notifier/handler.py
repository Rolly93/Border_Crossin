"""Envío de correos (avisos a clientes y alertas a soporte) con Amazon SES.

Contrato (el mismo que usa el backend en AssignationLambdaClient.send_notice):
    Header: x-api-key: <LAMBDA_API_TOKEN>   (también se acepta x-api-token)
    Body:   {"to": ["a@b.com", ...], "subject": "...", "html": "<p>...</p>"}

Variables de entorno: LAMBDA_API_TOKEN, SES_SENDER_EMAIL, AWS_REGION (opcional).
"""

import hmac
import html as html_lib
import json
import os
import re

import boto3
from botocore.exceptions import ClientError

ses_client = boto3.client(
    "ses",
    region_name=os.environ.get("AWS_REGION", "us-east-1"),
)

MAX_RECIPIENTS = 50  # límite de SES por mensaje
_TAGS = re.compile(r"<[^>]+>")


def _response(status_code: int, body: dict) -> dict:
    return {
        "statusCode": status_code,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(body),
    }


def _authorized(headers: dict) -> bool:
    expected = os.environ.get("LAMBDA_API_TOKEN")
    provided = headers.get("x-api-key") or headers.get("x-api-token") or ""
    return bool(expected) and hmac.compare_digest(provided, expected)


def _plain_text(html_body: str) -> str:
    """Respaldo en texto para clientes de correo que no muestran HTML."""
    text = re.sub(r"<(br|/p|/h\d|/tr|/li)\s*/?>", "\n", html_body, flags=re.I)
    return html_lib.unescape(_TAGS.sub("", text)).strip()


def lambda_handler(event, context):
    headers = {k.lower(): v for k, v in (event.get("headers") or {}).items()}
    if not _authorized(headers):
        return _response(403, {"error": "Acceso no autorizado"})

    try:
        raw_body = event.get("body") or "{}"
        body = json.loads(raw_body) if isinstance(raw_body, str) else raw_body
    except json.JSONDecodeError:
        return _response(400, {"error": "JSON inválido"})

    to = body.get("to")
    subject = body.get("subject")
    html_body = body.get("html")
    if (
        not isinstance(to, list)
        or not to
        or not all(isinstance(t, str) and "@" in t for t in to)
        or not isinstance(subject, str)
        or not subject.strip()
        or not isinstance(html_body, str)
        or not html_body.strip()
    ):
        return _response(400, {"error": "Faltan datos obligatorios: to (lista), subject, html"})
    if len(to) > MAX_RECIPIENTS:
        return _response(400, {"error": f"Máximo {MAX_RECIPIENTS} destinatarios"})

    sender_email = os.environ.get("SES_SENDER_EMAIL")
    if not sender_email:
        return _response(500, {"error": "Remitente SES no configurado"})

    try:
        ses_response = ses_client.send_email(
            Source=sender_email,
            Destination={"ToAddresses": to},
            Message={
                "Subject": {"Data": subject.strip()[:998], "Charset": "UTF-8"},
                "Body": {
                    "Html": {"Data": html_body, "Charset": "UTF-8"},
                    "Text": {"Data": _plain_text(html_body), "Charset": "UTF-8"},
                },
            },
        )
    except ClientError as exc:
        return _response(502, {"error": "Error al enviar correo en SES", "detail": str(exc)})

    return _response(
        200,
        {"status": "sent", "message_id": ses_response.get("MessageId"), "recipients": to},
    )
