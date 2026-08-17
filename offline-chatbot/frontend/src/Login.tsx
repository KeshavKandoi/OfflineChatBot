import { useState } from 'react'

interface Props {
  onLogin: (user: { id: number; name: string; username: string; email: string }) => void
}

const FEATURES = [
  { title: 'Runs fully offline' },
  { title: 'Private by design' },
  { title: 'Persistent memory' },
]

export default function Login({ onLogin }: Props) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function switchMode(m: 'login' | 'signup') {
    setMode(m)
    setError('')
  }

  async function handleSubmit() {
    if (mode === 'login') {
      if (!email || !password) {
        setError('Please fill in all fields')
        return
      }
    } else {
      if (!name || !email || !password) {
        setError('Please fill in all fields')
        return
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters')
        return
      }
    }

    setLoading(true)
    setError('')

    try {
      const url = `http://127.0.0.1:8000/auth/${mode}`
      const body = mode === 'signup'
        ? { name, email, password }
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
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      fontFamily: 'DM Sans, sans-serif',
      padding: '40px 24px',
      boxSizing: 'border-box',
      overflowY: 'auto',
      animation: 'fadeIn 0.4s ease'
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      <div style={{
        width: '440px',
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '28px'
      }}>

        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: 'var(--accent)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', fontWeight: 700, color: '#fff',
            margin: '0 auto 18px'
          }}>
            N
          </div>
          <h1 style={{
            fontSize: '26px', fontWeight: 700,
            color: 'var(--text-primary)', margin: 0,
            letterSpacing: '-0.02em'
          }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p style={{
            fontSize: '14px', color: 'var(--text-muted)',
            marginTop: '8px'
          }}>
            {mode === 'login' ? 'Log in to continue to Nexachat' : 'Start using Nexachat in seconds'}
          </p>
        </div>

        <div style={{
          display: 'flex',
          background: 'var(--bg-tertiary)',
          borderRadius: '12px',
          padding: '4px',
          width: '100%'
        }}>
          {(['login', 'signup'] as const).map(m => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              style={{
                flex: 1, padding: '9px',
                borderRadius: '9px', border: 'none',
                background: mode === m ? 'var(--accent)' : 'transparent',
                color: mode === m ? '#fff' : 'var(--text-muted)',
                fontSize: '13.5px', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.15s ease'
              }}
            >
              {m === 'login' ? 'Login' : 'Sign up'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>

          {mode === 'signup' && (
            <div>
              <label style={labelStyle}>Full name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Jane Doe"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
              />
            </div>
          )}

          <div>
            <label style={labelStyle}>Email address</label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@example.com"
              type="email"
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)' }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'At least 6 characters' : 'Enter your password'}
                type={showPassword ? 'text' : 'password'}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={{ ...inputStyle, paddingRight: '44px' }}
                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                style={{
                  position: 'absolute', right: '10px', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', color: 'var(--text-muted)',
                  fontSize: '12px', cursor: 'pointer', padding: '4px 6px'
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div style={{
            width: '100%',
            padding: '10px 14px',
            background: 'rgba(255,59,48,0.1)',
            border: '1px solid rgba(255,59,48,0.3)',
            borderRadius: '10px',
            fontSize: '13px',
            color: '#ff3b30',
            boxSizing: 'border-box'
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%',
            padding: '13px',
            borderRadius: '12px',
            border: 'none',
            background: loading ? 'var(--bg-tertiary)' : 'var(--accent)',
            color: loading ? 'var(--text-muted)' : '#fff',
            fontSize: '15px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}
        </button>

        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: '18px',
          flexWrap: 'wrap'
        }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '12px', color: 'var(--text-muted)'
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="3">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              {f.title}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12.5px',
  fontWeight: 500,
  color: 'var(--text-muted)',
  marginBottom: '6px'
}

const inputStyle: React.CSSProperties = {
  padding: '12px 14px',
  borderRadius: '10px',
  background: 'var(--bg-tertiary)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
  fontSize: '14px',
  outline: 'none',
  fontFamily: 'DM Sans, sans-serif',
  transition: 'border-color 0.15s, box-shadow 0.15s',
  width: '100%',
  boxSizing: 'border-box' as const
}
