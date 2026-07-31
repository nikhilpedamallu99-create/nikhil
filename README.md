# AI Knowledge Base Search Using RAG

A modern, full-stack, beginner-friendly web application built with **Retrieval-Augmented Generation (RAG)**. This application allows users to upload documents (PDF, TXT, DOCX), automatically extract and chunk text, generate vector embeddings using **SentenceTransformers**, store them in a persistent **ChromaDB** vector database, and perform semantic Q&A with strict fact-grounded answer generation and source citations.

---

## 📌 Project Overview

Traditional Large Language Models (LLMs) often hallucinate or lack access to domain-specific private documents. **Retrieval-Augmented Generation (RAG)** solves this by retrieving relevant text passages from a vector database before passing them as context to an AI model.

### Main Objective
1. **Upload Documents**: Support PDF, TXT, and DOCX files.
2. **Text Extraction & Chunking**: Extract page-level text and split it into 800-1000 character overlapping chunks.
3. **Dense Vector Embeddings**: Convert chunks into 384-dimensional dense vectors using `sentence-transformers/all-MiniLM-L6-v2`.
4. **Vector Database Storage**: Store chunks and embeddings in a persistent ChromaDB instance.
5. **Semantic AI Search**: Query ChromaDB using cosine similarity to retrieve top-K relevant chunks.
6. **Grounded AI Generation**: Generate answers based strictly on retrieved context.
7. **Source Attribution**: Display source document names, page numbers, text snippets, and relevance scores.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React.js 19 with Vite
- **Styling**: Tailwind CSS v4 & Lucide React icons
- **Routing & HTTP**: React Router DOM v7 & Axios

### Backend
- **Framework**: Python FastAPI & Uvicorn
- **Database**: SQLite (SQLAlchemy ORM) for document records & chat history
- **Vector Store**: ChromaDB (persistent local vector database)
- **Embedding Model**: `sentence-transformers/all-MiniLM-L6-v2`
- **Text Extraction**: `pypdf`, `python-docx`
- **Text Chunking**: `langchain-text-splitters` (`RecursiveCharacterTextSplitter`)

---

## 📂 Project Structure

```
rag/
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   ├── documents.py      # REST endpoints for upload, list, delete
│   │   │   └── chat.py           # REST endpoints for RAG query & chat history
│   │   ├── services/
│   │   │   ├── document_processor.py # Text extraction & chunking
│   │   │   ├── embedding_service.py  # SentenceTransformers embedding generator
│   │   │   ├── vector_store.py       # ChromaDB persistent store management
│   │   │   └── rag_service.py        # RAG retrieval & prompt synthesis
│   │   ├── config.py             # Environment & configuration paths
│   │   ├── database.py           # SQLAlchemy SQLite database setup
│   │   ├── models.py             # SQLAlchemy models (Document, ChatMessage)
│   │   ├── schemas.py            # Pydantic request/response schemas
│   │   └── main.py               # FastAPI entrypoint & CORS middleware
│   ├── uploads/                  # Physical uploaded document storage
│   ├── vector_store/             # ChromaDB vector index persistence
│   ├── test_rag.py               # Automated backend integration test suite
│   ├── requirements.txt          # Python dependencies
│   └── .env.example              # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Navigation header
│   │   │   ├── Sidebar.jsx       # Dashboard sidebar
│   │   │   ├── DocumentCard.jsx  # Document item card with deletion modal
│   │   │   ├── UploadArea.jsx    # Drag-and-drop file upload zone
│   │   │   ├── ChatMessage.jsx   # User bubble & AI answer card
│   │   │   ├── SourceCard.jsx    # Document source citation snippet
│   │   │   └── Toast.jsx         # User feedback notification banner
│   │   ├── pages/
│   │   │   ├── Home.jsx          # Landing page with RAG workflow explanation
│   │   │   ├── Dashboard.jsx     # Metrics overview & recent documents
│   │   │   ├── KnowledgeBase.jsx # Document upload & management page
│   │   │   └── AISearch.jsx      # AI Q&A chat interface with citations
│   │   ├── services/
│   │   │   └── api.js            # Axios API client
│   │   ├── App.jsx               # Main React router container
│   │   ├── index.css             # Tailwind CSS styles
│   │   └── main.jsx              # React DOM mounting entrypoint
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
├── README.md
└── .gitignore
```

