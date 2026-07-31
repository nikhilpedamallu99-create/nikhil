from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text
from app.database import Base

class DocumentModel(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, index=True)
    filename = Column(String, index=True)
    original_filename = Column(String)
    file_type = Column(String)
    file_size = Column(Integer)
    upload_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="Uploading") # Uploading, Processing, Ready, Failed
    chunk_count = Column(Integer, default=0)
    file_path = Column(String)

class ChatMessageModel(Base):
    __tablename__ = "chat_messages"

    id = Column(String, primary_key=True, index=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    sources_json = Column(Text, nullable=True) # JSON string of sources
    timestamp = Column(DateTime, default=datetime.utcnow)
