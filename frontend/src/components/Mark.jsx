// PatchPilot logo mark: a hexagon-web globe, a </> symbol and an orbiting ring.
// animate = true plays the intro animation (CSS classes in App.css).
// small = true thickens the lines and hides the web so it stays clear at navbar size.

// Build the globe web once: points spread evenly over a sphere (golden-angle
// spiral), each joined to its nearest neighbours. Only the front half is kept.
function buildGlobe() {
  const N = 190, R = 70, C = 100;
  const spin = 0.6, lean = -0.3;
  const cs = Math.cos(spin), sn = Math.sin(spin);
  const cl = Math.cos(lean), sl = Math.sin(lean);

  const pts = [];
  for (let i = 0; i < N; i++) {
    const y = 1 - (2 * (i + 0.5)) / N;
    const r = Math.sqrt(1 - y * y);
    const a = i * Math.PI * (3 - Math.sqrt(5));
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    // rotate to the viewing angle, then flatten onto the drawing
    const x1 = x * cs + z * sn, z1 = -x * sn + z * cs;
    const y2 = y * cl - z1 * sl, z2 = y * sl + z1 * cl;
    pts.push({ x, y, z, sx: C + x1 * R, sy: C + y2 * R, depth: z2, front: z2 > 0 });
  }

  // Join each point to its 5 nearest neighbours (front half only)
  const edges = [];
  const seen = new Set();
  pts.forEach((p, i) => {
    pts
      .map((q, j) => ({ j, d: (p.x - q.x) ** 2 + (p.y - q.y) ** 2 + (p.z - q.z) ** 2 }))
      .filter((o) => o.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 5)
      .forEach(({ j }) => {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!seen.has(key) && p.front && pts[j].front) {
          seen.add(key);
          edges.push([p, pts[j]]);
        }
      });
  });
  return { nodes: pts.filter((p) => p.front), edges };
}

const GLOBE = buildGlobe();

// The ring path starts at the right end and runs through the bottom to the left,
// so drawing it left-to-right "sweeps" across the globe. Both ring and orb use it.
const RING = "M188 100 A88 24 0 0 1 12 100 A88 24 0 0 1 188 100";

export default function Mark({ size = 44, animate = false, small = false }) {
  const cls = `mark${animate ? " mark--anim" : ""}${small ? " mark--small" : ""}`;

  return (
    <svg className={cls} width={size} height={size} viewBox="0 0 200 200" role="img" aria-label="PatchPilot logo">
      {/* 1. The dot the logo starts as */}
      <circle className="m-dot" cx="100" cy="100" r="5" />

      {/* 2. Globe: outline, web lines and nodes */}
      <g className="m-globe">
        <circle className="m-outline" cx="100" cy="100" r="70" />
        <g className="m-web">
          {GLOBE.edges.map(([a, b], i) => (
            <line key={i} x1={a.sx.toFixed(1)} y1={a.sy.toFixed(1)} x2={b.sx.toFixed(1)} y2={b.sy.toFixed(1)} />
          ))}
        </g>
        <g className="m-nodes">
          {GLOBE.nodes.map((p, i) => (
            <circle key={i} cx={p.sx.toFixed(1)} cy={p.sy.toFixed(1)} r={(0.8 + p.depth * 1.1).toFixed(1)} />
          ))}
        </g>
      </g>

      {/* 3. The </> symbol */}
      <g className="m-code">
        <path d="M78 86 L62 100 L78 114" />
        <path d="M107 82 L93 118" />
        <path d="M122 86 L138 100 L122 114" />
      </g>

      {/* 4. Tilted ring with the orb that rides along it */}
      <g transform="rotate(-18 100 100)">
        <path className="m-ring" d={RING} pathLength="1" />
        <circle className="m-orb" cx="0" cy="0" r="8" />
      </g>
    </svg>
  );
}