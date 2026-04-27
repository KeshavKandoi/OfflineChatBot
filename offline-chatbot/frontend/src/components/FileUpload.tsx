import { useRef } from 'react'

interface Props {
  onFileSelect: (file: File | null, preview: string | null) => void
}

export default function FileUpload({ onFileSelect }: Props) {
  const ref = useRef<HTMLInputElement>(null)

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return

    if (f.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = () => {
        onFileSelect(f, reader.result as string)
      }
      reader.readAsDataURL(f)
    } else {
      onFileSelect(f, null)
    }

    if (ref.current) ref.current.value = ''
  }

  return (
    <>
      <input
        ref={ref}
        type="file"
        accept=".pdf,.txt,.docx,.jpg,.jpeg,.png"
        onChange={handleSelect}
        style={{ display: 'none' }}
      />
      <button
        onClick={() => ref.current?.click()}
        title="Attach file"
        style={{
          padding: '10px 12px',
          borderRadius: '10px',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border)',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          fontSize: '16px',
          transition: 'all 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
      >
        📎
      </button>
    </>
  )
}