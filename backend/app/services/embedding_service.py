import os
import json
import math
from typing import List
from collections import Counter
from app.config import EMBEDDING_MODEL_NAME

try:
    from sentence_transformers import SentenceTransformer
    HAS_SENTENCE_TRANSFORMERS = True
except ImportError:
    HAS_SENTENCE_TRANSFORMERS = False

class EmbeddingService:
    def __init__(self, model_name: str = EMBEDDING_MODEL_NAME):
        self.model_name = model_name
        self._model = None

    @property
    def model(self):
        if HAS_SENTENCE_TRANSFORMERS and self._model is None:
            print(f"Loading embedding model: {self.model_name}...")
            self._model = SentenceTransformer(self.model_name)
        return self._model

    def _fallback_embedding(self, text: str, dim: int = 384) -> List[float]:
        """Lightweight 384-dim term frequency embedding for serverless execution without PyTorch."""
        words = text.lower().split()
        counts = Counter(words)
        vec = [0.0] * dim
        for word, count in counts.items():
            h = hash(word) % dim
            vec[h] += float(count)
        norm = math.sqrt(sum(x * x for x in vec)) or 1.0
        return [round(x / norm, 6) for x in vec]

    def get_embedding(self, text: str) -> List[float]:
        """Generate embedding vector for a single text string."""
        text = text.replace("\n", " ")
        if HAS_SENTENCE_TRANSFORMERS and self.model:
            embedding = self.model.encode(text, convert_to_numpy=True)
            return embedding.tolist()
        return self._fallback_embedding(text)

    def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embedding vectors for a list of text strings."""
        clean_texts = [t.replace("\n", " ") for t in texts]
        if HAS_SENTENCE_TRANSFORMERS and self.model:
            embeddings = self.model.encode(clean_texts, convert_to_numpy=True)
            return embeddings.tolist()
        return [self._fallback_embedding(t) for t in clean_texts]
