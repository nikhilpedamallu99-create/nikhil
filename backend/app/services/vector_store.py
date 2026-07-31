import math
from typing import List, Dict, Any
from app.config import VECTOR_STORE_DIR

try:
    import chromadb
    HAS_CHROMADB = True
except ImportError:
    HAS_CHROMADB = False

class FallbackVectorStore:
    """In-memory cosine similarity vector store for serverless environments."""
    def __init__(self):
        self.chunks = [] # list of {"id", "text", "embedding", "metadata"}

    def add(self, ids, documents, embeddings, metadatas):
        for cid, doc, emb, meta in zip(ids, documents, embeddings, metadatas):
            self.chunks.append({
                "chunk_id": cid,
                "text": doc,
                "embedding": emb,
                "metadata": meta
            })

    def query(self, query_embeddings, n_results=5, include=None):
        if not self.chunks or not query_embeddings:
            return {"documents": [[]], "metadatas": [[]], "distances": [[]]}

        q_vec = query_embeddings[0]
        q_norm = math.sqrt(sum(x * x for x in q_vec)) or 1.0

        scored = []
        for item in self.chunks:
            emb = item["embedding"]
            e_norm = math.sqrt(sum(x * x for x in emb)) or 1.0
            dot = sum(a * b for a, b in zip(q_vec, emb))
            cosine_sim = dot / (q_norm * e_norm)
            cosine_dist = max(0.0, 1.0 - cosine_sim)
            scored.append((item, cosine_dist))

        scored.sort(key=lambda x: x[1])
        top = scored[:n_results]

        docs = [item["text"] for item, _ in top]
        metas = [item["metadata"] for item, _ in top]
        dists = [dist for _, dist in top]

        return {
            "documents": [docs],
            "metadatas": [metas],
            "distances": [dists]
        }

    def delete(self, where=None):
        if where and "document_id" in where:
            doc_id = where["document_id"]
            self.chunks = [c for c in self.chunks if c["metadata"].get("document_id") != doc_id]

    def count(self):
        return len(self.chunks)


class VectorStoreService:
    def __init__(self, collection_name: str = "knowledge_base_chunks"):
        self.use_chroma = HAS_CHROMADB
        if HAS_CHROMADB:
            try:
                self.client = chromadb.PersistentClient(path=str(VECTOR_STORE_DIR))
                self.collection = self.client.get_or_create_collection(
                    name=collection_name,
                    metadata={"hnsw:space": "cosine"}
                )
            except Exception:
                try:
                    self.client = chromadb.Client()
                    self.collection = self.client.get_or_create_collection(
                        name=collection_name,
                        metadata={"hnsw:space": "cosine"}
                    )
                except Exception:
                    self.use_chroma = False
                    self.collection = FallbackVectorStore()
        else:
            self.collection = FallbackVectorStore()

    def add_chunks(self, chunks: List[Dict[str, Any]], embeddings: List[List[float]]):
        """Add text chunks, metadata, and embeddings to vector store."""
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
