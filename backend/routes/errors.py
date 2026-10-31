from fastapi import APIRouter, HTTPException
from models.errors import ErrorAnalysisRequest, ErrorAnalysisResponse
from services.error_analysis_service import analyze_error
from services.ollama_service import OllamaServiceException

router = APIRouter(prefix="/errors", tags=["Error Exorcist"])

@router.post("/analyze", response_model=ErrorAnalysisResponse)
async def exorcise_error(req: ErrorAnalysisRequest):
    if not req.error_message or not req.error_message.strip():
        raise HTTPException(status_code=400, detail="Please provide an error message or traceback to analyze.")

    try:
        return await analyze_error(req)
    except OllamaServiceException as ose:
        raise HTTPException(status_code=ose.status_code, detail={"message": ose.message, "error_type": ose.error_type})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analysis failed: {str(e)}")
