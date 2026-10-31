from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import settings
from database import init_db
from routes import (
    health,
    chat,
    errors,
    commands,
    code_analysis,
    journal,
    settings as app_settings
)
from services.ollama_service import OllamaServiceException

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database on startup
    init_db()
    yield

app = FastAPI(
    title="PhantomShell API",
    description="The Ghost in Your Terminal — Universal AI Developer Companion API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom exception handler for clean Ollama errors without exposing internals
@app.exception_handler(OllamaServiceException)
async def ollama_exception_handler(request: Request, exc: OllamaServiceException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "error_type": exc.error_type,
            "message": exc.message
        }
    )

# Register route modules
app.include_router(health.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(errors.router, prefix="/api")
app.include_router(commands.router, prefix="/api")
app.include_router(code_analysis.router, prefix="/api")
app.include_router(journal.router, prefix="/api")
app.include_router(app_settings.router, prefix="/api")

@app.get("/")
async def root():
    return {
        "name": "PhantomShell API",
        "tagline": "Your terminal has a ghost. Fortunately, it knows how to debug.",
        "status": "Haunted & Operational",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
