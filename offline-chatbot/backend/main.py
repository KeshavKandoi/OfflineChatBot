from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from graph import build_graph
from langchain_core.messages import HumanMessage


app = FastAPI()

origins = ["*"] 

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,

    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def read_root():
    return {"status": "OK"}

class User(BaseModel):
    message:str
    session_id:str="default"


graph=build_graph()


@app.post("/chat")
def chat (user:User):
     
    config={"configurable": {"thread_id": user.session_id}}
    
    result = graph.invoke(
    {"messages": [HumanMessage(content=user.message)]},
    config=config
)
    return {"reply": result["messages"][-1].content}
