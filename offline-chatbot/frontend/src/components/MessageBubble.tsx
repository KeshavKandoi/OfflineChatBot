import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
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

  function CodeBlock({ language, code }: { language: string; code: string }) {
    const [codeCopied, setCodeCopied] = useState(false)
    function copyCode() {
      navigator.clipboard.writeText(code)
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2000)
    }
    return (
      <div style={{
        borderRadius: '10px', overflow: 'hidden',
        margin: '12px 0', border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '8px 14px', background: '#1a1a2e',
          borderBottom: '1px solid rgba(255,255,255,0.08)'
        }}>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
            {language || 'code'}
          </span>
          <button onClick={copyCode} style={{
            padding: '3px 10px', borderRadius: '6px',
            background: codeCopied ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: codeCopied ? '#4ade80' : 'rgba(255,255,255,0.6)',
            fontSize: '11px', cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s'
          }}>
            {codeCopied ? '✓ Copied' : '⧉ Copy'}
          </button>
        </div>
        <SyntaxHighlighter
          style={oneDark}
          language={language || 'text'}
          PreTag="div"
          customStyle={{
            margin: 0, borderRadius: 0, fontSize: '13px',
            lineHeight: '1.6', padding: '16px', background: '#0d0d1a',
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '16px', alignItems: 'flex-end', gap: '10px'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {!isUser && (
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%',
          background: 'var(--accent-dim)', border: '1px solid var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', flexShrink: 0
        }}>AI</div>
      )}

      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        gap: '4px', maxWidth: '72%', minWidth: 0, width: '100%'
      }}>

        {fileName && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: isUser ? 'rgba(124,106,247,0.15)' : 'var(--bg-tertiary)',
            border: `1px solid ${isUser ? 'rgba(124,106,247,0.4)' : 'var(--border)'}`,
            borderRadius: '14px 14px 14px 4px',
            padding: '10px 14px', minWidth: '200px', maxWidth: '320px'
          }}>
            {filePreview && filePreview.startsWith('data:image') ? (
              <img src={filePreview} alt={fileName} style={{
                width: '44px', height: '44px', borderRadius: '8px',
                objectFit: 'cover', flexShrink: 0
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

        {editing ? (
          <div style={{ width: '100%' }}>
            <textarea
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              autoFocus rows={3}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '12px',
                background: 'var(--bg-tertiary)', border: '1px solid var(--accent)',
                color: 'var(--text-primary)', fontSize: '14px', lineHeight: '1.7',
                outline: 'none', resize: 'vertical', fontFamily: 'DM Sans, sans-serif'
              }}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px', justifyContent: 'flex-end' }}>
              <button onClick={() => setEditing(false)} style={{
                padding: '6px 14px', borderRadius: '8px',
                background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer'
              }}>Cancel</button>
              <button onClick={saveEdit} style={{
                padding: '6px 14px', borderRadius: '8px',
                background: 'var(--accent)', border: 'none',
                color: '#fff', fontSize: '12px', cursor: 'pointer', fontWeight: 500
              }}>Save</button>
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
              color: 'var(--text-primary)',
              wordBreak: 'break-word', overflowWrap: 'break-word',
              minWidth: 0, width: '100%',
            }}>
              {isUser ? (
                <span style={{ whiteSpace: 'pre-wrap' }}>{textContent}</span>
              ) : (
                <ReactMarkdown
                  components={{
                    code({ className, children }) {
                      const match = /language-(\w+)/.exec(className || '')
                      const codeStr = String(children).replace(/\n$/, '')
                      if (codeStr.includes('\n') || match) {
                        return <CodeBlock language={match ? match[1] : ''} code={codeStr} />
                      }
                      return (
                        <code style={{
                          background: 'rgba(124,106,247,0.15)',
                          border: '1px solid rgba(124,106,247,0.25)',
                          borderRadius: '4px', padding: '1px 6px',
                          fontSize: '13px', fontFamily: 'monospace', color: '#a78bfa'
                        }}>{children}</code>
                      )
                    },
                    h1: ({ children }) => <h1 style={{ fontSize: '20px', fontWeight: 700, margin: '16px 0 8px' }}>{children}</h1>,
                    h2: ({ children }) => <h2 style={{ fontSize: '17px', fontWeight: 600, margin: '14px 0 6px' }}>{children}</h2>,
                    h3: ({ children }) => <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '12px 0 4px' }}>{children}</h3>,
                    p: ({ children }) => <p style={{ margin: '6px 0', lineHeight: '1.7', wordBreak: 'break-word' }}>{children}</p>,
                    ul: ({ children }) => <ul style={{ paddingLeft: '20px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>{children}</ul>,
                    ol: ({ children }) => <ol style={{ paddingLeft: '20px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>{children}</ol>,
                    li: ({ children }) => <li style={{ lineHeight: '1.6' }}>{children}</li>,
                    strong: ({ children }) => <strong style={{ fontWeight: 600 }}>{children}</strong>,
                    em: ({ children }) => <em style={{ color: 'rgba(240,240,248,0.75)' }}>{children}</em>,
                    blockquote: ({ children }) => (
                      <blockquote style={{
                        borderLeft: '3px solid var(--accent)', paddingLeft: '12px',
                        margin: '10px 0', color: 'rgba(240,240,248,0.6)', fontStyle: 'italic'
                      }}>{children}</blockquote>
                    ),
                    hr: () => <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '12px 0' }} />,
                  }}
                >
                  {textContent}
                </ReactMarkdown>
              )}
            </div>
          )
        )}

        {!editing && hovered && (
          <div style={{
            display: 'flex', gap: '4px', marginTop: '2px',
            justifyContent: isUser ? 'flex-end' : 'flex-start'
          }}>
            <button onClick={handleCopy} style={{
              padding: '5px 8px', borderRadius: '7px',
              background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
              color: copied ? 'var(--success)' : 'var(--text-secondary)',
              cursor: 'pointer', fontSize: '13px',
              display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.15s'
            }}>
              {copied ? '✓' : '⧉'} <span style={{ fontSize: '11px' }}>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            {isUser && onEdit && (
              <button onClick={startEdit} style={{
                padding: '5px 8px', borderRadius: '7px',
                background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px',
                display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.15s'
              }}>
                ✎ <span style={{ fontSize: '11px' }}>Edit</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}