import { useState } from "react";
import "./Memory.css";

const MEMORY_STAGES = [
  {
    id: "capture",
    label: "Conversation Capture",
    detail: "Every user and assistant message is saved to SQLite immediately after being sent, giving you a durable, searchable chat history per session.",
  },
  {
    id: "embed",
    label: "Long-Term Embedding",
    detail: "In parallel, long_memory.py embeds each message using a local sentence-transformer model, turning it into a vector that captures its meaning.",
  },
  {
    id: "store",
    label: "Vector Storage",
    detail: "These embeddings are stored in ChromaDB, separate from the raw chat log, indexed for fast similarity search across all your past conversations.",
  },
  {
    id: "recall",
    label: "Semantic Recall",
    detail: "When you send a new message, it's embedded the same way and compared against stored memory vectors to find genuinely relevant past context — not just the last few messages.",
  },
  {
    id: "reuse",
    label: "Context Reuse",
    detail: "Retrieved memories are woven into the model's context alongside your current message, so it can reference things you discussed sessions ago.",
  },
];

export default function Memory() {
  const [activeId, setActiveId] = useState(MEMORY_STAGES[0].id);

  return (
    <div className="nx-memory">
      <div className="nx-pipeline-header">
        <span className="nx-section-eyebrow">Local Memory</span>
        <h1 className="nx-section-title">Conversations that persist</h1>
        <p className="nx-section-sub">
          NexaChat remembers what you've discussed by embedding and storing
          conversations locally, then recalling relevant context automatically.
        </p>
      </div>

      <div className="nx-memory-timeline">
        {MEMORY_STAGES.map((stage, i) => (
          <button
            key={stage.id}
            className={`nx-memory-node ${activeId === stage.id ? "is-active" : ""}`}
            onClick={() => setActiveId(stage.id)}
          >
            <span className="nx-memory-node-dot" />
            <div className="nx-memory-node-text">
              <span className="nx-memory-node-index">{String(i + 1).padStart(2, "0")}</span>
              <span className="nx-memory-node-label">{stage.label}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="nx-memory-detail">
        <p>{MEMORY_STAGES.find((s) => s.id === activeId).detail}</p>
      </div>
    </div>
  );
}
