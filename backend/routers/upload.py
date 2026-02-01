"""Upload Router - File processing for RAG."""
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from typing import List
import uuid
import logging
from services.file_processor import file_processor
from services.vector_store import vector_store

router = APIRouter()
logger = logging.getLogger(__name__)
sessions: dict[str, dict] = {}


@router.post("/upload")
async def upload_files(files: List[UploadFile] = File(...), session_id: str = None):
    if not session_id:
        session_id = str(uuid.uuid4())
    if session_id not in sessions:
        sessions[session_id] = {"files": [], "total_chunks": 0}
    
    processed_files, total_chunks, errors = [], 0, []
    
    for file in files:
        try:
            ext = file.filename.split(".")[-1].lower()
            if ext not in file_processor.SUPPORTED_EXTENSIONS:
                errors.append({"filename": file.filename, "error": f"Unsupported: {ext}"})
                continue
            
            content = await file.read()
            text = file_processor.extract_text(content, file.filename)
            
            if not text or not text.strip():
                errors.append({"filename": file.filename, "error": "No text extracted"})
                continue
            
            chunks = file_processor.chunk_text(text, file.filename)
            if not chunks:
                errors.append({"filename": file.filename, "error": "No chunks created"})
                continue
            
            num_chunks = vector_store.add_documents(chunks, session_id)
            processed_files.append({"filename": file.filename, "chunks": num_chunks})
            total_chunks += num_chunks
            sessions[session_id]["files"].append(file.filename)
            sessions[session_id]["total_chunks"] += num_chunks
            
        except Exception as e:
            logger.error(f"Error processing {file.filename}: {e}")
            errors.append({"filename": file.filename, "error": str(e)})
    
    return JSONResponse({
        "session_id": session_id,
        "processed_files": processed_files,
        "total_chunks": total_chunks,
        "errors": errors if errors else None
    })


@router.get("/session/{session_id}")
async def get_session(session_id: str):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    return sessions[session_id]


@router.delete("/session/{session_id}")
async def clear_session(session_id: str):
    if session_id in sessions:
        vector_store.clear_session(session_id)
        del sessions[session_id]
    return {"message": "Session cleared", "session_id": session_id}


@router.get("/supported-formats")
async def get_supported_formats():
    return {"extensions": sorted(list(file_processor.SUPPORTED_EXTENSIONS))}
