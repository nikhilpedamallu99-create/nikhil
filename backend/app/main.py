from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import engine, Base, get_db
from app.models import DocumentModel
from app.schemas import HealthResponse
from app.routes import documents, chat
from app.routes.documents import vector_store

# Initialize DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Knowledge Base Search API",
    description="RAG-powered full-stack document Q&A API built with FastAPI, SentenceTransformers, and ChromaDB.",
    version="1.0.0"
)

# CORS configuration for React frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(documents.router)
app.include_router(chat.router)


@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint to verify backend, database, and vector store availability."""
    db_status = "connected"
    doc_count = 0
    try:
        doc_count = db.query(DocumentModel).count()
    except Exception as e:
        db_status = f"error: {str(e)}"

    vector_status = "ready"
    try:
        # Ping chroma collection count
        _ = vector_store.collection.count()
    except Exception as e:
        vector_status = f"error: {str(e)}"

    return HealthResponse(
        status="healthy",
        database=db_status,
        vector_store=vector_status,
        document_count=doc_count
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
