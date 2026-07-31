import os
from pathlib import Path
from typing import List, Dict, Any
from pypdf import PdfReader
import docx
from langchain_text_splitters import RecursiveCharacterTextSplitter

class DocumentProcessor:
    def __init__(self, chunk_size: int = 900, chunk_overlap: int = 150):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""]
        )

    def extract_pages(self, file_path: str, file_type: str) -> List[Dict[str, Any]]:
        """
        Extract text content along with page numbers from PDF, TXT, or DOCX files.
        Returns a list of dicts: [{"page": page_num, "text": page_text}]
        """
        path = Path(file_path)
        ext = file_type.lower().strip(".")
        pages_data = []

        if ext == "pdf":
            reader = PdfReader(file_path)
            for idx, page in enumerate(reader.pages):
                text = page.extract_text() or ""
                if text.strip():
                    pages_data.append({"page": idx + 1, "text": text.strip()})
        
        elif ext == "docx":
            doc = docx.Document(file_path)
            full_text = []
            for para in doc.paragraphs:
                if para.text.strip():
                    full_text.append(para.text.strip())
            joined_text = "\n\n".join(full_text)
            if joined_text:
                pages_data.append({"page": 1, "text": joined_text})
        
        elif ext in ["txt", "md"]:
            encoding = "utf-8"
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
            except UnicodeDecodeError:
                with open(file_path, "r", encoding="latin-1") as f:
                    content = f.read()
            
            if content.strip():
                pages_data.append({"page": 1, "text": content.strip()})
        else:
            raise ValueError(f"Unsupported file format: {ext}")

        return pages_data

    def process_and_chunk(self, file_path: str, file_type: str, doc_id: str, doc_name: str) -> List[Dict[str, Any]]:
        """
        Extracts pages and splits text into chunks with rich metadata.
        """
        pages = self.extract_pages(file_path, file_type)
        chunks = []
        chunk_idx = 0

        for page_info in pages:
            page_num = page_info["page"]
            page_text = page_info["text"]
            
            # Split page text into chunks
            split_texts = self.text_splitter.split_text(page_text)
            for text_snippet in split_texts:
                if text_snippet.strip():
                    chunk_idx += 1
                    chunks.append({
                        "chunk_id": f"{doc_id}_{chunk_idx}",
                        "text": text_snippet.strip(),
                        "metadata": {
                            "document_id": doc_id,
                            "document_name": doc_name,
                            "page": page_num,
                            "chunk_index": chunk_idx
                        }
                    })

        return chunks
