import { useState } from 'react'
import type { ChatSession } from '../types'

interface User {
  id: number
  name: string
  username: string
}

interface Props {
  sessions: ChatSession[]
  activeId: string | null
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
  onRename: (id: string, title: string) => void
  user: User
  onLogout: () => void
}

export default function Sidebar({ sessions, activeId, onSelect, onNew, onDelete, onRename, user, onLogout }: Props) {
  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [search, setSearch] = useState('')

  function startEdit(s: ChatSession) {
    setEditing(s.id)
    setEditValue(s.title)
  }

  function saveEdit(id: string) {
    if (editValue.trim()) {
      onRename(id, editValue.trim())
    }
    setEditing(null)
  }

  return (
    <div style={{
      width: '260px',
      minWidth: '260px',
      height: '100vh',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
          Offline AI
        </div>
        <button onClick={onNew} style={{
          width: '100%', padding: '10px 14px',
          background: 'var(--accent-dim)', border: '1px solid var(--accent)',
          borderRadius: '8px', color: 'var(--accent)',
          fontSize: '13px', fontWeight: 500, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '8px',
          transition: 'all 0.15s'
        }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent)', e.currentTarget.style.color = '#fff')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent-dim)', e.currentTarget.style.color = 'var(--accent)')}
        >
          <span style={{ fontSize: '16px' }}>+</span> New Chat
        </button>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search chats..."
          style={{
            width: '100%', marginTop: '10px', padding: '8px 12px',
            borderRadius: '8px', background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)', color: 'var(--text-primary)',
            fontSize: '13px', outline: 'none', fontFamily: 'DM Sans, sans-serif'
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      </div>

      {/* Sessions list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {sessions.length === 0 && (
          <div style={{ padding: '20px 8px', color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>
            No chats yet
          </div>
        )}
        {sessions.filter(s => s.title.toLowerCase().includes(search.toLowerCase())).map(s => (
          <div
            key={s.id}
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              marginBottom: '2px',
              background: activeId === s.id ? 'var(--bg-hover)' : 'transparent',
              borderLeft: activeId === s.id ? '2px solid var(--accent)' : '2px solid transparent',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              position: 'relative'
            }}
            onMouseEnter={e => { if (activeId !== s.id) e.currentTarget.style.background = 'var(--bg-tertiary)' }}
            onMouseLeave={e => { if (activeId !== s.id) e.currentTarget.style.background = 'transparent' }}
          >
            {editing === s.id ? (
              <input
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveEdit(s.id)}
                onBlur={() => saveEdit(s.id)}
                autoFocus
                style={{
                  flex: 1,
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--accent)',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
            ) : (
              <>
                <div onClick={() => onSelect(s.id)} style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {new Date(s.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="chat-actions" style={{ display: 'flex', gap: '4px', opacity: 0 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); startEdit(s) }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px', padding: '2px 4px' }}
                    title="Rename"
                  >✎</button>
                  <button
                    onClick={(e) => { e.stopPropagation(); if (confirm('Delete this chat?')) onDelete(s.id) }}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '14px', padding: '2px 4px' }}
                    title="Delete"
                  >✕</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* User info + Logout at bottom */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        {/* Avatar */}
        <div style={{
          width: '32px', height: '32px',
          borderRadius: '50%',
          background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '13px', fontWeight: 700, color: '#fff',
          flexShrink: 0
        }}>
          {user.name.charAt(0).toUpperCase()}
        </div>

        {/* Name + username */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user.name}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            @{user.username}
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={() => { if (confirm('Log out?')) onLogout() }}
          title="Logout"
          style={{
            background: 'none', border: 'none',
            color: 'var(--text-muted)', cursor: 'pointer',
            fontSize: '16px', padding: '4px',
            borderRadius: '6px', transition: 'all 0.15s'
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          ⏻
        </button>
      </div>

      <style>{`
        div:hover .chat-actions { opacity: 1 !important; }
      `}</style>
    </div>
  )
}