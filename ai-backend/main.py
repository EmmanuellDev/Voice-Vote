from flask import Flask, request, jsonify
from flask_cors import CORS
from alith import Agent
import os
import json
import re
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize Alith Agent with Groq backend
def create_alith_agent():
    """Create and configure Alith Agent using Groq backend"""
    try:
        groq_api_key = os.environ.get("GROQ_API_KEY")

        if not groq_api_key:
            print("Groq API key not found. Cannot initialize Alith Agent.")
            return None

        # Create Alith Agent with Groq backend
        agent = Agent(
            model="llama3-8b-8192",
            api_key=groq_api_key,
            base_url="https://api.groq.com/openai/v1",
            preamble="""You are a specialized civic engagement AI assistant for community reporting.

CORE MISSION: Transform informal citizen complaints into professional civic reports.

STRICT REQUIREMENTS:
1. ONLY process civic issues: infrastructure, public services, utilities, safety, maintenance
2. REJECT inappropriate content: violence, sexual content, hate speech, political attacks
3. Generate formal, actionable complaint language
4. Keep responses under 100 characters for captions
5. Provide relevant civic hashtags with # symbol

RESPONSE FORMAT (JSON only):
{
    "caption": "Professional civic complaint description",
    "hashtags": ["#infrastructure", "#publicsafety", "#utilities"]
}

EXAMPLES:
- "drainage problem" → "Drainage system failure causing waterlogging. Immediate repair required."
- "broken streetlight" → "Non-functional street lighting creating safety hazards."
- "water shortage" → "Water supply disruption affecting residents. Restoration needed."

Focus on: Roads, Water, Electricity, Drainage, Waste, Public Transport, Street Lights, Parks, Safety

IMPORTANT: Always respond with valid JSON only. No additional text or explanations."""
        )

        print("Alith Agent initialized successfully with Groq backend")
        return agent

    except Exception as e:
        print(f"Failed to create Alith agent: {e}")
        return None
