export default function ArchitecturePage({ onBack }) {
  return (
    <div style={{ minHeight: '100vh', padding: '80px 24px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
      <button
        onClick={onBack}
        className="btn-glass liquid-glass"
        style={{ marginBottom: '40px', cursor: 'pointer', border: 'none' }}
      >
        ← Back
      </button>
      <h2 className="sec-title">Architecture</h2>
      <p className="sec-sub">Detailed architecture breakdown coming soon.</p>
    </div>
  );
}
