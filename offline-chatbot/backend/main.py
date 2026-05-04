
import bcrypt
from fastapi import FastAPI, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from graph import build_graph
from langchain_core.messages import HumanMessage, SystemMessage
from database import create_tables, get_db

from models import Session, Message, User
from sqlalchemy.orm import Session as DBSession
from datetime import datetime
from ollama_client import model
from long_memory import save_to_long_memory, search_long_memory
from rag import process_pdf, process_txt, process_docx, process_image, search_rag
from gemini_client import is_online, stream_gemini
import os
import shutil

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

graph = build_graph()
create_tables()

UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class ChatRequest(BaseModel):
    message: str
    session_id: str = "default"
    has_file: bool = False
    filename: str = ""

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
    return db.query(Session).order_by(Session.created_at.desc()).all()

@app.delete("/sessions/{session_id}")
def delete_session(session_id: str, db: DBSession = Depends(get_db)):
    db.query(Message).filter(Message.session_id == session_id).delete()
    db.query(Session).filter(Session.id == session_id).delete()
    db.commit()
    return {"message": "Session deleted"}

@app.patch("/sessions/{session_id}")
def update_session(session_id: str, data: dict, db: DBSession = Depends(get_db)):
    session = db.query(Session).filter(Session.id == session_id).first()
    if session and "title" in data:
        session.title = data["title"]
        db.commit()
        db.refresh(session)
        return session
    return {"error": "Session not found"}

@app.get("/sessions/{session_id}/messages")
def get_messages(session_id: str, db: DBSession = Depends(get_db)):
    return db.query(Message).filter(
        Message.session_id == session_id
    ).order_by(Message.created_at.asc()).all()

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


def stream_graph(req: ChatRequest, system_content: str, db: DBSession):
    """Auto-switch: Gemini if online, Ollama if offline"""
    full_reply = []

    use_ollama = not is_online()

    if not use_ollama:
        # ── Online: try Gemini first ───────────────────────────
        try:
            for token in stream_gemini(system_content, req.message):
                full_reply.append(token)
                yield token
        except Exception as e:
            # Gemini failed (quota, error) → fallback to Ollama
            full_reply = []
            use_ollama = True
            yield "[Switching to offline mode...]\n"

    if use_ollama:
        # ── Offline: use Ollama via LangGraph ──────────────────
        config = {"configurable": {"thread_id": req.session_id}}
        for chunk in graph.stream(
            {
                "messages": [HumanMessage(content=req.message)],
                "system_content": system_content
            },
            config=config,
            stream_mode="messages"
        ):
            if isinstance(chunk, tuple):
                msg, metadata = chunk
                if hasattr(msg, 'content') and msg.content:
                    token = msg.content
                    full_reply.append(token)
                    yield token

    reply = "".join(full_reply)

    # Save to DB
    db.add(Message(
        session_id=req.session_id,
        role="user",
        content=req.message,
        created_at=datetime.utcnow()
    ))
    db.add(Message(
        session_id=req.session_id,
        role="assistant",
        content=reply,
        created_at=datetime.utcnow()
    ))
    db.commit()

    save_to_long_memory(req.session_id, "user", req.message)
    save_to_long_memory(req.session_id, "assistant", reply)


@app.post("/chat/stream")
async def chat_stream(req: ChatRequest, db: DBSession = Depends(get_db)):
    # Only use RAG if user actually uploaded a file with this message
    if req.has_file and req.filename:
        ext = req.filename.split(".")[-1].lower()
        if ext in ["jpg", "jpeg", "png"]:
            rag_context = search_rag(req.filename, n_results=1)
            if not rag_context:
                rag_context = search_rag("image diagram screenshot", n_results=3)
        else:
            rag_context = search_rag(req.filename if req.filename else req.message)
    else:
        rag_context = []

    system_content = (
        "You are a helpful assistant with memory. "
        "Always prioritize information the user has directly told you. "
        "Use past conversation context to answer personal questions like name, preferences, etc."
    )

    if rag_context:
        rag_text = "\n".join(rag_context)
        system_content += (
            f"\n\nThe user JUST uploaded an image file called '{req.filename}'. "
            f"Here is the detailed analysis of that image:\n{rag_text}"
            f"\n\nAnswer the user's question based on this image analysis. "
            f"Do NOT say you cannot see images. The image has already been analyzed and the description is above."
        )

    return StreamingResponse(
        stream_graph(req, system_content, db),
        media_type="text/plain"
    )


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    filename = file.filename or "uploaded_file"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    ext = filename.split(".")[-1].lower()

    if ext == "pdf":
        count = process_pdf(file_path, filename)
        return {"message": f"PDF processed, {count} chunks saved"}
    elif ext == "txt":
        count = process_txt(file_path, filename)
        return {"message": f"TXT processed, {count} chunks saved"}
    elif ext == "docx":
        count = process_docx(file_path, filename)
        return {"message": f"DOCX processed, {count} chunks saved"}
    elif ext in ["jpg", "jpeg", "png"]:
        description = process_image(file_path, filename)
        return {"message": "Image analyzed", "description": description}
    else:
        return {"message": f"Unsupported file type: {ext}"}


@app.get("/rag/search/{query}")
def rag_search(query: str):
    results = search_rag(query)
    return {"results": results}



# ── Auth Models ──────────────────────────────────────────────
class SignupRequest(BaseModel):
    name: str
    username: str
    email: str   
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

# ── Signup ────────────────────────────────────────────────────
@app.post("/auth/signup")
def signup(req: SignupRequest, db: DBSession = Depends(get_db)):
    existing = db.query(User).filter(User.username == req.username).first()
    if existing:
        return {"error": "Username already exists"}

    # Check email too
    existing_email = db.query(User).filter(User.email == req.email).first()
    if existing_email:
        return {"error": "Email already registered"}

    password_hash = bcrypt.hashpw(
        req.password.encode('utf-8'),
        bcrypt.gensalt()
    ).decode('utf-8')

    user = User(
        name=req.name,
        username=req.username,
        email=req.email,        # ← add this
        password_hash=password_hash,
        created_at=datetime.utcnow()
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "Account created successfully",
        "user": {
            "id": user.id,
            "name": user.name,
            "username": user.username,
            "email": user.email    # ← add this
        }
    }

# ── Login ─────────────────────────────────────────────────────
@app.post("/auth/login")
def login(req: LoginRequest, db: DBSession = Depends(get_db)):
    # Find user by email
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        return {"error": "Invalid email or password"}

    if not bcrypt.checkpw(
        req.password.encode('utf-8'),
        user.password_hash.encode('utf-8')
    ):
        return {"error": "Invalid email or password"}

    return {
        "message": "Login successful",
        "user": {
            "id": user.id,
            "name": user.name,
            "username": user.username,
            "email": user.email
        }
    }

# ── Get current user sessions ─────────────────────────────────
@app.get("/sessions/user/{user_id}")
def get_user_sessions(user_id: int, db: DBSession = Depends(get_db)):
    return db.query(Session).filter(
        Session.user_id == user_id
    ).order_by(Session.created_at.desc()).all()

@app.post("/generate-title")
async def generate_title(req: dict):
    message = req.get("message", "")
    try:
        from gemini_client import is_online, client
        from google.genai import types
        if is_online():
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=f"Generate a short 4-5 word title for a chat that starts with this message. Reply with ONLY the title, no quotes, no punctuation at end:\n{message}"
            )
            return {"title": response.text.strip()}
    except:
        pass
    # Fallback: use first 40 chars of message
    title = message.strip()[:40] + ("..." if len(message) > 40 else "")
    return {"title": title}
