#!/bin/bash

echo "🧪 Testing Handover Export Webhook Integration"
echo "============================================="
echo ""

# Test payload matching the spec
PAYLOAD='{
  "date_from": "2025-08-01",
  "date_to": "2025-08-24",
  "export_format": "pdf",
  "recipient_email": "engineer@yacht.com",
  "include_sections": [
    "conversations",
    "token_usage",
    "integrations",
    "maintenance_notes"
  ],
  "user_info": {
    "user_id": "test_user_123",
    "display_name": "Test Engineer",
    "export_timestamp": "'$(date -Iseconds)'"
  },
  "metadata": {
    "app_version": "1.4.0",
    "export_reason": "handover",
    "requested_by": "engineer@yacht.com"
  }
}'

echo "📤 Testing Production Webhook:"
echo "URL: https://api.celeste7.ai/webhook/handover-export"
echo ""

# Test production webhook
curl -X POST https://api.celeste7.ai/webhook/handover-export \
  -H "Content-Type: application/json" \
  -H "X-API-Key: celesteos-handover-2024" \
  -d "$PAYLOAD" \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -m 10 \
  2>/dev/null || echo "❌ Production webhook not available"

echo ""
echo "📤 Testing Local Webhook:"
echo "URL: http://localhost:5679/webhook/handover-export"
echo ""

# Test local webhook
curl -X POST http://localhost:5679/webhook/handover-export \
  -H "Content-Type: application/json" \
  -H "X-API-Key: celesteos-handover-2024" \
  -d "$PAYLOAD" \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -m 5 \
  2>/dev/null || echo "❌ Local webhook not available"

echo ""
echo "============================================="
echo "✅ Test Complete"
echo ""
echo "To test in the UI:"
echo "1. Open http://localhost:8083"
echo "2. Login and navigate to Settings"
echo "3. Go to 'Handover' section"
echo "4. Select a date range"
echo "5. Enter your email address"
echo "6. Click 'Export to my email'"