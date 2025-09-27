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

@app.route('/api/ai-suggest-caption', methods=['POST'])
def suggest_caption():
    """AI caption suggestion using Alith Agent with Groq backend"""
    try:
        data = request.json
        user_content = data.get('content', '')

        if not user_content:
            return jsonify({'error': 'Content is required'}), 400

        # Content filtering
        inappropriate_keywords = [
    # Adult / explicit content
    'sex', 'sexual', 'nude', 'nudity', 'porn', 'adult', 'xxx', 'erotic',

    # Hate / harassment
    'hate', 'racist', 'discrimination', 'abuse', 'harassment', 
    'genocide', 'ethnic cleansing', 'insurrection', 'armed attack',

    # Political/National targeting
    'overthrow government', 'destroy nation', 'attack party', 
    'eliminate party', 'down with', 'burn flag', 'bomb parliament', 
    'kill president', 'kill prime minister', 'kill leader',
    'threaten government', 'target embassy', 'political assassination'
]

        content_lower = user_content.lower()
        for keyword in inappropriate_keywords:
            if keyword in content_lower:
                return jsonify({
                    'error': 'Content not appropriate for civic reporting. Please focus on community issues.'
                }), 400

        # Create Alith Agent
        agent = create_alith_agent()
        if not agent:
            print("Failed to create Alith Agent - using fallback")
            return jsonify({
                'error': 'AI service unavailable. Please try again later.'
            }), 500

        print(f"Alith Agent created successfully for input: {user_content}")

        # Use Alith Agent for processing
        try:
            # Create structured prompt for Alith Agent
            prompt = f"""Convert this civic complaint to formal format and respond with COMPLETE JSON only:

User complaint: "{user_content}"

Requirements:
- Convert to formal civic complaint language
- Keep caption under 100 characters
- Include 2-4 hashtags with # symbol
- Only for civic issues (roads, water, drainage, lights, etc.)

Respond with this COMPLETE JSON format (ensure closing braces):
{{
    "caption": "formal complaint here",
    "hashtags": ["#tag1", "#tag2", "#tag3"]
}}

IMPORTANT: Make sure your JSON response is COMPLETE with all closing brackets and braces."""

            # Get response from Alith Agent
            response = agent.prompt(prompt)
            print(f"Alith Agent Response: {response}")




            # Parse JSON response
            try:
                # Clean the response and extract JSON
                cleaned_response = response.strip()

                # Try to fix incomplete JSON by adding missing closing brace
                if cleaned_response.startswith('{') and not cleaned_response.endswith('}'):
                    # Check if it looks like incomplete JSON
                    if '"hashtags":' in cleaned_response and cleaned_response.count('[') > cleaned_response.count(']'):
                        # Add missing closing bracket and brace
                        cleaned_response += ']}'
                    elif not cleaned_response.endswith('}'):
                        # Add missing closing brace
                        cleaned_response += '}'

          

                # Clean and format hashtags
                if isinstance(result['hashtags'], list):
                    
                    cleaned_hashtags = []
                    for tag in result['hashtags']:
                        
                        clean_tag = str(tag).strip()
                        # Remove spaces and special characters except alphanumeric
                        clean_tag = re.sub(r'[^a-zA-Z0-9]', '', clean_tag)
                        if clean_tag and not clean_tag.startswith('#'):
                            
                            clean_tag = '#' + clean_tag
                        if clean_tag and len(clean_tag) > 1:
                            
                            cleaned_hashtags.append(clean_tag)
                    result['hashtags'] = cleaned_hashtags

                print(f"Successfully processed with Alith Agent: {result}")
                return jsonify(result)

            except (json.JSONDecodeError, ValueError) as e:
                print(f"Alith JSON parsing error: {e}")
                print(f"Raw Alith response: {response}")

                # Enhanced fallback response
                fallback_caption = f"Civic issue reported: {user_content.strip()}. Immediate attention required."

                # Smart hashtag generation based on content
                hashtags = ["#civicissue", "#community"]
                content_lower = user_content.lower()

                if any(word in content_lower for word in ['road', 'street', 'pothole', 'traffic']):
                    hashtags.append("#infrastructure")
                elif any(word in content_lower for word in ['water', 'drainage', 'flood', 'pipe']):
                    hashtags.append("#watersupply")
                elif any(word in content_lower for word in ['light', 'electricity', 'power']):
                    hashtags.append("#utilities")
                elif any(word in content_lower for word in ['waste', 'garbage', 'trash', 'clean']):
                    hashtags.append("#sanitation")
                else:
                    hashtags.append("#infrastructure")

                fallback_response = {
                    "caption": fallback_caption[:100],
                    "hashtags": hashtags
                }

                print(f"Using Alith fallback response: {fallback_response}")
                return jsonify(fallback_response)

        except Exception as agent_error:
            print(f"Alith Agent error: {agent_error}")
            return jsonify({
                'error': 'AI processing failed. Please try again later.'
            }), 500

    except Exception as e:
        print(f"Endpoint error: {e}")
        return jsonify({
            'error': 'Service temporarily unavailable. Please try again later.'
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'alith-ai-suggestion-api'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)
