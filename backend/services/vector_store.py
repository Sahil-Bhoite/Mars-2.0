"""Vector Store - FAISS with Google embeddings."""
import faiss
import numpy as np
import os
import logging
import google.generativeai as genai
from config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


class VectorStore:
    EMBEDDING_DIM = 768
    
    def __init__(self):
        self.index = None
        self.documents = []
        self._initialized = False
    
    def initialize(self):
        if self._initialized:
            return
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not found")
        genai.configure(api_key=api_key)
        self.index = faiss.IndexFlatIP(self.EMBEDDING_DIM)
        self._initialized = True
    
    def _get_embeddings(self, texts: list[str]) -> list[list[float]]:
        return [genai.embed_content(model="models/embedding-001", content=t, task_type="retrieval_document")['embedding'] for t in texts]
    
    def _get_query_embedding(self, query: str) -> list[float]:
        return genai.embed_content(model="models/embedding-001", content=query, task_type="retrieval_query")['embedding']
    
    def add_documents(self, chunks: list[dict], session_id: str) -> int:
        self.initialize()
        if not chunks:
            return 0
        
        texts = [c["text"] for c in chunks]
        embeddings = np.array(self._get_embeddings(texts), dtype=np.float32)
        faiss.normalize_L2(embeddings)
        
        start_idx = len(self.documents)
        self.index.add(embeddings)
        
        for i, chunk in enumerate(chunks):
            self.documents.append({
                "text": chunk["text"], "source": chunk["source"],
                "chunk_index": chunk["chunk_index"], "session_id": session_id,
                "faiss_idx": start_idx + i
            })
        return len(chunks)
    
    def search(self, query: str, session_id: str, top_k: int = None) -> list[dict]:
        self.initialize()
        if top_k is None:
            top_k = settings.top_k_results
        if not self.documents:
            return []
        
        query_emb = np.array([self._get_query_embedding(query)], dtype=np.float32)
        faiss.normalize_L2(query_emb)
        
        scores, indices = self.index.search(query_emb, min(len(self.documents), top_k * 5))
        
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < 0 or idx >= len(self.documents):
                continue
            doc = self.documents[idx]
            if doc["session_id"] == session_id:
                results.append({"text": doc["text"], "source": doc["source"], "chunk_index": doc["chunk_index"], "score": float(score)})
                if len(results) >= top_k:
                    break
        return results
    
    def clear_session(self, session_id: str) -> bool:
        self.documents = [d for d in self.documents if d["session_id"] != session_id]
        if self.documents and self._initialized:
            embeddings = np.array(self._get_embeddings([d["text"] for d in self.documents]), dtype=np.float32)
            faiss.normalize_L2(embeddings)
            self.index = faiss.IndexFlatIP(self.EMBEDDING_DIM)
            self.index.add(embeddings)
        elif self._initialized:
            self.index = faiss.IndexFlatIP(self.EMBEDDING_DIM)
        return True


vector_store = VectorStore()
