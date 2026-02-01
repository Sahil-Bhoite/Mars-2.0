"""Chat Router - RAG agent interactions."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.rag_agent import rag_agent
from routers.upload import sessions

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    session_id: str
    history: Optional[list] = None
    model: Optional[str] = "gemini"


class ChatResponse(BaseModel):
    response: str
    sources: list[str]
    session_id: str
    model: str


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        result = await rag_agent.chat(
            query=request.message,
            session_id=request.session_id,
            history=request.history,
            provider=request.model
        )
        return ChatResponse(
            response=result["response"],
            sources=result["sources"],
            session_id=request.session_id,
            model=result.get("model", request.model)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")


@router.get("/models")
async def get_models():
    """Get available models."""
    return {
        "models": [
            {"id": "gemini", "name": "Gemini 3 Flash", "type": "online", "provider": "Google"},
            {"id": "ollama", "name": "Llama 3.2:3B", "type": "local", "provider": "Ollama"}
        ],
        "default": "gemini"
    }


@router.get("/chat/history/{session_id}")
async def get_chat_history(session_id: str):
    return {"session_id": session_id, "history": []}
