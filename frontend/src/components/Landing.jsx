import { useEffect, useRef, useState } from "react";
import { PLATFORMS } from "../config";
import ResultCard from "./ResultCard";
import sample from "../sample_response.json";

// Our own lines (not attributed to anyone). They rotate on their own.
const QUOTES = [
  "Every maintainer you admire once opened their very first pull request.",
  "Your first contribution doesn't need to be big. It needs to be yours.",
  "The best way to learn code is to read it, fix it, and share it.",
  "Open source begins the moment someone says: I can help.",
];

// What each part of the example card means
const CALLOUTS = [
  ["Difficulty, with a reason", "Easy, Medium or Stretch, and a sentence on why."],
  ["Repo health", "Active, Slow or Dormant, from recent commits and merged PRs."],
  ["Fit score", "How well the issue matches your skills, out of 100."],
  ["Why this fits you", "Plain-language reasons, not just a number."],
  ["First steps", "Files to read and an approach, so you can start today."],
];

const PROBLEMS = [
  ["Too hard", 'Many "easy" issues need deep project knowledge.'],
  ["Out of date", "Old issues nobody has touched in months."],
  ["Already taken", 'Someone said "I\'ll take this" or opened a PR.'],
];

const STEPS = [
  ["Tell us who you are", "Enter your GitHub username and interests."],
  ["We read your skills", "Your repos and languages become a skill profile."],
  ["We filter the noise", "Taken, stale or already-fixed issues are removed."],
  ["We rank what is left", "Difficulty, repo health and fit, all explained."],
  ["You start today", "Get first steps for each issue."],
];

const FEATURES = [
  ["Personalized", "Matched to your languages and interests."],
  ["Actually open", "Detects claims, open PRs, assignees and stale issues."],
  ["Repo health", "Active, Slow or Dormant, so you pick living projects."],
  ["Real difficulty", "Easy, Medium or Stretch, with a reason."],
  ["Plain language", "Every result explains why it fits you."],
  ["First steps", "Files to read and an approach to begin."],
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

  // Show the next quote every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => setQ((n) => (n + 1) % QUOTES.length), 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="landing">
      {/* Hero: only the headline and the quote, centered */}
      <header className="hero">
        <h2>Your first open-source contribution starts here.</h2>
        <blockquote key={q} className="quote">“{QUOTES[q]}”</blockquote>
      </header>

      {/* Next page: the example issue, elaborated */}
      <Reveal>
        <section className="section example" id="example">
          <span className="eyebrow">What you get</span>
          <h2>One issue, fully explained</h2>
          <div className="example-grid">
            <ResultCard issue={sample.results[0]} defaultOpen />
            <ol className="callouts">
              {CALLOUTS.map(([title, text]) => (
                <li key={title}><strong>{title}</strong>{text}</li>
              ))}
            </ol>
          </div>
        </section>
      </Reveal>

      {/* Problem */}
      <Reveal>
        <section className="section">
          <h2>Why is starting so hard?</h2>
          <div className="grid3">
            {PROBLEMS.map(([title, text]) => (
              <div className="tile" key={title}><h3>{title}</h3><p>{text}</p></div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* How it works */}
      <Reveal>
        <section className="section" id="how">
          <h2>How it works</h2>
          <div className="steps">
            {STEPS.map(([title, text], i) => (
              <div className="tile step" key={title}>
                <span className="index">0{i + 1}</span>
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
            {FEATURES.map(([title, text], i) => (
              <div className="tile" key={title}>
                <span className="index">0{i + 1}</span>
                <h3>{title}</h3>
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