// One recommended issue. Reads fields straight from the response JSON.
// defaultOpen = true shows the "First steps" section already expanded.
export default function ResultCard({ issue, defaultOpen = false }) {
  // Badge colour classes come from the value, e.g. "badge diff-easy"
  const diffClass = `badge diff-${issue.difficulty.toLowerCase()}`;
  const healthClass = `badge health-${issue.health.label.toLowerCase()}`;

  return (
    <div className="card">
      <div className="card-top">
        <span className="badge platform">{issue.platform}</span>
        <span className="fit">
          Fit {issue.fit_score}/100
          <span className="fit-bar"><span style={{ width: `${issue.fit_score}%` }} /></span>
        </span>
      </div>

      <h3>
        <a href={issue.url} target="_blank" rel="noreferrer">{issue.title}</a>
      </h3>
      <p className="repo">{issue.repo}</p>

      <div className="badges">
        <span className={diffClass}>{issue.difficulty}</span>
        <span className={healthClass}>
          {issue.health.label} ({issue.health.score})
        </span>
      </div>
      <p className="reason">{issue.difficulty_reason}</p>

      <h4>Why this fits you</h4>
      <ul>
        {issue.why_fit.map((reason, i) => (
          <li key={i}>{reason}</li>
        ))}
      </ul>

      {/* <details> gives us expand/collapse with no extra code */}
      <details open={defaultOpen}>
        <summary>First steps</summary>
        <ol>
          {issue.first_steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </details>
    </div>
  );
}