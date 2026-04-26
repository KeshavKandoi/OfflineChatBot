import { useState, useRef, useEffect } from 'react'
import type  { Message } from '../types'
import { streamChat } from '../api'
import MessageBubble from './MessageBubble'
import FileUpload from './FileUpload'

interface Props {
  sessionId: string | null
  initialMessages: Message[]
}

export default function ChatWindow({ sessionId, initialMessages }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages(initialMessages)
    setStreamingText('')
  }, [sessionId, initialMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  async function send() {
    if (!input.trim() || !sessionId || streaming) return
    const userMsg: Message = {
      id: Date.now(), session_id: sessionId,
      role: 'user', content: input, created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMsg])
    const text = input
    setInput('')
    setStreaming(true)
    setStreamingText('')
  
    let fullText = ''
  
    await streamChat(
      text, sessionId,
      (chunk) => {
        fullText += chunk
        setStreamingText(fullText)
      },
      () => {
        setMessages(msgs => [...msgs, {
          id: Date.now() + 1, session_id: sessionId,
          role: 'assistant', content: fullText, created_at: new Date().toISOString()
        }])
        setStreamingText('')
        setStreaming(false)
      }
    )
  }

  if (!sessionId) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
      <div style={{ fontSize: '32px' }}>💬</div>
      <div style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Select a chat or start a new one</div>
    </div>
  )

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
        {messages.length === 0 && !streamingText && (
          <div style={{ textAlign: 'center', marginTop: '80px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>✦</div>
            <div style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>How can I help you today?</div>
          </div>
        )}
        {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
        {streamingText && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: 'var(--accent-dim)', border: '1px solid var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', marginRight: '10px', flexShrink: 0, marginTop: '2px'
            }}>AI</div>
            <div style={{
              maxWidth: '72%', padding: '12px 16px',
              borderRadius: '18px 18px 18px 4px',
              background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
              fontSize: '14px', lineHeight: '1.7', whiteSpace: 'pre-wrap', color: 'var(--text-primary)'
            }}>
              {streamingText}
              <span style={{ display: 'inline-block', width: '2px', height: '14px', background: 'var(--accent)', marginLeft: '2px', animation: 'blink 1s infinite' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '16px 32px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <FileUpload />
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Type a message..."
            style={{
              flex: 1, padding: '12px 16px', borderRadius: '12px',
              background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
              color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
              fontFamily: 'DM Sans, sans-serif', transition: 'border-color 0.15s'
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <button onClick={send} disabled={streaming || !input.trim()} style={{
            padding: '12px 20px', borderRadius: '12px', border: 'none',
            background: streaming || !input.trim() ? 'var(--bg-tertiary)' : 'var(--accent)',
            color: streaming || !input.trim() ? 'var(--text-muted)' : '#fff',
            fontSize: '14px', fontWeight: 500, cursor: streaming ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s', whiteSpace: 'nowrap'
          }}>
            {streaming ? '...' : 'Send →'}
          </button>
        </div>
      </div>
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  )
}