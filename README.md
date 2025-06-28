# CelesteOS Chat Interface

Professional ChatGPT-style interface with Redis cache integration, delivering sub-200ms load times and advanced chat features.

## 🚀 Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/celesteos-chat&env=REACT_APP_BACKEND_URL&envDescription=Backend%20API%20URL%20for%20CelesteOS&envLink=https://github.com/your-username/celesteos-chat/blob/main/VERCEL_DEPLOYMENT.md)

## ✨ Features

- 🎨 **Professional UI**: ChatGPT-style interface with dark/light mode
- ⚡ **Redis Cache**: Sub-200ms load times for user data
- 💬 **Advanced Chat**: Message actions (copy, edit, regenerate, stop)
- 🔐 **Authentication**: Secure login with session management
- 📱 **Mobile Ready**: Fully responsive design
- 🎯 **Token Tracking**: Real-time token usage display
- 🧠 **Smart Features**: Typing indicators, markdown rendering
- 📊 **User Profiles**: Cached business metrics and patterns

## 🏗️ Architecture

- **Frontend**: React with Tailwind CSS
- **Cache**: Redis via webhook API
- **Backend**: FastAPI with MongoDB
- **Deployment**: Vercel (frontend) + your backend

## 📦 Deployment Files Created

| File | Purpose |
|------|---------|
| `vercel.json` | Main Vercel configuration |
| `.vercelignore` | Files to exclude from deployment |
| `deploy-vercel.sh` | Automated deployment script |
| `pre-deploy-check.sh` | Pre-deployment validation |
| `app.json` | Heroku deployment config (alternative) |
| `VERCEL_DEPLOYMENT.md` | Detailed deployment guide |
| `README_VERCEL.md` | Complete deployment documentation |

## 🚀 Deployment Options

### Option 1: Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Run pre-deployment checks
./pre-deploy-check.sh

# Deploy
./deploy-vercel.sh
```

### Option 2: Git Integration
1. Push code to GitHub/GitLab/Bitbucket
2. Connect repository to Vercel
3. Auto-deploy on every push

### Option 3: One-Click Deploy
Click the "Deploy with Vercel" button above

## ⚙️ Environment Variables

Set these in Vercel Dashboard:

```bash
REACT_APP_BACKEND_URL=https://api.celeste7.ai
WDS_SOCKET_PORT=443
```

## 🔧 Backend Requirements

Your backend needs CORS configured for Vercel:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-vercel-app.vercel.app",
        "https://your-custom-domain.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 📊 Performance

- **Load Time**: <200ms for cached data
- **Cache Hit Rate**: 80%+ with Redis integration
- **Build Time**: ~2-3 minutes
- **Bundle Size**: Optimized with code splitting

## 🧪 Testing

```bash
# Run pre-deployment checks
./pre-deploy-check.sh

# Test build locally
cd frontend && yarn build

# Test production build
npx serve -s build
```

## 📱 Features Included

### Chat Interface
- ✅ Real-time messaging
- ✅ Message persistence
- ✅ Typing indicators
- ✅ Stop generation
- ✅ Message actions

### User Experience
- ✅ Dark/light mode
- ✅ Mobile responsive
- ✅ Session management
- ✅ Profile dashboard
- ✅ Cache performance monitoring

### Performance
- ✅ Redis cache integration
- ✅ Sub-200ms load times
- ✅ Optimized bundle size
- ✅ CDN delivery via Vercel

## 🎯 Tech Stack

- **React** 19.0.0
- **Tailwind CSS** 3.4.17
- **Framer Motion** 12.16.0
- **React Markdown** 10.1.0
- **Lucide Icons** 0.513.0
- **Axios** 1.8.4

## 📞 Support

For deployment issues:
1. Check `VERCEL_DEPLOYMENT.md`
2. Run `./pre-deploy-check.sh`
3. Verify environment variables
4. Check backend CORS settings

## 🎉 Ready to Deploy!

Your CelesteOS chat interface is production-ready with:
- Complete Vercel configuration
- Automated deployment scripts
- Performance optimizations
- Professional UI/UX
- Redis cache integration

Deploy now and deliver a blazing-fast chat experience! 🚀
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
>>>>>>> e13f8557b60adfdd133448110cc5509092dcaf35
  }
}
```

