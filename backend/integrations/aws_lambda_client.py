import httpx
import logging

logger = logging.getLogger(__name__)


class AssignationLambdaClient:
    def __init__(self, endpoint_url: str, api_key: str, timeout: float = 10.0):
        self.endpoint_url = endpoint_url
        self.api_key = api_key
        self.timeout = timeout

    def send_notice(self, to: list[str], subject: str, html: str) -> None:
        payload = {
            "to": to,
            "subject": subject,
            "html": html,
        }

        logger.info(
            "Sending email notification to %d recipients",
            len(to),
        )

        headers = {
            "x-api-key": self.api_key,
            "Content-Type": "application/json",
        }
        with httpx.Client(timeout=self.timeout) as client:
            response = client.post(self.endpoint_url, json=payload, headers=headers)
            response.raise_for_status()
