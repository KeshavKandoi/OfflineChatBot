import { useRef, useState } from 'react'
import { uploadFile } from '../api'

export default function FileUpload() {
  const ref = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setStatus('Uploading...')
    try {
      const res = await uploadFile(file)
      setStatus(res.message || 'Done')
    } catch {
      setStatus('Upload failed')
    } finally {
      setLoading(false)
      setTimeout(() => setStatus(''), 3000)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <input ref={ref} type="file" accept=".pdf,.txt,.docx,.jpg,.jpeg,.png" onChange={handleFile} style={{ display: 'none' }} />
      <button
        onClick={() => ref.current?.click()}
        disabled={loading}
        title="Upload file"
        style={{
          padding: '10px 12px', borderRadius: '10px',
          background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
          color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '16px',
          transition: 'all 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
      >
        📎
      </button>
      {status && <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{status}</span>}
    </div>
  )
}