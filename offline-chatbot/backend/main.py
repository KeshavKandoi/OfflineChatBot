from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from graph import build_graph
from langchain_core.messages import HumanMessage,SystemMessage
from database import create_tables, get_db
from models import Session, Message
from sqlalchemy.orm import Session as DBSession
from datetime import datetime
from ollama_client import model
from long_memory import save_to_long_memory, search_long_memory
from fastapi.responses import StreamingResponse
import os
import shutil
from fastapi import UploadFile, File
from rag import process_pdf, process_txt, process_docx, process_image, search_rag
app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

graph = build_graph()
create_tables()

class ChatRequest(BaseModel):
    message: str
    session_id: str = "default"

class SessionCreate(BaseModel):
    id: str
    title: str

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/sessions")
def create_session(data: SessionCreate, db: DBSession = Depends(get_db)):
    session = Session(id=data.id, title=data.title, created_at=datetime.utcnow())
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@app.get("/sessions")
def get_sessions(db: DBSession = Depends(get_db)):
    sessions = db.query(Session).order_by(Session.created_at.desc()).all()
    return sessions

@app.get("/sessions/{session_id}/messages")
def get_messages(session_id: str, db: DBSession = Depends(get_db)):
    messages = db.query(Message).filter(
        Message.session_id == session_id
    ).order_by(Message.created_at.asc()).all()
    return messages

@app.post("/chat")
def chat(req: ChatRequest, db: DBSession = Depends(get_db)):
    config = {"configurable": {"thread_id": req.session_id}}
    result = graph.invoke(
        {"messages": [HumanMessage(content=req.message)]},
        config=config
    )
    reply = result["messages"][-1].content


    db.add(Message(session_id=req.session_id, role="user", content=req.message, created_at=datetime.utcnow()))
    db.add(Message(session_id=req.session_id, role="assistant", content=reply, created_at=datetime.utcnow()))
    db.commit()


    save_to_long_memory(req.session_id, "user", req.message)
    save_to_long_memory(req.session_id, "assistant", reply)

    return {"reply": reply}


def stream(messages: list, req: ChatRequest, db: DBSession):
    full_reply = []

    for chunk in model.stream(messages):
        token = chunk.content
        if token:
            full_reply.append(token)
            yield token


    reply = "".join(full_reply)
    db.add(Message(session_id=req.session_id, role="user", content=req.message, created_at=datetime.utcnow()))
    db.add(Message(session_id=req.session_id, role="assistant", content=reply, created_at=datetime.utcnow()))
    db.commit()

    save_to_long_memory(req.session_id, "user", req.message)
    save_to_long_memory(req.session_id, "assistant", reply)


@app.post("/chat/stream")
async def chat_stream(req: ChatRequest, db: DBSession = Depends(get_db)):
    past_context = search_long_memory(req.message)

    system_content = (
        "You are a helpful assistant. "
        "Remember everything the user tells you in this conversation."
    )
    if past_context:
        context_text = "\n".join(past_context)
        system_content += f"\n\nRelevant context from past conversations:\n{context_text}"

    messages = [SystemMessage(content=system_content), HumanMessage(content=req.message)]

    return StreamingResponse(stream(messages, req, db), media_type="text/plain")


UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    # Save file to disk
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    ext = file.filename.split(".")[-1].lower()

    if ext == "pdf":
        count = process_pdf(file_path, file.filename)
        return {"message": f"PDF processed, {count} chunks saved"}
    elif ext == "txt":
        count = process_txt(file_path, file.filename)
        return {"message": f"TXT processed, {count} chunks saved"}
    elif ext == "docx":
        count = process_docx(file_path, file.filename)
        return {"message": f"DOCX processed, {count} chunks saved"}
    elif ext in ["jpg", "jpeg", "png"]:
        description = process_image(file_path, file.filename)
        return {"message": "Image analyzed", "description": description}
    else:
        return {"message": "Unsupported file type"}

@app.get("/rag/search/{query}")
def rag_search(query: str):
    results = search_rag(query)
    return {"results": results}