from fastapi import APIRouter
from services.ollama_service import ollama_service
from database import get_db_connection
from models.health import SystemHealthResponse

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("", response_model=SystemHealthResponse)
async def get_system_health():
    # Real SQLite check
    db_status = "Available"
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        conn.close()
    except Exception as e:
        db_status = f"Database Error: {str(e)}"

    # Real Ollama check
    health_info = await ollama_service.check_health(force_refresh=False)

    return SystemHealthResponse(
        backend_status="Running",
        database_status=db_status,
        ollama_connected=health_info.get("connected", False),
        ollama_status=health_info.get("status", "Ghost Missing"),
        configured_model=health_info.get("configured_model", "gemma2:2b"),
        model_available=health_info.get("model_available", False),
        available_models=health_info.get("available_models", []),
        ollama_url=health_info.get("base_url", "http://localhost:11434"),
        error_message=health_info.get("error_message"),
        troubleshooting_guidance=health_info.get("troubleshooting_guidance")
    )
