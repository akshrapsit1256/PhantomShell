from fastapi import APIRouter, HTTPException
from models.chat import ChatRequest, ChatResponse
from services.ollama_service import ollama_service, OllamaServiceException
from services.prompt_service import (
    get_active_personality,
    build_system_prompt,
    build_chat_prompt
)

router = APIRouter(prefix="/chat", tags=["Haunted Terminal Chat"])

@router.post("", response_model=ChatResponse)
async def chat_with_ghost(req: ChatRequest):
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="Cannot summon the ghost with an empty message.")

    personality = get_active_personality(req.personality)
    system_prompt = build_system_prompt(personality)
    
    history_dicts = [{"role": m.role, "content": m.content} for m in (req.history or [])]
    full_prompt = build_chat_prompt(
        message=req.message.strip(),
        language=req.language or "Auto Detect",
        topic=req.topic or "Auto Detect",
        history=history_dicts
    )

    try:
        response_text = await ollama_service.generate(prompt=full_prompt, system_prompt=system_prompt)
        cfg = ollama_service.get_effective_config()
        return ChatResponse(
            response=response_text,
            language=req.language or "Auto Detect",
            topic=req.topic or "Auto Detect",
            personality=personality,
            model=cfg["model"]
        )
    except OllamaServiceException as ose:
        raise HTTPException(status_code=ose.status_code, detail={"message": ose.message, "error_type": ose.error_type})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ghost summoning failed unexpectedly: {str(e)}")
