import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    // FAQ Toggle
    window.toggleFaq = function(el) {
      const item = el.parentElement;
      const answer = item.querySelector('.faq-answer');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-answer').classList.remove('open');
      });
      if (!isOpen) {
        item.classList.add('open');
        answer.classList.add('open');
      }
    };

    // Scroll Reveal
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Navbar scroll
    const handleScroll = () => {
      const nav = document.querySelector('nav');
      if (nav) nav.style.background = window.scrollY > 60 ? 'rgba(2,8,6,0.92)' : 'rgba(2,8,6,0.7)';
    };
    window.addEventListener('scroll', handleScroll);

    // 3D tilt
    document.querySelectorAll('.feature-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `translateY(-6px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

        :root {
          --black: #020806;
          --dark: #060f08;
          --card: #0a130c;
          --card2: #0e1910;
          --border: rgba(255,255,255,0.07);
          --border2: rgba(255,255,255,0.12);
          --accent: #22c55e;
          --accent2: #4ade80;
          --cyan: #34d399;
          --pink: #a3e635;
          --green: #86efac;
          --text: #f0f8f2;
          --muted: #7aaa88;
          --faint: #3a5a44;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }

        body {
          font-family: 'DM Sans', sans-serif;
          background: var(--black);
          color: var(--text);
          overflow-x: hidden;
          line-height: 1.6;
        }

        body::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 1000;
          opacity: 0.4;
        }

        h1, h2, h3, h4 { font-family: 'Syne', sans-serif; letter-spacing: -0.02em; }

        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 18px 6%;
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(2,8,6,0.7);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
          transition: all 0.3s ease;
        }

        .logo {
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px;
          background: linear-gradient(135deg, #4ade80, #34d399);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; letter-spacing: -0.03em;
        }

        .nav-links { display: flex; gap: 36px; list-style: none; }
        .nav-links a { color: var(--muted); text-decoration: none; font-size: 14px; font-weight: 400; transition: color 0.2s; }
        .nav-links a:hover { color: var(--text); }

        .nav-cta {
          padding: 9px 22px;
          background: linear-gradient(135deg, var(--accent), #16a34a);
          border: none; border-radius: 100px; color: white;
          font-size: 13px; font-weight: 500; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: all 0.25s ease;
          box-shadow: 0 0 24px rgba(34,197,94,0.35); text-decoration: none;
        }
        .nav-cta:hover { transform: translateY(-1px); box-shadow: 0 0 36px rgba(34,197,94,0.55); }

        .hero {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden; padding: 120px 6% 80px;
        }

        .hero-bg {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(34,197,94,0.12) 0%, transparent 70%),
                      radial-gradient(ellipse 60% 40% at 80% 80%, rgba(52,211,153,0.08) 0%, transparent 60%),
                      radial-gradient(ellipse 40% 40% at 20% 60%, rgba(163,230,53,0.06) 0%, transparent 60%);
        }

        .orb { position: absolute; border-radius: 50%; filter: blur(80px); animation: float 8s ease-in-out infinite; pointer-events: none; }
        .orb-1 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(34,197,94,0.18) 0%, transparent 70%); top: -100px; left: -100px; animation-delay: 0s; }
        .orb-2 { width: 400px; height: 400px; background: radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 70%); top: 20%; right: -80px; animation-delay: -3s; }
        .orb-3 { width: 300px; height: 300px; background: radial-gradient(circle, rgba(163,230,53,0.1) 0%, transparent 70%); bottom: 10%; left: 30%; animation-delay: -5s; }

        @keyframes float { 0%, 100% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-30px) scale(1.05); } }

        .hero-content { position: relative; z-index: 2; text-align: center; max-width: 900px; margin: 0 auto; }

        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 16px; background: rgba(34,197,94,0.1);
          border: 1px solid rgba(34,197,94,0.3); border-radius: 100px;
          font-size: 12px; color: var(--accent2); font-weight: 500;
          letter-spacing: 0.05em; text-transform: uppercase;
          margin-bottom: 32px; animation: fadeInUp 0.6s ease both;
        }

        .badge-dot { width: 6px; height: 6px; background: var(--accent2); border-radius: 50%; animation: pulse 2s ease infinite; }

        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.8); } }

        .hero h1 { font-size: clamp(52px, 7vw, 96px); font-weight: 800; line-height: 1.0; letter-spacing: -0.04em; margin-bottom: 24px; animation: fadeInUp 0.6s ease 0.1s both; }
        .hero h1 .line1 { display: block; color: var(--text); }
        .hero h1 .line2 {
          display: block;
          background: linear-gradient(135deg, #4ade80 0%, #34d399 50%, #a3e635 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; background-size: 200% 200%;
          animation: fadeInUp 0.6s ease 0.1s both, gradShift 4s ease infinite 0.7s;
        }

        @keyframes gradShift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }

        .hero p { font-size: 19px; color: var(--muted); max-width: 560px; margin: 0 auto 44px; line-height: 1.7; font-weight: 300; animation: fadeInUp 0.6s ease 0.2s both; }

        .hero-actions { display: flex; gap: 16px; justify-content: center; align-items: center; flex-wrap: wrap; animation: fadeInUp 0.6s ease 0.3s both; }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 16px 36px; background: linear-gradient(135deg, #22c55e, #16a34a);
          border: none; border-radius: 100px; color: white;
          font-size: 15px; font-weight: 500; cursor: pointer;
          font-family: 'DM Sans', sans-serif; text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 0 40px rgba(34,197,94,0.4), inset 0 1px 0 rgba(255,255,255,0.1);
          position: relative; overflow: hidden;
        }
        .btn-primary::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent); opacity: 0; transition: opacity 0.3s; }
        .btn-primary:hover::before { opacity: 1; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 60px rgba(34,197,94,0.6), inset 0 1px 0 rgba(255,255,255,0.1); }
        .btn-primary:active { transform: translateY(0) scale(0.98); }

        .btn-secondary {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 15px 32px; background: transparent;
          border: 1px solid var(--border2); border-radius: 100px;
          color: var(--text); font-size: 15px; font-weight: 400;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          text-decoration: none; transition: all 0.25s ease; backdrop-filter: blur(10px);
        }
        .btn-secondary:hover { border-color: rgba(34,197,94,0.35); background: rgba(34,197,94,0.05); transform: translateY(-1px); }

        .hero-stats { display: flex; justify-content: center; gap: 60px; margin-top: 80px; padding-top: 60px; border-top: 1px solid var(--border); animation: fadeInUp 0.6s ease 0.4s both; }
        .stat { text-align: center; }
        .stat-num { font-family: 'Syne', sans-serif; font-size: 36px; font-weight: 800; background: linear-gradient(135deg, var(--text), var(--muted)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1; margin-bottom: 6px; }
        .stat-label { font-size: 13px; color: var(--faint); font-weight: 400; }

        @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }

        .chat-preview-wrapper { position: relative; z-index: 2; margin-top: 80px; animation: fadeInUp 0.8s ease 0.5s both; padding: 0 6% 80px; }

        .chat-preview {
          max-width: 720px; margin: 0 auto; background: var(--card);
          border: 1px solid var(--border2); border-radius: 20px; overflow: hidden;
          box-shadow: 0 40px 120px rgba(0,0,0,0.8), 0 0 80px rgba(34,197,94,0.08);
          transform: perspective(1200px) rotateX(4deg); transition: transform 0.4s ease;
        }
        .chat-preview:hover { transform: perspective(1200px) rotateX(0deg); }

        .chat-header { padding: 16px 20px; background: rgba(255,255,255,0.03); border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 10px; }
        .chat-dots { display: flex; gap: 6px; }
        .dot { width: 10px; height: 10px; border-radius: 50%; }
        .dot-r { background: #ff5f57; } .dot-y { background: #febc2e; } .dot-g { background: #28c840; }
        .chat-title { flex: 1; text-align: center; font-size: 12px; color: var(--faint); font-weight: 400; }
        .chat-status { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--green); }
        .status-dot { width: 6px; height: 6px; background: var(--green); border-radius: 50%; animation: pulse 2s ease infinite; }

        .chat-messages { padding: 24px 20px; display: flex; flex-direction: column; gap: 16px; }
        .msg { display: flex; gap: 12px; animation: msgIn 0.4s ease both; }
        @keyframes msgIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .msg-ai { align-self: flex-start; }
        .msg-user { align-self: flex-end; flex-direction: row-reverse; }

        .msg-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, var(--accent), #16a34a);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; flex-shrink: 0;
          box-shadow: 0 0 16px rgba(34,197,94,0.4);
          animation: glowPulse 3s ease infinite;
        }
        @keyframes glowPulse { 0%, 100% { box-shadow: 0 0 16px rgba(34,197,94,0.4); } 50% { box-shadow: 0 0 28px rgba(34,197,94,0.7); } }

        .msg-bubble { padding: 12px 16px; border-radius: 16px; font-size: 14px; line-height: 1.6; max-width: 80%; }
        .msg-ai .msg-bubble { background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: var(--text); border-radius: 4px 16px 16px 16px; }
        .msg-user .msg-bubble { background: linear-gradient(135deg, var(--accent), #16a34a); color: white; border-radius: 16px 4px 16px 16px; }

        .typing-indicator { display: flex; align-items: center; gap: 4px; padding: 12px 16px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 4px 16px 16px 16px; width: fit-content; }
        .typing-dot { width: 6px; height: 6px; background: var(--muted); border-radius: 50%; animation: typingDot 1.2s ease infinite; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typingDot { 0%, 100% { transform: translateY(0); opacity: 0.4; } 50% { transform: translateY(-4px); opacity: 1; } }

        .chat-input-bar { padding: 16px 20px; border-top: 1px solid var(--border); display: flex; gap: 12px; align-items: center; background: rgba(255,255,255,0.02); }
        .chat-input-mock { flex: 1; padding: 10px 16px; background: rgba(255,255,255,0.05); border: 1px solid var(--border2); border-radius: 100px; font-size: 13px; color: var(--muted); font-family: 'DM Sans', sans-serif; }
        .send-btn-mock { width: 36px; height: 36px; background: linear-gradient(135deg, var(--accent), #16a34a); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; transition: all 0.2s; box-shadow: 0 0 16px rgba(34,197,94,0.4); }

        section { padding: 120px 6%; position: relative; }
        .section-label { display: inline-block; font-size: 11px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: var(--accent2); margin-bottom: 16px; }
        .section-title { font-size: clamp(36px, 4vw, 56px); font-weight: 800; line-height: 1.1; letter-spacing: -0.03em; margin-bottom: 20px; }
        .section-sub { font-size: 17px; color: var(--muted); max-width: 500px; font-weight: 300; line-height: 1.7; }

        .features { background: var(--dark); }
        .features-header { text-align: center; margin-bottom: 72px; }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; max-width: 1100px; margin: 0 auto; }

        .feature-card {
          padding: 36px 32px; background: var(--card); border: 1px solid var(--border);
          border-radius: 20px; transition: all 0.35s ease; position: relative; overflow: hidden; cursor: default;
        }
        .feature-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, var(--accent), transparent); opacity: 0; transition: opacity 0.35s ease; }
        .feature-card:hover { border-color: rgba(34,197,94,0.3); transform: translateY(-6px); background: var(--card2); box-shadow: 0 24px 60px rgba(0,0,0,0.5), 0 0 40px rgba(34,197,94,0.08); }
        .feature-card:hover::before { opacity: 1; }

        .feature-icon { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 24px; }
        .fi-purple { background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.25); }
        .fi-cyan { background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.2); }
        .fi-pink { background: rgba(163,230,53,0.1); border: 1px solid rgba(163,230,53,0.2); }
        .fi-green { background: rgba(134,239,172,0.1); border: 1px solid rgba(134,239,172,0.2); }
        .fi-amber { background: rgba(74,222,128,0.1); border: 1px solid rgba(74,222,128,0.2); }
        .fi-blue { background: rgba(22,163,74,0.1); border: 1px solid rgba(22,163,74,0.2); }

        .feature-title { font-size: 18px; font-weight: 700; margin-bottom: 12px; color: var(--text); }
        .feature-desc { font-size: 14px; color: var(--muted); line-height: 1.7; font-weight: 300; }
        .feature-tag { display: inline-block; margin-top: 20px; padding: 4px 12px; background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.2); border-radius: 100px; font-size: 11px; color: var(--accent2); font-weight: 500; }

        .how-it-works { background: var(--black); }
        .hiw-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; max-width: 1100px; margin: 80px auto 0; position: relative; }
        .hiw-grid::before { content: ''; position: absolute; top: 40px; left: 12.5%; right: 12.5%; height: 1px; background: linear-gradient(90deg, transparent, var(--accent), var(--cyan), var(--pink), transparent); opacity: 0.3; }
        .hiw-step { padding: 40px 28px 36px; text-align: center; position: relative; }
        .step-num { width: 52px; height: 52px; border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 800; position: relative; z-index: 1; transition: all 0.3s ease; }
        .sn-1 { background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.4); color: var(--accent2); }
        .sn-2 { background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.3); color: var(--cyan); }
        .sn-3 { background: rgba(163,230,53,0.1); border: 1px solid rgba(163,230,53,0.3); color: var(--pink); }
        .sn-4 { background: rgba(134,239,172,0.1); border: 1px solid rgba(134,239,172,0.3); color: var(--green); }
        .hiw-step:hover .step-num { transform: scale(1.1); }
        .step-title { font-size: 16px; font-weight: 700; margin-bottom: 10px; color: var(--text); }
        .step-desc { font-size: 13px; color: var(--muted); line-height: 1.65; font-weight: 300; }

        .tech-section { background: var(--dark); text-align: center; }
        .tech-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; max-width: 900px; margin: 64px auto 0; }
        .tech-card { padding: 28px 24px; background: var(--card); border: 1px solid var(--border); border-radius: 16px; text-align: left; transition: all 0.3s ease; }
        .tech-card:hover { border-color: var(--border2); transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
        .tech-name { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 6px; }
        .tech-role { font-size: 12px; color: var(--muted); font-weight: 300; line-height: 1.5; }
        .tech-badge { display: inline-block; margin-top: 14px; padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 500; }
        .tb-ai { background: rgba(34,197,94,0.12); color: var(--accent2); border: 1px solid rgba(34,197,94,0.2); }
        .tb-backend { background: rgba(52,211,153,0.08); color: var(--cyan); border: 1px solid rgba(52,211,153,0.2); }
        .tb-frontend { background: rgba(163,230,53,0.08); color: var(--pink); border: 1px solid rgba(163,230,53,0.2); }
        .tb-memory { background: rgba(134,239,172,0.08); color: var(--green); border: 1px solid rgba(134,239,172,0.2); }
        .tb-desktop { background: rgba(74,222,128,0.08); color: #4ade80; border: 1px solid rgba(74,222,128,0.2); }

        .testimonials { background: var(--black); }
        .testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; max-width: 1100px; margin: 72px auto 0; }
        .testimonial-card { padding: 32px 28px; background: var(--card); border: 1px solid var(--border); border-radius: 20px; transition: all 0.35s ease; }
        .testimonial-card:hover { transform: translateY(-6px); border-color: rgba(34,197,94,0.25); box-shadow: 0 24px 60px rgba(0,0,0,0.5); }
        .quote-mark { font-size: 48px; color: var(--accent); opacity: 0.4; font-family: Georgia, serif; line-height: 1; margin-bottom: 16px; }
        .testimonial-text { font-size: 15px; color: var(--text); line-height: 1.75; font-weight: 300; margin-bottom: 24px; }
        .testimonial-author { display: flex; align-items: center; gap: 12px; }
        .author-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0; }
        .av-1 { background: linear-gradient(135deg, #22c55e, #16a34a); }
        .av-2 { background: linear-gradient(135deg, #34d399, #059669); }
        .av-3 { background: linear-gradient(135deg, #a3e635, #65a30d); }
        .author-name { font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 2px; }
        .author-title { font-size: 12px; color: var(--muted); }

        .pricing { background: var(--dark); text-align: center; }
        .pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; max-width: 960px; margin: 72px auto 0; align-items: start; }
        .pricing-card { padding: 40px 32px; background: var(--card); border: 1px solid var(--border); border-radius: 24px; text-align: left; transition: all 0.35s ease; position: relative; overflow: hidden; }
        .pricing-card:hover { transform: translateY(-8px); box-shadow: 0 32px 80px rgba(0,0,0,0.5); }
        .pricing-card.featured { background: linear-gradient(135deg, rgba(34,197,94,0.12), rgba(22,163,74,0.08)); border-color: rgba(34,197,94,0.4); transform: scale(1.04); }
        .pricing-card.featured:hover { transform: scale(1.04) translateY(-8px); box-shadow: 0 32px 80px rgba(34,197,94,0.2); }
        .featured-badge { position: absolute; top: 20px; right: 20px; padding: 4px 12px; background: var(--accent); border-radius: 100px; font-size: 11px; font-weight: 600; color: white; letter-spacing: 0.03em; }
        .pricing-tier { font-size: 13px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.1em; font-weight: 500; margin-bottom: 16px; }
        .pricing-price { display: flex; align-items: baseline; gap: 4px; margin-bottom: 8px; }
        .price-amount { font-family: 'Syne', sans-serif; font-size: 48px; font-weight: 800; color: var(--text); line-height: 1; }
        .price-period { font-size: 14px; color: var(--muted); }
        .pricing-desc { font-size: 13px; color: var(--muted); margin-bottom: 28px; font-weight: 300; line-height: 1.6; }
        .pricing-features { list-style: none; margin-bottom: 32px; display: flex; flex-direction: column; gap: 12px; }
        .pricing-features li { display: flex; align-items: center; gap: 10px; font-size: 14px; color: var(--text); font-weight: 300; }
        .check { width: 18px; height: 18px; border-radius: 50%; background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.3); display: flex; align-items: center; justify-content: center; font-size: 10px; color: var(--green); flex-shrink: 0; }
        .pricing-btn { width: 100%; padding: 14px; border-radius: 12px; font-size: 14px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.25s ease; text-align: center; display: block; text-decoration: none; }
        .pb-outline { background: transparent; border: 1px solid var(--border2); color: var(--text); }
        .pb-outline:hover { border-color: rgba(34,197,94,0.35); background: rgba(34,197,94,0.05); }
        .pb-solid { background: linear-gradient(135deg, var(--accent), #16a34a); border: none; color: white; box-shadow: 0 0 30px rgba(34,197,94,0.35); }
        .pb-solid:hover { box-shadow: 0 0 50px rgba(34,197,94,0.55); transform: translateY(-1px); }

        .faq { background: var(--black); }
        .faq-container { max-width: 700px; margin: 72px auto 0; }
        .faq-item { border: 1px solid var(--border); border-radius: 14px; margin-bottom: 12px; overflow: hidden; transition: border-color 0.25s; }
        .faq-item:hover { border-color: var(--border2); }
        .faq-question { padding: 22px 24px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; font-size: 15px; font-weight: 500; color: var(--text); transition: background 0.2s; user-select: none; }
        .faq-question:hover { background: rgba(255,255,255,0.02); }
        .faq-icon { width: 24px; height: 24px; border-radius: 50%; background: rgba(255,255,255,0.05); border: 1px solid var(--border2); display: flex; align-items: center; justify-content: center; font-size: 14px; transition: all 0.3s ease; flex-shrink: 0; color: var(--muted); }
        .faq-answer { max-height: 0; overflow: hidden; transition: max-height 0.4s ease, padding 0.4s ease; font-size: 14px; color: var(--muted); line-height: 1.75; font-weight: 300; }
        .faq-answer.open { max-height: 200px; padding: 0 24px 22px; }
        .faq-item.open .faq-icon { background: rgba(34,197,94,0.15); border-color: rgba(34,197,94,0.3); color: var(--accent2); transform: rotate(45deg); }

        .cta-section { background: var(--dark); text-align: center; position: relative; overflow: hidden; }
        .cta-section::before { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 600px; height: 400px; background: radial-gradient(ellipse, rgba(34,197,94,0.1) 0%, transparent 70%); pointer-events: none; }
        .cta-section .section-title { max-width: 600px; margin: 0 auto 20px; }
        .cta-section .section-sub { max-width: 440px; margin: 0 auto 48px; text-align: center; }

        footer { background: var(--black); padding: 80px 6% 40px; border-top: 1px solid var(--border); }
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 60px; margin-bottom: 60px; }
        .footer-brand .logo { font-size: 24px; display: block; margin-bottom: 16px; }
        .footer-tagline { font-size: 13px; color: var(--muted); font-weight: 300; line-height: 1.7; max-width: 260px; margin-bottom: 24px; }
        .footer-socials { display: flex; gap: 12px; }
        .social-icon { width: 36px; height: 36px; border-radius: 10px; background: rgba(255,255,255,0.04); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; transition: all 0.25s; text-decoration: none; color: var(--muted); }
        .social-icon:hover { background: rgba(34,197,94,0.1); border-color: rgba(34,197,94,0.3); color: var(--accent2); transform: translateY(-2px); }
        .footer-col h4 { font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 20px; letter-spacing: 0.02em; }
        .footer-links { list-style: none; display: flex; flex-direction: column; gap: 12px; }
        .footer-links a { font-size: 13px; color: var(--muted); text-decoration: none; font-weight: 300; transition: color 0.2s; }
        .footer-links a:hover { color: var(--text); }
        .footer-bottom { padding-top: 32px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
        .footer-copy { font-size: 12px; color: var(--faint); font-weight: 300; }
        .footer-legal { display: flex; gap: 24px; }
        .footer-legal a { font-size: 12px; color: var(--faint); text-decoration: none; transition: color 0.2s; }
        .footer-legal a:hover { color: var(--muted); }

        .reveal { opacity: 0; transform: translateY(32px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .reveal-delay-1 { transition-delay: 0.1s; }
        .reveal-delay-2 { transition-delay: 0.2s; }
        .reveal-delay-3 { transition-delay: 0.3s; }
        .reveal-delay-4 { transition-delay: 0.4s; }

        @media (max-width: 900px) {
          .features-grid, .testimonials-grid, .pricing-grid { grid-template-columns: 1fr; }
          .hiw-grid { grid-template-columns: repeat(2, 1fr); }
          .tech-grid { grid-template-columns: repeat(2, 1fr); }
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 40px; }
          .pricing-card.featured { transform: none; }
          .hero-stats { gap: 32px; }
          .nav-links { display: none; }
        }

        @media (max-width: 600px) {
          .hiw-grid, .tech-grid, .footer-grid { grid-template-columns: 1fr; }
          .hero-stats { flex-direction: column; gap: 24px; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav>
        <div className="logo">Offline AI</div>
        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#how-it-works">How It Works</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="#faq">FAQ</a></li>
        </ul>
        <a href="#download" className="nav-cta">Download Free</a>
      </nav>

      {/* HERO */}
      <section className="hero" id="home">
        <div className="hero-bg"></div>
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        <div className="hero-content">
          <div className="hero-badge">
            <div className="badge-dot"></div>
            Now with Gemini 2.5 Flash + Local AI
          </div>
          <h1>
            <span className="line1">Your AI, Always</span>
            <span className="line2">Private. Powerful.</span>
          </h1>
          <p>A fully offline AI assistant that runs on your Mac. No data leaves your device — ever. Switch to Gemini 2.5 when online for smarter answers.</p>
          <div className="hero-actions">
            <a href="#download" className="btn-primary">↓ Download for Mac</a>
            <a href="https://github.com/KeshavKandoi/OfflineChatBot/releases/download/v2.1.0/Offline.AI.Setup.1.0.0.exe" className="btn-secondary">↓ Download for Windows</a>
            <a href="https://github.com/KeshavKandoi/OfflineChatBot/releases/download/v2.1.0/Offline.AI.Setup.1.0.0.exe" className="btn-secondary">↓ Download for Windows</a>
            <a href="#features" className="btn-secondary">See how it works →</a>
          </div>
          <div className="hero-stats">
            <div className="stat"><div className="stat-num">100%</div><div className="stat-label">Private by default</div></div>
            <div className="stat"><div className="stat-num">3</div><div className="stat-label">AI models bundled</div></div>
            <div className="stat"><div className="stat-num">0ms</div><div className="stat-label">Setup required</div></div>
            <div className="stat"><div className="stat-num">∞</div><div className="stat-label">Offline usage</div></div>
          </div>
        </div>
      </section>

      {/* CHAT PREVIEW */}
      <div className="chat-preview-wrapper">
        <div className="chat-preview">
          <div className="chat-header">
            <div className="chat-dots">
              <div className="dot dot-r"></div>
              <div className="dot dot-y"></div>
              <div className="dot dot-g"></div>
            </div>
            <div className="chat-title">Offline AI — New Chat</div>
            <div className="chat-status"><div className="status-dot"></div>Gemini 2.5 Active</div>
          </div>
          <div className="chat-messages">
            <div className="msg msg-user" style={{animationDelay: '0.1s'}}>
              <div className="msg-avatar" style={{background: 'rgba(255,255,255,0.1)', fontSize: '11px', fontWeight: 600}}>K</div>
              <div className="msg-bubble">Can you explain how transformers work in deep learning?</div>
            </div>
            <div className="msg msg-ai" style={{animationDelay: '0.3s'}}>
              <div className="msg-avatar">AI</div>
              <div className="msg-bubble">Transformers use <strong>self-attention mechanisms</strong> to weigh the importance of different parts of the input sequence. Unlike RNNs, they process all tokens in parallel, enabling much faster training and better long-range dependency capture...</div>
            </div>
            <div className="msg msg-user" style={{animationDelay: '0.5s'}}>
              <div className="msg-avatar" style={{background: 'rgba(255,255,255,0.1)', fontSize: '11px', fontWeight: 600}}>K</div>
              <div className="msg-bubble">Write me the attention formula in Python</div>
            </div>
            <div className="msg msg-ai" style={{animationDelay: '0.7s'}}>
              <div className="msg-avatar">AI</div>
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          </div>
          <div className="chat-input-bar">
            <div className="chat-input-mock">Ask anything...</div>
            <div className="send-btn-mock">→</div>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <section className="features" id="features">
        <div className="features-header reveal">
          <div className="section-label">Capabilities</div>
          <h2 className="section-title">Everything you need,<br />nothing you don't</h2>
          <p className="section-sub" style={{margin: '0 auto'}}>Built for developers, researchers, and power users who take privacy seriously.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card reveal reveal-delay-1">
            <div className="feature-icon fi-purple">🧠</div>
            <div className="feature-title">Dual AI Engine</div>
            <div className="feature-desc">Auto-switches between Gemini 2.5 Flash (online) and local Ollama models (offline). Always the best model for your situation.</div>
            <div className="feature-tag">qwen2.5 + Gemini 2.5</div>
          </div>
          <div className="feature-card reveal reveal-delay-2">
            <div className="feature-icon fi-cyan">👁</div>
            <div className="feature-title">Vision & Image Analysis</div>
            <div className="feature-desc">Upload screenshots, diagrams, and photos. The MiniCPM-V model analyzes visual content locally with no cloud upload.</div>
            <div className="feature-tag">MiniCPM-V</div>
          </div>
          <div className="feature-card reveal reveal-delay-3">
            <div className="feature-icon fi-green">💻</div>
            <div className="feature-title">Code Intelligence</div>
            <div className="feature-desc">Powered by qwen2.5-coder:7b, get expert-level code generation, debugging, and explanations in 40+ languages.</div>
            <div className="feature-tag">qwen2.5-coder:7b</div>
          </div>
          <div className="feature-card reveal reveal-delay-1">
            <div className="feature-icon fi-pink">📄</div>
            <div className="feature-title">Document RAG</div>
            <div className="feature-desc">Upload PDFs, DOCX, and TXT files. The app indexes them locally using ChromaDB and answers questions from your documents.</div>
            <div className="feature-tag">ChromaDB + nomic-embed</div>
          </div>
          <div className="feature-card reveal reveal-delay-2">
            <div className="feature-icon fi-amber">🔒</div>
            <div className="feature-title">100% Private</div>
            <div className="feature-desc">All processing happens on your device. No telemetry, no cloud sync, no data collection. Your conversations are yours alone.</div>
            <div className="feature-tag">Zero data egress</div>
          </div>
          <div className="feature-card reveal reveal-delay-3">
            <div className="feature-icon fi-blue">💾</div>
            <div className="feature-title">Persistent Memory</div>
            <div className="feature-desc">Long-term memory with SQLite + vector embeddings. The AI remembers context across sessions and past conversations.</div>
            <div className="feature-tag">SQLite + LangGraph</div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works" id="how-it-works">
        <div style={{textAlign: 'center'}} className="reveal">
          <div className="section-label">Process</div>
          <h2 className="section-title">From download to<br />first conversation in seconds</h2>
        </div>
        <div className="hiw-grid">
          <div className="hiw-step reveal reveal-delay-1">
            <div className="step-num sn-1">1</div>
            <div className="step-title">Download .dmg</div>
            <div className="step-desc">One-click download. A single 358MB installer for Apple Silicon Macs.</div>
          </div>
          <div className="hiw-step reveal reveal-delay-2">
            <div className="step-num sn-2">2</div>
            <div className="step-title">Auto Setup</div>
            <div className="step-desc">The app downloads AI models automatically on first launch — qwen2.5, MiniCPM-V, and nomic-embed.</div>
          </div>
          <div className="hiw-step reveal reveal-delay-3">
            <div className="step-num sn-3">3</div>
            <div className="step-title">Start Chatting</div>
            <div className="step-desc">Ask anything — code questions, document analysis, general knowledge, or image understanding.</div>
          </div>
          <div className="hiw-step reveal reveal-delay-4">
            <div className="step-num sn-4">4</div>
            <div className="step-title">Works Everywhere</div>
            <div className="step-desc">Online gets Gemini 2.5 Flash. Offline gets local Ollama. Automatic, seamless, always fast.</div>
          </div>
        </div>
      </section>

      {/* TECH STACK */}
      <section className="tech-section" id="stack">
        <div className="reveal">
          <div className="section-label">Built With</div>
          <h2 className="section-title">Open-source,<br />production-grade stack</h2>
        </div>
        <div className="tech-grid">
          <div className="tech-card reveal reveal-delay-1"><div className="tech-name">Electron</div><div className="tech-role">Desktop app shell. Manages Ollama process, Python backend lifecycle, and native macOS window.</div><div className="tech-badge tb-desktop">Desktop</div></div>
          <div className="tech-card reveal reveal-delay-2"><div className="tech-name">FastAPI + Python</div><div className="tech-role">Backend REST API. Handles chat streaming, file uploads, RAG retrieval, and auth.</div><div className="tech-badge tb-backend">Backend</div></div>
          <div className="tech-card reveal reveal-delay-3"><div className="tech-name">React + TypeScript</div><div className="tech-role">Frontend UI with Vite. Real-time streaming, markdown rendering, syntax highlighting.</div><div className="tech-badge tb-frontend">Frontend</div></div>
          <div className="tech-card reveal reveal-delay-1"><div className="tech-name">Ollama</div><div className="tech-role">Local LLM runner. Bundles qwen2.5:7b, qwen2.5-coder:7b, and MiniCPM-V for offline inference.</div><div className="tech-badge tb-ai">AI Engine</div></div>
          <div className="tech-card reveal reveal-delay-2"><div className="tech-name">LangGraph + LangChain</div><div className="tech-role">Orchestration layer. Manages conversation state, long-term memory, and RAG pipeline.</div><div className="tech-badge tb-ai">AI Framework</div></div>
          <div className="tech-card reveal reveal-delay-3"><div className="tech-name">ChromaDB + SQLite</div><div className="tech-role">Dual storage. ChromaDB for vector embeddings and document search. SQLite for chat history.</div><div className="tech-badge tb-memory">Memory</div></div>
          <div className="tech-card reveal reveal-delay-1"><div className="tech-name">Gemini 2.5 Flash</div><div className="tech-role">Google's latest model with Google Search grounding. Used when internet is available.</div><div className="tech-badge tb-ai">Online AI</div></div>
          <div className="tech-card reveal reveal-delay-2"><div className="tech-name">MiniCPM-V</div><div className="tech-role">5.5GB vision model. Analyzes screenshots, diagrams, and images entirely on-device.</div><div className="tech-badge tb-ai">Vision AI</div></div>
          <div className="tech-card reveal reveal-delay-3"><div className="tech-name">nomic-embed-text</div><div className="tech-role">274MB embedding model for semantic document search and long-term memory retrieval.</div><div className="tech-badge tb-memory">Embeddings</div></div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials" id="testimonials">
        <div style={{textAlign: 'center'}} className="reveal">
          <div className="section-label">Feedback</div>
          <h2 className="section-title">People love<br />the privacy</h2>
        </div>
        <div className="testimonials-grid">
          <div className="testimonial-card reveal reveal-delay-1">
            <div className="quote-mark">"</div>
            <div className="testimonial-text">Finally an AI assistant I can use at work without worrying about confidential data leaking to some server. The code intelligence is genuinely impressive for a local model.</div>
            <div className="testimonial-author">
              <div className="author-avatar av-1">AR</div>
              <div><div className="author-name">Arjun Rao</div><div className="author-title">Senior Software Engineer</div></div>
            </div>
          </div>
          <div className="testimonial-card reveal reveal-delay-2">
            <div className="quote-mark">"</div>
            <div className="testimonial-text">The automatic switch between Gemini and Ollama is seamless. I barely notice when I go offline — the app just keeps working. This is how all AI tools should be built.</div>
            <div className="testimonial-author">
              <div className="author-avatar av-2">PM</div>
              <div><div className="author-name">Priya Mehta</div><div className="author-title">ML Research Scientist</div></div>
            </div>
          </div>
          <div className="testimonial-card reveal reveal-delay-3">
            <div className="quote-mark">"</div>
            <div className="testimonial-text">I use it daily to analyze architecture diagrams and code screenshots. The vision model is surprisingly accurate and the fact that nothing leaves my laptop is a game changer.</div>
            <div className="testimonial-author">
              <div className="author-avatar av-3">SK</div>
              <div><div className="author-name">Sneha Kapoor</div><div className="author-title">Product Designer</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="pricing" id="pricing">
        <div className="reveal">
          <div className="section-label">Pricing</div>
          <h2 className="section-title">Simple, honest pricing</h2>
          <p className="section-sub" style={{margin: '0 auto'}}>No subscriptions. No usage limits. No surprises.</p>
        </div>
        <div className="pricing-grid">
          <div className="pricing-card reveal reveal-delay-1">
            <div className="pricing-tier">Starter</div>
            <div className="pricing-price"><span className="price-amount">Free</span></div>
            <div className="pricing-desc">Full offline AI experience with local models.</div>
            <ul className="pricing-features">
              <li><span className="check">✓</span>qwen2.5:7b chat model</li>
              <li><span className="check">✓</span>MiniCPM-V vision model</li>
              <li><span className="check">✓</span>Document RAG (PDF, DOCX)</li>
              <li><span className="check">✓</span>Unlimited offline usage</li>
              <li><span className="check">✓</span>Local chat history</li>
            </ul>
            <a href="#download" className="pricing-btn pb-outline">Download Free</a>
          </div>
          <div className="pricing-card featured reveal reveal-delay-2">
            <div className="featured-badge">Most Popular</div>
            <div className="pricing-tier">Pro</div>
            <div className="pricing-price"><span className="price-amount">$0</span><span className="price-period">+ your API key</span></div>
            <div className="pricing-desc">Bring your own Gemini API key for online mode.</div>
            <ul className="pricing-features">
              <li><span className="check">✓</span>Everything in Starter</li>
              <li><span className="check">✓</span>Gemini 2.5 Flash online</li>
              <li><span className="check">✓</span>Google Search grounding</li>
              <li><span className="check">✓</span>Real-time information</li>
              <li><span className="check">✓</span>Auto online/offline switch</li>
              <li><span className="check">✓</span>AI-generated chat titles</li>
            </ul>
            <a href="#download" className="pricing-btn pb-solid">Get Started Free</a>
          </div>
          <div className="pricing-card reveal reveal-delay-3">
            <div className="pricing-tier">Developer</div>
            <div className="pricing-price"><span className="price-amount">OSS</span></div>
            <div className="pricing-desc">Full source code available. Fork and customize.</div>
            <ul className="pricing-features">
              <li><span className="check">✓</span>Everything in Pro</li>
              <li><span className="check">✓</span>Full source code on GitHub</li>
              <li><span className="check">✓</span>Custom model support</li>
              <li><span className="check">✓</span>Self-hostable backend</li>
              <li><span className="check">✓</span>MIT License</li>
            </ul>
            <a href="https://github.com/KeshavKandoi/OfflineChatBot" className="pricing-btn pb-outline">View on GitHub</a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq" id="faq">
        <div style={{textAlign: 'center'}} className="reveal">
          <div className="section-label">FAQ</div>
          <h2 className="section-title">Common questions</h2>
        </div>
        <div className="faq-container reveal">
          <div className="faq-item">
            <div className="faq-question" onClick={(e) => window.toggleFaq(e.currentTarget)}>Does my data really never leave my device?<span className="faq-icon">+</span></div>
            <div className="faq-answer">Yes. When using offline mode, all AI inference runs locally on your Mac using Ollama. No data is sent anywhere. When using Gemini online mode, your messages are sent to Google's API — just like using Google Gemini directly.</div>
          </div>
          <div className="faq-item">
            <div className="faq-question" onClick={(e) => window.toggleFaq(e.currentTarget)}>What Mac hardware do I need?<span className="faq-icon">+</span></div>
            <div className="faq-answer">Currently supports Apple Silicon Macs (M1, M2, M3, M4). The app requires at least 16GB RAM and 20GB of free disk space for the AI models. Intel Macs are not currently supported.</div>
          </div>
          <div className="faq-item">
            <div className="faq-question" onClick={(e) => window.toggleFaq(e.currentTarget)}>How does the online/offline switching work?<span className="faq-icon">+</span></div>
            <div className="faq-answer">On every message, the backend pings Google with a 2-second timeout. If it responds, Gemini 2.5 Flash is used. If not (no WiFi, slow connection, airplane mode), it automatically falls back to local Ollama models. The switch is instant and transparent.</div>
          </div>
          <div className="faq-item">
            <div className="faq-question" onClick={(e) => window.toggleFaq(e.currentTarget)}>Is the Gemini API key required?<span className="faq-icon">+</span></div>
            <div className="faq-answer">No. The app works fully offline without any API key. The Gemini integration is optional — add your own free API key from Google AI Studio to unlock online mode with real-time information access.</div>
          </div>
          <div className="faq-item">
            <div className="faq-question" onClick={(e) => window.toggleFaq(e.currentTarget)}>Which file types can I upload for analysis?<span className="faq-icon">+</span></div>
            <div className="faq-answer">You can upload PDF, DOCX, TXT files for document analysis (RAG), and PNG, JPG images for visual analysis. The vision model (MiniCPM-V) can analyze screenshots, diagrams, charts, and photos entirely on-device.</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" id="download">
        <div className="reveal">
          <div className="section-label">Get Started</div>
          <h2 className="section-title">Ready to own<br />your AI experience?</h2>
          <p className="section-sub">Free download. No account required. Works offline from day one.</p>
          <div style={{display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap'}}>
            <a href="https://github.com/KeshavKandoi/OfflineChatBot/releases/download/v2.1.0/Offline.AI-1.0.0-arm64.dmg" className="btn-primary">↓ Download for Mac — Free</a>
            <a href="https://github.com/KeshavKandoi/OfflineChatBot/releases/download/v2.1.0/Offline.AI.Setup.1.0.0.exe" className="btn-secondary">↓ Download for Windows — Free</a>
          </div>
          <p style={{fontSize: '12px', color: 'var(--faint)', marginTop: '20px'}}>macOS 13+ · Apple Silicon · 358MB</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-grid">
          <div className="footer-brand">
            <span className="logo">Offline AI</span>
            <p className="footer-tagline">A fully offline AI assistant built for privacy-conscious power users. Your intelligence, your rules.</p>
            <div className="footer-socials">
              <a href="https://github.com/KeshavKandoi/OfflineChatBot" className="social-icon">⌥</a>
              <a href="#" className="social-icon">𝕏</a>
              <a href="#" className="social-icon">in</a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Product</h4>
            <ul className="footer-links">
              <li><a href="#features">Features</a></li>
              <li><a href="#stack">Tech Stack</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#download">Download</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Resources</h4>
            <ul className="footer-links">
              <li><a href="https://github.com/KeshavKandoi/OfflineChatBot">GitHub</a></li>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#">Changelog</a></li>
              <li><a href="#">Roadmap</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Models</h4>
            <ul className="footer-links">
              <li><a href="#">qwen2.5:7b</a></li>
              <li><a href="#">qwen2.5-coder:7b</a></li>
              <li><a href="#">MiniCPM-V</a></li>
              <li><a href="#">Gemini 2.5 Flash</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">© 2026 Offline AI · Built by Keshav Kandoi</div>
          <div className="footer-legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Use</a>
            <a href="#">MIT License</a>
          </div>
        </div>
      </footer>
    </>
  );
}