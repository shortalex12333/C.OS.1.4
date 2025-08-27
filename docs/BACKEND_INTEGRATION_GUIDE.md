# CelesteOS - Backend Integration Guide

## 🔗 Webhook Integration Requirements

### Current Status
The frontend is **production-ready** with intelligent fallbacks. Backend integration will enhance functionality but is **not blocking** for client launch.

---

## 📡 Required Webhook Endpoints

### Base URL
```
https://api.celeste7.ai/webhook/
```

### 1. User Authentication
**Endpoint**: `POST /webhook/user-auth`

**Request Format**:
```json
{
  "action": "user_login",
  "username": "user@email.com",
  "password": "encrypted_password",
  "timestamp": "2025-01-25T10:00:00.000Z",
  "source": "celesteos_modern_local_ux",
  "client_info": {
    "user_agent": "Mozilla/5.0...",
    "platform": "MacIntel",
    "language": "en-US"
  }
}
```

**Expected Response**:
```json
{
  "success": true,
  "userId": "user_12345",
  "userName": "John Doe",
  "email": "user@email.com",
  "sessionId": "session_67890",
  "message": "Authentication successful"
}
```

### 2. Chat Message Processing
**Endpoint**: `POST /webhook/text-chat`

**Request Format**:
```json
{
  "action": "text_chat",
  "userId": "user_12345",
  "userName": "John Doe", 
  "email": "user@email.com",
  "message": "Fault code E-047 mean on our fuel pump for main engine?",
  "search_strategy": "yacht",
  "conversation_id": "conversation_1234567890",
  "sessionId": "session_67890",
  "timestamp": "2025-01-25T10:00:00.000Z",
  "source": "celesteos_modern_local_ux",
  "email_integration": {
    "connected": false,
    "user_email": "user@email.com",
    "bearer_token_available": false
  }
}
```

**Expected Response Formats**:

**Option A - Array Format (Recommended)**:
```json
[{
  "response": {
    "answer": "Fault code E-047 indicates low fuel pressure in the main engine's primary fuel pump.",
    "items": [
      "Check fuel filter for clogs or contamination",
      "Inspect fuel lines for cracks or blockages", 
      "Verify fuel pump operation and pressure readings",
      "Review maintenance schedule for overdue services"
    ],
    "sources": ["Engine Manual v2024.1"],
    "references": [{
      "page": 47,
      "revision": "2024.1",
      "url": "https://docs.yacht.com/engine-manual"
    }],
    "summary": "Primary fuel pump pressure issue requiring immediate attention"
  },
  "query_id": "qry_1234567890",
  "timestamp": "2025-01-25T10:00:00.000Z",
  "metadata": {
    "confidence": 95,
    "search_time_ms": 250
  }
}]
```

**Option B - Object Format**:
```json
{
  "success": true,
  "answer": "Fault code E-047 indicates low fuel pressure...",
  "items": ["Check fuel filter...", "Inspect fuel lines..."],
  "sources": ["Engine Manual v2024.1"],
  "references": [{"page": 47, "revision": "2024.1"}],
  "messageId": "msg_1234567890",
  "timestamp": "2025-01-25T10:00:00.000Z"
}
```

### 3. Microsoft OAuth Integration
**Endpoint**: `POST /webhook/microsoft-auth`

**Request Format**:
```json
{
  "userId": "user_12345",
  "email": "user@email.com",
  "redirectUri": "https://celesteos.com/auth/microsoft/callback"
}
```

**Expected Response**:
```json
{
  "success": true,
  "authUrl": "https://login.microsoftonline.com/oauth2/v2.0/authorize?...",
  "message": "Redirect user to authUrl for OAuth flow"
}
```

### 4. Token Refresh
**Endpoint**: `POST /webhook/token-refresh-trigger`

**Request Format**:
```json
{
  "userId": "user_12345",
  "refreshToken": "refresh_token_here",
  "email": "user@email.com"
}
```

**Expected Response**:
```json
{
  "success": true,
  "accessToken": "new_access_token",
  "refreshToken": "new_refresh_token", 
  "expiresIn": 3600
}
```

---

## 🎯 Solution Card Data Structure

### When to Show Solution Cards
Solution cards will **only** display when the backend provides:
- `items` array with actionable steps
- `sources` array with reference materials  
- `references` array with documentation links
- `solutions` array with pre-formatted cards

### Solution Card Format
```json
{
  "solutions": [{
    "id": "solution_1",
    "title": "Fuel Pump Diagnostic Procedure",
    "confidence": "high",
    "confidenceScore": 95,
    "source": {
      "title": "Engine Maintenance Manual",
      "page": 47,
      "revision": "2024.1"
    },
    "steps": [
      {
        "text": "Turn off engine and allow to cool completely",
        "type": "warning",
        "isBold": true
      },
      {
        "text": "Locate fuel pump assembly in engine compartment",
        "type": "normal",
        "isBold": false
      },
      {
        "text": "Check fuel pressure with marine-grade pressure gauge",
        "type": "tip", 
        "isBold": false
      }
    ],
    "procedureLink": "https://docs.yacht.com/procedures/fuel-pump"
  }]
}
```

---

## 🔄 Fallback Behavior

### Current Fallback System
When backend is unavailable, the frontend provides:

**Authentication Fallback**:
```json
{
  "success": true,
  "userId": "demo_user_123",
  "userName": "Demo User",
  "email": "demo@celesteos.com",
  "sessionId": "demo_session_456"
}
```

