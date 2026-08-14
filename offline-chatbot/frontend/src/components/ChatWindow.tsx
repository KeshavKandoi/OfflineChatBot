import { useState, useRef, useEffect } from 'react'
import type { Message } from '../types'
import { streamChat, uploadFile } from '../api'
import MessageBubble from './MessageBubble'
import FileUpload from './FileUpload'
import HeroPromptInput from './HeroPromptInput'

interface Props {
  sessionId: string | null
  initialMessages: Message[]
  onAutoTitle?: (sessionId: string, firstMessage: string) => void
  userMemory?: string
}

export default function ChatWindow({ sessionId, initialMessages, onAutoTitle, userMemory = '' }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const [attachedPreview, setAttachedPreview] = useState<string | null>(null)
  const [uploadStatus, setUploadStatus] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const userScrolled = useRef(false)
  const abortRef = useRef<(() => void) | null>(null)

  // ── Typewriter reveal buffer ──
  // Raw chunks land here as fast as the network delivers them (bursty).
  // A steady ticker below drains a few characters at a time so the UI
  // always reads at a smooth, consistent pace regardless of burst size.
  const queueRef = useRef('')
  const finalizeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    let timer: number
    function tick() {
      if (queueRef.current.length > 0) {
        const take = queueRef.current.slice(0, 3)
        queueRef.current = queueRef.current.slice(3)
        setStreamingText(prev => prev + take)
      } else if (finalizeRef.current) {
        const fn = finalizeRef.current
        finalizeRef.current = null
        fn()
      }
      timer = window.setTimeout(tick, 18)
    }
    timer = window.setTimeout(tick, 18)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    setMessages(initialMessages)
    setStreamingText('')
    queueRef.current = ''
    finalizeRef.current = null
  }, [sessionId, initialMessages])

  useEffect(() => {
    if (!userScrolled.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, streamingText])

  function handleFileSelect(file: File | null, preview: string | null) {
    setAttachedFile(file)
    setAttachedPreview(preview)
    setUploadStatus('')
  }

  function removeAttachment() {
    setAttachedFile(null)
    setAttachedPreview(null)
    setUploadStatus('')
  }

  function stopStreaming() {
    if (abortRef.current) {
      abortRef.current()
      abortRef.current = null
    }
    queueRef.current = ''
    finalizeRef.current = null
    setStreaming(false)
    setStreamingText('')
  }

  function handleEdit(id: number, newContent: string) {
    setMessages(prev => {
      const updated = prev.map(m => m.id === id ? { ...m, content: newContent } : m)
      const idx = updated.findIndex(m => m.id === id)
      return updated.slice(0, idx + 1)
    })
    if (sessionId) {
      setStreaming(true)
      setStreamingText('')
      queueRef.current = ''
      finalizeRef.current = null
      let fullText = ''
      streamChat(
        newContent,
        sessionId,
        (chunk) => { fullText += chunk; queueRef.current += chunk },
        () => {
          finalizeRef.current = () => {
            setMessages(msgs => [...msgs, {
              id: Date.now() + 1,
              session_id: sessionId,
              role: 'assistant',
              content: fullText,
              created_at: new Date().toISOString()
            }])
            setStreamingText('')
            setStreaming(false)
          }
        },
        false,
        '',
        userMemory
      )
    }
  }

  async function send() {
    if ((!input.trim() && !attachedFile) || !sessionId || streaming) return

    let fileUploaded = false
    let uploadedFilename = ''

    if (attachedFile) {
      setUploadStatus('Uploading...')
      try {
        await uploadFile(attachedFile)
        setUploadStatus('✓')
        fileUploaded = true
        uploadedFilename = attachedFile.name
      } catch {
        setUploadStatus('✗ Failed')
        return
      }
    }

    const displayContent = attachedFile
      ? `[File: ${attachedFile.name} | ${attachedPreview ?? 'none'}]${input.trim() ? '\n' + input.trim() : ''}`
      : input.trim()

    const ragText = input.trim()
      ? `${input.trim()} [the user just uploaded this file: ${uploadedFilename}]`
      : `The user just uploaded a file called "${uploadedFilename}". Please analyze and explain its contents in detail.`

    const userMsg: Message = {
      id: Date.now(),
      session_id: sessionId,
      role: 'user',
      content: displayContent,
      created_at: new Date().toISOString()
    }

    const isFirstMessage = messages.length === 0
    userScrolled.current = false
    setMessages(prev => [...prev, userMsg])
    if (isFirstMessage && sessionId && onAutoTitle) {
      onAutoTitle(sessionId, input.trim() || uploadedFilename)
    }
    setInput('')
    setAttachedFile(null)
    setAttachedPreview(null)
    setUploadStatus('')
    setStreaming(true)
    setStreamingText('')
    queueRef.current = ''
    finalizeRef.current = null

    let fullText = ''
    await streamChat(
      fileUploaded ? ragText : input.trim(),
      sessionId,
      (chunk) => { fullText += chunk; queueRef.current += chunk },
      () => {
        finalizeRef.current = () => {
          setMessages(msgs => [...msgs, {
            id: Date.now() + 1,
            session_id: sessionId,
            role: 'assistant',
            content: fullText,
            created_at: new Date().toISOString()
          }])
          setStreamingText('')
          setStreaming(false)
        }
      },
      fileUploaded,
      uploadedFilename,
      userMemory
    )
  }

  if (!sessionId) return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexDirection: 'column', gap: '12px'
    }}>
      <div style={{ fontSize: '32px' }}>💬</div>
      <div style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
        Select a chat or start a new one
      </div>
    </div>
  )

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', height: '100vh',
      background: 'var(--bg-primary)'
    }}>
      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={(e) => {
          const el = e.currentTarget
          const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60
          userScrolled.current = !isAtBottom
        }}
        style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
        {messages.length === 0 && !streamingText && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', minHeight: '70vh', gap: '32px', padding: '0 24px'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Ask anything
            </div>
            <HeroPromptInput
              value={input}
              onChange={setInput}
              onSubmit={send}
              loading={streaming}
              placeholder="Ask Nexa"
            />
          </div>
        )}

        {messages.map(msg => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            onEdit={handleEdit}
          />
        ))}

        {streamingText && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}>
            <div style={{
              maxWidth: '100%', padding: '2px 0',
              fontSize: '14px', lineHeight: '1.7', whiteSpace: 'pre-wrap',
              color: 'var(--text-primary)'
            }}>
              {streamingText}
              <span style={{
                display: 'inline-block', width: '2px', height: '14px',
                background: 'var(--accent)', marginLeft: '2px',
                animation: 'blink 1s infinite'
              }} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      {(messages.length > 0 || streamingText) && (
      <div style={{
        padding: '12px 32px 24px',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-secondary)'
      }}>
        {attachedFile && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '8px 12px',
            marginBottom: '10px',
            maxWidth: '380px'
          }}>
            {attachedPreview ? (
              <img src={attachedPreview} alt="preview" style={{
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
                {attachedFile.name.endsWith('.pdf') ? '📄'
                  : attachedFile.name.endsWith('.docx') ? '📝' : '📃'}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
              }}>
                {attachedFile.name}
              </div>
              <div style={{
                fontSize: '11px', marginTop: '1px',
                color: uploadStatus.startsWith('✓') ? 'var(--success)'
                  : uploadStatus.startsWith('✗') ? 'var(--danger)'
                  : 'var(--text-muted)'
              }}>
                {uploadStatus || `${(attachedFile.size / 1024).toFixed(1)} KB`}
              </div>
            </div>
            <button
              onClick={removeAttachment}
              style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', flexShrink: 0, transition: 'all 0.15s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--danger)'
                e.currentTarget.style.color = 'var(--danger)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.color = 'var(--text-secondary)'
              }}
            >✕</button>
          </div>
        )}

        <div style={{
          display: 'flex', gap: '8px', alignItems: 'center',
          background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
          borderRadius: '999px', padding: '6px 6px 6px 18px'
        }}>
          <FileUpload onFileSelect={handleFileSelect} />
          <textarea
            value={input}
            onChange={e => {
              setInput(e.target.value)
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
            }}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
            placeholder={attachedFile
              ? 'Ask about this file or press Send...'
              : 'Ask Nexa'}
            rows={1}
            style={{
              flex: 1, padding: '10px 0', borderRadius: '0',
              background: 'transparent', border: 'none',
              color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
              fontFamily: 'DM Sans, sans-serif',
              resize: 'none', overflow: 'hidden', lineHeight: '1.5',
              minHeight: '24px', maxHeight: '160px'
            }}
          />
          {streaming ? (
            <button
              onClick={stopStreaming}
              style={{
                width: '38px', height: '38px', borderRadius: '50%', border: 'none',
                background: 'var(--danger, #ef4444)', color: '#fff', flexShrink: 0,
                fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s'
              }}
            >
              ⏹
            </button>
          ) : (
            <button
              onClick={send}
              disabled={!input.trim() && !attachedFile}
              style={{
                width: '38px', height: '38px', borderRadius: '50%', border: 'none',
                background: (!input.trim() && !attachedFile)
                  ? 'var(--bg-hover)' : 'var(--accent)',
                color: (!input.trim() && !attachedFile)
                  ? 'var(--text-muted)' : '#fff', flexShrink: 0,
                fontSize: '16px', fontWeight: 500,
                cursor: (!input.trim() && !attachedFile) ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s'
              }}
            >
              ↑
            </button>
          )}
        </div>
      </div>
      )}
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  )
}
