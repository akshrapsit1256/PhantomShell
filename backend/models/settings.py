from pydantic import BaseModel, Field
from typing import Optional, List

class AppSettings(BaseModel):
    ollama_base_url: str = Field(default="http://localhost:11434")
    ollama_model: str = Field(default="gemma2:2b")
    personality: str = Field(default="Friendly Ghost")
    reduced_motion: bool = Field(default=False)
    halloween_theme: bool = Field(default=True)

class UpdateSettingsRequest(BaseModel):
    ollama_base_url: Optional[str] = None
    ollama_model: Optional[str] = None
    personality: Optional[str] = None
    reduced_motion: Optional[bool] = None
    halloween_theme: Optional[bool] = None

class TestConnectionRequest(BaseModel):
    ollama_base_url: Optional[str] = None
    ollama_model: Optional[str] = None

class TestConnectionResponse(BaseModel):
    connected: bool
    status_message: str
    available_models: List[str]
    model_found: bool
    suggested_action: Optional[str] = None
