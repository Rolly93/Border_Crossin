import os
from dotenv import load_dotenv
from pathlib import Path
from dataclasses import dataclass

# Load .env file if it exists (for local development)
env_path = Path(__file__).resolve().parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)


class Env:
    """Environment configuration."""

    def __init__(self):
        super(Env, self).__init__()

    VITE_API_URL = os.getenv("VITE_API_URL", "http://localhost:8000")
    PORT = int(os.getenv("PORT", 8000))
    USER_EMAIL = os.getenv("USER_EMAIL", "admin@test.com")
    USER_PASSWORD = os.getenv("USER_PASSWORD", "1234")
    SECRET_KEY = os.getenv("SECRET_KEY", "").strip('"').strip("'")
    ALGORITHM = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 480)
    )


@dataclass(frozen=True)
class SFTPConfig:
    HOST: str = os.getenv("SFTP_HOST", "")
    PORT: str = os.getenv("SFTP_PORT", "22")
    USER: str = os.getenv("SFTP_USER", "")
    PASSWORD: str = os.getenv("SFTP_PASS", "")


@dataclass(frozen=True)
class EmailConfig:
    USERNAME: str = os.getenv("MAIL_USERNAME", "")
    PASSWORD: str = str(os.getenv("MAIL_PASSWORD", ""))
    SERVER: str = os.getenv("MAIL_SERVER", "")
    PORT: int = int(os.getenv("MAIL_PORT", 22))
    MAIL_FROM: str = os.getenv("MAIL_FROM", "")
