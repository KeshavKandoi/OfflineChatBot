import  type { ChatSession } from '../types'

interface Props {
  sessions: ChatSession[]
  activeId: string | null
  onSelect: (id: string) => void
  onNew: () => void
}

export default function Sidebar({ sessions, activeId, onSelect, onNew }: Props) {
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
      </div>

      {/* Sessions list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {sessions.length === 0 && (
          <div style={{ padding: '20px 8px', color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>
            No chats yet
          </div>
        )}
        {sessions.map(s => (
          <div
            key={s.id}
            onClick={() => onSelect(s.id)}
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              marginBottom: '2px',
              background: activeId === s.id ? 'var(--bg-hover)' : 'transparent',
              borderLeft: activeId === s.id ? '2px solid var(--accent)' : '2px solid transparent',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => { if (activeId !== s.id) e.currentTarget.style.background = 'var(--bg-tertiary)' }}
            onMouseLeave={e => { if (activeId !== s.id) e.currentTarget.style.background = 'transparent' }}
          >
            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {s.title}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {new Date(s.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}