import logging
import re

import httpx

from config import Env

logger = logging.getLogger(__name__)

# Meta rechaza parámetros de plantilla con saltos de línea, tabs o >4 espacios seguidos.
_WHITESPACE = re.compile(r"\s+")
MAX_PARAM_LENGTH = 200


def _clean_param(value: str) -> str:
    text = _WHITESPACE.sub(" ", value).strip()
    return text[:MAX_PARAM_LENGTH] or "-"


class MetaWhatsAppClient:
    """Envía mensajes de plantilla por WhatsApp Cloud API (Meta).

    Los mensajes iniciados por el negocio requieren una plantilla aprobada.
    """

    def __init__(
        self,
        token: str,
        phone_number_id: str,
        template: str,
        language: str,
        api_version: str,
        timeout: float = 10.0,
    ):
        self._url = f"https://graph.facebook.com/{api_version}/{phone_number_id}/messages"
        self._token = token
        self._template = template
        self._language = language
        self._timeout = timeout

    def send_template(self, to: str, params: list[str]) -> None:
        payload = {
            "messaging_product": "whatsapp",
            "to": to,
            "type": "template",
            "template": {
                "name": self._template,
                "language": {"code": self._language},
                "components": [
                    {
                        "type": "body",
                        "parameters": [
                            {"type": "text", "text": _clean_param(p)} for p in params
                        ],
                    }
                ],
            },
        }
        headers = {"Authorization": f"Bearer {self._token}"}
        with httpx.Client(timeout=self._timeout) as client:
            response = client.post(self._url, json=payload, headers=headers)
            response.raise_for_status()


def get_whatsapp_client() -> MetaWhatsAppClient | None:
    """None (no-op) si falta cualquier dato de configuración."""
    env = Env()
    required = (
        env.WHATSAPP_TOKEN,
        env.WHATSAPP_PHONE_NUMBER_ID,
        env.WHATSAPP_TEMPLATE,
        env.WHATSAPP_API_VERSION,
    )
    if not all(required):
        logger.debug("WhatsApp de alertas no configurado; se omite.")
        return None
    return MetaWhatsAppClient(
        token=env.WHATSAPP_TOKEN,
        phone_number_id=env.WHATSAPP_PHONE_NUMBER_ID,
        template=env.WHATSAPP_TEMPLATE,
        language=env.WHATSAPP_TEMPLATE_LANG,
        api_version=env.WHATSAPP_API_VERSION,
    )