<<<<<<< HEAD
#### **User Presence Tracking**
```javascript
// Heartbeat (every 30 seconds)
POST /webhook/c7/user-heartbeat
{
  "userId": "user_uuid",
  "sessionId": "session_id", 
  "timestamp": 1749715171301,
  "user": {
    "email": "user@example.com",
    "displayName": "John Doe"
  }
}

// Response
{
  "success": true,
  "onlineUsers": 47
}

// User Offline
POST /webhook/c7/user-offline
{
  "userId": "user_uuid",
  "sessionId": "session_id",
  "timestamp": 1749715171301
}
```

### **Intervention System**

#### **Intervention Delivery**
```javascript
// Frontend API Endpoint (not n8n webhook)
POST http://localhost:3001/api/interventions

{
  "intervention_id": "intervention_123",
  "message": "Low energy detected. 10 pushups now?",
  "priority": 8,
  "final_priority": 83,
  "delivery_timestamp": "2025-01-08T12:56:24.258Z",
  "expected_impact": "high",
  "breakthrough_potential": 7.5,
  "status": "pending"
}
```

---

## 🧠 **Oracle API Integration**

### **What the Oracle API Does:**
- **Pattern Detection**: Identifies behavioral patterns (procrastination, perfectionism, pricing anxiety)
- **ML Analysis**: Uses HuggingFace + OpenAI for real behavioral intelligence
- **Response Enhancement**: Enriches AI responses with personalized interventions
- **Learning System**: Learns from every interaction to improve accuracy

### **Behavioral Patterns Detected:**
- **Procrastination**: "I'll work on pricing tomorrow maybe"
- **Planning Paralysis**: "Need to make another plan for my launch"
- **Perfectionism**: "It's not perfect yet"
- **Pricing Anxiety**: "Not sure what to charge for this"

### **Enhanced Message Flow:**
1. User types message → Frontend sends to n8n webhook
2. n8n calls GPT for base response
3. n8n calls Oracle API for pattern detection
4. Oracle enhances response if pattern detected
5. Enhanced response returns to frontend

### **Pattern Detection UI:**
- **Enhanced Messages**: Purple border indicates Oracle API enhancement
- **Pattern Badges**: Show detected pattern with confidence level
- **Confidence Tooltips**: Hover to see pattern confidence percentage

### **Business Type Detection:**
```javascript
// Automatic detection based on user profile and message content
const businessTypes = {
  "saas": ["saas", "software", "subscription"],
  "agency": ["agency", "client", "marketing"], 
  "ecommerce": ["ecommerce", "product", "store"],
  "consultant": ["consultant", "consulting", "advice"]
}
```

---

## 🎨 **Frontend Integration (Updated)**

### **Key Components**
- **AuthScreen** - Authentication interface
- **OnboardingScreen** - 4-step profile building
- **ChatInterface** - Main conversation UI
- **InterventionSystem** - Pattern-based interventions

### **State Management**
```javascript
// User Session
const user = {
  id: "user_uuid",
  email: "user@example.com", 
  name: "John Doe"
}

// Session ID (unique per session)
const sessionId = sessionStorage.getItem('celeste7_session_id')

// Online Users
const [onlineUserCount, setOnlineUserCount] = useState(1)
```

### **API Integration Example (Oracle Enhanced)**
```javascript
// Send text chat message with Oracle API context
const sendMessage = async (message) => {
  const payload = {
    userId: user.id,
    chatId: activeConversation.id,
    message: message,
    timestamp: Date.now(),
    sessionId: sessionStorage.getItem('celeste7_session_id'),
    user: {
      email: user.email,
      displayName: user.name
    },
    // NEW: Oracle API Context
    context: {
      businessType: detectBusinessType(user, message),
      messageCount: sessionMessageCount + 1,
      lastMessageTime: lastMessageTime
    }
  }
  
  const response = await fetch('/webhook/c7/text-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  
  const data = await response.json()
  
  // Handle Oracle API enhanced responses
  if (data.metadata?.enhanced) {
    console.log('🧠 Pattern detected:', data.metadata.pattern_detected)
    console.log('📊 Confidence:', data.metadata.confidence)
    return data.message // Enhanced response
  }
  
  return data.Ai_reply // Standard response
}

// Pattern Detection UI State
const [patternDetected, setPatternDetected] = useState(null)
const [confidence, setConfidence] = useState(null)
```

