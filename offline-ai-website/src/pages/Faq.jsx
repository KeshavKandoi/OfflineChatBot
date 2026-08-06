import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Faq.css";

const FAQ_ITEMS = [
  {
    q: "Do I need Ollama installed separately?",
    a: "No. NexaChat bundles its own Ollama binary and downloads the required models automatically the first time you launch the app.",
  },
  {
    q: "What hardware do I need?",
    a: "An Apple Silicon Mac with 16GB or more of unified memory is recommended for smooth performance. Windows is supported via the .exe installer on 64-bit systems with a comparable amount of RAM.",
  },
  {
    q: "Is an internet connection required?",
    a: "No. Core chat, document analysis, and memory all run fully offline through local models. An optional Gemini API key can be added to enable online mode when you specifically want it.",
  },
  {
    q: "Where is my data stored?",
    a: "Chat history lives in a local SQLite file on your machine. Document content and conversation memory embeddings live in a local ChromaDB folder. Nothing is uploaded by default.",
  },
  {
    q: "What file types can I upload for document analysis?",
    a: "PDF, DOCX, and TXT files are currently supported. Uploaded files are processed and embedded entirely on-device.",
  },
  {
    q: "Can I use my own models instead of the bundled ones?",
    a: "The current release ships with qwen2.5, qwen2.5-coder, and MiniCPM-V. Swapping in other Ollama-compatible models requires editing ollama_client.py directly, since there's no in-app model picker yet.",
  },
  {
    q: "Is NexaChat free?",
    a: "Yes. It's free to download and use, and the full source is available on GitHub under the MIT license.",
  },
];

function FaqItem({ item, isOpen, onToggle, index }) {
  return (
    <div className="nx-faq-item">
      <button
        className="nx-faq-question"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`nx-faq-panel-${index}`}
        id={`nx-faq-trigger-${index}`}
      >
        <span>{item.q}</span>
        <span className={`nx-faq-icon ${isOpen ? "is-open" : ""}`} aria-hidden="true">+</span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`nx-faq-panel-${index}`}
            role="region"
            aria-labelledby={`nx-faq-trigger-${index}`}
            className="nx-faq-answer-wrap"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="nx-faq-answer">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="nx-faq">
      <div className="nx-pipeline-header">
        <span className="nx-section-eyebrow">FAQ</span>
        <h1 className="nx-section-title">Common questions</h1>
      </div>

      <div className="nx-faq-list">
        {FAQ_ITEMS.map((item, i) => (
          <FaqItem
            key={item.q}
            item={item}
            index={i}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
          />
        ))}
      </div>
    </div>
  );
}
