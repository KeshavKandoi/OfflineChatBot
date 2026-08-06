import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./MobileNav.css";

const NAV_ITEMS = [
  { to: "/", label: "Overview", end: true },
  { to: "/architecture", label: "Architecture" },
  { to: "/models", label: "AI Models" },
  { to: "/documents", label: "Document Intelligence" },
  { to: "/memory", label: "Local Memory" },
  { to: "/stack", label: "Tech Stack" },
  { to: "/downloads", label: "Downloads" },
  { to: "/open-source", label: "Open Source" },
  { to: "/faq", label: "FAQ" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="nx-mobile-nav">
      <div className="nx-mobile-bar">
        <span className="nx-mobile-logo">
          <span className="nx-logo-mark">N</span>
          NexaChat
        </span>
        <button
          className="nx-mobile-toggle"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          <span className={`nx-burger ${open ? "is-open" : ""}`}>
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="nx-mobile-panel"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <nav>
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `nx-mobile-link ${isActive ? "is-active" : ""}`}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
              <a
              href="https://github.com/KeshavKandoi/OfflineChatBot"
              target="_blank"
              rel="noreferrer"
              className="nx-mobile-link nx-mobile-github"
              onClick={() => setOpen(false)}
            >
              GitHub
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
