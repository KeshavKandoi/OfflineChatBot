import { useState } from 'react'
import type { ChatSession } from '../types'

interface Props {
  sessions: ChatSession[]
  activeId: string | null
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
  onRename: (id: string, title: string) => void
}

export default function Sidebar({ sessions, activeId, onSelect, onNew, onDelete, onRename }: Props) {
  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

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
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {sessions.length === 0 && (
          <div style={{ padding: '20px 8px', color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>
            No chats yet
          </div>
        )}
        {sessions.map(s => (
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
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '14px',
                      padding: '2px 4px'
                    }}
                    title="Rename"
                  >
                    ✎
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); if (confirm('Delete this chat?')) onDelete(s.id) }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--danger)',
                      cursor: 'pointer',
                      fontSize: '14px',
                      padding: '2px 4px'
                    }}
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      <style>{`
        div:hover .chat-actions {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  )
}