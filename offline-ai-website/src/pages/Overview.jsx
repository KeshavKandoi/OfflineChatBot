import { useState } from "react";
import ComputeCore from "../components/three/ComputeCore.jsx";
import TerminalBoot from "../components/TerminalBoot.jsx";
import PipelineSection from "../components/PipelineSection.jsx";

import "./Overview.css";

export default function Overview() {
  const [, setBooted] = useState(false);

  return (
    <>
    <section className="nx-hero">
      <div className="nx-hero-copy">
        <span className="nx-hero-eyebrow">
          <span className="nx-hero-eyebrow-dot" />
          Offline-first · No account · No cloud
        </span>

        <h1 className="nx-hero-title">
          Runs AI.<br />
          <em>Not the cloud.</em>
        </h1>

        <p className="nx-hero-sub">
          NexaChat runs local language and vision models on your own machine
          through Ollama, retrieves your documents with local RAG powered by
          ChromaDB, and remembers past conversations with on-device semantic
          memory. Nothing leaves your machine unless you choose to enable
          online mode.
        </p>

        <div className="nx-hero-actions">
          <a href="https://github.com/KeshavKandoi/OfflineChatBot" className="nx-btn-primary" target="_blank" rel="noreferrer">View Source</a>
        </div>

        <div className="nx-hero-stats">
          <div className="nx-hero-stat">
            <span className="nx-hero-stat-value">3</span>
            <span className="nx-hero-stat-label">Local models</span>
          </div>
          <div className="nx-hero-stat-divider" />
          <div className="nx-hero-stat">
            <span className="nx-hero-stat-value">0</span>
            <span className="nx-hero-stat-label">Bytes sent to cloud</span>
          </div>
          <div className="nx-hero-stat-divider" />
          <div className="nx-hero-stat">
            <span className="nx-hero-stat-value">MIT</span>
            <span className="nx-hero-stat-label">Open source license</span>
          </div>
        </div>
      </div>

      <div className="nx-hero-visual">
        <ComputeCore />
        <TerminalBoot onComplete={() => setBooted(true)} />
      </div>
    </section>

    <PipelineSection />

    </>
  );
}
