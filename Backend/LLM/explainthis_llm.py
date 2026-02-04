import sys
import json
import time
from collections import defaultdict
from dotenv import load_dotenv
import os
from openai import OpenAI



# Load environment

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


# Week-2 System Prompt (LOCKED)

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


# Limits and rate limiting

MAX_INPUT_CHARS = 2500
MAX_INPUT_LINES = 150
MAX_OUTPUT_TOKENS = 1000
RATE_LIMIT = 5
RATE_WINDOW = 60  # seconds
requests_by_ip = defaultdict(list)


# Static disclaimer

STATIC_DISCLAIMER = [
    "This explanation is for educational purposes only.",
    "This API does not execute code.",
    "No guarantees of correctness, safety, or performance.",
]



# Helper: safe JSON parser

def safe_json_loads(raw):
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {
            "type": "explanation",
            "format": "structured",
            "content": {
                "summary": "Unable to parse LLM output.",
                "breakdown": [],
                "key_points": [],
                "limitations": STATIC_DISCLAIMER.copy(),
            },
        }



# Rate limiting check per client_id (IP)

def rate_limited(client_id: str):
    now = time.time()
    window_start = now - RATE_WINDOW
    requests_by_ip[client_id] = [
        t for t in requests_by_ip[client_id] if t > window_start
    ]
    if len(requests_by_ip[client_id]) >= RATE_LIMIT:
        return True
    requests_by_ip[client_id].append(now)
    return False



# LLM explanation function

def explain_input(user_input: str, client_id="local") -> dict:
    user_input = user_input.strip()
    print(f"DEBUG_INPUT ({client_id}): {user_input}", file=sys.stderr)

    # Rate limit enforcement
    if rate_limited(client_id):
        return {
            "type": "explanation",
            "format": "structured",
            "content": {
                "summary": "Rate limit exceeded.",
                "breakdown": [],
                "key_points": [],
                "limitations": [
                    f"Maximum {RATE_LIMIT} requests per {RATE_WINDOW} seconds."
                ]
                + STATIC_DISCLAIMER,
            },
        }

    # Input validation
    if not user_input:
        return {
            "type": "explanation",
            "format": "structured",
            "content": {
                "summary": "Input rejected.",
                "breakdown": [],
                "key_points": [],
                "limitations": ["Input is empty."] + STATIC_DISCLAIMER,
            },
        }
    if len(user_input) > MAX_INPUT_CHARS:
        return {
            "type": "explanation",
            "format": "structured",
            "content": {
                "summary": "Input rejected.",
                "breakdown": [],
                "key_points": [],
                "limitations": [f"Input exceeds {MAX_INPUT_CHARS} characters."]
                + STATIC_DISCLAIMER,
            },
        }
    if user_input.count("\n") > MAX_INPUT_LINES:
        return {
            "type": "explanation",
            "format": "structured",
            "content": {
                "summary": "Input rejected.",
                "breakdown": [],
                "key_points": [],
                "limitations": [f"Input exceeds {MAX_INPUT_LINES} lines."]
                + STATIC_DISCLAIMER,
            },
        }

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            temperature=0,
            max_tokens=MAX_OUTPUT_TOKENS,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_input},
            ],
        )

        raw = response.choices[0].message.content.strip()
        print(f"DEBUG_RAW_OUTPUT ({client_id}): {raw}", file=sys.stderr)

        parsed = safe_json_loads(raw)

        # Merge static disclaimer without duplicating
        existing_limits = parsed["content"].get("limitations", [])
        for item in STATIC_DISCLAIMER:
            if item not in existing_limits:
                existing_limits.append(item)
        parsed["content"]["limitations"] = existing_limits

        return {
            "type": "explanation",
            "format": "structured",
            "content": {
                "summary": parsed.get("content", {}).get("summary", ""),
                "breakdown": parsed.get("content", {}).get("breakdown", []),
                "key_points": parsed.get("content", {}).get("key_points", []),
                "limitations": parsed.get("content", {}).get("limitations", []),
            },
        }

    except Exception as e:
        print(f"DEBUG_EXCEPTION ({client_id}): {str(e)}", file=sys.stderr)
        return {
            "type": "explanation",
            "format": "structured",
            "content": {
                "summary": "Unable to generate explanation.",
                "breakdown": [],
                "key_points": [],
                "limitations": STATIC_DISCLAIMER.copy(),
            },
        }



# Entry point

def main():
    user_input = sys.stdin.read()
    client_id = os.getenv("CLIENT_ID", "local")  # can be IP or unique user id
    result = explain_input(user_input, client_id)
    print(f"DEBUG_FINAL_JSON ({client_id}): {json.dumps(result)}", file=sys.stderr)
    print(json.dumps(result))


if __name__ == "__main__":
    main()
