import { useState } from 'react'
import type { Message } from '../types'

interface Props {
  msg: Message
  onEdit?: (id: number, newContent: string) => void
}

export default function MessageBubble({ msg, onEdit }: Props) {
  const isUser = msg.role === 'user'
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [hovered, setHovered] = useState(false)

  // Parse out attachment info
  const fileMatch = msg.content.match(/^\[File: (.+?) \| (.+?)\]([\s\S]*)$/)
  const fileName = fileMatch?.[1] ?? null
  const filePreview = fileMatch?.[2] ?? null
  const textContent = fileMatch ? fileMatch[3].trim() : msg.content

  function handleCopy() {
    navigator.clipboard.writeText(textContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function startEdit() {
    setEditValue(textContent)
    setEditing(true)
  }

  function saveEdit() {
    if (editValue.trim() && onEdit) {
      const newContent = fileName
        ? `[File: ${fileName} | ${filePreview ?? 'none'}]\n${editValue.trim()}`
        : editValue.trim()
      onEdit(msg.id, newContent)
    }
    setEditing(false)
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '16px',
        alignItems: 'flex-end',
        gap: '10px'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* AI avatar */}
      {!isUser && (
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%',
          background: 'var(--accent-dim)', border: '1px solid var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', flexShrink: 0
        }}>AI</div>
      )}

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        gap: '4px',
        maxWidth: '72%'
      }}>

        {/* File attachment card */}
        {fileName && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: isUser ? 'rgba(124,106,247,0.15)' : 'var(--bg-tertiary)',
            border: `1px solid ${isUser ? 'rgba(124,106,247,0.4)' : 'var(--border)'}`,
            borderRadius: '14px 14px 14px 4px',
            padding: '10px 14px',
            minWidth: '200px',
            maxWidth: '320px'
          }}>
            {filePreview && filePreview.startsWith('data:image') ? (
              <img src={filePreview} alt={fileName} style={{
                width: '44px', height: '44px',
                borderRadius: '8px', objectFit: 'cover', flexShrink: 0
              }} />
            ) : (
              <div style={{
                width: '44px', height: '44px', borderRadius: '8px',
                background: 'var(--bg-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', flexShrink: 0
              }}>
                {fileName.endsWith('.pdf') ? '📄' : fileName.endsWith('.docx') ? '📝' : '📃'}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
              }}>{fileName}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Attached file
              </div>
            </div>
          </div>
        )}

        {/* Text bubble */}
        {editing ? (
          <div style={{ width: '100%' }}>
            <textarea
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              autoFocus
              rows={3}
              style={{
                width: '100%', padding: '12px 16px',
                borderRadius: '12px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--accent)',
                color: 'var(--text-primary)',
                fontSize: '14px', lineHeight: '1.7',
                outline: 'none', resize: 'vertical',
                fontFamily: 'DM Sans, sans-serif'
              }}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setEditing(false)}
                style={{
                  padding: '6px 14px', borderRadius: '8px',
                  background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                  color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer'
                }}
              >Cancel</button>
              <button
                onClick={saveEdit}
                style={{
                  padding: '6px 14px', borderRadius: '8px',
                  background: 'var(--accent)', border: 'none',
                  color: '#fff', fontSize: '12px', cursor: 'pointer', fontWeight: 500
                }}
              >Save</button>
            </div>
          </div>
        ) : (
          textContent && (
            <div style={{
              padding: '12px 16px',
              borderRadius: isUser
                ? (fileName ? '14px 14px 4px 14px' : '18px 18px 4px 18px')
                : '18px 18px 18px 4px',
              background: isUser ? 'var(--accent)' : 'var(--bg-tertiary)',
              border: isUser ? 'none' : '1px solid var(--border)',
              fontSize: '14px', lineHeight: '1.7',
              whiteSpace: 'pre-wrap', color: 'var(--text-primary)',
            }}>
              {textContent}
            </div>
          )
        )}

        {/* Action buttons — appear on hover */}
        {!editing && hovered && (
          <div style={{
            display: 'flex',
            gap: '4px',
            marginTop: '2px',
            justifyContent: isUser ? 'flex-end' : 'flex-start'
          }}>
            {/* Copy button */}
            <button
              onClick={handleCopy}
              title="Copy"
              style={{
                padding: '5px 8px', borderRadius: '7px',
                background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                color: copied ? 'var(--success)' : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: '13px',
                display: 'flex', alignItems: 'center', gap: '4px',
                transition: 'all 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              {copied ? '✓' : '⧉'} <span style={{ fontSize: '11px' }}>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {/* Edit button — only for user messages */}
            {isUser && onEdit && (
              <button
                onClick={startEdit}
                title="Edit"
                style={{
                  padding: '5px 8px', borderRadius: '7px',
                  background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer', fontSize: '13px',
                  display: 'flex', alignItems: 'center', gap: '4px',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                ✎ <span style={{ fontSize: '11px' }}>Edit</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}