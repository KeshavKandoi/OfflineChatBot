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
          width: '34px', height: '34px',
          borderRadius: '50%',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          fontSize: '20px',
          fontWeight: 400,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          transition: 'background 0.15s, color 0.15s'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'var(--bg-hover)'
          e.currentTarget.style.color = 'var(--text-primary)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--text-secondary)'
        }}
      >
        +
      </button>
    </>
  )
}
