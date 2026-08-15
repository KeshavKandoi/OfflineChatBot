import { useState } from "react";
import { TECH_STACK } from "../data/techStack.js";
import MiniCore from "../components/three/MiniCore.jsx";
import "./Stack.css";

const RADIUS_PERCENT = 42;

function positionFor(angleDeg) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  const x = 50 + RADIUS_PERCENT * Math.cos(rad);
  const y = 50 + RADIUS_PERCENT * Math.sin(rad);
  return { left: `${x}%`, top: `${y}%` };
}

export default function Stack() {
  const [activeId, setActiveId] = useState(null);
  const active = TECH_STACK.find((t) => t.id === activeId);

  return (
    <div className="nx-stack">
      <div className="nx-pipeline-header">
        <span className="nx-section-eyebrow">Tech Stack</span>
        <h1 className="nx-section-title">Everything orbiting one core</h1>
        <p className="nx-section-sub">
          NexaChat is built from proven, independently-run technologies.
          Click any node to see why it's part of the stack.
        </p>
      </div>

      <div className="nx-orbit-wrap">
        <div className="nx-orbit-ring" />
        <div className="nx-orbit-center">
          <MiniCore />
          <span className="nx-orbit-center-label">NexaChat</span>
        </div>

        {TECH_STACK.map((tech) => (
          <button
            key={tech.id}
            className={`nx-orbit-node ${activeId === tech.id ? "is-active" : ""}`}
            style={positionFor(tech.angle)}
            onClick={() => setActiveId(activeId === tech.id ? null : tech.id)}
          >
            <span className="nx-orbit-node-dot">{tech.label.slice(0, 2).toUpperCase()}</span>
            <span className="nx-orbit-node-label">{tech.label}</span>
          </button>
        ))}
      </div>

      {active && (
        <div className="nx-stack-detail">
          <h3>{active.label}</h3>
          <p>{active.desc}</p>
        </div>
      )}
    </div>
  );
}
