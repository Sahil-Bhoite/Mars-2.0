"""RAG Agent - Supports Gemini and Ollama."""
import os
import logging
import google.generativeai as genai
import requests
from config import get_settings
from services.vector_store import vector_store

settings = get_settings()
logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are M.A.R.S, an AI assistant for document analysis.

RULES:
- Use **bold** for key terms
- Use bullet points for lists
- Be direct - no "Based on the document" phrases
- Sources are shown separately

Context:
{context}
"""


class RAGAgent:
    def __init__(self):
        self.gemini_model = None
        self.current_provider = "gemini"
        self._initialized = False
    
    def initialize(self, provider: str = None):
        if provider:
            self.current_provider = provider
        
        if self.current_provider == "gemini":
            api_key = os.getenv("GOOGLE_API_KEY")
            if not api_key:
                raise ValueError("GOOGLE_API_KEY not found")
            genai.configure(api_key=api_key)
            self.gemini_model = genai.GenerativeModel(settings.gemini_model)
        
        self._initialized = True
    
    def _call_gemini(self, prompt: str) -> str:
        response = self.gemini_model.generate_content(prompt)
        return response.text
    
    def _call_ollama(self, prompt: str) -> str:
        """Call Ollama API for local LLM inference."""
        try:
            response = requests.post(
                f"{settings.ollama_base_url}/api/generate",
                json={
                    "model": settings.ollama_model,
                    "prompt": prompt,
                    "stream": False
                },
                timeout=120
            )
            if response.status_code == 200:
                return response.json().get("response", "No response from Ollama")
            else:
                return f"Ollama error: {response.status_code}"
        except requests.exceptions.ConnectionError:
            return "Ollama is not running. Start with: `ollama serve` then `ollama run llama3.2:3b`"
        except Exception as e:
            return f"Ollama error: {str(e)}"
    
    def _retrieve_context(self, query: str, session_id: str) -> tuple[str, list]:
        """Retrieve context from documents."""
        results = vector_store.search(query, session_id, top_k=settings.top_k_results)
        sources = []
        
        if results:
            parts = [f"[{r['source']}]\n{r['text']}" for r in results]
            context = "\n\n---\n\n".join(parts)
            sources = [r['source'] for r in results]
        else:
            context = "No relevant documents found in uploaded files."
        
        return context, sources
    
    async def chat(self, query: str, session_id: str, history: list = None, 
                   provider: str = None) -> dict:
        if provider:
            self.current_provider = provider
        self.initialize(self.current_provider)
        
        try:
            context, sources = self._retrieve_context(query, session_id)
            prompt = f"{SYSTEM_PROMPT.format(context=context)}\n\nQuestion: {query}"
            
            if self.current_provider == "ollama":
                answer = self._call_ollama(prompt)
            else:
                answer = self._call_gemini(prompt)
            
            return {
                "response": answer, 
                "sources": list(set(sources)), 
                "model": self.current_provider
            }
        except Exception as e:
            logger.error(f"Chat error: {e}")
            return {"response": f"Error: {str(e)}", "sources": [], "model": self.current_provider}


rag_agent = RAGAgent()
