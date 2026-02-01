# M.A.R.S - Multi-format Agentic RAG System

An intelligent document chatbot powered by AI agents that retrieves and answers questions from your documents.

## Features

- **Agentic RAG** - AI-powered query processing with intelligent retrieval
- **35+ File Types** - PDF, DOCX, DOC, PPTX, PPT, Excel, CSV, Code, Images (OCR), Audio, Video
- **Dual LLM Support** - Gemini 3 Flash (Online) + Llama 3.2:3B (Local via Ollama)
- **Vector Search** - FAISS with Google embeddings for similarity search

> **[📄 Read the full Documentation (PDF)](M.A.R.S.pdf)** - Detailed architecture and design.

## Quick Start

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

GOOGLE_API_KEY=your_google_api_key
```

Open http://localhost:5173

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React, Vite |
| Backend | FastAPI, Python 3.11+ |
| LLM | Google Gemini / Ollama |
| Vector DB | FAISS |
| Embeddings | Google Embedding API |

## Supported File Types

| Category | Extensions |
|----------|------------|
| Documents | PDF, DOCX, DOC, PPTX, PPT |
| Spreadsheets | XLSX, XLS, CSV |
| Code | PY, JS, TS, JAVA, C, CPP, GO, RS, PHP, RB |
| Markup | HTML, CSS, JSON, XML, MD |
| Images | JPG, PNG, BMP (OCR) |
| Audio | WAV, MP3 |
| Video | MP4 |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload files |
| POST | `/api/chat` | Chat with documents |
| GET | `/api/models` | List LLM models |
| GET | `/api/supported-formats` | List file types |

## Architecture

```
Upload: Files → FileProcessor → Chunking → Embeddings → FAISS
Query:  Question → RAG Agent → Vector Search → Context → LLM → Answer
```

## Project Structure

```
MARS/
├── backend/
│   ├── main.py
│   ├── config.py
│   ├── requirements.txt
│   ├── routers/
│   │   ├── upload.py
│   │   └── chat.py
│   └── services/
│       ├── file_processor.py
│       ├── vector_store.py
│       └── rag_agent.py
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── components/
│   └── package.json
├── Sample Data/
├── .env
└── README.md
```

## Ollama Setup (Optional)

```bash
brew install ollama
ollama serve
ollama pull llama3.2:3b
```
