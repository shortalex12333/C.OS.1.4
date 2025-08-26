#!/bin/bash

echo "🔧 Verifying Webhook Configuration in Build"
echo "============================================"
echo ""

# Check if the production webhook URL is in the built files
echo "📦 Checking production build for webhook URLs..."
echo ""

# Search for webhook URLs in the built JavaScript
if grep -q "api.celeste7.ai/webhook" dist/assets/*.js 2>/dev/null; then
  echo "✅ Production webhook URL found in build"
  echo "   Base URL: https://api.celeste7.ai/webhook/"
else
  echo "⚠️  Production webhook URL not found in build"
fi

if grep -q "localhost:5679/webhook" dist/assets/*.js 2>/dev/null; then
  echo "✅ Development webhook URL found in build"
  echo "   Base URL: http://localhost:5679/webhook/"
else
  echo "⚠️  Development webhook URL not found in build"
fi

echo ""
echo "📋 Webhook endpoints configured:"
echo "--------------------------------"
echo "• user-auth          - User authentication"
echo "• microsoft-auth     - Microsoft OAuth integration"
echo "• text-chat          - Chat message processing"
echo "• handover-export    - Export handover notes to PDF"
echo "• token-refresh      - Token refresh trigger"
echo "• documents          - Document management"
echo "• yacht-search       - Yacht-specific searches"
echo "• email-search       - Email searches"

echo ""
echo "🌐 Testing authentication flow..."
echo ""

# Test user authentication with production webhook
TEST_PAYLOAD='{
  "email": "test@example.com",
  "password": "test123",
  "displayName": "Test User"
}'

echo "Testing production user-auth endpoint..."
response=$(curl -s -X POST "https://api.celeste7.ai/webhook/user-auth" \
  -H "Content-Type: application/json" \
  -d "$TEST_PAYLOAD" \
  -w "\nStatus: %{http_code}" \
  -m 5 2>/dev/null | tail -1)

if [[ "$response" == *"404"* ]]; then
  echo "❌ User authentication webhook not active in production"
  echo "   Users will not be able to login via production URL"
elif [[ "$response" == *"200"* ]] || [[ "$response" == *"201"* ]]; then
  echo "✅ User authentication webhook is active"
else
  echo "⚠️  User authentication status: $response"
fi

echo ""
echo "============================================"
echo "📝 Summary:"
echo ""
echo "The webhook configuration has been updated to use:"
echo "• Production: https://api.celeste7.ai/webhook/"
echo "• Development: http://localhost:5679/webhook/"
echo ""
echo "⚠️  Important: Authentication will not work until the"
echo "   user-auth webhook is registered in N8N production."
echo ""
echo "To fix authentication:"
echo "1. Open N8N at https://api.celeste7.ai"
echo "2. Activate the user-auth webhook workflow"
echo "3. Ensure it accepts POST requests to /webhook/user-auth"