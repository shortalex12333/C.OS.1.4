<<<<<<< HEAD
# CELESTE7 - AI-Powered Conversational Oracle

> **Intelligent ChatGPT-style interface with behavioral pattern recognition and personalized interventions**

![Celeste7 Interface](https://images.unsplash.com/photo-1633412802994-5c058f151b66?w=800&h=400&fit=crop&crop=center)

## 🚀 **Project Overview**

Celeste7 is a sophisticated AI conversation platform that replicates ChatGPT Plus functionality while adding advanced behavioral pattern recognition, personalized interventions, and real-time user analytics. Built with React frontend, n8n orchestration, and Oracle API ML backend.

### **🏗 Production Architecture**
```
Frontend → n8n webhook → Oracle API (Vercel) → n8n → Frontend
             ↓               ↓
     (orchestration)   (Real ML behavioral intelligence)
```

### **Key Features**
- 🤖 **ChatGPT-style Interface** - Familiar chat experience with enhanced capabilities
- 🧠 **Oracle API Integration** - ML-powered behavioral analysis using HuggingFace + OpenAI
- 🎯 **Pattern Recognition** - Detects procrastination, perfectionism, pricing anxiety patterns
- 📈 **Enhanced Responses** - AI responses enriched with behavioral interventions
- 👥 **Real-time User Counter** - Live online user tracking
- 🔄 **Session Management** - Secure, unique session handling
- 📊 **Profile Building** - 4-step onboarding for personalized experiences
- 🎨 **Responsive Design** - Beautiful UI with dark/light mode support

---

## 🛠 **Local Development Setup**

### **Prerequisites**
```bash
Node.js >= 18.0.0
Python >= 3.8
yarn (recommended) or npm
```

### **1. Clone Repository**
```bash
git clone https://github.com/shortalex12333/C.OS.1.1.git
cd C.OS.1.1
```

### **2. Frontend Setup**
```bash
cd frontend
yarn install

# Start development server
yarn start

# Start intervention server (separate terminal)
yarn intervention-server
```

### **3. Environment Configuration**
Create `.env` file in frontend directory:
```env
REACT_APP_BACKEND_URL=http://localhost:8001
REACT_APP_ML_API_URL=http://localhost:5000
```

### **4. Backend/ML API Setup**
```bash
cd backend
pip install -r requirements.txt

# Start ML API server
python app.py
```

---

## 📡 **API Endpoints for Frontend Integration**

### **Authentication Endpoints**
```javascript
// Sign Up
POST /webhook/c7/auth/signup
{
  "email": "user@example.com",
  "password": "secure_password",
  "name": "John Doe"
}

// Login
POST /webhook/c7/auth/login
{
  "email": "user@example.com", 
  "password": "secure_password"
}

// Logout
POST /webhook/c7/auth/logout
{
  "token": "jwt_token_here"
}

// Verify Token
POST /webhook/c7/auth/verify-token
{
  "token": "jwt_token_here"
}
```

### **Chat & AI Endpoints**

#### **Analyze User Message (Oracle API Enhanced)**
```javascript
POST /webhook/c7/text-chat

// Request Payload (Enhanced with Oracle API Context)
{
  "userId": "user_uuid",
  "chatId": "1",
  "message": "I need help with productivity",
  "timestamp": 1749715171301,
  "sessionId": "session_user_1749715171301_abc123",
  "user": {
    "email": "user@example.com",
    "displayName": "John Doe"
  },
  "context": {
    "businessType": "saas",           // "saas", "agency", "ecommerce", "consultant", "unknown"
    "messageCount": 5,                // Total messages in this session
    "lastMessageTime": 1749715171301  // For detecting patterns over time
  },
  "intervention_id": "intervention_123" // Optional
}

// Enhanced Response Format (Oracle API)
{
  "success": true,
  "message": "I understand you're looking to improve productivity. Based on your patterns, I notice you might be overthinking your approach...",
  "metadata": {
    "enhanced": true,
    "pattern_detected": "procrastination",
    "confidence": 0.85,
    "intervention_type": "direct_challenge"
  },
  "timestamp": "2025-01-08T12:00:00Z",
  "sessionId": "session_user_1749715171301_abc123"
}

// Legacy Response Format (Fallback)
{
  "success": true,
  "Ai_reply": "Standard AI response without behavioral enhancement...",
  "timestamp": "2025-01-08T12:00:00Z"
}
```

#### **Fetch Conversation History**
```javascript
POST /webhook/c7/fetch-chat

// Request
{
  "userId": "user_uuid",
  "chatId": "1", 
  "sessionId": "session_user_1749715171301_abc123",
  "user": {
    "email": "user@example.com",
    "displayName": "John Doe"
  }
}

// Response
{
  "success": true,
  "output": "Previous conversation content...",
  "timestamp": "2025-01-08T12:00:00Z"
}
```

### **User Analytics Endpoints**

#### **Profile Building**
```javascript
POST /webhook/c7/profile-building

// Stage 1-3: Individual stage data
{
  "userId": "user_uuid",
  "stage": 1,
  "data": {
    "age_range": "23-26"
  }
}

// Stage 4: Complete profile
{
  "userId": "user_uuid",
  "stage": 4,
  "data": {
    "age_range": "23-26",
    "primary_goal": "business_growth",
    "work_style": "entrepreneur", 
    "biggest_challenge": "procrastination"
=======
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

## 🎨 **Frontend Integration**

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

### **API Integration Example**
```javascript
// Send text chat message
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
    }
  }
  
  const response = await fetch('/webhook/c7/text-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  
  const data = await response.json()
  return data.Ai_reply
}
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
