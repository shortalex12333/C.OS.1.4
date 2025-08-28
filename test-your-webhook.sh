#!/bin/bash

# Test script to verify your webhook and database integration

echo "🧪 Testing your Schedule Call Webhook..."
echo ""

# Send test data to your webhook
curl -X POST https://api.celeste7.ai/webhook/schedule-call \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "userId": "test-user-001",
    "email": "captain@superyacht.com",
    "displayName": "Captain Smith",
    "firstName": "John",
    "lastName": "Smith",
    "selectedDate": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
    "selectedTime": "2:30 PM",
    "dateTimeLocal": "'$(date +"%m/%d/%Y")' at 2:30 PM",
    "phone": "+1-555-YACHT-01",
    "yachtSize": "80-120 ft",
    "yachtLength": 100,
    "chatQueriesCount": 8,
    "faqQueriesCount": 5,
    "topics": [
      "How does CelesteOS handle offline mode?",
      "What is the pricing structure?",
      "Can it integrate with our existing systems?"
    ],
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
    "timezone": "America/New_York",
    "source": "schedule-call-modal"
  }'

echo ""
echo ""
echo "✅ Webhook test sent!"
echo ""
echo "Now check your Supabase dashboard to see if the data was stored:"
echo "👉 https://supabase.com/dashboard/project/vivovcnaapmcfxxfhzxk/editor/schedule_calls"
echo ""
echo "You should see a new row with Captain Smith's booking!"