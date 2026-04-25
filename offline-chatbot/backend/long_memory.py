from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document
from uuid import uuid4
from datetime import datetime

embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

chat_memory = Chroma(
    collection_name="chat_memory",
    embedding_function=embedding_model,
    persist_directory="./chroma_db",
)

def save_to_long_memory(session_id: str, role: str, content: str):
    doc = Document(
        page_content=content,
        metadata={"session_id": session_id, "role": role}
    )
    chat_memory.add_documents(documents=[doc], ids=[str(uuid4())])
    

def search_long_memory(query: str, n_results: int = 3):
    try:
        results = chat_memory.similarity_search(query, k=n_results)
        return [doc.page_content for doc in results]
    except Exception:
        return []