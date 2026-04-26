import type  { Message } from '../types'

export default function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: '16px' }}>
      {!isUser && (
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%',
          background: 'var(--accent-dim)', border: '1px solid var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', marginRight: '10px', flexShrink: 0, marginTop: '2px'
        }}>AI</div>
      )}
      <div style={{
        maxWidth: '72%',
        padding: '12px 16px',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        background: isUser ? 'var(--accent)' : 'var(--bg-tertiary)',
        border: isUser ? 'none' : '1px solid var(--border)',
        fontSize: '14px',
        lineHeight: '1.7',
        whiteSpace: 'pre-wrap',
        color: 'var(--text-primary)',
        fontFamily: 'DM Sans, sans-serif'
      }}>
        {msg.content}
      </div>
    </div>
  )
}