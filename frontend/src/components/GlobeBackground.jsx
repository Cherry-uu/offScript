import { useEffect, useRef } from "react";

// A rotating globe drawn as a hexagon-like web: points are spread evenly over a
// sphere, and each point is joined to its 6 nearest neighbours.
// The cursor tilts it a little. It sits fixed behind the whole site.
export default function GlobeBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let w, h, frame;
    const mouse = { x: 0, y: 0 }; // cursor position, -1 to 1
    const tilt = { x: 0, y: 0 };  // smoothed version of the cursor

    // 1. Spread N points evenly over a sphere (golden-angle spiral)
    const N = 260;
    const pts = [];
    for (let i = 0; i < N; i++) {
      const y = 1 - (2 * (i + 0.5)) / N;
      const r = Math.sqrt(1 - y * y);
      const a = i * Math.PI * (3 - Math.sqrt(5));
      pts.push({ x: Math.cos(a) * r, y, z: Math.sin(a) * r });
    }

    // 2. Join every point to its 6 nearest neighbours (done once)
    const edges = [];
    const seen = new Set();
    pts.forEach((p, i) => {
      pts
        .map((q, j) => ({ j, d: (p.x - q.x) ** 2 + (p.y - q.y) ** 2 + (p.z - q.z) ** 2 }))
        .filter((o) => o.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 6)
        .forEach(({ j }) => {
          const key = i < j ? `${i}-${j}` : `${j}-${i}`;
          if (!seen.has(key)) {
            seen.add(key);
            edges.push([i, j]);
          }
        });
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
      tilt.x += (mouse.x - tilt.x) * 0.04;
      tilt.y += (mouse.y - tilt.y) * 0.04;

      const R = Math.min(w, h) * 0.44;   // globe radius in pixels
      const cx = w / 2, cy = h / 2;
      const spin = t * 0.00007 + tilt.x * 0.5;  // slow auto-rotation + cursor
      const lean = -0.35 + tilt.y * 0.25;       // axis tilt
      const cs = Math.cos(spin), sn = Math.sin(spin);
      const cl = Math.cos(lean), sl = Math.sin(lean);

      // 3. Rotate every point, then project to the screen
      const p2 = pts.map((p) => {
        const x1 = p.x * cs + p.z * sn;
        const z1 = -p.x * sn + p.z * cs;
        const y2 = p.y * cl - z1 * sl;
        const z2 = p.y * sl + z1 * cl;       // z2 > 0 means facing us
        return { sx: cx + x1 * R, sy: cy + y2 * R, z: z2 };
      });

      // 4. Draw back lines faintly, then front lines a bit brighter
      for (const front of [false, true]) {
        ctx.beginPath();
        for (const [i, j] of edges) {
          if ((p2[i].z + p2[j].z > 0) !== front) continue;
          ctx.moveTo(p2[i].sx, p2[i].sy);
          ctx.lineTo(p2[j].sx, p2[j].sy);
        }
        ctx.strokeStyle = front ? "rgba(45, 212, 191, 0.2)" : "rgba(45, 212, 191, 0.06)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 5. Nodes
      for (const p of p2) {
        ctx.fillStyle = p.z > 0 ? "rgba(153, 246, 228, 0.55)" : "rgba(153, 246, 228, 0.12)";
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, p.z > 0 ? 1.8 : 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Thin outline of the globe
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(45, 212, 191, 0.12)";
      ctx.stroke();

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

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", inset: 0, width: "100vw", height: "100vh",
        zIndex: 0, pointerEvents: "none",
      }}
    />
  );
}