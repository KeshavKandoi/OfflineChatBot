import { useState } from 'react'

interface Props {
  onLogin: (user: { id: number; name: string; username: string; email: string }) => void
}

export default function Login({ onLogin }: Props) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (mode === 'login') {
      if (!email || !password) {
        setError('Please fill in all fields')
        return
      }
    } else {
      if (!name || !username || !email || !password) {
        setError('Please fill in all fields')
        return
      }
    }

    setLoading(true)
    setError('')

    try {
      const url = `http://127.0.0.1:8000/auth/${mode}`
      const body = mode === 'signup'
        ? { name, username, email, password }
        : { email, password }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        localStorage.setItem('user', JSON.stringify(data.user))
        onLogin(data.user)
      }
    } catch {
      setError('Connection error. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      fontFamily: 'DM Sans, sans-serif'
    }}>
      <div style={{
        width: '380px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Icon + Title */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🧠</div>
          <h1 style={{
            fontSize: '22px', fontWeight: 700,
            color: 'var(--text-primary)', margin: 0
          }}>
            Offline AI
          </h1>
          <p style={{
            fontSize: '13px', color: 'var(--text-muted)',
            marginTop: '6px'
          }}>
            {mode === 'login' ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>

        {/* Mode toggle */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-tertiary)',
          borderRadius: '10px',
          padding: '4px'
        }}>
          {(['login', 'signup'] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError('') }}
              style={{
                flex: 1, padding: '8px',
                borderRadius: '8px', border: 'none',
                background: mode === m ? 'var(--accent)' : 'transparent',
                color: mode === m ? '#fff' : 'var(--text-muted)',
                fontSize: '13px', fontWeight: 500,
                cursor: 'pointer', transition: 'all 0.15s',
                textTransform: 'capitalize'
              }}
            >
              {m === 'login' ? 'Login' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Signup only fields */}
          {mode === 'signup' && (
            <>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Full name"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Username"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </>
          )}

          {/* Email — shown in both login and signup */}
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email address"
            type="email"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />

          {/* Password */}
          <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '10px 14px',
            background: 'rgba(255,59,48,0.1)',
            border: '1px solid rgba(255,59,48,0.3)',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#ff3b30'
          }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            padding: '12px',
            borderRadius: '12px',
            border: 'none',
            background: loading ? 'var(--bg-tertiary)' : 'var(--accent)',
            color: loading ? 'var(--text-muted)' : '#fff',
            fontSize: '15px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s'
          }}
        >
          {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
        </button>

        {/* Privacy note */}
        <div style={{
          textAlign: 'center',
          fontSize: '12px',
          color: 'var(--text-muted)'
        }}>
          🔒 Your data never leaves your device
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '12px 16px',
  borderRadius: '10px',
  background: 'var(--bg-tertiary)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
  fontSize: '14px',
  outline: 'none',
  fontFamily: 'DM Sans, sans-serif',
  transition: 'border-color 0.15s',
  width: '100%',
  boxSizing: 'border-box' as const
}