
from ai.model import generate


def generate_first_steps(profile: dict, issue: dict) -> list[str]:
    """Generate practical starting steps for an open-source issue."""

    prompt = f"""
You help beginners make their first open-source contribution.

User profile:
{profile}

Issue:
Title: {issue.get("title", "")}
Repository: {issue.get("repo", issue.get("repository", ""))}
Description: {issue.get("body", issue.get("description", ""))}
Language: {issue.get("language", "Unknown")}
Labels: {issue.get("labels", [])}

Return a JSON object with exactly one field:
{{
  "first_steps": [
    "Step one",
    "Step two",
    "Step three"
  ]
}}

Rules:
- Give 3 to 5 concrete, beginner-friendly steps.
- Start with reading the repository's contribution instructions.
- Suggest exploring relevant code and tests before editing.
- Do not invent filenames, functions, or project commands.
- Explain what the user should look for when exact paths are unknown.
- Include testing and contribution steps where appropriate.
- Keep each step short and actionable.
"""

    result = generate(prompt, json_mode=True)

    steps = result.get("first_steps") if isinstance(result, dict) else None

    if (
        not isinstance(steps, list)
        or not 3 <= len(steps) <= 5
        or not all(isinstance(step, str) and step.strip() for step in steps)
    ):
        raise ValueError("Gemma returned invalid first steps.")

    return steps
