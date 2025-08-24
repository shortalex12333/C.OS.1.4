#!/bin/bash

# Phase 1: Test webhook with various yacht queries
echo "================================"
echo "Phase 1: Webhook Testing"
echo "================================"
echo ""

# Test different query types to understand response formats
QUERIES=(
  "Show fault code 110-00 solutions"
  "Find hydraulic pump manual"
  "What does Error E-343 mean"
  "generator troubleshooting"
  "stabilizer fault log"
)

echo "Testing ${#QUERIES[@]} different query types..."
echo ""

for query in "${QUERIES[@]}"; do
  echo "Testing: '$query'"
  
  response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"query\":\"$query\",\"userId\":\"phase1-test\"}" \
    "https://api.celeste7.ai/webhook/text-chat-fast")
  
  # Check if we got a response
  if [ $? -eq 0 ]; then
    # Extract key information
    has_response=$(echo "$response" | grep -o '"response"' | head -1)
    has_solutions=$(echo "$response" | grep -o '"solutions"' | head -1)
    has_items=$(echo "$response" | grep -o '"items"' | head -1)
    has_answer=$(echo "$response" | grep -o '"answer"' | head -1)
    
    echo "  ✓ Response received"
    [ -n "$has_response" ] && echo "    - Has 'response' wrapper"
    [ -n "$has_solutions" ] && echo "    - Has 'solutions' array"
    [ -n "$has_items" ] && echo "    - Has 'items' array"
    [ -n "$has_answer" ] && echo "    - Has 'answer' field"
    
    # Save response for analysis
    echo "$response" > "webhook-response-$(echo "$query" | tr ' ' '-' | tr '[:upper:]' '[:lower:]').json"
    
  else
    echo "  ✗ Request failed"
  fi
  
  echo ""
  sleep 1 # Be nice to the API
done

echo "================================"
echo "Responses saved to webhook-response-*.json files"
echo "Check browser console at http://localhost:8087 for detailed logs"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:8087"
echo "2. Send a test message"
echo "3. Check browser console (F12)"
echo "4. Run: window.analyzeWebhookLogs()"
echo "================================"