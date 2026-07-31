import os
import sys
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_tests():
    print("=== Testing AI Knowledge Base Search Backend ===")

    # 1. Health Check
    print("\n1. Testing GET /api/health...")
    resp = client.get("/api/health")
    print("Status Code:", resp.status_code)
    print("Response:", resp.json())
    assert resp.status_code == 200, "Health check failed!"
    assert resp.json()["status"] == "healthy"

    # 2. Upload Document (TXT)
    print("\n2. Testing POST /api/documents/upload with TXT file...")
    sample_text = """
    Artificial Intelligence Knowledge Base Search Using RAG.
    Retrieval-Augmented Generation (RAG) is a framework for improving LLM outputs.
    It combines semantic search across vector databases like ChromaDB with generative AI models.
    Sentence Transformers generate 384-dimensional vector embeddings using the all-MiniLM-L6-v2 model.
    Key benefits of RAG include eliminating AI hallucinations, providing accurate source citations, and updating knowledge dynamically without retraining models.
    The primary developer of this college project is Antigravity.
    """
    files = {"file": ("ai_rag_overview.txt", sample_text.encode("utf-8"), "text/plain")}
    resp = client.post("/api/documents/upload", files=files)
    print("Status Code:", resp.status_code)
    doc_data = resp.json()
    print("Uploaded Doc:", doc_data)
    assert resp.status_code == 201, "Document upload failed!"
    doc_id = doc_data["id"]
    assert doc_data["status"] == "Ready"
    assert doc_data["chunk_count"] > 0

    # 3. List Documents
    print("\n3. Testing GET /api/documents...")
    resp = client.get("/api/documents")
    print("Status Code:", resp.status_code)
    list_data = resp.json()
    print("Documents Count:", list_data["total"])
    assert list_data["total"] >= 1

    # 4. Ask Question (In-domain)
    print("\n4. Testing POST /api/chat (In-Domain Question)...")
    chat_payload = {"question": "What embedding model is used and what are its benefits?"}
    resp = client.post("/api/chat", json=chat_payload)
    print("Status Code:", resp.status_code)
    chat_resp = resp.json()
    print("Answer:\n", chat_resp["answer"])
    print("Sources:", len(chat_resp["sources"]))
    for src in chat_resp["sources"]:
        print(f" - {src['document_name']} (Score: {src['score']}): {src['snippet'][:60]}...")
    assert resp.status_code == 200
    assert len(chat_resp["sources"]) > 0

    # 5. Ask Question (Out-of-domain)
    print("\n5. Testing POST /api/chat (Out-of-Domain Question)...")
    chat_payload_ood = {"question": "What is the recipe for baking a chocolate cake?"}
    resp = client.post("/api/chat", json=chat_payload_ood)
    print("Status Code:", resp.status_code)
    chat_resp_ood = resp.json()
    print("Answer:\n", chat_resp_ood["answer"])
    assert "couldn't find enough information" in chat_resp_ood["answer"].lower() or len(chat_resp_ood["sources"]) == 0

    # 6. Chat History
    print("\n6. Testing GET /api/chat/history...")
    resp = client.get("/api/chat/history")
    print("Status Code:", resp.status_code)
    history_data = resp.json()
    print("History Count:", history_data["total"])
    assert history_data["total"] >= 2

    # 7. Delete Document
    print("\n7. Testing DELETE /api/documents/{document_id}...")
    resp = client.delete(f"/api/documents/{doc_id}")
    print("Status Code:", resp.status_code)
    print("Response:", resp.json())
    assert resp.status_code == 200

    # 8. Verify post-deletion search (No longer retrieves deleted content)
    print("\n8. Verifying search after document deletion...")
    resp = client.post("/api/chat", json={"question": "What embedding model is used?"})
    chat_resp_post_delete = resp.json()
    print("Post-delete Sources:", len(chat_resp_post_delete["sources"]))
    assert len(chat_resp_post_delete["sources"]) == 0 or "couldn't find" in chat_resp_post_delete["answer"].lower()

    print("\n=== ALL BACKEND TESTS PASSED PERFECTLY! ===")

if __name__ == "__main__":
    run_tests()
