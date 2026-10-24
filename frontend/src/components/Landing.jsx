import { useEffect, useRef, useState } from "react";
import { PLATFORMS } from "../config";

// Our own lines (not attributed to anyone). The button cycles through them.
const QUOTES = [
  "Every maintainer you admire once opened their very first pull request.",
  "Your first contribution doesn't need to be big. It needs to be yours.",
  "The best way to learn code is to read it, fix it, and share it.",
  "Open source begins the moment someone says: I can help.",
];

const STEPS = [
  ["1", "Tell us who you are", "Enter your GitHub username and interests."],
  ["2", "We read your skills", "Your repos and languages become a skill profile."],
  ["3", "We filter the noise", "Taken, stale or already-fixed issues are removed."],
  ["4", "We rank what is left", "Difficulty, repo health and fit, all explained."],
  ["5", "You start today", "Get first steps for each issue."],
];

const FEATURES = [
  ["🎯", "Personalized", "Matched to your languages and interests."],
  ["🚫", "Actually open", "Detects claims, open PRs, assignees and stale issues."],
  ["💚", "Repo health", "Active, Slow or Dormant, so you pick living projects."],
  ["📊", "Real difficulty", "Easy, Medium or Stretch, with a reason."],
  ["💬", "Plain language", "Every result explains why it fits you."],
  ["🧭", "First steps", "Files to read and an approach to begin."],
];

// Fades a section in when it scrolls into view.
function Reveal({ children }) {
  const ref = useRef(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setShow(true),
      { threshold: 0.15 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${show ? "show" : ""}`}>{children}</div>;
}

export default function Landing({ onStart }) {
  const [q, setQ] = useState(0);

  // Hero cursor effect: store the mouse position as CSS variables.
  // CSS then moves the icons, glow and card from those variables.
  const heroRef = useRef(null);

  function handleMove(e) {
    const el = heroRef.current;
    const r = el.getBoundingClientRect();
    // -1 (left/top edge) to 1 (right/bottom edge)
    el.style.setProperty("--mx", ((e.clientX - r.left) / r.width - 0.5) * 2);
    el.style.setProperty("--my", ((e.clientY - r.top) / r.height - 0.5) * 2);
    // Exact pixel position for the glow
    el.style.setProperty("--gx", `${e.clientX - r.left}px`);
    el.style.setProperty("--gy", `${e.clientY - r.top}px`);
  }

  // Move everything back to the centre when the cursor leaves
  function handleLeave() {
    heroRef.current.style.setProperty("--mx", 0);
    heroRef.current.style.setProperty("--my", 0);
  }

  return (
    <div className="landing">
      {/* Hero */}
      <header className="hero" ref={heroRef} onMouseMove={handleMove} onMouseLeave={handleLeave}>
        <div className="cursor-glow" />
        

        <div className="hero-text">
          <span className="pill">Hacktoberfest Hack Day</span>
          <h2>Your first open-source contribution starts here.</h2>
          <blockquote key={q} className="quote">“{QUOTES[q]}”</blockquote>
          <div className="hero-actions">
            <button className="big-btn" onClick={onStart}>Find my first issue →</button>
            <button className="ghost-btn" onClick={() => setQ((q + 1) % QUOTES.length)}>
              Another quote ↻
            </button>
          </div>
        </div>
        <div className="hero-card">
          <span className="badge diff-easy">Easy</span>
          <h3>Fix typo in installation guide</h3>
          <p className="repo">octo/docs-tool</p>
          <div className="fit-bar wide"><span style={{ width: "92%" }} /></div>
          <small>Fit 92/100 · Matches your Python background</small>
        </div>
      </header>

      {/* Problem */}
      <Reveal>
        <section className="section">
          <h2>Why is starting so hard?</h2>
          <div className="grid3">
            <div className="tile"><h3>😵 Too hard</h3><p>Many "easy" issues need deep project knowledge.</p></div>
            <div className="tile"><h3>🕰️ Out of date</h3><p>Old issues nobody has touched in months.</p></div>
            <div className="tile"><h3>🙋 Already taken</h3><p>Someone said "I'll take this" or opened a PR.</p></div>
          </div>
        </section>
      </Reveal>

      {/* How it works */}
      <Reveal>
        <section className="section" id="how">
          <h2>How it works</h2>
          <div className="steps">
            {STEPS.map(([n, title, text]) => (
              <div className="tile step" key={n}>
                <span className="step-num">{n}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Features */}
      <Reveal>
        <section className="section" id="features">
          <h2>What makes it different</h2>
          <div className="grid3">
            {FEATURES.map(([icon, title, text]) => (
              <div className="tile" key={title}>
                <h3>{icon} {title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Platforms */}
      <Reveal>
        <section className="section" id="platforms">
          <h2>Works across platforms</h2>
          <div className="platform-row">
            {PLATFORMS.map((p) => <span className="pill big" key={p.id}>{p.label}</span>)}
          </div>
        </section>
      </Reveal>

      {/* Final call to action */}
      <Reveal>
        <section className="section cta">
          <h2>Ready for your first pull request?</h2>
          <button className="big-btn" onClick={onStart}>Open the finder →</button>
        </section>
      </Reveal>

      <footer className="footer">Built at Hacktoberfest Hack Day · Open source</footer>
    </div>
  );
}