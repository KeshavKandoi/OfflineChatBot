import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ARCHITECTURE_NODES } from "../data/architectureNodes.js";
import "./ArchitectureMap.css";

const CONNECTIONS = [
  ["electron", "react"],
  ["electron", "ollama"],
  ["electron", "fastapi"],
  ["react", "fastapi"],
  ["fastapi", "ollama"],
  ["fastapi", "sqlite"],
  ["fastapi", "chromadb"],
  ["fastapi", "langchain"],
  ["langchain", "chromadb"],
  ["langchain", "ollama"],
];

function findNode(id) {
  return ARCHITECTURE_NODES.find((n) => n.id === id);
}

export default function ArchitectureMap() {
  const [activeId, setActiveId] = useState(null);
  const activeNode = activeId ? findNode(activeId) : null;

  return (
    <section className="nx-arch" id="architecture">
      <div className="nx-pipeline-header">
        <span className="nx-section-eyebrow">System Map</span>
        <h2 className="nx-section-title">Every component, one machine</h2>
        <p className="nx-section-sub">
          Click any node to see its role and how it communicates with the
          rest of the system.
        </p>
      </div>

      <div className="nx-arch-canvas">
        <svg viewBox="0 0 100 100" className="nx-arch-lines" preserveAspectRatio="none" aria-hidden="true">
          {CONNECTIONS.map(([a, b]) => {
            const nodeA = findNode(a);
            const nodeB = findNode(b);
            const isActive = activeId === a || activeId === b;
            return (
              <line
                key={`${a}-${b}`}
                x1={nodeA.x}
                y1={nodeA.y}
                x2={nodeB.x}
                y2={nodeB.y}
                className={`nx-arch-line ${isActive ? "is-active" : ""}`}
              />
            );
          })}
        </svg>

        {ARCHITECTURE_NODES.map((node) => (
          <button
            key={node.id}
            className={`nx-arch-node ${activeId === node.id ? "is-active" : ""}`}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            onClick={() => setActiveId(activeId === node.id ? null : node.id)}
            aria-expanded={activeId === node.id}
          >
            <span className="nx-arch-node-dot">{node.icon}</span>
            <span className="nx-arch-node-label">{node.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {activeNode && (
          <motion.div
            className="nx-arch-panel"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="nx-arch-panel-head">
              <span className="nx-arch-panel-role">{activeNode.role}</span>
              <h3>{activeNode.label}</h3>
            </div>

            <div className="nx-arch-panel-section">
              <span className="nx-arch-panel-label">Description</span>
              <p>{activeNode.detail}</p>
            </div>

            <div className="nx-arch-panel-section">
              <span className="nx-arch-panel-label">Connects to</span>
              <div className="nx-arch-panel-chips">
                {activeNode.connectsTo.map((name) => (
                  <span key={name} className="nx-arch-panel-chip">{name}</span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
