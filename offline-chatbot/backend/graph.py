# from langgraph.graph import StateGraph, START, END
# from typing import TypedDict, Annotated
# from ollama_client import get_model
# from langgraph.checkpoint.memory import InMemorySaver  
# from langchain_core.messages import SystemMessage
# from langgraph.graph.message import add_messages
# from long_memory import search_long_memory
# from rag import search_rag


# class State(TypedDict):
#     messages: Annotated[list, add_messages]

# checkpointer = InMemorySaver()

# def call_llm(state: State) -> State:
#     last_message = state["messages"][-1].content
#     past_context = search_long_memory(last_message)
#     rag_context = search_rag(last_message)

#     system_content = (
#         "You are a helpful assistant. "
#         "Remember everything the user tells you in this conversation."
#     )

#     if past_context:
#         context_text = "\n".join(past_context)
#         system_content += f"\n\nRelevant context from past conversations:\n{context_text}"

#     if rag_context:
#         rag_text = "\n".join(rag_context)
#         system_content += f"\n\nRelevant context from uploaded documents:\n{rag_text}"

#     system = SystemMessage(content=system_content)
#     response = get_model(last_message).invoke([system] + state["messages"])
#     return {"messages": [response]}


# def build_graph():

#   graph = StateGraph(State)

#   graph.add_node("call_llm",call_llm)

#   graph.add_edge(START,"call_llm")
#   graph.add_edge("call_llm",END)

 

#   return graph.compile(checkpointer=checkpointer)

from langgraph.graph import StateGraph, START, END
from typing import TypedDict, Annotated
from ollama_client import get_model
from langgraph.checkpoint.memory import InMemorySaver
from langchain_core.messages import SystemMessage, HumanMessage
from langgraph.graph.message import add_messages
from long_memory import search_long_memory

class State(TypedDict):
    messages: Annotated[list, add_messages]
    system_content: str  # injected from outside

checkpointer = InMemorySaver()

def call_llm(state: State) -> State:
    system_content = state.get("system_content", (
        "You are a helpful assistant with memory. "
        "Always prioritize information the user has directly told you. "
        "Use past conversation context to answer personal questions like name, preferences, etc."
    ))

    # Add long memory context
    last_message = state["messages"][-1].content
    past_context = search_long_memory(last_message)
    if past_context:
        context_text = "\n".join(past_context)
        system_content += f"\n\nWhat the user has told you in past conversations:\n{context_text}"

    system = SystemMessage(content=system_content)
    response = get_model(last_message).invoke([system] + state["messages"])
    return {"messages": [response]}

def build_graph():
    graph = StateGraph(State)
    graph.add_node("call_llm", call_llm)
    graph.add_edge(START, "call_llm")
    graph.add_edge("call_llm", END)
    return graph.compile(checkpointer=checkpointer)





