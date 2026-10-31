from pydantic import BaseModel, Field
from typing import Optional, List

class ChatMessage(BaseModel):
    role: str = Field(..., description="Role: 'user' or 'assistant' or 'system'")
    content: str = Field(..., min_length=1, max_length=50000)

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=20000, description="User prompt or question")
    language: Optional[str] = Field("Auto Detect", description="Target programming language")
    topic: Optional[str] = Field("Auto Detect", description="Computer Science topic")
    personality: Optional[str] = Field(None, description="Friendly Ghost | Ancient Phantom | Sassy Poltergeist")
    history: Optional[List[ChatMessage]] = Field(default_factory=list, description="Prior conversation messages")

class ChatResponse(BaseModel):
    response: str
    language: str
    topic: str
    personality: str
    model: str
