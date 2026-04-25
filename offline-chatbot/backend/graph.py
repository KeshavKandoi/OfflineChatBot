from langgraph.graph import StateGraph, START, END
from typing import TypedDict, Annotated
from ollama_client import model
from langgraph.checkpoint.memory import InMemorySaver  
from langchain_core.messages import SystemMessage
from langgraph.graph.message import add_messages

class State(TypedDict):
    messages: Annotated[list, add_messages]

checkpointer = InMemorySaver()

def call_llm(state: State) -> State:
    system = SystemMessage(
        content="You must remember and use previous conversation messages. "
                "If user asks about past information, answer using chat history."
    )
    response = model.invoke([system] + state["messages"])
    return {"messages":[response]}

def build_graph():

  graph = StateGraph(State)

  graph.add_node("call_llm",call_llm)

  graph.add_edge(START,"call_llm")
  graph.add_edge("call_llm",END)

  return graph.compile(checkpointer=checkpointer)


