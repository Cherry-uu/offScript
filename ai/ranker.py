
from ai.model import generate


def score_issue(profile: dict, issue: dict) -> dict:
    """Rank an issue and generate contribution guidance in one AI call."""

    prompt = f"""
You help beginners find suitable open-source issues.

USER PROFILE:
{profile}

ISSUE:
ID: {issue.get("id", "")}
Title: {issue.get("title", "")}
Repository: {issue.get("repo", "")}
Description: {issue.get("body", "")}
Language: {issue.get("language") or "Unknown"}
Labels: {issue.get("labels") or "Not provided"}

Evaluate the match using only the supplied evidence.
Do not invent repository facts or claim unverified skills are required.

Return one JSON object with exactly these fields:
{{
  "difficulty": "Easy",
  "difficulty_reason": "Short explanation of estimated difficulty.",
  "fit_score": 75,
  "why_fit": [
    "Evidence-based reason one.",
    "Evidence-based reason two."
  ],
  "required_skills": ["Python"],
  "suggested_next_steps": [
    "Read the repository contribution guide.",
    "Reproduce the issue locally.",
    "Test a small proposed change."
  ]
}}

Rules:
- difficulty must be Easy, Medium, or Stretch.
- fit_score must be an integer from 0 to 100.
- why_fit must contain 2 or 3 concise reasons.
- required_skills must be a list of skills supported by the issue.
- suggested_next_steps must contain 3 to 5 actionable steps.
- Do not invent filenames, commands, or repository structure.
- If information is missing, acknowledge uncertainty.
- A good-first-issue label does not guarantee an easy issue.
- Keep explanations concise and beginner-friendly.
"""

    result = generate(prompt, json_mode=True)

    if not isinstance(result, dict):
        raise ValueError("AI response must be a JSON object.")

    if result.get("difficulty") not in ("Easy", "Medium", "Stretch"):
        raise ValueError("Invalid difficulty.")

    score = result.get("fit_score")
    if (
        not isinstance(score, int)
        or isinstance(score, bool)
        or not 0 <= score <= 100
    ):
        raise ValueError("Fit score must be an integer from 0 to 100.")

    difficulty_reason = result.get("difficulty_reason")
    if not isinstance(difficulty_reason, str) or not difficulty_reason.strip():
        raise ValueError("Invalid or missing difficulty_reason.")

    reasons = result.get("why_fit")
    if not isinstance(reasons, list) or not 2 <= len(reasons) <= 3:
        raise ValueError("Expected 2 or 3 fit explanations.")
    if not all(isinstance(item, str) and item.strip() for item in reasons):
        raise ValueError("Fit explanations must be non-empty strings.")

    skills = result.get("required_skills")
    if not isinstance(skills, list):
        raise ValueError("required_skills must be a list.")
    if not all(isinstance(item, str) and item.strip() for item in skills):
        raise ValueError("Required skills must be non-empty strings.")

    steps = result.get("suggested_next_steps")
    if not isinstance(steps, list) or not 3 <= len(steps) <= 5:
        raise ValueError("Expected 3 to 5 suggested next steps.")
    if not all(isinstance(item, str) and item.strip() for item in steps):
        raise ValueError("Next steps must be non-empty strings.")

    return {
        "difficulty": result["difficulty"],
        "difficulty_reason": difficulty_reason,
        "fit_score": score,
        "why_fit": reasons,
        "required_skills": skills,
        "suggested_next_steps": steps,
    }
