
import { API_BASE_URL, USE_MOCK } from "./config";
import sample from "./sample_response.json";

// Translate the original Finder form to the backend API.
export async function fetchRecommendations(query) {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return sample;
  }

  const interests = (query.interests || []).map((item) =>
  item.toLowerCase()
);

const isFrontend = interests.some((item) =>
  ["frontend", "front-end", "web development", "ui", "react"].some(
    (keyword) => item.includes(keyword)
  )
);

const preferredLanguages = isFrontend
  ? ["JavaScript", "TypeScript"]
  : ["Python", "JavaScript"];
  const profile = {
    skills: interests.length ? interests : preferredLanguages,
    preferred_languages: preferredLanguages,
    interests,
    experience_level: "beginner",
  };

  const params = new URLSearchParams({
    language: preferredLanguages[0],
    limit: "10",
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 180000);

  let payload;

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/recommendations?${params.toString()}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
        signal: controller.signal,
      }
    );

    payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        payload.message || `Backend request failed (${response.status}).`
      );
    }
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(
        "Recommendations took too long. Check the backend and AI process, then try again."
      );
    }

    if (error instanceof TypeError) {
      throw new Error(
        "Cannot connect to the backend. Make sure it is running at " +
        API_BASE_URL
      );
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  return {
    profile: {
      languages: preferredLanguages,
      level: profile.experience_level,
      interests,
      summary: `Recommendations for ${query.username || "your profile"}`,
    },
    results: (payload.recommendations || []).map((issue) => ({
      ...issue,
      fit_score: issue.match_score ?? 0,
      difficulty: {
        beginner: "Easy",
        intermediate: "Medium",
        advanced: "Stretch",
      }[issue.difficulty] || "Medium",
      difficulty_reason: issue.explanation || "No explanation provided.",
      why_fit: issue.explanation ? [issue.explanation] : [],
      first_steps: issue.suggested_next_steps || [],
      health: {
        score: issue.availability?.checked ? 100 : 0,
        label:
          issue.availability?.status === "likely_available"
            ? "Likely available"
            : "Unverified",
        signals: {},
      },
    })),
    rejected: [],
  };
}

// Offline sample for raw GitHub comparison.
const RAW_FALLBACK = [
  {
    title: "Update logo",
    url: "https://github.com/octo/site/issues/9",
    repo: "octo/site",
    comments: 4,
    assignee: null,
  },
  {
    title: "Add dark mode",
    url: "https://github.com/octo/app/issues/31",
    repo: "octo/app",
    comments: 7,
    assignee: null,
  },
  {
    title: "Improve README",
    url: "https://github.com/octo/lib/issues/3",
    repo: "octo/lib",
    comments: 0,
    assignee: null,
  },
  {
    title: "Refactor old parser",
    url: "https://github.com/octo/parser/issues/88",
    repo: "octo/parser",
    comments: 12,
    assignee: "someone",
  },
];

export async function fetchGithubRaw(language) {
  const q = `is:issue is:open label:"good first issue"${
    language ? ` language:${language}` : ""
  }`;

  try {
    const res = await fetch(
      `https://api.github.com/search/issues?q=${encodeURIComponent(q)}&per_page=5`
    );

    if (!res.ok) throw new Error("GitHub search failed");

    const json = await res.json();

    const items = json.items.map((issue) => ({
      title: issue.title,
      url: issue.html_url,
      repo: issue.repository_url.replace(
        "https://api.github.com/repos/",
        ""
      ),
      comments: issue.comments,
      assignee: issue.assignee ? issue.assignee.login : null,
    }));

    return { items, live: true };
  } catch {
    return { items: RAW_FALLBACK, live: false };
  }
}
