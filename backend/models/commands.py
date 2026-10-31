from pydantic import BaseModel, Field
from typing import Optional, List, Dict

class CommandExplainRequest(BaseModel):
    command: str = Field(..., min_length=1, max_length=10000, description="Command or configuration snippet")
    environment: Optional[str] = Field("Auto Detect", description="Shell, CLI, or configuration environment")
    context: Optional[str] = Field(None, max_length=2000, description="Optional intent or background context")
    personality: Optional[str] = Field(None, description="Selected ghost personality")

class CommandExplainResponse(BaseModel):
    purpose: str
    breakdown: List[Dict[str, str]]  # list of {"part": "...", "description": "..."}
    expected_behavior: str
    risks: str
    risk_level: str  # Safe, Caution, High Risk
    safer_alternative: Optional[str] = None
    example: Optional[str] = None
    environment_notes: str
    raw_markdown: str
    environment: str
