import pytest

async def test_health_endpoint(client):
    response = await client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert "backend_status" in data
    assert data["backend_status"] == "Running"
    assert "database_status" in data
    assert "ollama_connected" in data
    assert "configured_model" in data
    assert "ollama_url" in data

async def test_root_endpoint(client):
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "PhantomShell" in data["name"]
    assert "status" in data
