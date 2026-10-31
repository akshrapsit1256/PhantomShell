from pydantic import BaseModel, Field
from typing import Optional, List

class JournalEntryCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    entry_type: str = Field(..., description="chat | error | command | code")
    language_or_subject: str = Field(..., min_length=1, max_length=100)
    original_prompt: str = Field(..., min_length=1)
    ai_response: str = Field(..., min_length=1)
    tags: Optional[str] = Field(default="", description="Comma-separated tags")

class JournalEntry(BaseModel):
    id: int
    title: str
    entry_type: str
    language_or_subject: str
    original_prompt: str
    ai_response: str
    tags: str
    created_at: str

class JournalListResponse(BaseModel):
    entries: List[JournalEntry]
    total_count: int

class SecretCheckResponse(BaseModel):
    has_potential_secrets: bool
    findings: List[str]
    warning_message: Optional[str] = None
