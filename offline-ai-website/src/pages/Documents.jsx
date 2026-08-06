import { useState } from "react";
import "./Documents.css";

const STAGES = [
  {
    id: "upload",
    label: "File Upload",
    detail: "You upload a PDF, DOCX, or TXT file through the chat interface. It's saved to a local uploads/ folder — never transmitted anywhere.",
  },
  {
    id: "extract",
    label: "Text Extraction",
    detail: "rag.py uses pypdf, python-docx, or plain text parsing depending on file type to pull raw text content out of the document.",
  },
  {
    id: "chunk",
    label: "Chunking",
    detail: "Extracted text is split into overlapping chunks sized to fit comfortably within the embedding model's context window, preserving semantic coherence.",
  },
  {
    id: "embed",
    label: "Embedding Generation",
    detail: "Each chunk is converted into a vector using a local sentence-transformers model, entirely on-device with no external API calls.",
  },
  {
    id: "index",
    label: "ChromaDB Indexing",
    detail: "Vectors are stored in a local ChromaDB collection alongside the source text, ready for fast similarity search.",
  },
  {
    id: "retrieve",
    label: "Semantic Retrieval",
    detail: "When you ask a question, your query is embedded the same way and ChromaDB returns the chunks most semantically similar to it.",
  },
  {
    id: "answer",
    label: "Grounded Answer",
    detail: "Retrieved chunks are inserted into the model's context so its response is grounded in your actual document content, not just general knowledge.",
  },
];

const FILE_TYPES = ["PDF", "DOCX", "TXT"];

export default function Documents() {
  const [activeId, setActiveId] = useState(STAGES[0].id);
  const active = STAGES.find((s) => s.id === activeId);

  return (
    <div className="nx-documents">
      <div className="nx-pipeline-header">
        <span className="nx-section-eyebrow">Document Intelligence</span>
        <h1 className="nx-section-title">Your files, understood locally</h1>
        <p className="nx-section-sub">
          Upload documents and NexaChat grounds its answers in their actual
          content — chunked, embedded, and indexed entirely on your machine.
        </p>
      </div>

      <div className="nx-doc-filetypes">
        {FILE_TYPES.map((type) => (
          <span key={type} className="nx-doc-filetype-chip">{type}</span>
        ))}
      </div>

      <div className="nx-doc-flow">
        {STAGES.map((stage, i) => (
          <div key={stage.id} className="nx-doc-flow-item">
            <button
              className={`nx-doc-flow-node ${activeId === stage.id ? "is-active" : ""}`}
              onClick={() => setActiveId(stage.id)}
            >
              <span className="nx-doc-flow-index">{i + 1}</span>
              <span className="nx-doc-flow-label">{stage.label}</span>
            </button>
            {i < STAGES.length - 1 && <span className="nx-doc-flow-arrow" aria-hidden="true">→</span>}
          </div>
        ))}
      </div>

      <div className="nx-doc-detail">
        <h3>{active.label}</h3>
        <p>{active.detail}</p>
      </div>
    </div>
  );
}
