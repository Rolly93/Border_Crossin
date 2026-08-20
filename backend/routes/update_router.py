import os
import sys
import shutil
import zipfile
import subprocess
from typing import Dict, Any
from fastapi import APIRouter, BackgroundTasks, HTTPException, status
from fastapi_utils.cbv import cbv
import requests

router = APIRouter()


@cbv(router)
class UpdatedTask:
    def __init__(self) -> None:
        self._APPVERSION: str = "1.0.0"
        self._REMOTESERVER: str = "https://your-remote-server.com"
        self._BASE_DIR: str = os.path.dirname(os.path.abspath(sys.argv[0]))
        self._STATIC_DIR: str = os.path.join(self._BASE_DIR, "static")

    @router.get("/api/v1/health")
    async def health_check(self) -> Dict[str, str]:
        return {"status": "ok", "version": self._APPVERSION}

    @router.get("/api/v1/check")
    async def check_update(self) -> Dict[str, Any]:
        try:
            res = requests.get(
                f"{self._REMOTESERVER}/api/check?version={self._APPVERSION}",
                timeout=5,
            )
            if res.status_code == 200:
                return res.json()
        except Exception:
            pass

        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Update Not Available",
        )

    @router.post("/api/v1/update/apply-frontend")
    async def apply_frontend_update(self, payload: Dict[str, str]) -> Dict[str, str]:
        """Downloads new React static bundle and extracts it over static directory."""
        download_url = payload.get("url")
        if not download_url:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing download URL",
            )

        temp_dir = os.getenv("TEMP", "/tmp")
        zip_path = os.path.join(temp_dir, "ui_update.zip")

        # 1. Download bundle
        with requests.get(download_url, stream=True) as r:
            r.raise_for_status()
            with open(zip_path, "wb") as f:
                shutil.copyfileobj(r.raw, f)

        # 2. Extract over static directory
        with zipfile.ZipFile(zip_path, "r") as zip_ref:
            zip_ref.extractall(self._STATIC_DIR)

        if os.path.exists(zip_path):
            os.remove(zip_path)

        return {"message": "Frontend updated. Refresh browser window."}

    @router.post("/api/v1/update/apply-full")
    async def apply_full_update(
        self, payload: Dict[str, str], background_tasks: BackgroundTasks
    ) -> Dict[str, str]:
        """Schedules background process to kill app, swap executable files, and restart."""
        download_url = payload.get("url")
        if not download_url:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing download URL",
            )

        def execute_updater(url: str) -> None:
            temp_dir = os.getenv("TEMP", "/tmp")
            zip_path = os.path.join(temp_dir, "full_app.zip")

            with requests.get(url, stream=True) as r:
                r.raise_for_status()
                with open(zip_path, "wb") as f:
                    shutil.copyfileobj(r.raw, f)

            pid = os.getpid()
            if sys.platform == "win32":
                updater_bat = os.path.join(temp_dir, "updater.bat")
                content = f"""@echo off
timeout /t 2 /nobreak > nul
taskkill /F /PID {pid} > nul 2>&1
powershell -Command "Expand-Archive -Path '{zip_path}' -DestinationPath '{self._BASE_DIR}' -Force"
start "" "{sys.executable}"
del "%~f0"
"""
                with open(updater_bat, "w") as f:
                    f.write(content)

                subprocess.Popen(
                    ["cmd.exe", "/c", updater_bat],
                    creationflags=subprocess.CREATE_NEW_CONSOLE,
                )

        background_tasks.add_task(execute_updater, download_url)
        return {"message": "Shutting down for full update..."}
