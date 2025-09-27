# Metis AI Backend

A Flask-based AI backend service for civic engagement and community reporting using Alith Agent with Groq backend.

## Features

- AI-powered caption suggestions for civic issues
- Content filtering for appropriate civic reporting
- Professional complaint formatting
- Hashtag generation for civic categories
- Health check endpoint

## Local Development

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your GROQ_API_KEY
```

3. Run the application:
```bash
python main.py
```

The server will start on `http://localhost:5001`

## API Endpoints

### POST /api/ai-suggest-caption
Generates AI-powered captions and hashtags for civic issues.

**Request Body:**
```json
{
  "content": "broken streetlight on main road"
}
```

**Response:**
```json
{
  "caption": "Non-functional street lighting creating safety hazards.",
  "hashtags": ["#infrastructure", "#publicsafety", "#utilities"]
}
```

### GET /health
Health check endpoint for monitoring.

**Response:**
```json
{
  "status": "healthy",
  "service": "alith-ai-suggestion-api"
}
```

## Deployment on Render.com

This application is configured for deployment on Render.com with the included `render.yaml` configuration.

### Environment Variables Required:
- `GROQ_API_KEY`: Your Groq API key for AI processing

## Dependencies

- Flask 2.3.3
- Flask-CORS 4.0.0
- Groq >= 0.4.1
- python-dotenv 1.0.0
- alith

## Content Filtering

The service includes built-in content filtering to ensure only appropriate civic issues are processed:
- Infrastructure problems
- Public services issues
- Utilities concerns
- Safety matters
- Maintenance requests

Inappropriate content (violence, sexual content, hate speech) is automatically rejected.
