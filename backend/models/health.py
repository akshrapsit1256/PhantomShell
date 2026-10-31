from pydantic import BaseModel
from typing import List, Optional

class SystemHealthResponse(BaseModel):
    backend_status: str
    database_status: str
    ollama_connected: bool
    ollama_status: str
    configured_model: str
    model_available: bool
    available_models: List[str]
    ollama_url: str
    error_message: Optional[str] = None
    troubleshooting_guidance: Optional[str] = None
