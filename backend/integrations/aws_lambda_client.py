import json
import httpx


class AssignationLambdaClient:
    def __init__(self, function_url: str, api_token: str, timeout: float = 10.0):
        self.function_url = function_url
        self.api_token = api_token
        self.timeout = timeout

    def send_assignation(self, tag: str, gafe: str, client_email: list[str]) -> dict:
        payload = {
            "tag": tag,
            "gafe": gafe,
            "client_email": client_email,
        }
        headers = {
            "Content-Type": "application/json",
            "x-api-token": self.api_token,
        }
        with httpx.Client(timeout=self.timeout) as client:
            response = client.post(self.function_url, json=payload, headers=headers)
            response.raise_for_status()
            return response.json()
