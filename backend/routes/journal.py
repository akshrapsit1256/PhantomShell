from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from models.journal import (
    JournalEntry,
    JournalEntryCreate,
    JournalListResponse,
    SecretCheckResponse
)
from services.journal_service import journal_service

router = APIRouter(prefix="/journal", tags=["Session Journal"])

@router.get("", response_model=JournalListResponse)
async def list_journal_entries(
    search: Optional[str] = None,
    entry_type: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0)
):
    entries, total = journal_service.list_entries(
        search=search,
        entry_type=entry_type,
        limit=limit,
        offset=offset
    )
    return JournalListResponse(entries=entries, total_count=total)

@router.post("", response_model=JournalEntry)
async def create_journal_entry(entry: JournalEntryCreate):
    if not entry.title.strip():
        raise HTTPException(status_code=400, detail="Title cannot be empty.")
    if not entry.original_prompt.strip() or not entry.ai_response.strip():
        raise HTTPException(status_code=400, detail="Prompt and AI response are required to preserve an entry.")

    return journal_service.create_entry(entry)

@router.post("/check-secrets", response_model=SecretCheckResponse)
async def scan_text_for_secrets(payload: dict):
    text = payload.get("text", "")
    return journal_service.check_for_secrets(text)

@router.get("/{entry_id}", response_model=JournalEntry)
async def get_journal_entry(entry_id: int):
    entry = journal_service.get_entry_by_id(entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail=f"Journal entry #{entry_id} not found in the archives.")
    return entry

@router.delete("/{entry_id}")
async def delete_journal_entry(entry_id: int):
    success = journal_service.delete_entry(entry_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Journal entry #{entry_id} not found or already deleted.")
    return {"status": "success", "message": f"Journal entry #{entry_id} banished from history."}
