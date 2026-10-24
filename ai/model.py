
import json
import ollama

MODEL = "gemma4:e2b"


def generate(prompt: str, json_mode: bool = False) -> str | dict:
    """Send a prompt to Gemma 4 and return its response."""

    options = {}
    if json_mode:
        options["format"] = "json"

    response = ollama.chat(
        model=MODEL,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        **options
    )

    content = response["message"]["content"].strip()

    if json_mode:
        return json.loads(content)

    return content
