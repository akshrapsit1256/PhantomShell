import pytest

async def test_journal_crud_flow(client):
    payload = {
        "title": "Fixing NullPointerException in Java Stream",
        "entry_type": "error",
        "language_or_subject": "Java",
        "original_prompt": "Exception in thread 'main' java.lang.NullPointerException at com.example.Main.main",
        "ai_response": "The stream element encountered a null value before calling .map()",
        "tags": "java, npe, streams"
    }
    create_res = await client.post("/api/journal", json=payload)
    assert create_res.status_code == 200
    created_data = create_res.json()
    assert created_data["id"] > 0
    assert created_data["title"] == payload["title"]
    entry_id = created_data["id"]

    get_res = await client.get(f"/api/journal/{entry_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == entry_id

    list_res = await client.get("/api/journal?search=NullPointerException")
    assert list_res.status_code == 200
    list_data = list_res.json()
    assert list_data["total_count"] >= 1
    assert any(e["id"] == entry_id for e in list_data["entries"])

    filter_res = await client.get("/api/journal?entry_type=error")
    assert filter_res.status_code == 200
    assert any(e["id"] == entry_id for e in filter_res.json()["entries"])

    del_res = await client.delete(f"/api/journal/{entry_id}")
    assert del_res.status_code == 200

    get_after_del = await client.get(f"/api/journal/{entry_id}")
    assert get_after_del.status_code == 404

async def test_secret_detection(client):
    secret_payload = {"text": "My API key is api_key = 'abcdef1234567890abcdef'"}
    res = await client.post("/api/journal/check-secrets", json=secret_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["has_potential_secrets"] is True
    assert len(data["findings"]) > 0

    clean_payload = {"text": "A standard binary search implementation in Python."}
    res_clean = await client.post("/api/journal/check-secrets", json=clean_payload)
    assert res_clean.status_code == 200
    data_clean = res_clean.json()
    assert data_clean["has_potential_secrets"] is False
