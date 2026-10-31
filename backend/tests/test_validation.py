import pytest

async def test_chat_empty_message_validation(client):
    response = await client.post("/api/chat", json={"message": "   "})
    assert response.status_code in [400, 422]

async def test_errors_empty_input_validation(client):
    response = await client.post("/api/errors/analyze", json={"error_message": ""})
    assert response.status_code in [400, 422]

async def test_commands_empty_input_validation(client):
    response = await client.post("/api/commands/explain", json={"command": ""})
    assert response.status_code in [400, 422]

async def test_code_empty_input_validation(client):
    response = await client.post("/api/code/analyze", json={"code": "", "action": "Explain Code"})
    assert response.status_code in [400, 422]

async def test_journal_empty_title_validation(client):
    response = await client.post("/api/journal", json={
        "title": "",
        "entry_type": "chat",
        "language_or_subject": "Python",
        "original_prompt": "hello",
        "ai_response": "world"
    })
    assert response.status_code in [400, 422]
