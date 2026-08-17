import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MeshGradient } from "@paper-design/shaders-react";
import { Mic, ArrowUp } from "lucide-react";
import "./HeroPromptInput.css";

interface HeroPromptInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  loading?: boolean;
}

export default function HeroPromptInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Ask anything...",
  loading = false,
}: HeroPromptInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [micSupported, setMicSupported] = useState(true);
  const baseValueRef = useRef("");

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }
      if (final) {
        baseValueRef.current = (baseValueRef.current + " " + final).trim();
      }
      const combined = (baseValueRef.current + " " + interim).trim();
      onChange(combined);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

  function toggleRecording() {
    if (!micSupported || !recognitionRef.current) {
      alert("Voice input isn't supported in this browser.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      baseValueRef.current = value;
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch {
        setIsRecording(false);
      }
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !loading) onSubmit();
    }
  }

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }

  return (
    <div className="nx-hero-prompt-wrap">
      <div className="nx-hero-prompt-gradient" aria-hidden="true">
        <MeshGradient
          colors={["#3b82f6", "#8b5cf6", "#ec4899", "#0ea5e9"]}
          distortion={0.8}
          swirl={0.3}
          speed={0.15}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      <motion.div
        className="nx-hero-prompt-pill"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            autoResize();
          }}
          onKeyDown={handleKeyDown}
          placeholder={isRecording ? "Listening..." : placeholder}
          rows={1}
          className="nx-hero-prompt-textarea"
        />
        <button
          className="nx-hero-prompt-icon-btn"
          aria-label={isRecording ? "Stop recording" : "Voice input"}
          type="button"
          onClick={toggleRecording}
          style={{
            color: isRecording ? "#ef4444" : undefined,
            animation: isRecording ? "nxMicPulse 1.2s ease-in-out infinite" : undefined
          }}
        >
          <Mic size={18} />
        </button>
        <AnimatePresence mode="wait">
          <motion.button
            key={loading ? "loading" : "send"}
            className="nx-hero-prompt-send"
            onClick={onSubmit}
            disabled={!value.trim() || loading}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.15 }}
            type="button"
            aria-label="Send"
          >
            {loading ? <span className="nx-hero-prompt-spinner" /> : <ArrowUp size={18} />}
          </motion.button>
        </AnimatePresence>
      </motion.div>
      <style>{`
        @keyframes nxMicPulse {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
