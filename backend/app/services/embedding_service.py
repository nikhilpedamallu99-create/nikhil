from typing import List
from sentence_transformers import SentenceTransformer
from app.config import EMBEDDING_MODEL_NAME

class EmbeddingService:
    def __init__(self, model_name: str = EMBEDDING_MODEL_NAME):
        self.model_name = model_name
        self._model = None

    @property
    def model(self):
        if self._model is None:
            # Lazy load the embedding model to allow fast startup
            print(f"Loading embedding model: {self.model_name}...")
            self._model = SentenceTransformer(self.model_name)
        return self._model

    def get_embedding(self, text: str) -> List[float]:
        """Generate embedding vector for a single text string."""
        text = text.replace("\n", " ")
        embedding = self.model.encode(text, convert_to_numpy=True)
        return embedding.tolist()

    def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embedding vectors for a list of text strings."""
        clean_texts = [t.replace("\n", " ") for t in texts]
        embeddings = self.model.encode(clean_texts, convert_to_numpy=True)
        return embeddings.tolist()
