from fastapi import APIRouter, HTTPException
from models.code_analysis import CodeAnalysisRequest, CodeAnalysisResponse
from services.code_analysis_service import analyze_code
from services.ollama_service import OllamaServiceException

router = APIRouter(prefix="/code", tags=["Code Crypt"])

@router.post("/analyze", response_model=CodeAnalysisResponse)
async def crypt_code_analysis(req: CodeAnalysisRequest):
    if not req.code or not req.code.strip():
        raise HTTPException(status_code=400, detail="Please provide a code snippet to analyze.")
    if not req.action or not req.action.strip():
        raise HTTPException(status_code=400, detail="Please select an analysis action.")

    try:
        return await analyze_code(req)
    except OllamaServiceException as ose:
        raise HTTPException(status_code=ose.status_code, detail={"message": ose.message, "error_type": ose.error_type})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Code Crypt analysis failed: {str(e)}")
