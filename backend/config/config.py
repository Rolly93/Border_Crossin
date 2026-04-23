import os
from dotenv import load_dotenv
from pathlib import Path
import os
from dataclasses import dataclass

class Env():
    """docstring for Env."""
    def __init__(self):
        super(Env, self).__init__()
    env_path = Path(__file__).resolve().parent.parent / '.env'
    load_dotenv(dotenv_path=env_path)
    VITE_API_URL = os.getenv("VITE_API_URL",)
    PORT = int(os.getenv("PORT", 8000))
    VITE_USE_MOCK = bool(os.getenv("VITE_USE_MOCK",False))
    USER_EMAIL = str(os.getenv("USER_EMAIL",False))
    USER_PASSWORD = str(os.getenv("USER_PASSWORD",False))
    
    

load_dotenv()
@dataclass(frozen=True)
class SFTPConfig:
    HOST: str = os.getenv("SFTP_HOST")
    PORT: str = os.getenv("SFTP_PORT","22")
    USER: str = os.getenv("SFTP_USER")
    PASSWORD: str = os.getenv("SFTP_PASS")

@dataclass (frozen=True)
class EmailConfig:
    USERNAME: str = os.getenv("MAIL_USERNAME")
    PASSWORD : str = os.getenv("MAIL_PASSWORD")
    SERVER : str = os.getenv("MAIL_SERVER")
    PORT: str = int(os.getenv("MAIL_PORT"))
    MAIL_FROM: str =  os.getenv("MAIL_FROM")
    