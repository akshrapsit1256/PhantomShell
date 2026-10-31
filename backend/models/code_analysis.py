from pydantic import BaseModel, Field
from typing import Optional, List

class CodeAnalysisRequest(BaseModel):
    code: str = Field(..., min_length=1, max_length=50000, description="Code snippet or algorithm implementation")
    language: Optional[str] = Field("Auto Detect", description="Source programming language")
    action: str = Field(..., description="Action: Explain Code | Find Potential Bugs | Complexity Analysis | Find Edge Cases | Improve Readability | Compare Approaches | Convert Language | Explain Algorithm | Suggest Unit Tests | Security Review")
    target_language: Optional[str] = Field(None, description="Target language if action is Convert Language")
    context: Optional[str] = Field(None, max_length=2000, description="Additional context or questions")
    personality: Optional[str] = Field(None, description="Selected ghost personality")

class CodeAnalysisResponse(BaseModel):
    action: str
    language: str
    target_language: Optional[str] = None
    summary: str
    detailed_analysis: str
    complexity_notes: Optional[str] = None
    proposed_code: Optional[str] = None
    edge_cases: Optional[List[str]] = None
    raw_markdown: str
