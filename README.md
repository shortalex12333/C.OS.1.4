# CELESTE7 Behavioral Intelligence API

A sophisticated behavioral intelligence system that detects patterns in user communication and enhances responses with targeted behavioral interventions.

## 🚀 Features

### Core Capabilities
- **Pattern Detection**: Identifies behavioral patterns like procrastination, perfectionism, imposter syndrome, and more
- **ML-Powered Analysis**: Uses HuggingFace and OpenAI for sentiment analysis and intent classification
- **Response Enhancement**: Enhances AI responses with context-aware behavioral interventions
- **Fallback Systems**: Template-based enhancement when ML services are unavailable
- **Real-time Processing**: Fast pattern detection and response enhancement

### Behavioral Patterns Detected
- **Procrastination**: Delaying tasks or decisions
- **Planning Paralysis**: Overthinking that prevents action
- **Perfectionism**: Unrealistically high standards blocking progress
- **Pricing Anxiety**: Worry about pricing decisions and value perception
- **Decision Fatigue**: Mental exhaustion from too many decisions
- **Imposter Syndrome**: Feeling like a fraud despite competence

## 🏗️ Architecture

```
src/
├── index.js              # Main server entry point
├── routes/               # API route handlers
│   ├── analyze.js        # Pattern detection endpoint
│   ├── enhance.js        # Response enhancement endpoint
│   ├── feedback.js       # User feedback processing
│   ├── patterns.js       # Pattern listing and management
│   └── health.js         # Health check endpoint
├── services/             # Core business logic
│   ├── index.js          # ML service orchestrator
│   ├── PatternDetector.js # Pattern detection engine
│   ├── ResponseEnhancer.js # Response enhancement logic
│   └── LearningEngine.js # Feedback and learning system
└── lib/                  # Utility libraries
    ├── database.js       # Supabase database connection
    ├── cache.js          # LRU cache management
    └── monitoring.js     # Logging and monitoring
```

## 🛠️ Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- HuggingFace account (optional)
- OpenAI account (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/shortalex12333/C.OS.1.1.git
   cd C.OS.1.1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your credentials:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   HUGGINGFACE_TOKEN=your_huggingface_token
   OPENAI_API_KEY=your_openai_api_key
   NODE_ENV=development
   PORT=3000
   SKIP_DB_CHECK=true
   ```

4. **Start the server**
   ```bash
   npm start
   ```

## 📡 API Endpoints

### Analyze Patterns
```bash
POST /api/analyze
Content-Type: application/json

{
  "userId": "user123",
  "message": "I'll work on this tomorrow maybe",
  "context": {
    "businessType": "saas",
    "energyLevel": "low"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "patterns": [
      {
        "name": "procrastination",
        "confidence": 0.45,
        "indicators": ["keyword_match:2", "low_energy_context"],
        "description": "Tendency to delay tasks or decisions",
        "suggestions": [
          "Break the task into smaller pieces",
          "Set a specific deadline",
          "Focus on progress over perfection"
        ]
      }
    ],
    "analysis": {
      "intent": {"primary": "procrastination", "confidence": 0.6},
      "sentiment": {"sentiment": "neutral", "score": 0.5}
    }
  }
}
```

### Enhance Response
```bash
POST /api/enhance
Content-Type: application/json

{
  "userId": "user123",
  "message": "I'll work on this tomorrow maybe",
  "aiResponse": "Sure, you can review your pricing strategy when you have time.",
  "context": {
    "businessType": "saas",
    "energyLevel": "low"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "enhanced": true,
    "response": "⏰ I notice you're putting this off. Sure, you can review your pricing strategy when you have time. What's the smallest step you could take right now?",
    "pattern": {
      "type": "procrastination",
      "confidence": 0.45,
      "suggestions": [...]
    }
  }
}
```

### List Patterns
```bash
GET /api/patterns/list
```

### Health Check
```bash
GET /health
```

## 🔧 Configuration

### Environment Variables
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase API key
- `HUGGINGFACE_TOKEN`: HuggingFace API token (optional)
- `OPENAI_API_KEY`: OpenAI API key (optional)
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 3000)
- `SKIP_DB_CHECK`: Skip database health check (default: false)

### ML Providers
The system supports multiple ML providers with automatic fallback:
- **HuggingFace**: Sentiment analysis and embeddings
- **OpenAI**: Intent classification and response enhancement
- **Replicate**: Alternative LLM for enhancement
- **Fallback**: Template-based pattern detection

## 🧪 Testing

### Manual Testing
```bash
# Test pattern detection
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test123",
    "message": "I need to work on my pricing but I will do it tomorrow maybe",
    "context": {"businessType": "saas", "energyLevel": "low"}
  }'

# Test response enhancement
curl -X POST http://localhost:3000/api/enhance \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test123",
    "message": "I need to work on my pricing but I will do it tomorrow maybe",
    "aiResponse": "Sure, you can review your pricing strategy when you have time.",
    "context": {"businessType": "saas", "energyLevel": "low"}
  }'
```

## 🚀 Deployment

### Docker
```bash
docker build -t celeste7-api .
docker run -p 3000:3000 --env-file .env celeste7-api
```

### Production
1. Set `NODE_ENV=production`
2. Configure proper environment variables
3. Use a process manager like PM2
4. Set up monitoring and logging

## 📊 Monitoring

The API includes comprehensive logging and monitoring:
- Request/response logging with Pino
- Performance metrics
- Error tracking
- API usage analytics
- Circuit breaker patterns for ML services

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API examples

---

**CELESTE7 Behavioral Intelligence API** - Transforming how we understand and respond to human behavior patterns.