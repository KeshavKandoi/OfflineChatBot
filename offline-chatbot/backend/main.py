from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from graph import build_graph
from langchain_core.messages import HumanMessage
from database import create_tables, get_db
from models import Session, Message
from sqlalchemy.orm import Session as DBSession
from datetime import datetime
from long_memory import save_to_long_memory

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