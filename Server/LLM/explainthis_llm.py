import sys
import json
from dotenv import load_dotenv
import os
from openai import OpenAI

# -------------------------
# Load environment
# -------------------------
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    print(
        json.dumps(
            {
                "type": "explanation",
                "format": "structured",
                "content": {
                    "summary": "LLM configuration error.",
                    "breakdown": [],
                    "key_points": [],
                    "limitations": ["OpenAI API key is not configured."],
                },
            }
        )
    )
    sys.exit(0)

client = OpenAI(api_key=OPENAI_API_KEY)

# -------------------------
# Week-2 System Prompt (LOCKED)
# -------------------------
SYSTEM_PROMPT = """
You are an AI coding explanation engine.

Allowed:
- Explain programming concepts, source code, or coding questions.
- Provide educational, descriptive explanations only.

Guardrails (MANDATORY):
- DO NOT generate code.
- DO NOT modify, optimize, or rewrite code.
- DO NOT simulate execution.
- DO NOT claim security, safety, or performance guarantees.
- DO NOT provide advice outside coding explanations.

If input is NOT coding-related:
- Respond with a structured explanation stating it is out of scope.

You MUST return JSON ONLY in this exact schema:

{
  "type": "explanation",
  "format": "structured",
  "content": {
    "summary": "string",
    "breakdown": ["string"],
    "key_points": ["string"],
    "limitations": ["string"]
  }
}
"""


# -------------------------
# LLM explanation function
# -------------------------
def explain_input(user_input: str) -> dict:
    # --- Debug: show what input was received ---
    print(f"DEBUG_INPUT: {user_input}", file=sys.stderr)

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_input},
            ],
        )

        raw = response.choices[0].message.content.strip()

        # --- Debug: show raw LLM output ---
        print(f"DEBUG_RAW_OUTPUT: {raw}", file=sys.stderr)

        # Force JSON-only output
        parsed = json.loads(raw)

        # Final schema enforcement
        return {
            "type": "explanation",
            "format": "structured",
            "content": {
                "summary": parsed.get("content", {}).get("summary", ""),
                "breakdown": parsed.get("content", {}).get("breakdown", []),
                "key_points": parsed.get("content", {}).get("key_points", []),
                "limitations": parsed.get("content", {}).get(
                    "limitations",
                    [
                        "This explanation does not execute code.",
                        "No security or safety guarantees are made.",
                    ],
                ),
            },
        }

    except Exception as e:
        # --- Debug: show exception ---
        print(f"DEBUG_EXCEPTION: {str(e)}", file=sys.stderr)
        return {
            "type": "explanation",
            "format": "structured",
            "content": {
                "summary": "Unable to generate explanation.",
                "breakdown": [],
                "key_points": [],
                "limitations": [
                    "This explanation does not execute code.",
                    "No security or safety guarantees are made.",
                ],
            },
        }


# -------------------------
# Entry point
# -------------------------
def main():
    user_input = sys.stdin.read()
    result = explain_input(user_input)

    # --- Debug: show final JSON before printing ---
    print(f"DEBUG_FINAL_JSON: {json.dumps(result)}", file=sys.stderr)

    print(json.dumps(result))


if __name__ == "__main__":
    main()
