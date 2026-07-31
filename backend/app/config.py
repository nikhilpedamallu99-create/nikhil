import os
import tempfile
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# Check if base directory is writable, otherwise use system temp directory (for Vercel serverless)
if os.access(BASE_DIR, os.W_OK):
    UPLOAD_DIR = BASE_DIR / "uploads"
    VECTOR_STORE_DIR = BASE_DIR / "vector_store"
    DB_PATH = BASE_DIR / "knowledge_base.db"
else:
    temp_dir = Path(tempfile.gettempdir())
    UPLOAD_DIR = temp_dir / "uploads"
    VECTOR_STORE_DIR = temp_dir / "vector_store"
    DB_PATH = temp_dir / "knowledge_base.db"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
VECTOR_STORE_DIR.mkdir(parents=True, exist_ok=True)

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DB_PATH}")
EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL_NAME", "sentence-transformers/all-MiniLM-L6-v2")

LLM_API_KEY = os.getenv("LLM_API_KEY", "")
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "openai")
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-3.5-turbo")
