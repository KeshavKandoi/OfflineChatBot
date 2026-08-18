import { useState, useRef } from 'react'
import type { ChatSession } from '../types'
import ConfirmModal from './ConfirmModal'
import { X, User as UserIcon, Brain, Camera, Trash2, Loader2, Check, AlertCircle, Lock, Search } from 'lucide-react'

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
  onUpdateUser?: (user: User) => void
  locked?: boolean
}

const MEMORY_MAX = 2000

export default function Sidebar({ sessions, activeId, onSelect, onNew, onDelete, onRename, user, onLogout, onUpdateUser, locked = false }: Props) {
  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [search, setSearch] = useState('')

  const [showSettings, setShowSettings] = useState(false)
  const [settingsTab, setSettingsTab] = useState<'profile' | 'memory'>('profile')

  const [nameValue, setNameValue] = useState(user.name)
  const [memoryValue, setMemoryValue] = useState(user.memory || '')
  const [memoryEnabled, setMemoryEnabled] = useState(!!user.memory)

  // undefined = no change staged; null = explicitly removed; string = new photo data URL
  const [pendingPhoto, setPendingPhoto] = useState<string | null | undefined>(undefined)
  const [photoError, setPhotoError] = useState('')

  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [savingMemory, setSavingMemory] = useState(false)
  const [memorySaved, setMemorySaved] = useState(false)
  const [confirmClearMemory, setConfirmClearMemory] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const displayedPhoto = pendingPhoto !== undefined ? pendingPhoto : user.photo

  function startEdit(s: ChatSession) {
    setEditing(s.id)
    setEditValue(s.title)
  }

  function saveEdit(id: string) {
    if (editValue.trim()) onRename(id, editValue.trim())
    setEditing(null)
  }

  function openSettings() {
    setShowSettings(true)
    setSettingsTab('profile')
    setNameValue(user.name)
    setMemoryValue(user.memory || '')
    setMemoryEnabled(!!user.memory)
    setPendingPhoto(undefined)
    setPhotoError('')
    setProfileSaved(false)
    setMemorySaved(false)
  }

  function saveProfile() {
    setSavingProfile(true)
    setTimeout(() => {
      const updated: User = { ...user, name: nameValue.trim() || user.name }
      if (pendingPhoto !== undefined) {
        if (pendingPhoto === null) delete updated.photo
        else updated.photo = pendingPhoto
      }
      onUpdateUser?.(updated)
      setPendingPhoto(undefined)
      setSavingProfile(false)
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 1800)
    }, 350)
  }

  function saveMemory() {
    setSavingMemory(true)
    setTimeout(() => {
      const updated = { ...user, memory: memoryEnabled ? memoryValue : '' }
      onUpdateUser?.(updated)
      setSavingMemory(false)
      setMemorySaved(true)
      setTimeout(() => setMemorySaved(false), 1800)
    }, 350)
  }

  function clearMemory() {
    setMemoryValue('')
    const updated = { ...user, memory: '' }
    onUpdateUser?.(updated)
    setConfirmClearMemory(false)
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select a valid image file (PNG, JPG, etc).')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    setPhotoError('')
    const reader = new FileReader()
    reader.onload = () => setPendingPhoto(reader.result as string)
    reader.readAsDataURL(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removePhoto() {
    setPendingPhoto(null)
    setPhotoError('')
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
          <button
            onClick={() => { if (!locked) onNew() }}
            disabled={locked}
            title={locked ? 'Wait for the current response to finish' : undefined}
            style={{
            width: '100%', padding: '10px 14px',
            background: 'var(--accent-dim)', border: '1px solid var(--accent)',
            borderRadius: '8px', color: 'var(--accent)',
            fontSize: '13px', fontWeight: 500, cursor: locked ? 'not-allowed' : 'pointer',
            opacity: locked ? 0.5 : 1,
            display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.15s'
          }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent)', e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent-dim)', e.currentTarget.style.color = 'var(--accent)')}
          >
            <span style={{ fontSize: '16px' }}>+</span> New Chat
          </button>
          <div style={{ position: 'relative', marginTop: '10px' }}>
            <Search size={14} style={{
              position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-muted)', pointerEvents: 'none'
            }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search chats..."
              style={{
                width: '100%', padding: '8px 12px 8px 32px',
                borderRadius: '8px', background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)', color: 'var(--text-primary)',
                fontSize: '13px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>

        {/* Sessions list */}
        <div
          onClick={() => setMenuOpenId(null)}
          style={{
            flex: 1, overflowY: 'auto', padding: '8px',
            opacity: locked ? 0.5 : 1,
            pointerEvents: locked ? 'none' : 'auto',
            transition: 'opacity 0.15s'
          }}
          title={locked ? 'Wait for the current response to finish' : undefined}
        >
          <div style={{
            padding: '10px 12px 6px', fontSize: '11px', fontWeight: 600,
            color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase'
          }}>
            Recents
          </div>
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
                          onClick={() => { setConfirmDeleteId(s.id); setMenuOpenId(null) }}
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
          onClick={openSettings}
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
          </div>
          <button onClick={(e) => { e.stopPropagation(); setConfirmLogout(true) }} title="Logout"
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px', padding: '4px', borderRadius: '6px', transition: 'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >⏻</button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div
          className="settings-overlay"
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}
          onClick={() => setShowSettings(false)}
        >
          <div
            className="settings-modal"
            style={{
              background: 'var(--bg-primary)', borderRadius: '16px', width: '440px',
              border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)',
              overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ padding: '22px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)' }}>Settings</div>
              <button
                onClick={() => setShowSettings(false)}
                aria-label="Close settings"
                style={{
                  width: '30px', height: '30px', borderRadius: '8px', background: 'transparent',
                  border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
              >
                <X size={17} />
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', padding: '18px 24px 0' }}>
              {([
                { key: 'profile' as const, label: 'Profile', Icon: UserIcon },
                { key: 'memory' as const, label: 'Memory', Icon: Brain },
              ]).map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => setSettingsTab(key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '7px',
                    padding: '7px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    fontSize: '13px', fontWeight: 500, transition: 'all 0.15s',
                    background: settingsTab === key ? 'var(--accent-dim)' : 'transparent',
                    color: settingsTab === key ? 'var(--accent)' : 'var(--text-secondary)',
                  }}
                >
                  <Icon size={15} strokeWidth={2} />
                  {label}
                </button>
              ))}
            </div>

            <div style={{ padding: '20px 24px 24px' }}>
              {/* ── PROFILE TAB ── */}
              {settingsTab === 'profile' && (
                <div className="settings-tab-fade" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div
                      className="avatar-hover-group"
                      style={{ position: 'relative', width: '64px', height: '64px', flexShrink: 0, cursor: 'pointer' }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {displayedPhoto ? (
                        <img src={displayedPhoto} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
                      ) : (
                        <div style={{
                          width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '24px', fontWeight: 700, color: '#fff'
                        }}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div
                        className="avatar-hover-overlay"
                        style={{
                          position: 'absolute', inset: 0, borderRadius: '50%',
                          background: 'rgba(0,0,0,0.45)', opacity: 0, transition: 'opacity 0.15s',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                        }}
                      >
                        <Camera size={18} />
                      </div>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>{user.name}</div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          style={{
                            padding: '5px 11px', borderRadius: '7px',
                            background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                            fontSize: '12px', fontWeight: 500, cursor: 'pointer', color: 'var(--text-secondary)',
                            display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.15s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                        >
                          <Camera size={13} /> Change Photo
                        </button>
                        {displayedPhoto && (
                          <button
                            onClick={removePhoto}
                            aria-label="Remove photo"
                            title="Remove photo"
                            style={{
                              padding: '5px 9px', borderRadius: '7px',
                              background: 'transparent', border: '1px solid var(--border)',
                              fontSize: '12px', fontWeight: 500, cursor: 'pointer', color: 'var(--danger)',
                              display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.15s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <Trash2 size={13} /> Remove
                          </button>
                        )}
                      </div>
                    </div>

                    <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
                  </div>

                  {photoError && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      fontSize: '12.5px', color: 'var(--danger)',
                      background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)',
                      borderRadius: '8px', padding: '8px 12px'
                    }}>
                      <AlertCircle size={14} /> {photoError}
                    </div>
                  )}

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', letterSpacing: '0.02em' }}>
                      DISPLAY NAME
                    </label>
                    <input
                      value={nameValue}
                      onChange={e => setNameValue(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && saveProfile()}
                      disabled={savingProfile}
                      style={{
                        width: '100%', padding: '10px 12px', borderRadius: '9px', height: '38px',
                        background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                        color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
                        fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.15s',
                        opacity: savingProfile ? 0.6 : 1
                      }}
                      onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-dim)' }}
                      onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                    />
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '6px' }}>
                      This is the name shown in the sidebar and chat.
                    </div>
                  </div>

                  <button
                    onClick={saveProfile}
                    disabled={savingProfile}
                    style={{
                      padding: '10px', borderRadius: '9px', border: 'none',
                      background: profileSaved ? 'var(--success)' : 'var(--accent)',
                      color: '#fff', fontSize: '13.5px', fontWeight: 600,
                      cursor: savingProfile ? 'default' : 'pointer', transition: 'all 0.15s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                  >
                    {savingProfile ? (
                      <><Loader2 size={15} className="spin" /> Saving...</>
                    ) : profileSaved ? (
                      <><Check size={15} /> Saved</>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              )}

              {/* ── MEMORY TAB ── */}
              {settingsTab === 'memory' && (
                <div className="settings-tab-fade" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      Long-Term Memory
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                      When enabled, NexaChat remembers useful details you share and applies them across every conversation.
                    </div>
                  </div>

                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 12px', borderRadius: '9px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)'
                  }}>
                    <span style={{ fontSize: '12.5px', fontWeight: 500, color: memoryEnabled ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {memoryEnabled ? 'On' : 'Off'}
                    </span>
                    <button
                      role="switch"
                      aria-checked={memoryEnabled}
                      aria-label="Toggle long-term memory"
                      onClick={() => setMemoryEnabled(!memoryEnabled)}
                      style={{
                        width: '42px', height: '23px', borderRadius: '12px', cursor: 'pointer', border: 'none',
                        background: memoryEnabled ? 'var(--accent)' : 'var(--border)', position: 'relative', transition: 'background 0.2s'
                      }}
                    >
                      <div style={{
                        position: 'absolute', top: '2px', left: memoryEnabled ? '21px' : '2px',
                        width: '19px', height: '19px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s'
                      }} />
                    </button>
                  </div>

                  <div style={{ opacity: memoryEnabled ? 1 : 0.45, transition: 'opacity 0.2s', pointerEvents: memoryEnabled ? 'auto' : 'none' }}>
                    <textarea
                      value={memoryValue}
                      onChange={e => setMemoryValue(e.target.value.slice(0, MEMORY_MAX))}
                      placeholder="E.g. My name is Keshav, I'm a developer, I prefer concise answers, I'm building an offline AI app..."
                      rows={6}
                      disabled={!memoryEnabled || savingMemory}
                      style={{
                        width: '100%', padding: '11px 12px', borderRadius: '9px',
                        background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                        color: 'var(--text-primary)', fontSize: '13px', outline: 'none', lineHeight: '1.6',
                        fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', transition: 'border-color 0.15s'
                      }}
                      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px' }}>
                      {memoryValue.length} / {MEMORY_MAX}
                    </div>
                  </div>

                  {!memoryEnabled && (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '-8px' }}>
                      Memory is currently paused — NexaChat won't recall or store anything here until you turn this on.
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={saveMemory}
                      disabled={!memoryEnabled || savingMemory}
                      style={{
                        flex: 1, padding: '10px', borderRadius: '9px', border: 'none',
                        background: !memoryEnabled ? 'var(--bg-hover)' : memorySaved ? 'var(--success)' : 'var(--accent)',
                        color: !memoryEnabled ? 'var(--text-muted)' : '#fff',
                        fontSize: '13.5px', fontWeight: 600,
                        cursor: (!memoryEnabled || savingMemory) ? 'default' : 'pointer', transition: 'all 0.15s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                      }}
                    >
                      {savingMemory ? (
                        <><Loader2 size={15} className="spin" /> Saving...</>
                      ) : memorySaved ? (
                        <><Check size={15} /> Saved</>
                      ) : (
                        'Save Memory'
                      )}
                    </button>
                    <button
                      onClick={() => setConfirmClearMemory(true)}
                      disabled={!memoryValue}
                      title="Clear memory"
                      style={{
                        padding: '10px 14px', borderRadius: '9px',
                        background: 'transparent', border: '1px solid var(--border)',
                        color: memoryValue ? 'var(--danger)' : 'var(--text-muted)',
                        fontSize: '13px', fontWeight: 500,
                        cursor: memoryValue ? 'pointer' : 'default', transition: 'all 0.15s',
                        display: 'flex', alignItems: 'center', gap: '6px'
                      }}
                      onMouseEnter={e => { if (memoryValue) e.currentTarget.style.background = 'var(--bg-hover)' }}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <Trash2 size={14} /> Clear
                    </button>
                  </div>

                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: '8px',
                    fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: '1.5',
                    borderTop: '1px solid var(--border)', paddingTop: '12px'
                  }}>
                    <Lock size={13} style={{ marginTop: '1px', flexShrink: 0 }} />
                    <span>Stored locally on this device only — memory never leaves your machine.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .chat-row:hover .chat-actions { opacity: 1 !important; }
        .avatar-hover-group:hover .avatar-hover-overlay { opacity: 1 !important; }

        .spin { animation: nx-spin 0.8s linear infinite; }
        @keyframes nx-spin { to { transform: rotate(360deg); } }

        .settings-overlay { animation: nx-fade-in 0.18s ease; }
        .settings-modal { animation: nx-modal-in 0.18s cubic-bezier(0.16,1,0.3,1); }
        .settings-tab-fade { animation: nx-fade-in 0.15s ease; }

        @keyframes nx-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes nx-modal-in {
          from { opacity: 0; transform: scale(0.96) translateY(4px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .spin, .settings-overlay, .settings-modal, .settings-tab-fade {
            animation: none !important;
          }
        }
      `}</style>

      <ConfirmModal
        open={confirmDeleteId !== null}
        title="Delete chat"
        message="Are you sure you want to delete this chat? This can't be undone."
        confirmLabel="Delete"
        danger
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId) onDelete(confirmDeleteId)
          setConfirmDeleteId(null)
        }}
      />

      <ConfirmModal
        open={confirmLogout}
        title="Log out"
        message="Are you sure you want to log out?"
        confirmLabel="Log out"
        danger
        onCancel={() => setConfirmLogout(false)}
        onConfirm={() => {
          onLogout()
          setConfirmLogout(false)
        }}
      />

      <ConfirmModal
        open={confirmClearMemory}
        title="Clear memory"
        message="This will permanently erase everything NexaChat remembers about you. This can't be undone."
        confirmLabel="Clear Memory"
        danger
        onCancel={() => setConfirmClearMemory(false)}
        onConfirm={clearMemory}
      />
    </>
  )
}
