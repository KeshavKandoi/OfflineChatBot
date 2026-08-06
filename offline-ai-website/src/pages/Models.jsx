import { useState } from "react";
import { MODELS } from "../data/models.js";
import "./Models.css";

export default function Models() {
  const [activeIndex, setActiveIndex] = useState(0);
  const model = MODELS[activeIndex];

  return (
    <div className="nx-models">
      <div className="nx-pipeline-header">
        <span className="nx-section-eyebrow">AI Models</span>
        <h1 className="nx-section-title">Three models, one machine</h1>
        <p className="nx-section-sub">
          NexaChat routes each request to the model best suited for it.
          Slide between them to see specs and tradeoffs.
        </p>
      </div>

      <div className="nx-model-slider">
        <input
          type="range"
          min={0}
          max={MODELS.length - 1}
          step={1}
          value={activeIndex}
          onChange={(e) => setActiveIndex(Number(e.target.value))}
          className="nx-model-range"
          aria-label="Select model"
        />
        <div className="nx-model-tabs">
          {MODELS.map((m, i) => (
            <button
              key={m.id}
              className={`nx-model-tab ${i === activeIndex ? "is-active" : ""}`}
              onClick={() => setActiveIndex(i)}
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>

      <div className="nx-model-detail">
        <div className="nx-model-detail-head">
          <h2>{model.name}</h2>
          <p>{model.tagline}</p>
        </div>

        <div className="nx-model-specs">
          <div>
            <span className="nx-model-spec-label">Parameters</span>
            <span className="nx-model-spec-value">{model.params}</span>
          </div>
          <div>
            <span className="nx-model-spec-label">RAM</span>
            <span className="nx-model-spec-value">{model.ram}</span>
          </div>
          <div>
            <span className="nx-model-spec-label">Context window</span>
            <span className="nx-model-spec-value">{model.context}</span>
          </div>
          <div>
            <span className="nx-model-spec-label">Inference speed</span>
            <span className="nx-model-spec-value">{model.speed}</span>
          </div>
        </div>

        <div className="nx-model-tasks">
          <span className="nx-model-spec-label">Supported tasks</span>
          <div className="nx-model-task-chips">
            {model.tasks.map((task) => (
              <span key={task} className="nx-model-task-chip">{task}</span>
            ))}
          </div>
        </div>

        <div className="nx-model-notes">
          <div>
            <span className="nx-model-spec-label">Strengths</span>
            <p>{model.strengths}</p>
          </div>
          <div>
            <span className="nx-model-spec-label">Limitations</span>
            <p>{model.limitations}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
