from langgraph.graph import StateGraph, START, END
from typing import TypedDict
from ollama_client import model
from langgraph.checkpoint.memory import InMemorySaver  

class State(TypedDict):
    messages:list

checkpointer = InMemorySaver()

def call_llm(state:State)->State:
    messages=state["messages"]
    response=model.invoke(messages)

    return{"messages": messages + [response]}

def build_graph():

  graph = StateGraph(State)

  graph.add_node("call_llm",call_llm)

  graph.add_edge(START,"call_llm")
  graph.add_edge("call_llm",END)

  return graph.compile(checkpointer=checkpointer)


