import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { ChatSession, Message } from './types'
import { createSession, getSessions, getMessages, deleteSession, updateSessionTitle, generateTitle } from './api'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import Login from './Login'

interface User {
  id: number
  name: string
  username: string
  memory?: string
  photo?: string
}

export default function App() {

  const [user, setUser] = useState<User | null>(null)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
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

  // Clicking "New Chat" just clears the current view — no session is
  // created in the database until the user actually sends a message.
  function handleNew() {
    setActiveId(null)
    setMessages([])
  }

  // Called by ChatWindow the moment the user actually sends their first
  // message with no active session (fresh page load or after "New Chat").
  // Only the session-creation call is awaited (needed before /chat/stream
  // can use the id) — the sidebar list reload happens in the background so
  // it doesn't add extra latency before the user's message can be sent.
  async function createSessionForFirstMessage() {
    const id = uuidv4()
    const title = 'New Chat'
    await createSession(id, title)
    setActiveId(id)
    // Add it to the sidebar locally instead of re-fetching the whole list —
    // a background refetch here can race with the title-update refetch that
    // follows shortly after (from auto-titling), and whichever resolves
    // last wins, sometimes clobbering the real title back to "New Chat".
    setSessions(prev => [{ id, title, created_at: new Date().toISOString() }, ...prev])
    return id
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

  async function handleAutoTitle(sessionId: string, firstMessage: string) {
    const title = await generateTitle(firstMessage)
    await updateSessionTitle(sessionId, title)
    await loadSessions()
  }
  

  // Show login if not logged in
  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', position: 'relative' }}>
      {/* Sidebar toggle button */}
      <button
        onClick={() => setSidebarOpen(o => !o)}
        style={{
          position: 'fixed', top: '14px', left: sidebarOpen ? '220px' : '12px',
          zIndex: 200, width: '28px', height: '28px',
          background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
          borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
          color: 'var(--text-secondary)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          transition: 'left 0.25s ease'
        }}
      >{sidebarOpen ? '←' : '→'}</button>
      {sidebarOpen && <Sidebar
        sessions={sessions}
        activeId={activeId}
        onSelect={handleSelect}
        onNew={handleNew}
        onDelete={handleDelete}
        onRename={handleRename}
        user={user}
        onLogout={handleLogout}
        onUpdateUser={(u) => { localStorage.setItem("user", JSON.stringify(u)); setUser(u) }}
      />}
      <ChatWindow
        userMemory={user?.memory || ""}
        sessionId={activeId}
        initialMessages={messages}
        onAutoTitle={handleAutoTitle}
        onCreateSession={createSessionForFirstMessage}
      />
    </div>
  )
  
}