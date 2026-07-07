import os
import httpx
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

_client = None

def _get_client():
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return None
        _client = genai.Client(api_key=api_key)
    return _client

def is_online() -> bool:
    if not os.getenv("GEMINI_API_KEY"):
        return False
    try:
        httpx.get("https://www.google.com", timeout=2)
        return True
    except:
        return False

def stream_gemini(system_content: str, message: str):
    client = _get_client()
    if client is None:
        yield "Gemini is not configured (no API key set)."
        return
    full_prompt = f"{system_content}\n\nUser: {message}\nAssistant:"
    response = client.models.generate_content_stream(
        model="gemini-2.5-flash",
        contents=full_prompt,
        config=types.GenerateContentConfig(
            tools=[types.Tool(google_search=types.GoogleSearch())]
        )
    )
    for chunk in response:
        if chunk.text:
            yield chunk.text
