from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class DocumentResponse(BaseModel):
    id: str
    filename: str
    original_filename: str
    file_type: str
    file_size: int
    upload_date: datetime
    status: str
    chunk_count: int

    class Config:
        from_attributes = True

class DocumentListResponse(BaseModel):
    total: int
    processed_count: int
    documents: List[DocumentResponse]

class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, description="Question for the knowledge base")

class SourceItem(BaseModel):
    document_id: Optional[str] = None
    document_name: str
    snippet: str
    page: Optional[int] = None
    score: Optional[float] = None

class ChatResponse(BaseModel):
    id: str
    question: str
    answer: str
    sources: List[SourceItem]
    timestamp: datetime

class ChatHistoryResponse(BaseModel):
    total: int
    history: List[ChatResponse]

class HealthResponse(BaseModel):
    status: str
    database: str
    vector_store: str
    document_count: int
