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

        <div class="container">
        <h1>Introducing NexaChat</h1>
        </div>
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
