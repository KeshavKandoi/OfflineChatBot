from langchain_ollama import ChatOllama

# Code model - for programming questions
code_model = ChatOllama(model="qwen2.5-coder:7b", stream=True)

# General model - for general knowledge
general_model = ChatOllama(model="qwen2.5:7b", stream=True)

# Keywords that indicate a coding question
CODE_KEYWORDS = [
    'code', 'function', 'class', 'algorithm', 'debug', 'error',
    'implement', 'program', 'syntax', 'compile', 'python', 'java',
    'javascript', 'c++', 'typescript', 'html', 'css', 'sql', 'api',
    'array', 'loop', 'recursion', 'sort', 'search', 'leetcode', 'solve'
]

def get_model(message: str):
    msg_lower = message.lower()
    if any(kw in msg_lower for kw in CODE_KEYWORDS):
        return code_model
    return general_model

# Default model (used by graph.py)
model = general_model