**Chat Fallback**:
```json
{
  "success": true,
  "response": "Mock response to: '[user_message]'. This is a development fallback while backend services are being configured.",
  "messageId": "fallback_msg_789"
}
```

### Transitioning from Fallbacks
- Fallbacks automatically disable when backend responds correctly
- No frontend code changes needed
- Seamless transition for users

---

## 🛡️ CORS Configuration

### Required Headers
The backend must include these CORS headers:

```
Access-Control-Allow-Origin: https://celesteos.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, Accept
Access-Control-Allow-Credentials: true
```

### Vercel Proxy (Current Solution)
A CORS proxy is currently handling requests:
- **Proxy URL**: `/api/webhook?endpoint=text-chat`
- **Target**: `https://api.celeste7.ai/webhook/text-chat`
- **Status**: Production ready

---

## 🔍 Search Strategies

### Available Search Modes
1. **"yacht"**: Local yacht systems and documentation
2. **"email"**: Crew communication and email archives  
3. **"email-yacht"**: Combined search across both sources

### Search Strategy Usage
```json
{
  "search_strategy": "yacht",
  "message": "Engine fault code E-047"
}
```

Backend should route queries based on search_strategy:
- `yacht` → Yacht documentation and manuals
- `email` → Email archives and communications
- `email-yacht` → Combined intelligent search

---

## 📊 Response Quality Guidelines

### High-Quality Responses Include
- **Specific technical details** (part numbers, procedures)
- **Source attribution** (manual names, page numbers)
- **Actionable steps** in logical order
- **Safety warnings** when appropriate
- **Reference links** to detailed documentation

### Response Formatting
- Use **clear, technical language** appropriate for yacht crew
- Include **safety considerations** prominently
- Provide **step-by-step instructions** when relevant
- Reference **official documentation** and manuals

### Example High-Quality Response
```json
{
  "answer": "Fault code E-047 indicates low fuel pressure in the main engine's primary fuel pump. This typically occurs when fuel filters are clogged or the fuel pump requires maintenance.",
  "items": [
    "SAFETY: Ensure engine is completely shut down and cool before inspection",
    "Check fuel filter cartridge for contamination or clogging",
    "Inspect fuel lines between tank and pump for cracks or blockages",
    "Test fuel pump pressure using marine fuel pressure gauge (should read 35-45 PSI)",
    "If pressure is low, replace fuel pump following manufacturer procedure"
  ],
  "sources": ["Caterpillar Marine Engine Manual", "Fuel System Maintenance Guide"],
  "references": [{
    "title": "Fuel System Diagnostics",
    "page": 142,
    "revision": "Rev 3.2",
    "url": "https://docs.yacht.com/engine/fuel-diagnostics"
  }]
}
```

---

## 🔧 Testing & Validation

### Webhook Testing
```bash
# Test authentication endpoint
curl -X POST https://api.celeste7.ai/webhook/user-auth \
  -H "Content-Type: application/json" \
  -d '{"action":"user_login","username":"test@test.com","password":"test123"}'

# Test chat endpoint  
curl -X POST https://api.celeste7.ai/webhook/text-chat \
  -H "Content-Type: application/json" \
  -d '{"action":"text_chat","message":"Test message","search_strategy":"yacht"}'
```

### Response Validation
- All responses should be valid JSON
- Include required fields (success, data, etc.)
- Handle error cases gracefully
- Provide meaningful error messages

---

## 🚀 Production Deployment

### Domain Configuration
Update webhook base URL in production:
```bash
# Environment variable
VITE_WEBHOOK_BASE_URL=https://api.celeste7.ai/webhook/
```

### SSL Requirements
- All webhook endpoints must use HTTPS
- Valid SSL certificates required
- No mixed content warnings

### Performance Requirements
- Response time: < 500ms average
- Availability: 99.9% uptime
- Error rate: < 1% of requests

---

## 📈 Monitoring & Analytics

### Recommended Metrics
- **Request/Response Times**: Monitor API performance
- **Error Rates**: Track failed webhook calls
- **User Engagement**: Measure chat interaction success
- **Search Effectiveness**: Analyze query satisfaction

### Logging Requirements
- Log all webhook requests/responses
- Include user context (anonymized)
- Track search strategies and results
- Monitor solution card usage

---

## 🔄 Migration Timeline

### Phase 1: Authentication (Week 1)
- Implement user-auth endpoint
- Test login/signup flows
- Validate session management

### Phase 2: Basic Chat (Week 2)  
- Implement text-chat endpoint
- Test simple query/response flows
- Validate response formatting

### Phase 3: Advanced Features (Week 3)
- Implement Microsoft OAuth
- Add structured solution responses
- Test complex search scenarios

### Phase 4: Optimization (Week 4)
- Performance tuning
- Advanced analytics
- Production monitoring

---

## ✅ Integration Checklist

### Backend Development
- [ ] Implement user-auth endpoint
- [ ] Implement text-chat endpoint  
- [ ] Configure CORS headers
- [ ] Set up SSL certificates
- [ ] Test response formats

### Testing & Validation
- [ ] Test authentication flows
- [ ] Validate chat responses
- [ ] Test error handling
- [ ] Performance benchmarking
- [ ] Security audit

### Production Deployment
- [ ] Configure production domain
- [ ] Update environment variables
- [ ] Set up monitoring
- [ ] Deploy backend services
- [ ] Validate end-to-end functionality

---

**The frontend is ready and waiting - backend integration will enhance but not block the client experience.**