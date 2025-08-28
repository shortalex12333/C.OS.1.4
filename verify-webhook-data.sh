#!/bin/bash

echo "🧪 Testing Schedule Call Webhook with Complete Data..."
echo "======================================================"
echo ""

# Generate unique test ID
TEST_ID=$(date +%s)
TEST_EMAIL="yacht.captain.$TEST_ID@superyacht.com"

echo "📤 Sending comprehensive test payload..."
echo "   Test ID: $TEST_ID"
echo "   Email: $TEST_EMAIL"
echo ""

# Send comprehensive test data
RESPONSE=$(curl -s -X POST https://api.celeste7.ai/webhook/schedule-call \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -w "\n\n=== HTTP STATUS: %{http_code} ===" \
  -d '{
    "userId": "test-'$TEST_ID'",
    "email": "'$TEST_EMAIL'",
    "displayName": "Captain Alexander Hamilton",
    "firstName": "Alexander",
    "lastName": "Hamilton",
    "selectedDate": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
    "selectedTime": "4:30 PM EST",
    "dateTimeLocal": "'$(date +"%B %d, %Y" | sed "s/\"/\\\\\"/g")' at 4:30 PM EST",
    "date": "'$(date +%Y-%m-%d)'",
    "time": "4:30 PM EST",
    "yachtSize": "150-200 ft",
    "yachtLength": 175,
    "phone": "+1-555-MEGA-'$(date +%H%M)'",
    "chatQueriesCount": 15,
    "faqQueriesCount": 8,
    "topics": [
      "CelesteOS integration with bridge systems",
      "Multi-vessel fleet management features",
      "Crew training and onboarding modules",
      "Real-time weather and navigation data",
      "Maintenance scheduling and tracking",
      "Guest preference management system"
    ],
    "sessionId": "session-'$TEST_ID'",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
    "timezone": "America/New_York",
    "source": "schedule-call-modal"
  }')

echo "$RESPONSE"
echo ""
echo "======================================================"
echo "✅ Test Complete!"
echo ""
echo "📊 VERIFY YOUR DATA:"
echo ""
echo "1. Check n8n Workflow Execution:"
echo "   👉 Your n8n instance dashboard"
echo ""
echo "2. Check Supabase Database:"
echo "   👉 https://supabase.com/dashboard/project/vivovcnaapmcfxxfhzxk/editor/schedule_calls"
echo ""
echo "3. Look for record with email: $TEST_EMAIL"
echo ""
echo "======================================================"

# Now check if data exists in Supabase
echo ""
echo "🔍 Checking Supabase for your test record..."
echo ""

SUPABASE_URL="https://vivovcnaapmcfxxfhzxk.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpdm92Y25hYXBtY2Z4eGZoenhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NjQ5ODIsImV4cCI6MjA3MTQ0MDk4Mn0.eUICOqJRP_MyVMNJNlZu3Mc-1-jAG6nQE-Oy0k3Yr0E"

SUPABASE_CHECK=$(curl -s -X GET "$SUPABASE_URL/rest/v1/schedule_calls?email=eq.$TEST_EMAIL&select=*" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY")

if echo "$SUPABASE_CHECK" | grep -q "$TEST_EMAIL"; then
  echo "✅ SUCCESS! Record found in Supabase!"
  echo ""
  echo "Record details:"
  echo "$SUPABASE_CHECK" | python3 -m json.tool 2>/dev/null || echo "$SUPABASE_CHECK"
else
  echo "⚠️  Record not found in Supabase yet."
  echo "   This could mean:"
  echo "   - The n8n workflow needs to be configured"
  echo "   - There's a delay in processing"
  echo "   - Check your n8n workflow execution logs"
fi

echo ""
echo "======================================================"
echo "Test timestamp: $(date)"