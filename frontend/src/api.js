import { API_BASE_URL, USE_MOCK } from "./config";
import sample from "./sample_response.json";

// The ONLY place that talks to the backend. Mock now, real API later.
export async function fetchRecommendations({ username, interests, platforms }) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 1200)); // fake delay to see loading state
    return sample;
  }
  const res = await fetch(`${API_BASE_URL}/api/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, interests, platforms }),
  });
  if (!res.ok) throw new Error(`Server error (${res.status})`);
  return res.json();
}
// Offline sample, used if GitHub's search is rate-limited or the wifi is down.
// Two urls match the mock "rejected" list, so the red flags still show in the demo.
const RAW_FALLBACK = [
  { title: "Update logo", url: "https://github.com/octo/site/issues/9", repo: "octo/site", comments: 4, assignee: null },
  { title: "Add dark mode", url: "https://github.com/octo/app/issues/31", repo: "octo/app", comments: 7, assignee: null },
  { title: "Improve README", url: "https://github.com/octo/lib/issues/3", repo: "octo/lib", comments: 0, assignee: null },
  { title: "Refactor old parser", url: "https://github.com/octo/parser/issues/88", repo: "octo/parser", comments: 12, assignee: "someone" },
];

// What a beginner would get searching GitHub by hand (no filtering).
// Returns { items, live } where live=false means we used the offline sample.
export async function fetchGithubRaw(language) {
  const q = `is:issue is:open label:"good first issue"${language ? ` language:${language}` : ""}`;
  try {
    const res = await fetch(
      `https://api.github.com/search/issues?q=${encodeURIComponent(q)}&per_page=5`
    );
    if (!res.ok) throw new Error("GitHub search failed");
    const json = await res.json();
    const items = json.items.map((i) => ({
      title: i.title,
      url: i.html_url,
      repo: i.repository_url.replace("https://api.github.com/repos/", ""),
      comments: i.comments,
      assignee: i.assignee ? i.assignee.login : null,
    }));
    return { items, live: true };
  } catch {
    return { items: RAW_FALLBACK, live: false };
  }
}