import os
import socket
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

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

    # Separate keys for JWT and Fernet (security best practice)
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "").strip('"').strip("'")
    FERNET_KEY = os.getenv("FERNET_KEY", "").strip('"').strip("'")
    
    # Backwards compatibility: fall back to SECRET_KEY if new keys not set
    SECRET_KEY = JWT_SECRET_KEY or os.getenv("SECRET_KEY", "").strip('"').strip("'")
    
    ALGORITHM = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30)
    )
    DATABASE_URL = os.getenv("DATABASE_URL", "")

    # Alertas de errores del servidor a soporte (email vía Lambda + WhatsApp Cloud API).
    INSTALLATION_NAME = os.getenv("INSTALLATION_NAME", "") or socket.gethostname()
    ALERT_EMAILS = [e.strip() for e in os.getenv("ALERT_EMAILS", "").split(",") if e.strip()]
    ALERT_WHATSAPP_TO = os.getenv("ALERT_WHATSAPP_TO", "").strip()
    WHATSAPP_TOKEN = os.getenv("WHATSAPP_TOKEN", "").strip()
    WHATSAPP_PHONE_NUMBER_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID", "").strip()
    WHATSAPP_TEMPLATE = os.getenv("WHATSAPP_TEMPLATE", "").strip()
    WHATSAPP_TEMPLATE_LANG = os.getenv("WHATSAPP_TEMPLATE_LANG", "es_MX").strip()
    WHATSAPP_API_VERSION = os.getenv("WHATSAPP_API_VERSION", "").strip()


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
