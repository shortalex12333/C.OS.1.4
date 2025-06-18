Install dependencies

bashnpm install

Set up environment variables

bashcp .env.example .env
# Edit .env with your configuration

Start Redis (required for caching)

bashdocker run -d -p 6379:6379 redis:alpine

Run the server

bashnpm run dev

Production Deployment
Option 1: Railway
Show Image
Option 2: Render

Connect your GitHub repository
Set environment variables
Deploy with one click

Option 3: Docker
bash# Build image
docker build -t celeste7-oracle .

# Run container
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  celeste7-oracle
API Endpoints
Pattern Analysis
bashPOST /api/analyze
{
  "userId": "user_123",
  "message": "I'll work on this tomorrow",
  "context": {
    "businessType": "solopreneur",
    "energyLevel": "low"
  }
}
Response Enhancement
bashPOST /api/enhance
{
  "userId": "user_123",
  "message": "I need to plan my strategy",
  "aiResponse": "Here's how to create a strategy...",
  "context": {
    "sessionId": "session_456"
  }
}
Feedback
bashPOST /api/feedback
{
  "userId": "user_123",
  "enhancementId": "enh_789",
  "feedback": {
    "engaged": true,
    "helpful": true,
    "actionTaken": true
  }
}
Architecture
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   n8n       │────▶│  Oracle API │────▶│ ML Providers│
└─────────────┘     └─────────────┘     └─────────────┘
                            │
                            ▼
                    ┌─────────────┐
                    │  Supabase   │
                    └─────────────┘
Performance

Response time: <200ms (p99)
Throughput: 1000+ requests/second
ML inference: <100ms per model
Cache hit rate: >80%

Monitoring

Health check: GET /health
Metrics: Prometheus-compatible at /metrics
Logs: Structured JSON via Pino
Errors: Sentry integration

