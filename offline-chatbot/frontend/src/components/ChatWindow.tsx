import { useState, useRef, useEffect } from 'react'
import type { Message } from '../types'
import { streamChat, uploadFile } from '../api'
import MessageBubble from './MessageBubble'
import FileUpload from './FileUpload'
import HeroPromptInput from './HeroPromptInput'
import { Mic } from 'lucide-react'

interface Props {
  sessionId: string | null
  initialMessages: Message[]
  onAutoTitle?: (sessionId: string, firstMessage: string) => void
  onCreateSession?: () => Promise<string>
  userMemory?: string
}

export default function ChatWindow({ sessionId, initialMessages, onAutoTitle, onCreateSession, userMemory = '' }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const [attachedPreview, setAttachedPreview] = useState<string | null>(null)
  const [uploadStatus, setUploadStatus] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const recognitionRef = useRef<any>(null)
  const micBaseValueRef = useRef('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const userScrolled = useRef(false)
  const abortRef = useRef<(() => void) | null>(null)
  const creatingSessionRef = useRef(false)
  const skipNextResetRef = useRef(false)

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: any) => {
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          final += transcript
        } else {
          interim += transcript
        }
      }
      if (final) {
        micBaseValueRef.current = (micBaseValueRef.current + ' ' + final).trim()
      }
      setInput((micBaseValueRef.current + ' ' + interim).trim())
    }

    recognition.onerror = () => setIsRecording(false)
    recognition.onend = () => setIsRecording(false)

    recognitionRef.current = recognition
    return () => recognition.stop()
  }, [])

  function toggleRecording() {
    if (!recognitionRef.current) {
      alert("Voice input isn't supported in this browser.")
      return
    }
    if (isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
    } else {
      micBaseValueRef.current = input
      try {
        recognitionRef.current.start()
        setIsRecording(true)
      } catch {
        setIsRecording(false)
      }
    }
  }

  const queueRef = useRef('')
  const finalizeRef = useRef<(() => void) | null>(null)
  const stoppedRef = useRef(false)

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
    if (skipNextResetRef.current) {
      skipNextResetRef.current = false
      return
    }
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
    stoppedRef.current = true
    if (abortRef.current) {
      abortRef.current()
      abortRef.current = null
    }
    queueRef.current = ''
    finalizeRef.current = null
    setStreaming(false)
    setStreamingText(current => {
      if (current.trim() && sessionId) {
        setMessages(msgs => [...msgs, {
          id: Date.now() + 1,
          session_id: sessionId,
          role: 'assistant',
          content: current,
          created_at: new Date().toISOString()
        }])
      }
      return ''
    })
  }

  function handleEdit(id: number, newContent: string) {
    setMessages(prev => {
      const updated = prev.map(m => m.id === id ? { ...m, content: newContent } : m)
      const idx = updated.findIndex(m => m.id === id)
      return updated.slice(0, idx + 1)
    })
    if (sessionId) {
      stoppedRef.current = false
      setStreaming(true)
      setStreamingText('')
      queueRef.current = ''
      finalizeRef.current = null
      let fullText = ''
      abortRef.current = streamChat(
        newContent,
        sessionId,
        (chunk) => { fullText += chunk; queueRef.current += chunk },
        (aborted) => {
          if (stoppedRef.current || aborted) return
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
    if ((!input.trim() && !attachedFile) || streaming || creatingSessionRef.current) return

    const needsNewSession = !sessionId
    let sidPromise: Promise<string | null> = Promise.resolve(sessionId)
    if (needsNewSession) {
      if (!onCreateSession) return
      creatingSessionRef.current = true
      skipNextResetRef.current = true
      sidPromise = onCreateSession()
        .then(id => id)
        .finally(() => { creatingSessionRef.current = false })
    }

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
      session_id: sessionId || 'pending',
      role: 'user',
      content: displayContent,
      created_at: new Date().toISOString()
    }

    const shouldAutoTitle = messages.filter(m => m.role === 'user').length <= 1
    userScrolled.current = false
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setAttachedFile(null)
    setAttachedPreview(null)
    setUploadStatus('')
    setStreaming(true)
    setStreamingText('')
    queueRef.current = ''
    finalizeRef.current = null

    const sid = await sidPromise
    if (!sid) { setStreaming(false); return }

    if (shouldAutoTitle && onAutoTitle) {
      onAutoTitle(sid, input.trim() || uploadedFilename)
    }

    stoppedRef.current = false
    let fullText = ''
    abortRef.current = streamChat(
      fileUploaded ? ragText : input.trim(),
      sid,
      (chunk) => { fullText += chunk; queueRef.current += chunk },
      (aborted) => {
        if (stoppedRef.current || aborted) return
        finalizeRef.current = () => {
          setMessages(msgs => [...msgs, {
            id: Date.now() + 1,
            session_id: sid!,
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
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
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

        {streaming && !streamingText && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '5px', padding: '4px 0' }}>
              <span className="nx-thinking-dot" style={{ animationDelay: '0s' }} />
              <span className="nx-thinking-dot" style={{ animationDelay: '0.15s' }} />
              <span className="nx-thinking-dot" style={{ animationDelay: '0.3s' }} />
            </div>
          </div>
        )}

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
      </div>

      {/* Input area */}
      {(messages.length > 0 || streamingText) && (
      <div style={{
        padding: '12px 32px 24px',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-secondary)'
      }}>
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
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
          <button
            type="button"
            onClick={toggleRecording}
            aria-label={isRecording ? 'Stop recording' : 'Voice input'}
            style={{
              width: '32px', height: '32px', borderRadius: '50%', border: 'none',
              background: 'transparent',
              color: isRecording ? '#ef4444' : 'var(--text-muted)',
              flexShrink: 0, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: isRecording ? 'nxMicPulseChat 1.2s ease-in-out infinite' : undefined
            }}
          >
            <Mic size={17} />
          </button>
          <style>{`
            @keyframes nxMicPulseChat {
              0% { opacity: 1; }
              50% { opacity: 0.4; }
              100% { opacity: 1; }
            }
          `}</style>
          <textarea
            value={input}
            onChange={e => {
              setInput(e.target.value)
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
            }}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && !streaming && (e.preventDefault(), send())}
            placeholder={isRecording
              ? 'Listening...'
              : attachedFile
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
      </div>
      )}
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .nx-thinking-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--text-muted);
          animation: nx-thinking-bounce 1.1s infinite ease-in-out;
        }
        @keyframes nx-thinking-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