---

## 🧠 **ML API Integration**

### **Analyze User Message**
```javascript
POST /api/analyze-message

// Request
{
  "userId": "user_uuid",
  "message": "I keep procrastinating on important tasks",
  "sessionHistory": [...],
  "userProfile": {
    "age_range": "23-26",
    "primary_goal": "business_growth",
    "work_style": "entrepreneur",
    "biggest_challenge": "procrastination"
  }
}

// Response
{
  "analysis": {
    "pattern_detected": "procrastination_cycle",
    "confidence": 0.85,
    "intervention_suggested": true
  },
  "response": {
    "message": "I notice you're struggling with procrastination.",
    "action": "Try the 2-minute rule: start any task for just 2 minutes.",
    "question": "What's the smallest step you could take right now?"
  },
  "intervention": {
    "id": "intervention_123",
    "message": "Break tasks into 2-minute chunks. Start now?",
    "priority": 8,
    "timing": "immediate"
  }
}
```

---

## 🔧 **Development Scripts**

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build", 
    "test": "react-scripts test",
    "intervention-server": "node intervention-server.js"
=======
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
>>>>>>> e13f8557b60adfdd133448110cc5509092dcaf35
  }
}
```

<<<<<<< HEAD
### **Available Commands**
```bash
# Frontend development
yarn start                 # Start React dev server (port 3000)
yarn build                 # Build for production
yarn intervention-server   # Start intervention API (port 3001)

# Testing
yarn test                  # Run test suite
```

---

## 📁 **Project Structure**

```
C.OS.1.1/
├── frontend/
│   ├── src/
│   │   ├── App.js                 # Main app component
│   │   ├── components.js          # All UI components
│   │   ├── hooks/
│   │   │   └── useInterventions.js
│   │   └── interventionServer.js  # Intervention API server
│   ├── public/
│   │   └── intervention-demo.js   # Test utilities
│   ├── package.json
│   └── .env
├── backend/
│   ├── app.py                     # ML API server
│   ├── requirements.txt
│   └── models/
├── tests/
└── README.md
```

---

## 🚀 **Local Testing**

### **Start All Services**
```bash
# Terminal 1: Frontend
cd frontend && yarn start

# Terminal 2: Intervention Server  
cd frontend && yarn intervention-server

# Terminal 3: ML API
cd backend && python app.py
```

### **Test Endpoints**
```bash
# Test intervention delivery
curl -X POST http://localhost:3001/api/interventions \
  -H "Content-Type: application/json" \
  -d '{"message": "Test intervention", "priority": 5}'

# Health check
curl http://localhost:3001/health
```

---

## 🔐 **Security Features**

- **Session Management**: Unique, crypto-secure session IDs
- **CORS Protection**: Configured for secure cross-origin requests
- **Token Validation**: JWT-based authentication
- **Input Sanitization**: Protected against XSS and injection attacks

---

## 📊 **Monitoring & Analytics**

- **Real-time User Tracking**: Online user counter with heartbeat system
- **Session Analytics**: Track user engagement and session duration  
- **Pattern Recognition**: ML-powered behavioral analysis
- **Intervention Metrics**: Track intervention delivery and effectiveness

---

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📝 **License**

This project is proprietary software. All rights reserved.

---

## 🆘 **Support**

For technical support or questions:
- **Email**: support@celeste7.com
- **Documentation**: [Internal Wiki]
- **Issues**: Create GitHub issue for bug reports

---

**Built with ❤️ for intelligent conversations**
=======
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

### Vercel (Recommended)
```bash
# Deploy to Vercel
vercel --prod

# Or connect your GitHub repo to Vercel for automatic deployments
```

### Manual Deployment
1. Set `NODE_ENV=production`
2. Configure proper environment variables
3. Use a process manager like PM2
4. Set up monitoring and logging

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
HUGGINGFACE_TOKEN=your_huggingface_token
OPENAI_API_KEY=your_openai_api_key
SENTRY_DSN=your_sentry_dsn
```

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
# Force Vercel redeploy - Wed Jun 18 12:19:18 BST 2025
>>>>>>> e13f8557b60adfdd133448110cc5509092dcaf35
