import { useState, useRef } from 'react'
import type { ChatSession } from '../types'

interface User {
  id: number
  name: string
  username: string
  photo?: string
  memory?: string
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
  onUpdateName: (name: string) => void
  onUpdateUser?: (user: User) => void
}

export default function Sidebar({ sessions, activeId, onSelect, onNew, onDelete, onRename, user, onLogout, onUpdateName, onUpdateUser }: Props) {
  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [settingsTab, setSettingsTab] = useState<'profile' | 'memory'>('profile')
  const [nameValue, setNameValue] = useState(user.name)
  const [memoryValue, setMemoryValue] = useState(user.memory || '')
  const [memoryEnabled, setMemoryEnabled] = useState(!!user.memory)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function startEdit(s: ChatSession) {
    setEditing(s.id)
    setEditValue(s.title)
  }

  function saveEdit(id: string) {
    if (editValue.trim()) onRename(id, editValue.trim())
    setEditing(null)
  }

  function saveProfile() {
    const updated = { ...user, name: nameValue.trim() || user.name }
    onUpdateUser?.(updated)
    onUpdateName(updated.name)
    setShowSettings(false)
  }

  function saveMemory() {
    const updated = { ...user, memory: memoryEnabled ? memoryValue : '' }
    onUpdateUser?.(updated)
    setShowSettings(false)
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const updated = { ...user, photo: reader.result as string }
      onUpdateUser?.(updated)
    }
    reader.readAsDataURL(file)
  }

  return (
    <>
      <div style={{
        width: '260px', minWidth: '260px', height: '100vh',
        background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
            Nexachat
          </div>
          <button onClick={onNew} style={{
            width: '100%', padding: '10px 14px',
            background: 'var(--accent-dim)', border: '1px solid var(--accent)',
            borderRadius: '8px', color: 'var(--accent)',
            fontSize: '13px', fontWeight: 500, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.15s'
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
              fontSize: '13px', outline: 'none', fontFamily: 'inherit'
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        {/* Sessions list */}
        <div onClick={() => setMenuOpenId(null)} style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {sessions.length === 0 && (
            <div style={{ padding: '20px 8px', color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>
              No chats yet
            </div>
          )}
          {sessions.filter(s => s.title.toLowerCase().includes(search.toLowerCase())).map(s => (
            <div key={s.id} className="chat-row" style={{
              padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', marginBottom: '2px',
              background: activeId === s.id ? 'var(--bg-hover)' : 'transparent',
              borderLeft: activeId === s.id ? '2px solid var(--accent)' : '2px solid transparent',
              transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '8px', position: 'relative'
            }}
              onMouseEnter={e => { if (activeId !== s.id) e.currentTarget.style.background = 'var(--bg-tertiary)' }}
              onMouseLeave={e => { if (activeId !== s.id) e.currentTarget.style.background = 'transparent' }}
            >
              {editing === s.id ? (
                <input value={editValue} onChange={e => setEditValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveEdit(s.id)}
                  onBlur={() => saveEdit(s.id)} autoFocus
                  style={{ flex: 1, background: 'var(--bg-primary)', border: '1px solid var(--accent)', borderRadius: '4px', padding: '4px 8px', fontSize: '13px', color: 'var(--text-primary)', outline: 'none' }}
                />
              ) : (
                <>
                  <div onClick={() => onSelect(s.id)} style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{new Date(s.created_at).toLocaleDateString()}</div>
                  </div>

                  <div className="chat-actions" style={{ position: 'relative', opacity: 0, flexShrink: 0 }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === s.id ? null : s.id) }}
                      style={{
                        background: 'none', border: 'none', color: 'var(--text-secondary)',
                        cursor: 'pointer', fontSize: '16px', padding: '4px 6px', borderRadius: '6px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                      title="More options"
                    >⋮</button>

                    {menuOpenId === s.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: 'absolute', top: '28px', right: 0, zIndex: 50,
                          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                          borderRadius: '12px', padding: '6px', minWidth: '140px',
                          boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', gap: '2px'
                        }}
                      >
                        <button
                          onClick={() => { startEdit(s); setMenuOpenId(null) }}
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '13px', padding: '9px 10px', borderRadius: '8px', textAlign: 'left', width: '100%' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <span>✎</span> Edit
                        </button>
                        <button
                          onClick={() => { if (confirm('Delete this chat?')) onDelete(s.id); setMenuOpenId(null) }}
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '13px', padding: '9px 10px', borderRadius: '8px', textAlign: 'left', width: '100%' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <span>🗑</span> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* User info at bottom */}
        <div style={{
          padding: '12px 16px', borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: '10px',
          cursor: 'pointer', transition: 'background 0.15s',
        }}
          onClick={() => { setShowSettings(true); setSettingsTab('profile'); setNameValue(user.name); setMemoryValue(user.memory || '') }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          {user.photo ? (
            <img src={user.photo} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
          ) : (
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 700, color: '#fff', flexShrink: 0
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>@{user.username}</div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); if (confirm('Log out?')) onLogout() }} title="Logout"
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px', padding: '4px', borderRadius: '6px', transition: 'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >⏻</button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }} onClick={() => setShowSettings(false)}>
          <div style={{
            background: 'var(--bg-primary)', borderRadius: '16px', width: '420px',
            border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)',
            overflow: 'hidden'
          }} onClick={e => e.stopPropagation()}>

            <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Settings</div>
              <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color:'var(--text-muted)', lineHeight: 1 }}>×</button>
            </div>

            <div style={{ display: 'flex', gap: '4px', padding: '16px 24px 0' }}>
              {(['profile', 'memory'] as const).map(tab => (
                <button key={tab} onClick={() => setSettingsTab(tab)} style={{
                  padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontSize: '13px', fontWeight: 500, transition: 'all 0.15s',
                  background: settingsTab === tab ? 'var(--accent)' : 'var(--bg-tertiary)',
                  color: settingsTab === tab ? '#fff' : 'var(--text-secondary)',
                }}>
                  {tab === 'profile' ? '👤 Profile' : '🧠 Memory'}
                </button>
              ))}
            </div>

            <div style={{ padding: '20px 24px 24px' }}>
              {settingsTab === 'profile' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ position: 'relative' }}>
                      {user.photo ? (
                        <img src={user.photo} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{
                          width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '24px', fontWeight: 700, color: '#fff'
                        }}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <button onClick={() => fileInputRef.current?.click()} style={{
                        position: 'absolute', bottom: 0, right: 0,
                        width: '22px', height: '22px', borderRadius: '50%',
                        background: 'var(--accent)', border: '2px solid var(--bg-primary)',
                        cursor: 'pointer', fontSize: '11px', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', color: '#fff'
                      }}>📷</button>
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>@{user.username}</div>
                      <button onClick={() => fileInputRef.current?.click()} style={{
                        marginTop: '6px', padding: '4px 10px', borderRadius: '6px',
                        background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                        fontSize: '12px', cursor: 'pointer', color: 'var(--text-secondary)'
                      }}>Change Photo</button>
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>DISPLAY NAME</label>
                    <input value={nameValue} onChange={e => setNameValue(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && saveProfile()}
                      style={{
                        width: '100%', padding: '10px 12px', borderRadius: '8px',
                        background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                        color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
                        fontFamily: 'inherit', boxSizing: 'border-box'
                      }}
                      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                  </div>

                  <button onClick={saveProfile} style={{
                    padding: '10px', borderRadius: '8px', border: 'none',
                    background: 'var(--accent)', color: '#fff', fontSize: '14px',
                    fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s'
                  }}>Save Changes</button>
                </div>
              )}

              {settingsTab === 'memory' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Long Term Memory</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>AI remembers this about you in every chat</div>
                    </div>
                    <div onClick={() => setMemoryEnabled(!memoryEnabled)} style={{
                      width: '44px', height: '24px', borderRadius: '12px', cursor: 'pointer',
                      background: memoryEnabled ? 'var(--accent)' : 'var(--border)', position: 'relative', transition: 'all 0.2s'
                    }}>
                      <div style={{
                        position: 'absolute', top: '2px', left: memoryEnabled ? '22px' : '2px',
                        width: '20px', height: '20px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s'
                      }} />
                    </div>
                  </div>

                  {memoryEnabled && (
                    <textarea value={memoryValue} onChange={e => setMemoryValue(e.target.value)}
                      placeholder="E.g. My name is Keshav, I'm a developer, I prefer concise answers, I'm building an offline AI app..."
                      rows={6}
                      style={{
                        width: '100%', padding: '10px 12px', borderRadius: '8px',
                        background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                        color: 'var(--text-primary)', fontSize: '13px', outline: 'none',
                        fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box'
                      }}
                      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                  )}

                  <button onClick={saveMemory} style={{
                    padding: '10px', borderRadius: '8px', border: 'none',
                    background: 'var(--accent)', color: '#fff', fontSize: '14px',
                    fontWeight: 600, cursor: 'pointer'
                  }}>Save Memory</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .chat-row:hover .chat-actions { opacity: 1 !important; }
      `}</style>
    </>
  )
}
