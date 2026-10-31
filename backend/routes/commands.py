from fastapi import APIRouter, HTTPException
from models.commands import CommandExplainRequest, CommandExplainResponse
from services.command_analysis_service import explain_command
from services.ollama_service import OllamaServiceException

router = APIRouter(prefix="/commands", tags=["Command Oracle"])

@router.post("/explain", response_model=CommandExplainResponse)
async def consult_command_oracle(req: CommandExplainRequest):
    if not req.command or not req.command.strip():
        raise HTTPException(status_code=400, detail="Please provide a command or configuration snippet to explain.")

    try:
        return await explain_command(req)
    except OllamaServiceException as ose:
        raise HTTPException(status_code=ose.status_code, detail={"message": ose.message, "error_type": ose.error_type})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Command Oracle consultation failed: {str(e)}")
