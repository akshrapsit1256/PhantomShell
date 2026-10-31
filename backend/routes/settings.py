from fastapi import APIRouter
from models.settings import (
    AppSettings,
    UpdateSettingsRequest,
    TestConnectionRequest,
    TestConnectionResponse
)
from services.settings_service import settings_service

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("", response_model=AppSettings)
async def get_settings():
    return settings_service.get_settings()

@router.post("", response_model=AppSettings)
async def update_settings(req: UpdateSettingsRequest):
    return settings_service.update_settings(req)

@router.post("/test-connection", response_model=TestConnectionResponse)
async def test_ollama_connection(req: TestConnectionRequest):
    return await settings_service.test_connection(
        custom_url=req.ollama_base_url,
        custom_model=req.ollama_model
    )
