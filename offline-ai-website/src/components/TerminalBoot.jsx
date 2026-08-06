import { useEffect, useRef, useState } from "react";
import useReducedMotion from "../hooks/useReducedMotion";
import "./TerminalBoot.css";

const BOOT_SEQUENCE = [
  { label: "Starting Ollama runtime", ok: "Ollama connected", delay: 420 },
  { label: "Loading qwen2.5:7b", ok: "Qwen2.5 loaded", delay: 640 },
  { label: "Loading MiniCPM-V vision model", ok: "MiniCPM-V ready", delay: 560 },
  { label: "Starting FastAPI server", ok: "FastAPI running on :8000", delay: 380 },
  { label: "Opening ChromaDB collection", ok: "ChromaDB indexed", delay: 460 },
  { label: "Restoring local memory store", ok: "Local memory initialized", delay: 400 },
  { label: "Building vector index", ok: "Vector store ready", delay: 480 },
  { label: "Checking network reachability", ok: "Offline mode enabled", delay: 360 },
];

export default function TerminalBoot({ onComplete }) {
  const [visibleLines, setVisibleLines] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const containerRef = useRef(null);
  const scrollRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    if (reducedMotion) {
      setVisibleLines(
        BOOT_SEQUENCE.map((step) => ({ label: step.label, ok: step.ok, done: true }))
      );
      setActiveIndex(BOOT_SEQUENCE.length);
      setFinished(true);
      onComplete?.();
      return;
    }

    let cancelled = false;

    async function run() {
      for (let i = 0; i < BOOT_SEQUENCE.length; i++) {
        if (cancelled) return;
        const step = BOOT_SEQUENCE[i];

        setVisibleLines((prev) => [...prev, { label: step.label, ok: null, done: false }]);
        setActiveIndex(i);

        await new Promise((r) => setTimeout(r, step.delay));
        if (cancelled) return;

        setVisibleLines((prev) =>
          prev.map((line, idx) => (idx === i ? { ...line, ok: step.ok, done: true } : line))
        );

        await new Promise((r) => setTimeout(r, 90));
      }
      if (cancelled) return;
      setFinished(true);
      onComplete?.();
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [reducedMotion, onComplete]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleLines]);

  return (
    <div className="nx-terminal" ref={containerRef} role="status" aria-live="polite">
      <div className="nx-terminal-chrome">
        <span className="nx-terminal-dot nx-dot-red" />
        <span className="nx-terminal-dot nx-dot-amber" />
        <span className="nx-terminal-dot nx-dot-green" />
        <span className="nx-terminal-title">nexachat — local runtime</span>
      </div>
      <div className="nx-terminal-body" ref={scrollRef}>
        {visibleLines.map((line, i) => (
          <div className="nx-terminal-line" key={i}>
            <span className="nx-terminal-prompt">$</span>
            <span className="nx-terminal-label">{line.label}</span>
            {line.done ? (
              <span className="nx-terminal-ok">{line.ok}</span>
            ) : (
              <span className="nx-terminal-spinner" aria-hidden="true" />
            )}
          </div>
        ))}
        {finished && (
          <div className="nx-terminal-line nx-terminal-final">
            <span className="nx-terminal-prompt">$</span>
            <span className="nx-terminal-final-text">
              System ready — all services running locally
            </span>
            <span className="nx-terminal-cursor" aria-hidden="true" />
          </div>
        )}
      </div>
    </div>
  );
}
