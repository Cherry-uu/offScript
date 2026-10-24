import { useEffect, useState } from "react";
import { fetchGithubRaw } from "../api";

// Side by side: raw GitHub search (left) vs our filtered results (right).
export default function Comparison({ data }) {
  const [raw, setRaw] = useState(null);
  const language = data.profile.languages[0]; // same query basis as our profile

  useEffect(() => {
    fetchGithubRaw(language).then(setRaw);
  }, [language]);

  // Map url -> rejection, so we can flag raw results that we filtered out
  const rejectedByUrl = {};
  data.rejected.forEach((r) => (rejectedByUrl[r.url] = r));

  return (
    <div className="compare-grid">
      <div className="compare-col">
        <h4>GitHub search (raw)</h4>
        <p className="compare-note">No checks for claims, open PRs or stale issues.</p>
        {!raw && <p>Loading...</p>}
        {raw && !raw.live && <p className="compare-note">Offline sample shown.</p>}
        {raw && raw.items.map((item) => {
          const flagged = rejectedByUrl[item.url];
          return (
            <div key={item.url} className="compare-item">
              <a href={item.url} target="_blank" rel="noreferrer">{item.title}</a>
              <span className="compare-repo">{item.repo} · {item.comments} comments</span>
              {flagged && <span className="reject-tag">We'd filter this: {flagged.reason}</span>}
            </div>
          );
        })}
      </div>

      <div className="compare-col ours">
        <h4>Our results</h4>
        <p className="compare-note">Filtered, ranked and explained.</p>
        {data.results.map((issue) => (
          <div key={issue.id} className="compare-item">
            <a href={issue.url} target="_blank" rel="noreferrer">{issue.title}</a>
            <span className="compare-repo">
              {issue.repo} · {issue.difficulty} · Fit {issue.fit_score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}