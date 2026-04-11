import webview
import os
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

def start():
    url = os.getenv("VITE_API_URL","http://localhost:5173")
    webview.create_window(
        "Sistema de Logistica - Desktop",
        url,
        width=1200,
        height=800,
        resizable=True
    )
    webview.start
if __name__=="__main__":
    start()