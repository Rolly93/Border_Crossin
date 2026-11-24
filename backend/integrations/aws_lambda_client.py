import httpx

from schema.email_schema import PayloadAssginationNotificationEvent


class AssignationLambdaClient:
    def __init__(self, endpoint_url: str, api_key: str, timeout: float = 10.0):
        self.endpoint_url = endpoint_url
        self.api_key = api_key
        self.timeout = timeout

    def send_assignation_notice(
        self, payload: PayloadAssginationNotificationEvent
    ) -> None:
        payload = PayloadAssginationNotificationEvent(
            tag=payload.tag,
            gafet=payload.gafet,
            target_email=payload.target_email,
            reference_client=payload.reference_client,
            tracking_reference=payload.tracking_reference,
            cfdi=payload.cfdi or None,
        )

        headers = {"x-api-key": self.api_key}
        with httpx.Client(timeout=self.timeout) as client:
            response = client.post(self.endpoint_url, json=payload, headers=headers)
            response.raise_for_status()
