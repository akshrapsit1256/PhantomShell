from pydantic import BaseModel, Field
from typing import Optional, List

class ErrorAnalysisRequest(BaseModel):
    error_message: str = Field(..., min_length=1, max_length=30000, description="Error message, traceback or compiler output")
    code_snippet: Optional[str] = Field(None, max_length=30000, description="Related code snippet")
    language_or_env: Optional[str] = Field("Auto Detect", description="Programming language, runtime, or build tool")
    user_intent: Optional[str] = Field(None, max_length=2000, description="What the user was trying to accomplish")
    version_info: Optional[str] = Field(None, max_length=500, description="Framework, compiler, or library versions")
    personality: Optional[str] = Field(None, description="Selected ghost personality")

class ErrorAnalysisResponse(BaseModel):
    error_summary: str
    evidence: str
    likely_cause: str
    investigation_steps: List[str]
    possible_fixes: List[str]
    edge_cases: List[str]
    missing_information: str
    confidence: str  # High, Medium, Low
    confidence_rationale: str
    raw_markdown: str
    language_or_env: str
