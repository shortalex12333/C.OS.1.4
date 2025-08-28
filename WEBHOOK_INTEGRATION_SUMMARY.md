# Schedule Call Webhook Integration - Complete Implementation

## 🎯 Overview
This implementation provides comprehensive tracking and processing of schedule call requests with user engagement analytics.

## ✅ Frontend Tracking Implementation

### 1. Chat Query Tracking
- **Location**: `src/App.tsx`
- **State**: `chatQueriesCount`
- **Trigger**: Every time user sends a message in main chat
- **Code**: Increments in `handleStartChat()` function

### 2. FAQ Query Tracking  
- **Location**: `src/frontend-ux/components/AskAlexPage.tsx`
- **State**: `faqQueriesCount` (passed from App.tsx)
- **Trigger**: Every time user asks FAQ bot a question
- **Code**: Increments via `onFaqQuery` callback

### 3. Topics Tracking
- **Location**: `src/frontend-ux/components/AskAlexPage.tsx`
- **State**: `topicsAsked` (passed from App.tsx)
- **Trigger**: Every FAQ question is stored as a topic
- **Code**: Appends via `onTopicTracked` callback

## 📡 Webhook Payload Enhancement

The ScheduleCallModal now sends comprehensive data to `https://api.celeste7.ai/webhook/schedule-call`:

```json
{
  "userId": "user-uuid",
  "email": "user@example.com", 
  "displayName": "John Doe",
  "selectedDate": "2024-01-15T00:00:00.000Z",
  "selectedTime": "2:30 PM",
  "dateTimeLocal": "1/15/2024 at 2:30 PM",
  "phone": "+1234567890",
  "yachtSize": "80-120 ft",
  "chatQueriesCount": 5,
  "faqQueriesCount": 3,
  "topics": ["How does CelesteOS work?", "What is the pricing?"],
  "timestamp": "2024-01-15T14:30:00.000Z",
  "timezone": "America/New_York",
  "source": "schedule-call-modal"
}
```

## 🔄 N8N Workflow (`schedule-call-workflow.json`)

### Workflow Structure:
1. **Webhook Trigger** - Receives POST requests
2. **Data Processor** - Cleans and validates incoming data
3. **Dual Processing**:
   - **Outlook Email** - Sends formatted notification email
   - **Supabase Insert** - Stores data in database
4. **Response Handler** - Returns success/error response

### Email Features:
- ✅ Professional HTML template with CelesteOS branding
- ✅ User engagement analytics display
- ✅ Topics discussion summary
- ✅ Scheduling details and next steps
- ✅ High priority email setting

### Error Handling:
- ✅ Data validation and cleanup
- ✅ Graceful error responses
- ✅ Comprehensive logging

## 🗄️ Supabase Database Schema (`supabase-table-setup.sql`)

### Table: `schedule_calls`
```sql
CREATE TABLE schedule_calls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) DEFAULT '',
    email VARCHAR(255) NOT NULL,
    yacht_length INTEGER,
    time VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    chat_queries_count INTEGER DEFAULT 0,
    faq_queries_count INTEGER DEFAULT 0,
    topics JSONB DEFAULT '[]'::jsonb,
    phone VARCHAR(50),
    yacht_size VARCHAR(100),
    user_id UUID REFERENCES auth.users(id),
    timezone VARCHAR(100),
    session_id TEXT,
    source VARCHAR(100)
);
```

### Analytics Features:
- ✅ **Indexes** for performance optimization
- ✅ **RLS Policies** for security
- ✅ **Analytics View** for insights
- ✅ **Engagement Function** for user insights

## 🚀 Installation Instructions

### 1. Import N8N Workflow
```bash
# Copy the JSON content from schedule-call-workflow.json
# Go to n8n → Import → Paste the JSON
# Configure Microsoft Outlook OAuth2 credentials
# Configure Supabase connection details
# Activate the workflow
```

### 2. Setup Supabase Database
```bash
# Run the SQL commands from supabase-table-setup.sql
# In Supabase Dashboard → SQL Editor → Paste and run the commands
```

### 3. Configure Environment
Ensure these are configured in n8n:
- **Microsoft Outlook** OAuth2 connection
- **Supabase** service account connection with table permissions

## 📊 Data Flow

1. **User Interaction** → Frontend tracks queries and topics
2. **Schedule Request** → ScheduleCallModal collects all data
3. **Webhook Call** → Data sent to n8n workflow
4. **Processing** → Data cleaned and validated
5. **Dual Actions**:
   - Email sent to Microsoft Outlook
   - Record stored in Supabase
6. **Response** → Success confirmation sent back

## 🔍 Analytics Capabilities

### User Engagement Insights:
- Total chat interactions
- FAQ questions asked  
- Topics of interest
- Scheduling patterns
- Yacht size preferences

### Query Examples:
```sql
-- Get user engagement insights
SELECT get_user_engagement_insights('user@example.com');

-- Monthly analytics
SELECT * FROM schedule_calls_analytics;

-- Top topics across all users
SELECT topic->>'question' as question, COUNT(*) as frequency
FROM schedule_calls 
CROSS JOIN jsonb_array_elements(topics) AS topic
GROUP BY topic->>'question'
ORDER BY frequency DESC
LIMIT 10;
```

## ✅ Testing Status

- ✅ Frontend tracking implemented and tested
- ✅ Webhook endpoint tested and working
- ✅ Payload structure validated
- ✅ N8N workflow JSON created and verified
- ✅ Supabase schema designed and tested
- ✅ Error handling implemented

## 🎯 Ready for Production

The complete system is now ready for production deployment:

1. **Frontend**: Tracking user interactions ✅
2. **Webhook**: Sending comprehensive data ✅  
3. **N8N**: Processing and routing data ✅
4. **Email**: Professional notifications ✅
5. **Database**: Structured storage with analytics ✅

This integration provides deep insights into user engagement patterns while maintaining a smooth scheduling experience.