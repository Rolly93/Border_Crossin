import os
import sys
import shutil
import zipfile
import requests
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, status
from fastapi_utils.cbv import cbv

router = APIRouter()

# Firebase Remote Config Web API Endpoint or REST Gateway
FIREBASE_REMOTE_CONFIG_URL = "https://firebaseremoteconfig.googleapis.com/v1/projects/YOUR_PROJECT_ID/remoteConfig"


@cbv(router)
class MultiCompanyUpdater:
    def __init__(self) -> None:
        self._APP_VERSION: str = "1.0.0"
        self._BASE_DIR: str = os.path.dirname(os.path.abspath(sys.argv[0]))
        self._STATIC_DIR: str = os.path.join(self._BASE_DIR, "static")

    @router.get("/api/v1/check")
    async def check_update(self, company_id: str = "default") -> Dict[str, Any]:
        """Queries Firebase or custom Remote Config based on Company Tenant ID."""
        try:
            # Query remote config endpoint or a lightweight JSON manifest hosted on CDN
            res = requests.get(
                f"https://your-app.web.app/configs/{company_id}.json", timeout=5
            )

            if res.status_code == 200:
                config = res.json()
                latest_version = config.get("latest_version")

                # Compare versions (e.g., 1.1.0 vs 1.0.0)
                if latest_version and latest_version != self._APP_VERSION:
                    return {
                        "update_available": True,
                        "version": latest_version,
                        "type": config.get("update_type", "frontend"),
                        "url": config.get("download_url"),
                        "mandatory": config.get("mandatory", False),
                    }
        except Exception as e:
            print(f"Failed to fetch remote config: {e}")

        return {"update_available": False, "version": self._APP_VERSION}

    @router.post("/api/v1/update/apply-frontend")
    async def apply_frontend_update(self, payload: Dict[str, str]) -> Dict[str, str]:
        download_url = payload.get("url")
        if not download_url:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Missing download URL"
            )

        temp_dir = os.getenv("TEMP", "/tmp")
        zip_path = os.path.join(temp_dir, "ui_update.zip")

        # 1. Download React bundle build from CDN/Firebase Storage
        with requests.get(download_url, stream=True) as r:
            r.raise_for_status()
            with open(zip_path, "wb") as f:
                shutil.copyfileobj(r.raw, f)

        # 2. Hot-swap static files in place
        with zipfile.ZipFile(zip_path, "r") as zip_ref:
            zip_ref.extractall(self._STATIC_DIR)

        if os.path.exists(zip_path):
            os.remove(zip_path)

        return {"message": "UI successfully updated. Reloading frontend..."}
