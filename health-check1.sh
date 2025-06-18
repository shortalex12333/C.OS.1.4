#!/bin/bash
# Health check script

API_URL=${API_URL:-"https://api.celeste7.com"}

echo "🏥 Checking Oracle API health..."

# Check main health endpoint
response=$(curl -s -o /dev/null -w "%{http_code}" ${API_URL}/health)

if [ $response -eq 200 ]; then
  echo "✅ API is healthy"
else
  echo "❌ API health check failed with status: $response"
  exit 1
fi

# Check ML providers
echo "🧠 Checking ML providers..."
curl -s ${API_URL}/health | jq '.providers'

# Check database connection
echo "💾 Checking database..."
curl -s ${API_URL}/health | jq '.database'

echo "✅ All health checks passed!"