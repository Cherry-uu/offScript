
import json
import sys

from ai.ranker import score_issue


def recommend_batch(payload: dict) -> dict:
    """Generate ranked recommendations for normalized open-source issues."""

    profile_input = payload.get("profile", {})
    issues = payload.get("issues", [])

    profile = {
        "languages": list(dict.fromkeys(
            (profile_input.get("skills") or [])
            + (profile_input.get("preferred_languages") or [])
        )),
        "level": profile_input.get("experience_level", "beginner"),
        "interests": profile_input.get("interests") or [],
        "summary": "",
    }

    recommendations = []

    for issue in issues:
        if not isinstance(issue, dict):
            continue

        issue_id = issue.get("id")

        if not issue_id or not issue.get("title") or not issue.get("url"):
            continue

        try:
            result = score_issue(profile, issue)

            difficulty_map = {
                "Easy": "beginner",
                "Medium": "intermediate",
                "Stretch": "advanced",
            }

            explanation = result["why_fit"]
            if isinstance(explanation, list):
                explanation = " ".join(explanation)

            recommendations.append({
                "issue_id": issue_id,
                "match_score": result["fit_score"],
                "difficulty": difficulty_map[result["difficulty"]],
                "explanation": explanation,
                "required_skills": result["required_skills"],
                "suggested_next_steps": result["suggested_next_steps"],
            })

        except Exception as exc:
            print(
                f"Could not rank issue {issue_id}: {exc}",
                file=sys.stderr,
            )

    recommendations.sort(
        key=lambda item: item["match_score"],
        reverse=True,
    )

    return {"recommendations": recommendations}


if __name__ == "__main__":
    try:
        payload = json.load(sys.stdin)
        print(json.dumps(recommend_batch(payload)))
    except Exception as exc:
        print(f"AI recommendation error: {exc}", file=sys.stderr)
        sys.exit(1)
