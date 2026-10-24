// Friendly labels for each rejection reason (keys match the API contract).
const REASONS = {
  claimed_in_comment: { label: "Claimed in comment", icon: "💬" },
  has_open_pr: { label: "Has open PR", icon: "🔀" },
  assigned: { label: "Already assigned", icon: "👤" },
  stale: { label: "Stale / no recent activity", icon: "💤" },
};

// Collapsible list of issues we filtered out, with WHY.
// This is our key demo moment, so it opens by default.
export default function RejectedPanel({ rejected }) {
  if (!rejected || rejected.length === 0) return null;

  return (
    <details className="rejected" open>
      <summary>
        {rejected.length} issues filtered out (and why)
      </summary>
      <ul>
        {rejected.map((item, i) => {
          // Fall back to the raw reason if we ever get an unknown one
          const r = REASONS[item.reason] || { label: item.reason, icon: "⚠️" };
          return (
            <li key={i}>
              <span className="reject-tag">{r.icon} {r.label}</span>
              <a href={item.url} target="_blank" rel="noreferrer">{item.title}</a>
              <span className="reject-platform">{item.platform}</span>
              <p className="reject-detail">{item.detail}</p>
            </li>
          );
        })}
      </ul>
    </details>
  );
}