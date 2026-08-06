import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PIPELINE_STEPS } from "../data/pipelineSteps.js";
import "./PipelineSection.css";

export default function PipelineSection() {
  const [activeId, setActiveId] = useState(PIPELINE_STEPS[0].id);
  const activeStep = PIPELINE_STEPS.find((s) => s.id === activeId);

  return (
    <section className="nx-pipeline" id="how-it-works">
      <div className="nx-pipeline-header">
        <span className="nx-section-eyebrow">How NexaChat Works</span>
        <h2 className="nx-section-title">One request, seven local steps</h2>
        <p className="nx-section-sub">
          Every message you send moves through this pipeline entirely on your
          machine. Select a stage to see what actually happens under the hood.
        </p>
      </div>

      <div className="nx-pipeline-track" role="tablist" aria-label="Request pipeline stages">
        {PIPELINE_STEPS.map((step, i) => (
          <button
            key={step.id}
            role="tab"
            aria-selected={activeId === step.id}
            className={`nx-pipeline-node ${activeId === step.id ? "is-active" : ""}`}
            onClick={() => setActiveId(step.id)}
          >
            <span className="nx-pipeline-node-index">{String(i + 1).padStart(2, "0")}</span>
            <span className="nx-pipeline-node-label">{step.label}</span>
            {i < PIPELINE_STEPS.length - 1 && <span className="nx-pipeline-connector" aria-hidden="true" />}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep.id}
          className="nx-pipeline-detail"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          <h3>{activeStep.label}</h3>
          <p className="nx-pipeline-detail-summary">{activeStep.summary}</p>
          <p className="nx-pipeline-detail-body">{activeStep.detail}</p>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
