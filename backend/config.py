"""Config - Environment settings."""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    google_api_key: str = ""
    
    # Model options: "gemini" (online) or "ollama" (local)
    model_provider: str = "gemini"
    
    # Online model (Gemini)
    gemini_model: str = "gemini-3-flash-preview"
    
    # Local model (Ollama)
    ollama_model: str = "llama3.2:3b"
    ollama_base_url: str = "http://localhost:11434"
    
    embedding_model: str = "models/embedding-001"
    chunk_size: int = 1000
    chunk_overlap: int = 200
    top_k_results: int = 5
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://mars-2-0.onrender.com",
        "https://mars.onrender.com",
    ]
    
    class Config:
        env_file = "../.env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
