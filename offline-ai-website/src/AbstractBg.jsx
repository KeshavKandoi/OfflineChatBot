export default function AbstractBg() {
  return (
    <svg
      viewBox="0 0 1200 700"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      <defs>
        <radialGradient id="shapeShade" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#26262e" />
          <stop offset="55%" stopColor="#17171d" />
          <stop offset="100%" stopColor="#0a0a0d" />
        </radialGradient>
        <linearGradient id="lineFade" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.18)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <filter id="softShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="14" stdDeviation="18" floodColor="#000" floodOpacity="0.55" />
        </filter>
      </defs>

      <rect width="1200" height="700" fill="#0a0a0d" />

      <g filter="url(#softShadow)">
        <circle cx="820" cy="230" r="185" fill="url(#shapeShade)" />
        <rect x="560" y="470" width="150" height="380" rx="75" fill="url(#shapeShade)" transform="rotate(-45 635 470)" />
        <rect x="740" y="470" width="170" height="420" rx="85" fill="url(#shapeShade)" transform="rotate(-45 825 470)" />
        <rect x="960" y="470" width="150" height="360" rx="75" fill="url(#shapeShade)" transform="rotate(-45 1035 470)" />
      </g>

      <line x1="640" y1="20" x2="1180" y2="560" stroke="url(#lineFade)" strokeWidth="1.5" />
      <line x1="440" y1="700" x2="1000" y2="140" stroke="url(#lineFade)" strokeWidth="1.5" />
    </svg>
  );
}
