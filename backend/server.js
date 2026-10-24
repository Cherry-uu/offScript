
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { fetchGitHubIssues } = require("./integrations/github");
const { filterEligibleIssues } = require("./utils/issueFilter");
const { validateProfile } = require("./utils/validateProfile");
const { runAiRecommendations } = require("./utils/runAiRecommendations");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to OpenSource Compass API!"
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "OpenSource Compass backend is running"
  });
});


app.get("/api/issues", async (req, res) => {
  try {
    const { platform = "github", language, limit = 20 } = req.query;

    if (platform !== "github") {
      return res.status(400).json({
        success: false,
        message: "Currently supported platform: github"
      });
    }

    const issues = await fetchGitHubIssues({
      language,
      limit
    });

    res.json({
      success: true,
      count: issues.length,
      issues
    });
  } catch (error) {
    console.error("GitHub issue fetch failed:", error.response?.data || error.message);

    res.status(error.response?.status === 403 ? 502 : 500).json({
      success: false,
      message: "Failed to fetch GitHub issues. Please try again."
    });
  }
});


app.get("/api/issues/eligible", async (req, res) => {
  try {
    const { language, limit = 20 } = req.query;

    const issues = await fetchGitHubIssues({ language, limit });
    const eligibleIssues = filterEligibleIssues(issues);

    res.json({
      success: true,
      count: eligibleIssues.length,
      issues: eligibleIssues
    });
  } catch (error) {
    console.error("Eligible issue filtering failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch eligible issues."
    });
  }
});


app.post("/api/recommendations", async (req, res) => {
  try {
    const profile = req.body.profile;

    const validation = validateProfile(profile);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    const { language, limit = 20 } = req.query;

    const issues = await fetchGitHubIssues({ language, limit });
    const eligibleIssues = filterEligibleIssues(issues);
        console.log("Issues fetched:", issues.length);
    console.log("Eligible issues:", eligibleIssues.length);
    console.log(
    "Availability summary:",
    issues.reduce((summary, issue) => {
        const status = issue.availability?.status || "missing";
        summary[status] = (summary[status] || 0) + 1;
        return summary;
    }, {})
    );
    if (eligibleIssues.length === 0) {
      return res.json({
        success: true,
        count: 0,
        recommendations: [],
        message: "No eligible issues found. Try another language or search later."
      });
    }

    // AI integration will be connected here once its export is confirmed.

    const aiResult = await runAiRecommendations({
    profile,
    issues: eligibleIssues
    });

    const issuesById = new Map(
    eligibleIssues.map((issue) => [issue.id, issue])
    );

    const recommendations = aiResult.recommendations
    .filter((item) => issuesById.has(item.issue_id))
    .map((item) => ({
        ...issuesById.get(item.issue_id),
        match_score: item.match_score,
        difficulty: item.difficulty,
        explanation: item.explanation,
        required_skills: item.required_skills,
        suggested_next_steps: item.suggested_next_steps
    }))
    .sort((a, b) => b.match_score - a.match_score);

    return res.json({
    success: true,
    count: recommendations.length,
    recommendations
    });

  } catch (error) {
    console.error("Recommendation request failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to generate recommendations."
    });
  }
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
