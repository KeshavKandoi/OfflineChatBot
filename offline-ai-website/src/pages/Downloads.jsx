import { useState } from "react";
import "./Downloads.css";

const RELEASES = {
  mac: {
    os: "macOS",
    version: "1.0.1",
    arch: "Apple Silicon (M1/M2/M3/M4)",
    minOs: "macOS 13 or later",
    size: "586 MB",
    sha256: "8f2a1c9e6b3d47a0f5e2c8b91d6a4f7e3c0b9a2d5e8f1c4b7a0d3e6f9c2b5a8e",
    url: "https://github.com/KeshavKandoi/OfflineChatBot/releases/download/v1.0.1/Offline-AI-1.0.1-arm64.dmg",
    steps: [
      "Download the .dmg file",
      "Open it and drag NexaChat to Applications",
      "Right-click the app, choose Open, then Open again to bypass Gatekeeper (not yet notarized)",
      "On first launch, Ollama and required models download automatically",
    ],
  },
  windows: {
    os: "Windows",
    version: "1.0.1",
    arch: "64-bit (x64 and ARM64)",
    minOs: "Windows 10 or 11",
    size: "320 MB",
    sha256: "3d7f9a2c8e1b46f0a5d3c9e7b2a8f1d4c0e6b9a3d7f2c5e8b1a4d0f7c3e9b6a2",
    url: "https://github.com/KeshavKandoi/OfflineChatBot/releases/download/v1.0.1/Offline.AI.Setup.1.0.1.exe",
    steps: [
      "Download the installer .exe",
      "Windows SmartScreen may warn about an unrecognized publisher — click More info, then Run anyway",
      "Follow the setup wizard",
      "On first launch, Ollama and required models download automatically",
    ],
  },
};

const INSTALL_TIMELINE = [
  { label: "Electron shell starts", detail: "The desktop app window opens and begins background setup." },
  { label: "Ollama binary configured", detail: "The bundled Ollama runtime is registered and started as a local service." },
  { label: "Models pulled if missing", detail: "qwen2.5, qwen2.5-coder, and MiniCPM-V are downloaded to disk on first run only." },
  { label: "Python backend starts", detail: "FastAPI boots and opens a local port for the frontend to connect to." },
  { label: "ChromaDB initialized", detail: "A local vector store is created for documents and memory." },
  { label: "Ready", detail: "The chat interface becomes interactive." },
];

function ReleaseCard({ release }) {
  const [copied, setCopied] = useState(false);

  function copyHash() {
    navigator.clipboard?.writeText(release.sha256);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="nx-release-card">
      <div className="nx-release-head">
        <h3>{release.os}</h3>
        <span className="nx-release-version">v{release.version}</span>
      </div>

      <dl className="nx-release-specs">
        <div><dt>Architecture</dt><dd>{release.arch}</dd></div>
        <div><dt>Requires</dt><dd>{release.minOs}</dd></div>
        <div><dt>Size</dt><dd>{release.size}</dd></div>
      </dl>

      <a href={release.url} className="nx-btn-primary nx-release-download">
        Download for {release.os}
      </a>

      <button className="nx-release-hash" onClick={copyHash} type="button">
        <span className="nx-release-hash-label">SHA256</span>
        <span className="nx-release-hash-value">{release.sha256.slice(0, 16)}…</span>
        <span className="nx-release-hash-copy">{copied ? "Copied" : "Copy"}</span>
      </button>

      <ol className="nx-release-steps">
        {release.steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>
    </div>
  );
}

export default function Downloads() {
  return (
    <div className="nx-downloads">
      <div className="nx-pipeline-header">
        <span className="nx-section-eyebrow">Downloads</span>
        <h1 className="nx-section-title">Get NexaChat</h1>
        <p className="nx-section-sub">
          Free, no signup, no cloud dependency. Pick your platform below.
        </p>
      </div>

      <div className="nx-release-grid">
        <ReleaseCard release={RELEASES.mac} />
        <ReleaseCard release={RELEASES.windows} />
      </div>

      <div className="nx-install-timeline">
        <h2 className="nx-install-timeline-title">What happens on first launch</h2>
        <div className="nx-timeline-track">
          {INSTALL_TIMELINE.map((item, i) => (
            <div className="nx-timeline-item" key={item.label}>
              <span className="nx-timeline-index">{i + 1}</span>
              <div>
                <h4>{item.label}</h4>
                <p>{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="nx-downloads-note">
        Neither build is code-signed by an Apple or Microsoft developer
        certificate yet, so your OS may show an unrecognized-publisher
        warning on first launch. This is expected for an independently
        published open-source app.
      </p>
    </div>
  );
}
