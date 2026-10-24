
from ai.model import generate


def summarize_profile(repositories: list[dict]) -> dict:
    """Summarize a user's skills and interests from repository evidence."""

    if not repositories:
        return {
            "languages": [],
            "level": "beginner",
            "interests": [],
            "summary": "Not enough repository information to assess this profile."
        }

    prompt = f"""
You are helping beginners find suitable open-source issues.

Analyze the user's GitHub repository information below.
Use only evidence in the supplied data. Do not invent skills,
experience, projects, or interests.

Repository information:
{repositories}

Return a JSON object with exactly these fields:
{{
  "languages": ["language names"],
  "level": "beginner or intermediate",
  "interests": ["specific interests"],
  "summary": "A short, simple description of the user's skills and interests."
}}

Rules:
- Include languages only when supported by the data.
- Choose beginner if experience is limited or unclear.
- Choose intermediate only when the evidence supports it.
- Infer interests from repository names and README content.
- Keep the summary to one or two sentences.
"""

    profile = generate(prompt, json_mode=True)

    required_fields = {"languages", "level", "interests", "summary"}

    if not isinstance(profile, dict) or not required_fields.issubset(profile):
        raise ValueError("Gemma returned an invalid profile structure.")

    if profile["level"] not in ("beginner", "intermediate"):
        raise ValueError("Gemma returned an invalid skill level.")

    if not isinstance(profile["languages"], list):
        raise ValueError("Profile languages must be a list.")

    if not isinstance(profile["interests"], list):
        raise ValueError("Profile interests must be a list.")

    if not isinstance(profile["summary"], str):
        raise ValueError("Profile summary must be text.")

    return {
        "languages": profile["languages"],
        "level": profile["level"],
        "interests": profile["interests"],
        "summary": profile["summary"]
    }
