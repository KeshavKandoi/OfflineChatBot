import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { ChatSession, Message } from './types'
import { createSession, getSessions, getMessages, deleteSession, updateSessionTitle } from './api'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import Login from './Login'

interface User {
  id: number
  name: string
  username: string
}

export default function App() {

  const [user, setUser] = useState<User | null>(null)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])

  // Check if user is already logged in
  useEffect(() => {
    const saved = localStorage.getItem('user')
    if (saved) {
      setUser(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    if (user) loadSessions()
  }, [user])

  async function loadSessions() {
    const data = await getSessions()
    setSessions(data)
  }

  async function handleLogin(loggedInUser: User) {
    setUser(loggedInUser)
  }

  function handleLogout() {
    localStorage.removeItem('user')
    setUser(null)
    setSessions([])
    setActiveId(null)
    setMessages([])
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

  async function handleDelete(id: string) {
    await deleteSession(id)
    if (activeId === id) {
      setActiveId(null)
      setMessages([])
    }
    await loadSessions()
  }

  async function handleRename(id: string, title: string) {
    await updateSessionTitle(id, title)
    await loadSessions()
  }
  

  // Show login if not logged in
  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
      <Sidebar
        sessions={sessions}
        activeId={activeId}
        onSelect={handleSelect}
        onNew={handleNew}
        onDelete={handleDelete}
        onRename={handleRename}
        user={user}
        onLogout={handleLogout}
      />
      <ChatWindow
        sessionId={activeId}
        initialMessages={messages}
      />
    </div>
  )
  
}