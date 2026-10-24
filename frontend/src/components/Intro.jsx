import { useEffect, useRef, useState } from "react";
import Mark from "./Mark";

// Full-screen intro. The CSS animations in App.css play the logo and text.
// After 3.6s this file measures where the navbar logo is and moves the big
// logo there. At 4.65s it calls onDone and the intro disappears.
export default function Intro({ onDone }) {
  const wrapRef = useRef(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const [fly, setFly] = useState(null); // null while playing, then the move to the navbar

  useEffect(() => {
    const flyTimer = setTimeout(() => {
      const target = document.getElementById("nav-logo");
      const wrap = wrapRef.current;
      if (!target || !wrap) return doneRef.current();
      const a = wrap.getBoundingClientRect(); // big logo now
      const b = target.getBoundingClientRect(); // navbar logo spot
      setFly({
        x: b.left + b.width / 2 - (a.left + a.width / 2),
        y: b.top + b.height / 2 - (a.top + a.height / 2),
        s: b.width / a.width,
      });
    }, 3600);
    const doneTimer = setTimeout(() => doneRef.current(), 4650);
    return () => {
      clearTimeout(flyTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  return (
    <div className="intro" onClick={() => onDone()}>
      <div className="intro-bg" style={{ opacity: fly ? 0 : 1 }} />

      <div className="intro-content">
        <div
          ref={wrapRef}
          className={`intro-mark${fly ? " flying" : ""}`}
          style={fly ? { transform: `translate(${fly.x}px, ${fly.y}px) scale(${fly.s})` } : undefined}
        >
          <Mark size="100%" animate small={!!fly} />
        </div>

        {/* Text appears line by line (delays are set in CSS) */}
        <div className="intro-text" style={{ opacity: fly ? 0 : 1 }}>
          <div className="it-title">PatchPilot</div>
          <div className="it-sub">Open-Source Contribution Finder</div>
          <div className="it-pill-row">
            <span className="it-line it-line-l" />
            <span className="it-pill">First PR ready</span>
            <span className="it-line it-line-r" />
          </div>
        </div>
      </div>

      <span className="intro-skip" style={{ opacity: fly ? 0 : undefined }}>Click to skip</span>
    </div>
  );
}