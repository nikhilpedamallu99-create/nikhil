import os
import uuid
import shutil
from pathlib import Path
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import DocumentModel
from app.schemas import DocumentResponse, DocumentListResponse
from app.config import UPLOAD_DIR
from app.services.document_processor import DocumentProcessor
from app.services.embedding_service import EmbeddingService
from app.services.vector_store import VectorStoreService

router = APIRouter(prefix="/api/documents", tags=["Documents"])

# Shared service instances
doc_processor = DocumentProcessor()
embedding_service = EmbeddingService()
vector_store = VectorStoreService()

ALLOWED_EXTENSIONS = {".pdf", ".txt", ".docx", ".md"}

def process_document_background(doc_id: str, db_session_factory):
    """Background task to extract text, chunk, embed, and index document into vector store."""
    db: Session = db_session_factory()
    try:
        doc = db.query(DocumentModel).filter(DocumentModel.id == doc_id).first()
        if not doc:
            return

        doc.status = "Processing"
        db.commit()

        # Step 1: Process and chunk document
        chunks = doc_processor.process_and_chunk(
            file_path=doc.file_path,
            file_type=doc.file_type,
            doc_id=doc.id,
            doc_name=doc.original_filename
        )

        if not chunks:
            doc.status = "Failed"
            db.commit()
            return

        # Step 2: Generate embeddings for chunks
        texts = [c["text"] for c in chunks]
        embeddings = embedding_service.get_embeddings(texts)

        # Step 3: Add to ChromaDB vector store
        vector_store.add_chunks(chunks, embeddings)

        # Step 4: Update document status to Ready
        doc.chunk_count = len(chunks)
        doc.status = "Ready"
        db.commit()

    except Exception as e:
        print(f"Error processing document {doc_id}: {e}")
        doc = db.query(DocumentModel).filter(DocumentModel.id == doc_id).first()
        if doc:
            doc.status = "Failed"
            db.commit()
    finally:
        db.close()


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload a document (PDF, TXT, DOCX).
    Saves file, extracts text, generates vector embeddings, and indexes into ChromaDB.
    """
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{file_ext}'. Allowed formats: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Unique document ID and file path
    doc_id = str(uuid.uuid4())
    safe_filename = f"{doc_id}{file_ext}"
    saved_file_path = UPLOAD_DIR / safe_filename

    # Read and save file content
    try:
        contents = await file.read()
        file_size = len(contents)
        with open(saved_file_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    # Create DB record
    db_doc = DocumentModel(
        id=doc_id,
        filename=safe_filename,
        original_filename=file.filename,
        file_type=file_ext.strip("."),
        file_size=file_size,
        status="Processing",
        chunk_count=0,
        file_path=str(saved_file_path)
    )
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)

    # Process document synchronously or inline to ensure immediate ready status in test
    try:
        chunks = doc_processor.process_and_chunk(
            file_path=str(saved_file_path),
            file_type=file_ext.strip("."),
            doc_id=doc_id,
            doc_name=file.filename
        )
        if chunks:
            texts = [c["text"] for c in chunks]
            embeddings = embedding_service.get_embeddings(texts)
            vector_store.add_chunks(chunks, embeddings)
            db_doc.chunk_count = len(chunks)
            db_doc.status = "Ready"
        else:
            db_doc.status = "Ready" # empty doc handled
        db.commit()
        db.refresh(db_doc)
    except Exception as e:
        print(f"Error processing doc {doc_id}: {e}")
        db_doc.status = "Failed"
        db.commit()
        db.refresh(db_doc)

    return db_doc


@router.get("", response_model=DocumentListResponse)
def get_all_documents(db: Session = Depends(get_db)):
    """Retrieve all uploaded documents and processing metrics."""
    docs = db.query(DocumentModel).order_by(DocumentModel.upload_date.desc()).all()
    total = len(docs)
    processed_count = sum(1 for d in docs if d.status == "Ready")
    return {
        "total": total,
        "processed_count": processed_count,
        "documents": docs
    }


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document_by_id(document_id: str, db: Session = Depends(get_db)):
    """Retrieve metadata for a specific document."""
    doc = db.query(DocumentModel).filter(DocumentModel.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.get("/{document_id}/download")
def download_document_file(document_id: str, db: Session = Depends(get_db)):
    """Download or view the original uploaded document file."""
    doc = db.query(DocumentModel).filter(DocumentModel.id == document_id).first()
    if not doc or not doc.file_path or not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="File not found on server")
    from fastapi.responses import FileResponse
    return FileResponse(
        path=doc.file_path,
        filename=doc.original_filename,
        media_type="application/octet-stream"
    )


@router.delete("/{document_id}", status_code=status.HTTP_200_OK)
def delete_document(document_id: str, db: Session = Depends(get_db)):
    """
    Delete a document:
    1. Removes original file from disk
    2. Deletes SQLite DB record
    3. Deletes document embeddings from vector database
    """
    doc = db.query(DocumentModel).filter(DocumentModel.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Step 1: Remove physical file
    if doc.file_path and os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception as e:
            print(f"Error removing physical file {doc.file_path}: {e}")

    # Step 2: Delete vector store embeddings
    vector_store.delete_document_chunks(document_id)

    # Step 3: Delete DB record
    db.delete(doc)
    db.commit()

    return {"message": "Document and associated vector embeddings successfully deleted", "document_id": document_id}
