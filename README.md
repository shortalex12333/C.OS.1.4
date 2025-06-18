# CELESTE7 - AI-Powered Conversational Oracle

> **Intelligent ChatGPT-style interface with behavioral pattern recognition and personalized interventions**

![Celeste7 Interface](https://images.unsplash.com/photo-1633412802994-5c058f151b66?w=800&h=400&fit=crop&crop=center)

## 🚀 **Project Overview**

Celeste7 is a sophisticated AI conversation platform that replicates ChatGPT Plus functionality while adding advanced behavioral pattern recognition, personalized interventions, and real-time user analytics. Built with React frontend and Python ML backend.

### **Key Features**
- 🤖 **ChatGPT-style Interface** - Familiar chat experience with enhanced capabilities
- 🎯 **Pattern Recognition** - ML-powered behavioral analysis and interventions
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

#### **Analyze User Message**
```javascript
POST /webhook/c7/text-chat

// Request Payload
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
  "intervention_id": "intervention_123" // Optional
}

// Response Format
{
  "success": true,
  "Ai_reply": "I understand you're looking to improve productivity. Here are some strategies...",
  "timestamp": "2025-01-08T12:00:00Z",
  "sessionId": "session_user_1749715171301_abc123"
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
  }
}
```

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
  }
}
```

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
