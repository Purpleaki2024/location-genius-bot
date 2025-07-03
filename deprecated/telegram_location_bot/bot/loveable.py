import os
import requests

def analyze_text(text):
    """Send text to Loveable.dev API for analysis."""
    api_key = os.getenv("LOVEABLE_API_KEY")
    if not api_key:
        raise ValueError("LOVEABLE_API_KEY is not set in the environment variables.")

    url = "https://api.loveable.dev/analyze"
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    payload = {"text": text}

    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}
