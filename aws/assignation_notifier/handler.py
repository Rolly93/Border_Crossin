# aws/assignation_notifier/handler.py
import json
import os
import boto3
from botocore.exceptions import ClientError

ses_client = boto3.client(
    "ses",
    region_name=os.environ.get("AWS_REGION", "us-east-1"),
)


def _response(status_code: int, body: dict) -> dict:
    return {
        "statusCode": status_code,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(body),
    }


def lambda_handler(event, context):
    # 1. Validar acceso a la Lambda (ejemplo con token en header)
    expected_token = os.environ.get("LAMBDA_API_TOKEN")
    headers = {k.lower(): v for k, v in ((event.get("headers") or {}).items())}
    if not expected_token or headers.get("x-api-token") != expected_token:
        return _response(403, {"error": "Acceso no autorizado"})

    # 2. Leer y validar payload
    try:
        raw_body = event.get("body") or "{}"
        body = json.loads(raw_body) if isinstance(raw_body, str) else raw_body
    except json.JSONDecodeError:
        return _response(400, {"error": "JSON inválido"})

    tag = body.get("tag")
    gafe = body.get("gafe")
    client_email = body.get("client_email")

    if (
        not isinstance(tag, str)
        or not tag.strip()
        or not isinstance(gafe, str)
        or not gafe.strip()
        or not isinstance(client_email, list)
        or len(client_email) == 0
    ):
        return _response(
            400, {"error": "Faltan datos obligatorios: tag, gafe o client_email"}
        )

    sender_email = os.environ.get("SES_SENDER_EMAIL")
    if not sender_email:
        return _response(500, {"error": "Remitente SES no configurado"})

    # 3. Enviar correo con Amazon SES
    subject = f"Asignación registrada | TAG: {tag} | GAFE: {gafe}"
    text_body = (
        f"Se ha registrado una asignación.\n"
        f"TAG: {tag}\n"
        f"GAFE: {gafe}\n"
        f"Destinatarios: {', '.join(client_email)}\n"
    )

    try:
        ses_response = ses_client.send_email(
            Source=sender_email,
            Destination={"ToAddresses": client_email},
            Message={
                "Subject": {"Data": subject, "Charset": "UTF-8"},
                "Body": {"Text": {"Data": text_body, "Charset": "UTF-8"}},
            },
        )
    except ClientError as exc:
        return _response(
            502, {"error": "Error al enviar correo en SES", "detail": str(exc)}
        )

    return _response(
        200,
        {
            "status": "sent",
            "message_id": ses_response.get("MessageId"),
            "recipients": client_email,
        },
    )
