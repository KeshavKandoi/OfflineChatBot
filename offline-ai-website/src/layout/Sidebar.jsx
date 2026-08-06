import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./Sidebar.css";

const NAV_ITEMS = [
  { to: "/", label: "Overview", icon: "home", end: true },
  { to: "/architecture", label: "Architecture", icon: "cpu" },
  { to: "/models", label: "AI Models", icon: "layers" },
  { to: "/documents", label: "Document Intelligence", icon: "file" },
  { to: "/memory", label: "Local Memory", icon: "database" },
  { to: "/stack", label: "Tech Stack", icon: "orbit" },
  { to: "/downloads", label: "Downloads", icon: "download" },
  { to: "/open-source", label: "Open Source", icon: "github" },
  { to: "/faq", label: "FAQ", icon: "help" },
];

// Minimal inline icon set (no external icon lib dependency yet)
function Icon({ name }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "home": return <svg {...common}><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>;
    case "cpu": return <svg {...common}><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/></svg>;
    case "layers": return <svg {...common}><path d="M12 2l9 5-9 5-9-5 9-5z"/><path d="M3 12l9 5 9-5"/><path d="M3 17l9 5 9-5"/></svg>;
    case "file": return <svg {...common}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>;
    case "database": return <svg {...common}><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/></svg>;
    case "orbit": return <svg {...common}><circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="10" ry="4.5"/><ellipse cx="12" cy="12" rx="4.5" ry="10" transform="rotate(35 12 12)"/></svg>;
    case "download": return <svg {...common}><path d="M12 3v13"/><path d="M6 11l6 6 6-6"/><path d="M4 20h16"/></svg>;
    case "github": return <svg {...common}><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.4c0-1 .3-1.6 1-2.2-3.4-.4-7-1.7-7-7.5 0-1.7.6-3 1.6-4-.2-.4-.7-2 .2-4 0 0 1.3-.4 4.2 1.6a14.3 14.3 0 0 1 7.6 0c2.9-2 4.2-1.6 4.2-1.6.9 2 .4 3.6.2 4 1 1 1.6 2.3 1.6 4 0 5.8-3.6 7.1-7 7.5.5.5 1 1.4 1 2.9V22"/></svg>;
    case "help": return <svg {...common}><circle cx="12" cy="12" r="10"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.7-2.5 2-2.5 4"/><path d="M12 17h.01"/></svg>;
    default: return null;
  }
}

export default function Sidebar() {
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);
  const itemRefs = useRef([]);

  const expanded = hovered || pinned;

  // Keyboard navigation: Up/Down to move, Enter to activate, "p" to toggle pin
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusIndex((i) => {
          const next = Math.min(i + 1, NAV_ITEMS.length - 1);
          itemRefs.current[next]?.focus();
          return next;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusIndex((i) => {
          const next = Math.max(i - 1, 0);
          itemRefs.current[next]?.focus();
          return next;
        });
      }
    }
    const el = document.getElementById("nx-sidebar");
    el?.addEventListener("keydown", onKeyDown);
    return () => el?.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <motion.aside
      id="nx-sidebar"
      className={`nx-sidebar ${expanded ? "is-expanded" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={{ width: expanded ? 260 : 72 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      aria-label="Primary navigation"
    >
      <div className="nx-sidebar-top">
        <div className="nx-sidebar-logo">
          <span className="nx-logo-mark">N</span>
          <AnimatePresence>
            {expanded && (
              <motion.span
                className="nx-logo-text"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
              >
                NexaChat
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <button
          className={`nx-pin-btn ${pinned ? "is-pinned" : ""}`}
          onClick={() => setPinned((p) => !p)}
          aria-label={pinned ? "Unpin sidebar" : "Pin sidebar open"}
          aria-pressed={pinned}
          title={pinned ? "Unpin" : "Pin open"}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2l2 7h7l-5.5 4.5L17 21l-5-4-5 4 1.5-7.5L3 9h7z" />
          </svg>
        </button>
      </div>

      <nav className="nx-sidebar-nav">
        {NAV_ITEMS.map((item, i) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            ref={(el) => (itemRefs.current[i] = el)}
            className={({ isActive }) => `nx-nav-item ${isActive ? "is-active" : ""}`}
          >
            <span className="nx-nav-icon"><Icon name={item.icon} /></span>
            <AnimatePresence>
              {expanded && (
                <motion.span
                  className="nx-nav-label"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18 }}
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
            <span className="nx-nav-active-dot" aria-hidden="true" />
          </NavLink>
        ))}
      </nav>

      <div className="nx-sidebar-footer">
        
          href="https://github.com/KeshavKandoi/OfflineChatBot"
          className="nx-nav-item"
          target="_blank"
          rel="noreferrer"
        >
          <span className="nx-nav-icon"><Icon name="github" /></span>
          <AnimatePresence>
            {expanded && (
              <motion.span
                className="nx-nav-label"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
              >
                GitHub
              </motion.span>
            )}
          </AnimatePresence>
        </a>
      </div>
    </motion.aside>
  );
}
