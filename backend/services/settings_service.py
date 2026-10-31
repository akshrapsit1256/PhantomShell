from datetime import datetime, timezone
from typing import Dict, Any, Optional
from database import get_db_connection
from config import settings
from services.ollama_service import ollama_service
from models.settings import AppSettings, UpdateSettingsRequest, TestConnectionResponse

class SettingsService:
    @staticmethod
    def get_settings() -> AppSettings:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT key, value FROM app_settings")
        rows = cursor.fetchall()
        conn.close()

        data = {
            "ollama_base_url": settings.OLLAMA_BASE_URL,
            "ollama_model": settings.OLLAMA_MODEL,
            "personality": settings.DEFAULT_PERSONALITY,
            "reduced_motion": False,
            "halloween_theme": True,
        }

        for r in rows:
            k, v = r["key"], r["value"]
            if k == "ollama_base_url" and v:
                data["ollama_base_url"] = v
            elif k == "ollama_model" and v:
                data["ollama_model"] = v
            elif k == "personality" and v:
                data["personality"] = v
            elif k == "reduced_motion":
                data["reduced_motion"] = v.lower() in ("true", "1")
            elif k == "halloween_theme":
                data["halloween_theme"] = v.lower() in ("true", "1")

        return AppSettings(**data)

    @staticmethod
    def update_settings(req: UpdateSettingsRequest) -> AppSettings:
        conn = get_db_connection()
        cursor = conn.cursor()
        now = datetime.now(timezone.utc).isoformat()

        updates = []
        if req.ollama_base_url is not None:
            updates.append(("ollama_base_url", req.ollama_base_url.strip().rstrip("/"), now))
        if req.ollama_model is not None:
            updates.append(("ollama_model", req.ollama_model.strip(), now))
        if req.personality is not None:
            updates.append(("personality", req.personality.strip(), now))
        if req.reduced_motion is not None:
            updates.append(("reduced_motion", "true" if req.reduced_motion else "false", now))
        if req.halloween_theme is not None:
            updates.append(("halloween_theme", "true" if req.halloween_theme else "false", now))

        for key, val, updated_at in updates:
            cursor.execute(
                """
                INSERT INTO app_settings (key, value, updated_at)
                VALUES (?, ?, ?)
                ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at
                """,
                (key, val, updated_at)
            )

        conn.commit()
        conn.close()
        return SettingsService.get_settings()

    @staticmethod
    async def test_connection(custom_url: Optional[str] = None, custom_model: Optional[str] = None) -> TestConnectionResponse:
        current = SettingsService.get_settings()
        target_url = (custom_url or current.ollama_base_url).strip().rstrip("/")
        target_model = (custom_model or current.ollama_model).strip()

        health = await ollama_service.check_health(
            force_refresh=True,
            custom_url=target_url,
            custom_model=target_model
        )

        suggested = None
        if not health["connected"]:
            status_msg = f"Cannot reach Ollama at {target_url}."
            suggested = "Ensure the Ollama application or daemon is running (run `ollama serve` in PowerShell)."
        elif not health["model_available"]:
            status_msg = f"Connected to Ollama, but model '{target_model}' was not found."
            suggested = f"Pull the model using `ollama pull {target_model}`."
        else:
            status_msg = f"Ghost is awake! Connected to Ollama and model '{target_model}' is ready."

        return TestConnectionResponse(
            connected=health["connected"],
            status_message=status_msg,
            available_models=health.get("available_models", []),
            model_found=health.get("model_available", False),
            suggested_action=suggested
        )

settings_service = SettingsService()
