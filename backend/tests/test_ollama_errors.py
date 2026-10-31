import pytest
from unittest.mock import patch
from services.ollama_service import OllamaConnectionError, OllamaModelNotFoundError

async def test_ollama_unavailable_handling(client):
    with patch("services.ollama_service.ollama_service.generate", side_effect=OllamaConnectionError("Ollama is not running")):
        response = await client.post("/api/chat", json={
            "message": "Explain binary search",
            "language": "Python"
        })
        assert response.status_code == 503
        data = response.json()
        assert "Ollama" in data.get("message", "") or "Ollama" in str(data)

async def test_model_missing_handling(client):
    with patch("services.ollama_service.ollama_service.generate", side_effect=OllamaModelNotFoundError("Model 'gemma2:2b' not found")):
        response = await client.post("/api/chat", json={
            "message": "Explain quicksort",
            "language": "C++"
        })
        assert response.status_code == 404
        data = response.json()
        assert "gemma2:2b" in data.get("message", "") or "not found" in str(data).lower()
