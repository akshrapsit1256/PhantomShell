import os
from pathlib import Path
from pydantic_settings import BaseSettings
from typing import List

BASE_DIR = Path(__file__).resolve().parent

class Settings(BaseSettings):
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "gemma2:2b"
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    DATABASE_PATH: str = str(BASE_DIR / "phantomshell.db")
    DEFAULT_PERSONALITY: str = "Friendly Ghost"
    TIMEOUT_SECONDS: float = 90.0
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    model_config = {
        "env_file": str(BASE_DIR / ".env"),
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }

settings = Settings()
