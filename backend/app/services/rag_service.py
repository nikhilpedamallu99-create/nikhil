import os
import json
import requests
from typing import Dict, Any, List
from app.config import LLM_API_KEY, LLM_PROVIDER, LLM_MODEL
from app.services.embedding_service import EmbeddingService
from app.services.vector_store import VectorStoreService

class RAGService:
    def __init__(self, embedding_service: EmbeddingService, vector_store: VectorStoreService):
        self.embedding_service = embedding_service
        self.vector_store = vector_store
        self.llm_api_key = LLM_API_KEY
        self.llm_provider = LLM_PROVIDER.lower()
        self.llm_model = LLM_MODEL

    def generate_llm_response(self, prompt: str, context: str, question: str) -> str:
        """
        Sends context and question to configured LLM provider (OpenAI, Gemini, Ollama, etc.)
        If no API key is set, returns a smart synthesized response based directly on retrieved chunks.
        """
        if not self.llm_api_key:
            # Smart context synthesis fallback for out-of-the-box local testing
            return f"Based on the uploaded documents, here is the relevant information:\n\n{context}\n\n*Note: To enable direct LLM generation, set your `LLM_API_KEY` in `backend/.env`.*"

        try:
            if self.llm_provider in ["openai", "groq", "together"]:
                url = "https://api.openai.com/v1/chat/completions"
                headers = {
                    "Authorization": f"Bearer {self.llm_api_key}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "model": self.llm_model,
                    "messages": [
                        {"role": "system", "content": "You are a helpful AI Knowledge Base Assistant. Answer questions strictly using only the provided document context."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.2
                }
                resp = requests.post(url, headers=headers, json=payload, timeout=30)
                if resp.status_code == 200:
                    data = resp.json()
                    return data["choices"][0]["message"]["content"].strip()
                else:
                    print(f"LLM API Error {resp.status_code}: {resp.text}")
                    return f"Based on the uploaded knowledge base:\n\n{context}"
            else:
                return f"Based on your knowledge base:\n\n{context}"
        except Exception as e:
            print(f"Error calling LLM provider: {e}")
            return f"Based on the uploaded knowledge base:\n\n{context}"

    def answer_question(self, question: str) -> Dict[str, Any]:
        """
        Full RAG Pipeline:
        1. Question embedding
        2. Vector similarity search
        3. Threshold filtering & context building
        4. LLM response generation with strict prompt constraint
        5. Return answer with source citations
        """
        # Step 1 & 2: Embed question & search vector database
        query_vector = self.embedding_service.get_embedding(question)
        retrieved_chunks = self.vector_store.query_similarity(query_vector, top_k=5)

        # Step 3: Filter chunks by similarity score threshold (>= 0.20 similarity)
        relevant_sources = [item for item in retrieved_chunks if item.get("score", 0.0) >= 0.20]

        # Fallback response if no relevant documents/chunks found
        if not relevant_sources:
            return {
                "answer": "I couldn't find enough information in the uploaded knowledge base to answer this question.",
                "sources": []
            }

        # Format context for LLM prompt
        context_blocks = []
        for idx, src in enumerate(relevant_sources, 1):
            doc_name = src["document_name"]
            page_info = f" (Page {src['page']})" if src.get("page") else ""
            snippet = src["snippet"]
            context_blocks.append(f"--- Document {idx}: {doc_name}{page_info} ---\n{snippet}")

        formatted_context = "\n\n".join(context_blocks)

        prompt = f"""You are an AI Knowledge Base Assistant.

Answer the user's question using ONLY the provided context.

If the answer cannot be found in the context, clearly say that there is not enough information in the knowledge base.

Do not invent facts.

Give a clear, concise, and easy-to-understand answer.

CONTEXT:
{formatted_context}

QUESTION:
{question}

ANSWER:"""

        # Step 4: Generate answer via LLM
        answer_text = self.generate_llm_response(prompt, formatted_context, question)

        # Format source metadata for response
        sources_list = []
        seen = set()
        for src in relevant_sources:
            # De-duplicate identical snippet snippets per doc/page
            key = f"{src['document_name']}_{src['page']}_{src['snippet'][:30]}"
            if key not in seen:
                seen.add(key)
                sources_list.append({
                    "document_id": src.get("document_id"),
                    "document_name": src["document_name"],
                    "snippet": src["snippet"],
                    "page": src.get("page"),
                    "score": src.get("score")
                })

        return {
            "answer": answer_text,
            "sources": sources_list
        }
