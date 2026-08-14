interface Props {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({
  open, title, message, confirmLabel = 'Confirm', danger = true, onConfirm, onCancel
}: Props) {
  if (!open) return null

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '360px', background: 'var(--bg-secondary)',
          border: '1px solid var(--border)', borderRadius: '16px',
          padding: '24px', boxShadow: 'var(--shadow-md)'
        }}
      >
        <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          {title}
        </div>
        <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '22px' }}>
          {message}
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '9px 18px', borderRadius: '10px', border: '1px solid var(--border)',
              background: 'var(--bg-tertiary)', color: 'var(--text-primary)',
              fontSize: '13.5px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '9px 18px', borderRadius: '10px', border: 'none',
              background: danger ? 'var(--danger)' : 'var(--accent)', color: '#fff',
              fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s'
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
