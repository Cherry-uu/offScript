import { useEffect, useRef } from "react";

// Full-screen night sky. Stars twinkle slowly and shift with the cursor
// (parallax: near stars move more than far ones). Most stars sit along a
// diagonal band to suggest the Milky Way.
export default function Starfield() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let w, h, frame;
    const mouse = { x: 0, y: 0 }; // where the cursor is (-1 to 1)
    const pos = { x: 0, y: 0 };   // smoothed value we actually use

    // Create stars once. x and y are 0..1 so they survive resizing.
    const stars = Array.from({ length: 450 }, (_, i) => {
      const x = Math.random();
      const inBand = i < 300; // first 300 stars follow the band
      const y = inBand
        ? 0.85 - x * 0.7 + (Math.random() + Math.random() + Math.random() - 1.5) * 0.18
        : Math.random();
      return {
        x, y,
        depth: Math.random() * 0.9 + 0.1,  // 0.1 = far, 1 = near
        size: Math.random() * 1.2 + 0.3,
        phase: Math.random() * Math.PI * 2,
        teal: Math.random() < 0.25,
      };
    });

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function onMove(e) {
      mouse.x = (e.clientX / w) * 2 - 1;
      mouse.y = (e.clientY / h) * 2 - 1;
    }

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      // Ease toward the cursor so movement feels smooth
      pos.x += (mouse.x - pos.x) * 0.05;
      pos.y += (mouse.y - pos.y) * 0.05;
      const sway = Math.sin(t * 0.0003) * 0.3; // tiny idle movement

      for (const s of stars) {
        const x = s.x * w - (pos.x + sway) * s.depth * 40;
        const y = s.y * h - pos.y * s.depth * 40;
        const alpha = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 0.0012 + s.phase));
        ctx.fillStyle = s.teal
          ? `rgba(94, 234, 212, ${alpha})`
          : `rgba(226, 240, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, s.size * (0.6 + s.depth * 0.6), 0, Math.PI * 2);
        ctx.fill();
      }
      frame = requestAnimationFrame(draw);
    }

    resize();
    frame = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

    // Inline styles so the sky always covers the whole window,
  // whatever the CSS files say.
  const layer = {
    position: "fixed", inset: 0, zIndex: 0,
    width: "100vw", height: "100vh", pointerEvents: "none",
  };

  return (
    <>
      {/* Milky Way glow: a blurred, tilted band of teal light */}
      <div
        style={{
          ...layer,
          inset: "-20%", width: "140vw", height: "140vh",
          filter: "blur(24px)",
          transform: "rotate(-22deg)",
          background: `
            radial-gradient(ellipse 60% 14% at 50% 50%, rgba(45, 212, 191, 0.2), transparent 70%),
            radial-gradient(ellipse 35% 8% at 35% 56%, rgba(125, 211, 252, 0.14), transparent 70%),
            radial-gradient(ellipse 30% 7% at 68% 44%, rgba(94, 234, 212, 0.12), transparent 70%)`,
        }}
      />
      <canvas ref={canvasRef} style={layer} />
    </>
  );
}