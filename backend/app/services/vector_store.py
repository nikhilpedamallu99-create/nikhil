from typing import List, Dict, Any
import chromadb
from chromadb.config import Settings
from app.config import VECTOR_STORE_DIR

class VectorStoreService:
    def __init__(self, collection_name: str = "knowledge_base_chunks"):
        try:
            self.client = chromadb.PersistentClient(path=str(VECTOR_STORE_DIR))
        except Exception:
            # Ephemeral fallback for serverless execution
            self.client = chromadb.Client()

        self.collection = self.client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"}
        )

    def add_chunks(self, chunks: List[Dict[str, Any]], embeddings: List[List[float]]):
        """Add text chunks, metadata, and embeddings to ChromaDB."""
        if not chunks:
            return

        ids = [c["chunk_id"] for c in chunks]
        documents = [c["text"] for c in chunks]
        metadatas = [c["metadata"] for c in chunks]

        self.collection.add(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas
        )

    def query_similarity(self, query_embedding: List[float], top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Query vector store for top_k most similar document chunks.
        Returns formatted result objects with document_name, snippet, page, and similarity score.
        """
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            include=["documents", "metadatas", "distances"]
        )

        retrieved_items = []
        if results and results.get("documents") and len(results["documents"]) > 0:
            docs = results["documents"][0]
            metas = results["metadatas"][0]
            distances = results["distances"][0]

            for doc_text, meta, dist in zip(docs, metas, distances):
                similarity_score = max(0.0, round(1.0 - float(dist), 4))
                retrieved_items.append({
                    "document_id": meta.get("document_id"),
                    "document_name": meta.get("document_name", "Unknown Document"),
                    "snippet": doc_text,
                    "page": meta.get("page", 1),
                    "score": similarity_score
                })

        return retrieved_items

    def delete_document_chunks(self, document_id: str):
        """Delete all chunks associated with a specific document_id."""
        try:
            self.collection.delete(where={"document_id": document_id})
        except Exception as e:
            print(f"Error deleting chunks for doc {document_id}: {e}")
