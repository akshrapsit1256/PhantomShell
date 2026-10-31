import os
import pytest
import tempfile
from pathlib import Path
from unittest.mock import patch, AsyncMock

temp_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
temp_db_path = temp_db.name
temp_db.close()

os.environ["DATABASE_PATH"] = temp_db_path

from config import settings
settings.DATABASE_PATH = temp_db_path

from database import init_db
from main import app
from httpx import AsyncClient, ASGITransport

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    init_db()
    yield
    try:
        if os.path.exists(temp_db_path):
            os.remove(temp_db_path)
    except Exception:
        pass

@pytest.fixture(autouse=True)
def mock_ollama_health():
    mock_health = {
        "connected": True,
        "status": "Ghost Awake",
        "configured_model": "gemma2:2b",
        "model_available": True,
        "available_models": ["gemma2:2b"],
        "base_url": "http://localhost:11434",
        "error_message": None,
        "troubleshooting_guidance": None
    }
    with patch("services.ollama_service.ollama_service.check_health", new=AsyncMock(return_value=mock_health)):
        yield

@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c

