import os
from dotenv import load_dotenv
from pathlib import Path

class Env():
    """docstring for Env."""
    def __init__(self):
        super(Env, self).__init__()
    env_path = Path(__file__).resolve().parent.parent / '.env'
    load_dotenv(dotenv_path=env_path)
    URL = os.getenv("VITE_API_URL", "http://localhost:5173")
    PORT = int(os.getenv("PORT", 8000))
    VITE_USE_MOCK = bool(os.getenv("VITE_USE_MOCK",False))
    