import time
import httpx
from typing import Dict, Any, List, Optional
from config import settings
from database import get_db_connection

class OllamaServiceException(Exception):
    def __init__(self, message: str, status_code: int = 502, error_type: str = "OLLAMA_ERROR"):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.error_type = error_type

class OllamaConnectionError(OllamaServiceException):
    def __init__(self, message: str):
        super().__init__(message, status_code=503, error_type="OLLAMA_UNAVAILABLE")

class OllamaModelNotFoundError(OllamaServiceException):
    def __init__(self, message: str):
        super().__init__(message, status_code=404, error_type="MODEL_NOT_FOUND")

class OllamaTimeoutError(OllamaServiceException):
    def __init__(self, message: str):
        super().__init__(message, status_code=504, error_type="OLLAMA_TIMEOUT")

class OllamaAPIError(OllamaServiceException):
    def __init__(self, message: str, status_code: int = 502):
        super().__init__(message, status_code=status_code, error_type="OLLAMA_API_ERROR")

class OllamaService:
    def __init__(self):
        self._last_health_check: float = 0.0
        self._cached_health: Optional[Dict[str, Any]] = None
        self._health_ttl: float = 5.0  # 5 seconds cache

    def get_effective_config(self) -> Dict[str, str]:
        """Fetch active base URL and model from SQLite settings or fallback to config."""
        base_url = settings.OLLAMA_BASE_URL
        model = settings.OLLAMA_MODEL
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT key, value FROM app_settings WHERE key IN ('ollama_base_url', 'ollama_model')")
            rows = cursor.fetchall()
            for row in rows:
                if row["key"] == "ollama_base_url" and row["value"]:
                    base_url = row["value"]
                elif row["key"] == "ollama_model" and row["value"]:
                    model = row["value"]
            conn.close()
        except Exception:
            pass
        return {"base_url": base_url.rstrip("/"), "model": model}

    async def check_health(self, force_refresh: bool = False, custom_url: Optional[str] = None, custom_model: Optional[str] = None) -> Dict[str, Any]:
        cfg = self.get_effective_config()
        base_url = (custom_url or cfg["base_url"]).rstrip("/")
        model_name = custom_model or cfg["model"]

        now = time.time()
        if not force_refresh and not custom_url and not custom_model and self._cached_health and (now - self._last_health_check < self._health_ttl):
            return self._cached_health

        result: Dict[str, Any] = {
            "connected": False,
            "status": "Ghost Missing",
            "configured_model": model_name,
            "model_available": False,
            "available_models": [],
            "base_url": base_url,
            "error_message": None,
            "troubleshooting_guidance": None
        }

        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                resp = await client.get(f"{base_url}/api/tags")
                if resp.status_code == 200:
                    data = resp.json()
                    models = [m.get("name", "") for m in data.get("models", [])]
                    result["connected"] = True
                    result["available_models"] = models
                    
                    # Normalize model comparison (e.g. gemma2:2b vs gemma2:2b:latest or gemma2)
                    model_found = any(
                        m == model_name or m.startswith(f"{model_name}:") or model_name.startswith(f"{m}:")
                        for m in models
                    )
                    result["model_available"] = model_found

                    if model_found:
                        result["status"] = "Ghost Awake"
                    else:
                        result["status"] = "Model Missing"
                        result["troubleshooting_guidance"] = (
                            f"Ollama is running, but the configured model '{model_name}' was not found. "
                            f"Run `ollama pull {model_name}` in PowerShell, or select one of the available models: "
                            f"{', '.join(models) if models else 'None installed'}."
                        )
                else:
                    result["status"] = "Ghost Missing"
                    result["error_message"] = f"Ollama returned HTTP status {resp.status_code}."
                    result["troubleshooting_guidance"] = "Verify that the Ollama service is functioning and accessible."
        except (httpx.ConnectError, httpx.ConnectTimeout):
            result["status"] = "Ghost Missing"
            result["error_message"] = f"Could not connect to Ollama at {base_url}."
            result["troubleshooting_guidance"] = (
                "Ollama does not appear to be running. Open PowerShell and run `ollama serve` "
                "or launch the Ollama desktop application."
            )
        except Exception as e:
            result["status"] = "Ghost Missing"
            result["error_message"] = str(e)
            result["troubleshooting_guidance"] = "An unexpected error occurred while communicating with Ollama."

        if not custom_url and not custom_model:
            self._cached_health = result
            self._last_health_check = now

        return result

    async def generate(self, prompt: str, system_prompt: Optional[str] = None, model: Optional[str] = None, timeout: Optional[float] = None) -> str:
        cfg = self.get_effective_config()
        base_url = cfg["base_url"]
        target_model = model or cfg["model"]
        req_timeout = timeout or settings.TIMEOUT_SECONDS

        # First check connection health
        health = await self.check_health()
        if not health["connected"]:
            raise OllamaConnectionError(
                f"Cannot contact the ghost: Ollama is not running at {base_url}. "
                "Please start Ollama via `ollama serve` or the desktop app."
            )
        if not health["model_available"]:
            raise OllamaModelNotFoundError(
                f"The ghost model '{target_model}' is missing from Ollama. "
                f"Install it with `ollama pull {target_model}`."
            )

        payload: Dict[str, Any] = {
            "model": target_model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.4,
                "top_p": 0.9,
            }
        }
        if system_prompt:
            payload["system"] = system_prompt

        try:
            async with httpx.AsyncClient(timeout=req_timeout) as client:
                resp = await client.post(f"{base_url}/api/generate", json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    response_text = data.get("response", "").strip()
                    if not response_text:
                        raise OllamaAPIError("Ollama returned an empty response from the ghost model.")
                    return response_text
                elif resp.status_code == 404:
                    raise OllamaModelNotFoundError(f"Model '{target_model}' was not found by Ollama.")
                else:
                    raise OllamaAPIError(f"Ollama error {resp.status_code}: {resp.text}")
        except httpx.TimeoutException:
            raise OllamaTimeoutError(
                f"The summoning took too long ({req_timeout}s timeout). "
                "The local model might be under heavy load or processing a very long prompt."
            )
        except httpx.ConnectError:
            raise OllamaConnectionError(f"Connection lost while communicating with Ollama at {base_url}.")

ollama_service = OllamaService()
