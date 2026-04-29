import { useState, useEffect } from 'react'

export default function App() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ background: '#08080f', minHeight: '100vh', color: 'white', fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        nav a { color: rgba(240,240,248,0.6); text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.2s; }
        nav a:hover { color: #f0f0f8; }
        .glow-btn { transition: all 0.3s ease; }
        .glow-btn:hover { transform: translateY(-2px); box-shadow: 0 20px 60px rgba(124,58,237,0.4); }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 1; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        .fade-up-1 { animation: fadeUp 0.7s 0.1s ease both; }
        .fade-up-2 { animation: fadeUp 0.7s 0.2s ease both; }
        .fade-up-3 { animation: fadeUp 0.7s 0.3s ease both; }
        .fade-up-4 { animation: fadeUp 0.7s 0.4s ease both; }
        .fade-up-5 { animation: fadeUp 0.7s 0.5s ease both; }
        .shimmer-text {
          background: linear-gradient(90deg, #a78bfa, #f0abfc, #818cf8, #a78bfa);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
        .float { animation: float 4s ease-in-out infinite; }
        .grid-bg {
          background-image:
            linear-gradient(rgba(124,58,237,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124,58,237,0.05) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
      `}</style>

      {/* NAVBAR */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: '0 40px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: scrolled ? 'rgba(8,8,15,0.9)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px' }}>🧠</span>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '18px', letterSpacing: '-0.02em' }}>
            Offline AI
          </span>
        </div>

        <div style={{ display: 'flex', gap: '32px' }}>
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#download">Download</a>
        </div>

        <a
          href="#download"
          className="glow-btn"
          style={{
            padding: '10px 20px',
            background: 'rgba(124,58,237,0.2)',
            border: '1px solid rgba(124,58,237,0.4)',
            borderRadius: '10px',
            color: '#a78bfa',
            fontSize: '13px',
            fontWeight: 600,
            textDecoration: 'none'
          }}
        >
          Download for Mac
        </a>
      </nav>

      {/* HERO */}
      <section
        className="grid-bg"
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '120px 40px 80px',
          textAlign: 'center',
          overflow: 'hidden'
        }}
      >
        <div className="orb" style={{ width: 500, height: 500, background: 'rgba(124,58,237,0.15)', top: '10%', left: '20%' }} />
        <div className="orb" style={{ width: 400, height: 400, background: 'rgba(99,102,241,0.1)', bottom: '10%', right: '15%' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
          <div
            className="fade-up-1"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              background: 'rgba(124,58,237,0.15)',
              border: '1px solid rgba(124,58,237,0.3)',
              borderRadius: '100px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#a78bfa',
              marginBottom: '32px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#a78bfa',
                animation: 'pulse 2s infinite',
                display: 'inline-block'
              }}
            />
            100% Private · 100% Offline
          </div>

          <h1
            className="fade-up-2"
            style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: '72px',
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              marginBottom: '24px'
            }}
          >
            Your AI that never
            <br />
            <span className="shimmer-text">leaves your device</span>
          </h1>

          <p
            className="fade-up-3"
            style={{
              fontSize: '18px',
              color: 'rgba(240,240,248,0.55)',
              lineHeight: 1.7,
              maxWidth: '560px',
              margin: '0 auto 48px'
            }}
          >
            Offline AI is a fully local AI assistant with memory, document understanding,
            and multi-user support — no internet, no subscriptions, no data collection.
          </p>

          <div className="fade-up-4" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="#download"
              className="glow-btn"
              style={{
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                border: 'none',
                borderRadius: '14px',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              ⬇ Download for Mac
            </a>

            <a
              href="#features"
              style={{
                padding: '16px 32px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '14px',
                color: 'rgba(240,240,248,0.8)',
                fontSize: '15px',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
            >
              See features →
            </a>
          </div>

          <p className="fade-up-5" style={{ marginTop: '24px', fontSize: '13px', color: 'rgba(240,240,248,0.3)' }}>
            Free forever · No account required · macOS arm64
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: '120px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#a78bfa', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Features
          </div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '48px', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Everything you need,
            <br />
            nothing you don't
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {[
            { icon: '🔒', title: 'Fully Private', desc: 'Your conversations never leave your Mac. No cloud, no servers, no data collection. Ever.' },
            { icon: '🧠', title: 'Persistent Memory', desc: 'Remembers your name, preferences, and past conversations across all sessions.' },
            { icon: '📄', title: 'Document RAG', desc: 'Upload PDFs, Word docs, images and text files. Ask questions about your own documents.' },
            { icon: '👥', title: 'Multi-User', desc: 'Multiple accounts on one device. Each user has their own private chats and data.' },
            { icon: '⚡', title: 'Streaming Responses', desc: 'See responses as they generate in real time, just like ChatGPT — but completely offline.' },
            { icon: '🖼️', title: 'Vision Support', desc: 'Upload screenshots and images. The AI can see and analyze visual content.' }
          ].map((f, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                padding: '32px',
                transition: 'all 0.3s ease',
                cursor: 'default'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.borderColor = 'rgba(167,139,250,0.3)'
                e.currentTarget.style.transform = 'translateY(-4px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{ fontSize: '36px', marginBottom: '20px' }}>{f.icon}</div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>{f.title}</h3>
              <p style={{ fontSize: '14px', color: 'rgba(240,240,248,0.5)', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        style={{
          padding: '120px 40px',
          background: 'rgba(255,255,255,0.02)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#a78bfa', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>
              How it works
            </div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '48px', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Up and running in minutes
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '48px' }}>
            {[
              { n: '01', title: 'Download the app', desc: 'Download the .dmg file for Mac. Double click, drag to Applications. Done.' },
              { n: '02', title: 'First launch setup', desc: 'On first launch, the app downloads AI models automatically. Takes about 10 minutes.' },
              { n: '03', title: 'Start chatting', desc: 'Create your account, start a new chat, and talk to your private AI assistant.' }
            ].map((s, i) => (
              <div key={i}>
                <div
                  style={{
                    fontFamily: 'Syne, sans-serif',
                    fontSize: '72px',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(99,102,241,0.1))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    lineHeight: 1,
                    marginBottom: '8px'
                  }}
                >
                  {s.n}
                </div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 700, marginBottom: '12px' }}>{s.title}</h3>
                <p style={{ fontSize: '14px', color: 'rgba(240,240,248,0.5)', lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DOWNLOAD */}
      <section id="download" style={{ padding: '120px 40px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '56px', fontWeight: 800, marginBottom: '20px' }}>Download Offline AI</h2>
        <p style={{ fontSize: '17px', color: 'rgba(240,240,248,0.5)', maxWidth: '480px', margin: '0 auto 48px', lineHeight: 1.7 }}>
          Free forever. No account. No subscription. Your AI, your data, your device.
        </p>

        <a
          href="https://github.com/yourusername/offline-ai/releases/latest/download/Offline-AI-1.0.0-arm64.dmg"
          className="glow-btn"
          style={{
            padding: '18px 40px',
            background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
            border: 'none',
            borderRadius: '16px',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 700,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <span style={{ fontSize: '20px' }}>⬇</span>
          Download for Mac
          <span style={{ fontSize: '12px', fontWeight: 400, opacity: 0.7 }}>arm64 · 358 MB</span>
        </a>
      </section>
    </div>
  )
}