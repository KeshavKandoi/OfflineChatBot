const BASE = 'http://127.0.0.1:8000'

export async function createSession(id: string, title: string) {
  const res = await fetch(`${BASE}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, title })
  })
  return res.json()
}

export async function getSessions() {
  const res = await fetch(`${BASE}/sessions`)
  return res.json()
}

export async function getMessages(session_id: string) {
  const res = await fetch(`${BASE}/sessions/${session_id}/messages`)
  return res.json()
}

export async function deleteSession(session_id: string) {
  const res = await fetch(`${BASE}/sessions/${session_id}`, {
    method: 'DELETE'
  })
  return res.json()
}

export async function updateSessionTitle(session_id: string, title: string) {
  const res = await fetch(`${BASE}/sessions/${session_id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  })
  return res.json()
}

export async function uploadFile(file: File) {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${BASE}/upload`, { method: 'POST', body: form })
  return res.json()
}

// Returns a cancel() function so the caller can truly abort the in-flight
// request (not just stop reading it) — used by the Stop button.
export function streamChat(
  message: string,
  session_id: string,
  onChunk: (chunk: string) => void,
  onDone: (aborted: boolean) => void,
  has_file: boolean = false,
  filename: string = "",
  user_memory: string = ""
): () => void {
  const controller = new AbortController()

  ;(async () => {
    try {
      const res = await fetch(`${BASE}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, session_id, has_file, filename, user_memory }),
        signal: controller.signal
      })
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) { onDone(false); break }
        onChunk(decoder.decode(value))
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        onDone(true)
      } else {
        console.error('Stream error:', err)
        onDone(false)
      }
    }
  })()

  return () => controller.abort()
}

export async function generateTitle(message: string): Promise<string> {
  try {
    const res = await fetch(`${BASE}/generate-title`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    })
    const data = await res.json()
    return data.title || message.slice(0, 40)
  } catch {
    return message.slice(0, 40)
  }
}
