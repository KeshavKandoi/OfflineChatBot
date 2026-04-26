import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { ChatSession, Message } from './types'
import { createSession, getSessions, getMessages } from './api'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'

export default function App() {
 
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => { loadSessions() }, [])

  async function loadSessions() {
    const data = await getSessions()
    setSessions(data)
  }

  async function handleNew() {
    const id = uuidv4()
    const title = 'New Chat'
    await createSession(id, title)
    await loadSessions()
    setActiveId(id)
    setMessages([])
  }

  async function handleSelect(id: string) {
    setActiveId(id)
    const data = await getMessages(id)
    setMessages(data)
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
      <Sidebar
        sessions={sessions}
        activeId={activeId}
        onSelect={handleSelect}
        onNew={handleNew}
      />
      <ChatWindow
        sessionId={activeId}
        initialMessages={messages}
      />
    </div>
  )
}