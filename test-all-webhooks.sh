#!/bin/bash

echo "🔍 Testing All Webhook Endpoints Configuration"
echo "============================================="
echo ""

# Base URL for production
PROD_BASE="https://api.celeste7.ai/webhook/"
LOCAL_BASE="http://localhost:5679/webhook/"

# Test endpoints
ENDPOINTS=(
  "user-auth"
  "microsoft-auth"
  "text-chat"
  "handover-export"
  "token-refresh-trigger"
  "documents"
  "yacht-search"
  "email-search"
)

echo "📡 Testing Production Webhooks (${PROD_BASE})"
echo "----------------------------------------------"
for endpoint in "${ENDPOINTS[@]}"; do
  echo -n "• ${endpoint}: "
  response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${PROD_BASE}${endpoint}" \
    -H "Content-Type: application/json" \
    -d '{"test": true}' \
    -m 3 2>/dev/null)
  
  if [ "$response" = "404" ]; then
    echo "❌ Not registered"
  elif [ "$response" = "200" ] || [ "$response" = "201" ]; then
    echo "✅ Active"
  elif [ "$response" = "401" ] || [ "$response" = "403" ]; then
    echo "🔐 Requires auth"
  elif [ "$response" = "400" ]; then
    echo "⚠️  Bad request (endpoint exists)"
  else
    echo "⚠️  Status: $response"
  fi
done

echo ""
echo "🏠 Testing Local Webhooks (${LOCAL_BASE})"
echo "----------------------------------------------"
for endpoint in "${ENDPOINTS[@]}"; do
  echo -n "• ${endpoint}: "
  response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${LOCAL_BASE}${endpoint}" \
    -H "Content-Type: application/json" \
    -d '{"test": true}' \
    -m 2 2>/dev/null)
  
  if [ "$response" = "404" ]; then
    echo "❌ Not registered"
  elif [ "$response" = "200" ] || [ "$response" = "201" ]; then
    echo "✅ Active"
  elif [ "$response" = "401" ] || [ "$response" = "403" ]; then
    echo "🔐 Requires auth"
  elif [ "$response" = "400" ]; then
    echo "⚠️  Bad request (endpoint exists)"
  else
    echo "⚠️  Status: $response"
  fi
done

echo ""
echo "============================================="
echo "✅ Webhook Configuration Test Complete"
echo ""
echo "Note: Webhooks showing '❌ Not registered' need to be"
echo "      activated in the N8N workflow editor."