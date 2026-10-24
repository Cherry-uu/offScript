
const axios = require("axios");

const GITHUB_API = "https://api.github.com";

const headers = {
  Accept: "application/vnd.github+json",
  ...(process.env.GITHUB_TOKEN
    ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    : {})
};

async function fetchGitHubIssues({ language, limit = 20 } = {}) {
  const query = [
    "is:issue",
    "is:open",
    "no:assignee",
    language ? `language:${language}` : ""
  ]
    .filter(Boolean)
    .join(" ");

  const response = await axios.get(`${GITHUB_API}/search/issues`, {
    params: {
      q: query,
      sort: "updated",
      order: "desc",
      per_page: Math.min(Math.max(Number(limit) || 20, 1), 50)
    },
    headers,
    timeout: 10000
  });

  return Promise.all(
    response.data.items.map(async (issue) => {
      const repo = issue.repository_url.split("/").slice(-2).join("/");
      const issueNumber = issue.number;

      const normalized = {
        id: `${repo}#${issueNumber}`,
        platform: "github",
        title: issue.title,
        body: issue.body || "",
        url: issue.html_url,
        repo,
        language: language || null,
        labels: (issue.labels || []).map((label) => label.name),
        state: issue.state,
        assignee: issue.assignee?.login || null,
        comments: [],
        linked_prs: [],
        last_activity: issue.updated_at,
        availability: {
          status: "unverified",
          reasons: [],
          checked: false
        }
      };

      try {
        // Fetch comments only when comments exist.
        const commentsPromise =
          issue.comments > 0
            ? axios.get(
                `${GITHUB_API}/repos/${repo}/issues/${issueNumber}/comments`,
                {
                  headers,
                  timeout: 8000,
                  params: { per_page: 20 }
                }
              )
            : Promise.resolve({ data: [] });

        // Timeline can reveal cross-referenced pull requests.
        const timelinePromise = axios.get(
          `${GITHUB_API}/repos/${repo}/issues/${issueNumber}/timeline`,
          {
            headers,
            timeout: 8000,
            params: { per_page: 30 }
          }
        );

        const [commentsResponse, timelineResponse] = await Promise.all([
          commentsPromise,
          timelinePromise
        ]);

        normalized.comments = commentsResponse.data.map((comment) => ({
          author: comment.user?.login || "unknown",
          text: comment.body || "",
          created_at: comment.created_at
        }));

        normalized.linked_prs = timelineResponse.data
          .filter(
            (event) =>
              event.event === "cross-referenced" &&
              event.source?.issue?.pull_request
          )
          .map((event) => ({
            url: event.source.issue.html_url,
            state: event.source.issue.state
          }))
          .filter(
            (pr, index, all) =>
              all.findIndex((item) => item.url === pr.url) === index
          );

        const claimPattern =
            /\b(i['’]ll take (this|it)|i am taking this|i['’]m working on this|working on this|claiming this|assigned to me)\b/i;
        const possibleClaim = normalized.comments.some((comment) =>
          claimPattern.test(comment.text)
        );

        const hasOpenPR = normalized.linked_prs.some(
          (pr) => pr.state === "open"
        );

        if (hasOpenPR) {
          normalized.availability.reasons.push(
            "Linked pull request found"
          );
        }

        if (possibleClaim) {
          normalized.availability.reasons.push(
            "Possible claim in comments"
          );
        }

        normalized.availability.status =
          hasOpenPR || possibleClaim
            ? "needs_review"
            : "likely_available";

        normalized.availability.checked = true;
      }  catch (error) {
            console.error(
                `Availability check failed for ${repo}#${issueNumber}:`,
                error.response?.status,
                error.response?.data?.message || error.message
            );

            normalized.availability.status = "unverified";
            normalized.availability.checked = false;
            }

      return normalized;
    })
  );
}

module.exports = { fetchGitHubIssues };
