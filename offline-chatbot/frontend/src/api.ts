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

export async function uploadFile(file: File) {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${BASE}/upload`, { method: 'POST', body: form })
  return res.json()
}

export async function streamChat(
  message: string,
  session_id: string,
  onChunk: (chunk: string) => void,
  onDone: () => void
) {
  const res = await fetch(`${BASE}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, session_id })
  })

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) { onDone(); break }
    onChunk(decoder.decode(value))
  }
}