"""FastAPI Entry Point - M.A.R.S Agentic RAG System."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv
from config import get_settings
from routers import upload, chat

load_dotenv("../.env")
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("M.A.R.S Agentic RAG System starting...")
    os.environ["GOOGLE_API_KEY"] = settings.google_api_key
    yield
    print("M.A.R.S shutting down...")


app = FastAPI(
    title="M.A.R.S - Agentic RAG System",
    description="Multi-modal AI Research System with Agentic RAG",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api", tags=["Upload"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "M.A.R.S"}


@app.get("/")
async def root():
    return {"message": "M.A.R.S - Agentic RAG System", "docs": "/docs"}