---

## ⚡ Installation & Setup Instructions (Windows)

### Prerequisites
- **Node.js**: v18+ (verified on v24.15)
- **Python**: v3.10+ (verified on v3.11)

---

### Step 1: Clone or Open Project Directory

```powershell
cd c:\Users\sunny\OneDrive\Desktop\rag
```

---

### Step 2: Backend Setup

1. Navigate to the `backend` folder:
   ```powershell
   cd backend
   ```

2. Create a Python virtual environment:
   ```powershell
   py -3.11 -m venv venv
   ```

3. Activate virtual environment and install dependencies:
   ```powershell
   .\venv\Scripts\pip.exe install -r requirements.txt
   ```

4. Create backend `.env` file from example:
   ```powershell
   copy .env.example .env
   ```

5. (Optional) Run integration tests to verify backend, vector database, and embedding setup:
   ```powershell
   .\venv\Scripts\python.exe test_rag.py
   ```

6. Start the FastAPI server with Uvicorn:
   ```powershell
   .\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
   ```
   *The API will run at `http://localhost:8000` (Swagger docs available at `http://localhost:8000/docs`).*

---

### Step 3: Frontend Setup

1. Open a new PowerShell terminal and navigate to `frontend`:
   ```powershell
   cd c:\Users\sunny\OneDrive\Desktop\rag\frontend
   ```

2. Install Node packages:
   ```powershell
   npm install
   ```

3. Create frontend `.env` file from example:
   ```powershell
   copy .env.example .env
   ```

4. Start the Vite development server:
   ```powershell
   npm run dev
   ```
   *The web application will open at `http://localhost:5173`.*

---

## 🔗 API Endpoint Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Check backend health, DB connection, and vector store status |
| `POST` | `/api/documents/upload` | Upload PDF/TXT/DOCX file, extract text, chunk, embed, & index into ChromaDB |
| `GET` | `/api/documents` | Retrieve all uploaded documents and processing status metrics |
| `GET` | `/api/documents/{id}` | Retrieve metadata for a specific document |
| `DELETE` | `/api/documents/{id}` | Delete document, SQLite record, and ChromaDB vector embeddings |
| `POST` | `/api/chat` | Submit question, run RAG similarity search, & receive answer with sources |
| `GET` | `/api/chat/history` | Retrieve past question and answer history with citations |

---

## 🧠 How the RAG Pipeline Works

1. **Upload & Storage**: The user uploads a file (`.pdf`, `.txt`, `.docx`) via multipart form upload to `/api/documents/upload`. Files are saved under `backend/uploads/`.
2. **Text Processing**: `DocumentProcessor` uses `pypdf` or `python-docx` to extract text page-by-page. Text is divided into ~900 character chunks with a 150-character overlap using `RecursiveCharacterTextSplitter`.
3. **Vector Embeddings**: `EmbeddingService` generates dense vector representations for each text chunk using `sentence-transformers/all-MiniLM-L6-v2`.
4. **Vector DB Indexing**: Vectors, text snippets, and document metadata (ID, filename, page #) are indexed in a persistent local ChromaDB collection (`knowledge_base_chunks`).
5. **Similarity Search**: When a question is submitted to `/api/chat`, `VectorStoreService` converts the question to an embedding and performs cosine similarity search to retrieve the top 5 relevant document chunks.
6. **Guardrail Answer Generation**: If similarity scores fall below threshold or no chunks exist, the model returns:
   > *"I couldn't find enough information in the uploaded knowledge base to answer this question."*
   Otherwise, context blocks are sent with strict prompt constraints to generate an accurate, grounded answer with source citations.
7. **Document Deletion Safety**: Deleting a document removes its physical file, SQLite DB record, and deletes all matching embeddings from ChromaDB via `collection.delete(where={"document_id": doc_id})`.

---

## 🛡️ Common Troubleshooting

- **Symlink Warning on Windows (HuggingFace)**:
  - HuggingFace hub warns if Windows Developer Mode is disabled. It falls back to direct copy caching automatically without breaking functionality.
- **API Key Configuration**:
  - `LLM_API_KEY` is optional. If left empty, the RAG engine operates in smart synthesis mode, clearly presenting retrieved snippets and source citations out-of-the-box.
