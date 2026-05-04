import { useState, useRef, useEffect } from 'react'
import type { Message } from '../types'
import { streamChat, uploadFile } from '../api'
import MessageBubble from './MessageBubble'
import FileUpload from './FileUpload'

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
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)

  function toggleVoice() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) { alert('Voice input not supported in this browser'); return }
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript
      setInput(prev => prev ? prev + ' ' + transcript : transcript)
    }
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)
    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }

  useEffect(() => {
    setMessages(initialMessages)
    setStreamingText('')
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
    setStreaming(false)
    setStreamingText('')
  }

  function handleEdit(id: number, newContent: string) {
    // Update the message content
    setMessages(prev => {
      const updated = prev.map(m => m.id === id ? { ...m, content: newContent } : m)
      // Remove all messages after the edited message
      const idx = updated.findIndex(m => m.id === id)
      return updated.slice(0, idx + 1)
    })
    // Resend to AI
    if (sessionId) {
      setStreaming(true)
      setStreamingText('')
      let fullText = ''
      streamChat(
        newContent,
        sessionId,
        (chunk) => { fullText += chunk; setStreamingText(fullText) },
        () => {
          setMessages(msgs => [...msgs, {
            id: Date.now() + 1,
            session_id: sessionId,
            role: 'assistant',
            content: fullText,
            created_at: new Date().toISOString()
          }])
          setStreamingText('')
          setStreaming(false)
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
        uploadedFilename = attachedFile.name  // capture filename before clearing state
      } catch {
        setUploadStatus('✗ Failed')
        return
      }
    }

    // Encode file info into message so bubble can render it
    const displayContent = attachedFile
      ? `[File: ${attachedFile.name} | ${attachedPreview ?? 'none'}]${input.trim() ? '\n' + input.trim() : ''}`
      : input.trim()

    // Build message text — include filename so context is clear
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

    // Auto-title on first message (check BEFORE adding to messages)
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

    let fullText = ''
    await streamChat(
      fileUploaded ? ragText : input.trim(),
      sessionId,
      (chunk) => { fullText += chunk; setStreamingText(fullText) },
      () => {
        setMessages(msgs => [...msgs, {
          id: Date.now() + 1,
          session_id: sessionId,
          role: 'assistant',
          content: fullText,
          created_at: new Date().toISOString()
        }])
        setStreamingText('')
        setStreaming(false)
      },
      fileUploaded,
      uploadedFilename,   // pass filename to API
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
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>

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
          <div style={{ textAlign: 'center', marginTop: '80px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>✦</div>
            <div style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>
              How can I help you today?
            </div>
          </div>
        )}

        {messages.map(msg => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            onEdit={handleEdit}
          />
        ))}

        {/* Streaming bubble */}
        {streamingText && (
          <div style={{
            display: 'flex', justifyContent: 'flex-start',
            marginBottom: '16px', alignItems: 'flex-end', gap: '10px'
          }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: 'var(--accent-dim)', border: '1px solid var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', flexShrink: 0
            }}>AI</div>
            <div style={{
              maxWidth: '72%', padding: '12px 16px',
              borderRadius: '18px 18px 18px 4px',
              background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
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
      <div style={{
        padding: '12px 32px 24px',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-secondary)'
      }}>

        {/* Attached file preview above input */}
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

        {/* Input row */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
              : 'Type a message.'}
            rows={1}
            style={{
              flex: 1, padding: '12px 16px', borderRadius: '12px',
              background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
              color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
              fontFamily: 'DM Sans, sans-serif', transition: 'border-color 0.15s',
              resize: 'none', overflow: 'hidden', lineHeight: '1.5',
              minHeight: '46px', maxHeight: '160px'
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />

          <button
            onClick={toggleVoice}
            title={isListening ? 'Stop listening' : 'Voice input'}
            style={{
              padding: '12px', borderRadius: '12px', border: 'none',
              background: isListening ? 'var(--accent)' : 'var(--bg-tertiary)',
              color: isListening ? '#fff' : 'var(--text-muted)',
              fontSize: '18px', cursor: 'pointer', transition: 'all 0.15s',
              animation: isListening ? 'pulse 1s infinite' : 'none'
            }}
          >🎤</button>
          {streaming ? (
            <button
              onClick={stopStreaming}
              style={{
                padding: '12px 20px', borderRadius: '12px', border: 'none',
                background: 'var(--danger, #ef4444)', color: '#fff',
                fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                transition: 'all 0.15s', whiteSpace: 'nowrap'
              }}
            >
              ⏹ Stop
            </button>
          ) : (
            <button
              onClick={send}
              disabled={!input.trim() && !attachedFile}
              style={{
                padding: '12px 20px', borderRadius: '12px', border: 'none',
                background: (!input.trim() && !attachedFile)
                  ? 'var(--bg-tertiary)' : 'var(--accent)',
                color: (!input.trim() && !attachedFile)
                  ? 'var(--text-muted)' : '#fff',
                fontSize: '14px', fontWeight: 500,
                cursor: (!input.trim() && !attachedFile) ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s', whiteSpace: 'nowrap'
              }}
            >
              Send →
            </button>
          )}
        </div>
      </div>

      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  )
}