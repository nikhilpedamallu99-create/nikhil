import json
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ChatMessageModel
from app.schemas import ChatRequest, ChatResponse, ChatHistoryResponse, SourceItem
from app.routes.documents import embedding_service, vector_store
from app.services.rag_service import RAGService

router = APIRouter(prefix="/api/chat", tags=["Chat & RAG Search"])

rag_service = RAGService(embedding_service, vector_store)


@router.post("", response_model=ChatResponse, status_code=status.HTTP_200_OK)
def ask_question(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Process user query through full RAG pipeline:
    1. Convert question to vector embedding
    2. Search vector database for relevant chunks
    3. Construct LLM prompt with retrieved context
    4. Generate accurate answer with source references
    5. Save interaction to chat history
    """
    question = request.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    # Execute RAG Pipeline
    result = rag_service.answer_question(question)

    msg_id = str(uuid.uuid4())
    sources = [SourceItem(**src) for src in result["sources"]]
    sources_json = json.dumps([src.dict() for src in sources])

    # Save to SQLite database
    chat_record = ChatMessageModel(
        id=msg_id,
        question=question,
        answer=result["answer"],
        sources_json=sources_json
    )
    db.add(chat_record)
    db.commit()
    db.refresh(chat_record)

    return ChatResponse(
        id=chat_record.id,
        question=chat_record.question,
        answer=chat_record.answer,
        sources=sources,
        timestamp=chat_record.timestamp
    )


@router.get("/history", response_model=ChatHistoryResponse)
def get_chat_history(db: Session = Depends(get_db)):
    """Retrieve all past Q&A interactions from history."""
    messages = db.query(ChatMessageModel).order_by(ChatMessageModel.timestamp.asc()).all()
    
    formatted_history = []
    for msg in messages:
        sources = []
        if msg.sources_json:
            try:
                raw_sources = json.loads(msg.sources_json)
                sources = [SourceItem(**s) for s in raw_sources]
            except Exception:
                sources = []

        formatted_history.append(
            ChatResponse(
                id=msg.id,
                question=msg.question,
                answer=msg.answer,
                sources=sources,
                timestamp=msg.timestamp
            )
        )

    return ChatHistoryResponse(
        total=len(formatted_history),
        history=formatted_history
    )
