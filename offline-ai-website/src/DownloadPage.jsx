export default function DownloadPage({ onBack }) {
  const cardStyle = {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    padding: '48px 36px',
    textAlign: 'left'
  };

  const btnStyle = {
    display: 'block',
    textAlign: 'center',
    padding: '14px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, var(--accent), #16a34a)',
    color: 'white',
    fontWeight: 600,
    fontSize: '14px',
    textDecoration: 'none',
    boxShadow: '0 0 30px rgba(34,197,94,0.35)'
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', color: 'var(--text)', fontFamily: "'DM Sans', sans-serif" }}>

      <div style={{ padding: '24px 6%', borderBottom: '1px solid var(--border)' }}>
        <div onClick={onBack} style={{ cursor: 'pointer', display: 'inline-block', fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '20px', background: 'linear-gradient(135deg, #4ade80, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          NexaChat
        </div>
      </div>

      <div style={{ padding: '100px 6% 120px' }}>

        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 80px' }}>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '20px' }}>
            Download NexaChat
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '16px', fontWeight: 300 }}>
            Free. No signup. No cloud. Works fully offline.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', maxWidth: '860px', margin: '0 auto' }}>

          <div style={cardStyle}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '10px' }}>macOS</h2>
            <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '28px' }}>Apple Silicon (M1/M2/M3/M4) - macOS 13+</p>
            <a href="https://github.com/KeshavKandoi/OfflineChatBot/releases/download/v1.0.1/Offline-AI-1.0.1-arm64.dmg" style={btnStyle}>Download for macOS</a>
            <div style={{ marginTop: '18px', fontSize: '12px', color: 'var(--faint)' }}>v1.0.1 - 586 MB</div>
          </div>

          <div style={cardStyle}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '10px' }}>Windows</h2>
            <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '28px' }}>Windows 10 and 11 - 64-bit</p>
            <a href="https://github.com/KeshavKandoi/OfflineChatBot/releases/download/v1.0.1/Offline.AI.Setup.1.0.1.exe" style={btnStyle}>Download for Windows</a>
            <div style={{ marginTop: '18px', fontSize: '12px', color: 'var(--faint)' }}>v1.0.1 - 320 MB</div>
          </div>

        </div>

        <p style={{ textAlign: 'center', marginTop: '64px', fontSize: '12px', color: 'var(--faint)', maxWidth: '440px', marginLeft: 'auto', marginRight: 'auto' }}>
          macOS may say the app is "damaged" on first launch, this just means it isn't notarized by Apple yet. Right-click the app in Applications, choose Open, then Open again, and it'll run fine.
        </p>

      </div>
    </div>
  );
}
