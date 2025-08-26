#!/bin/bash

echo "🧪 Testing Supabase Authentication System"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Supabase credentials
SUPABASE_URL="https://vivovcnaapmcfxxfhzxk.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpdm92Y25hYXBtY2Z4eGZoenhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NjQ5ODIsImV4cCI6MjA3MTQ0MDk4Mn0.eUICOqJRP_MyVMNJNlZu3Mc-1-jAG6nQE-Oy0k3Yr0E"

# Test 1: Check Supabase is accessible
echo "1. Testing Supabase connectivity..."
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "${SUPABASE_URL}/rest/v1/")
if [ "$HEALTH_CHECK" -eq 200 ] || [ "$HEALTH_CHECK" -eq 401 ]; then
    echo -e "${GREEN}✅ Supabase is accessible${NC}"
else
    echo -e "${RED}❌ Cannot connect to Supabase (HTTP $HEALTH_CHECK)${NC}"
    exit 1
fi

echo ""
echo "2. Testing authentication with existing user..."
echo "   Email: shortalex@hotmail.co.uk"

# Test login with existing user
LOGIN_RESPONSE=$(curl -s -X POST \
  "${SUPABASE_URL}/auth/v1/token?grant_type=password" \
  -H "apikey: ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "shortalex@hotmail.co.uk",
    "password": "Password1!"
  }')

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    echo -e "${GREEN}✅ Login successful for existing user${NC}"
    ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))" 2>/dev/null || echo "")
    
    if [ -n "$ACCESS_TOKEN" ]; then
        echo -e "${GREEN}   Token received (first 20 chars): ${ACCESS_TOKEN:0:20}...${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Login failed or user doesn't exist yet${NC}"
    echo "   Response: $LOGIN_RESPONSE"
    echo ""
    echo "   Creating user shortalex@hotmail.co.uk..."
    
    # Try to create the user
    SIGNUP_RESPONSE=$(curl -s -X POST \
      "${SUPABASE_URL}/auth/v1/signup" \
      -H "apikey: ${ANON_KEY}" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "shortalex@hotmail.co.uk",
        "password": "Password1!",
        "data": {
          "display_name": "Alex Short"
        }
      }')
    
    if echo "$SIGNUP_RESPONSE" | grep -q "id"; then
        echo -e "${GREEN}✅ User created successfully${NC}"
    else
        echo -e "${RED}❌ Failed to create user${NC}"
        echo "   Response: $SIGNUP_RESPONSE"
    fi
fi

echo ""
echo "3. Testing application endpoints..."

# Check if dev server is running
if curl -s http://localhost:8085 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Development server is running on port 8085${NC}"
else
    echo -e "${YELLOW}⚠️  Development server not accessible on port 8085${NC}"
fi

# Check if production build exists
if [ -f "dist/index.html" ]; then
    echo -e "${GREEN}✅ Production build exists${NC}"
else
    echo -e "${YELLOW}⚠️  No production build found${NC}"
fi

echo ""
echo "4. Environment check..."

# Check .env file
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env file exists${NC}"
    if grep -q "VITE_SUPABASE_URL" .env; then
        echo -e "${GREEN}   ✅ VITE_SUPABASE_URL is configured${NC}"
    else
        echo -e "${RED}   ❌ VITE_SUPABASE_URL is missing${NC}"
    fi
    if grep -q "VITE_SUPABASE_ANON_KEY" .env; then
        echo -e "${GREEN}   ✅ VITE_SUPABASE_ANON_KEY is configured${NC}"
    else
        echo -e "${RED}   ❌ VITE_SUPABASE_ANON_KEY is missing${NC}"
    fi
else
    echo -e "${RED}❌ .env file not found${NC}"
fi

echo ""
echo "5. Testing new user creation..."
echo "   Email: x@alex-short.com"

# Test creating new user
SIGNUP2_RESPONSE=$(curl -s -X POST \
  "${SUPABASE_URL}/auth/v1/signup" \
  -H "apikey: ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "x@alex-short.com",
    "password": "Password1!",
    "data": {
      "display_name": "X User"
    }
  }')

if echo "$SIGNUP2_RESPONSE" | grep -q "id"; then
    echo -e "${GREEN}✅ New user created successfully${NC}"
elif echo "$SIGNUP2_RESPONSE" | grep -q "already registered"; then
    echo -e "${YELLOW}ℹ️  User already exists${NC}"
    
    # Try to login
    LOGIN2_RESPONSE=$(curl -s -X POST \
      "${SUPABASE_URL}/auth/v1/token?grant_type=password" \
      -H "apikey: ${ANON_KEY}" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "x@alex-short.com",
        "password": "Password1!"
      }')
    
    if echo "$LOGIN2_RESPONSE" | grep -q "access_token"; then
        echo -e "${GREEN}   ✅ Login successful for x@alex-short.com${NC}"
    else
        echo -e "${RED}   ❌ Login failed for x@alex-short.com${NC}"
    fi
else
    echo -e "${RED}❌ Failed to create new user${NC}"
    echo "   Response: $SIGNUP2_RESPONSE"
fi

echo ""
echo "========================================="
echo -e "${GREEN}Testing complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:8085 to test the application"
echo "2. Try logging in with:"
echo "   - shortalex@hotmail.co.uk / Password1!"
echo "   - x@alex-short.com / Password1!"
echo "3. Test signup with a new email address"
echo "4. Test logout functionality"
echo "5. Verify session persistence after page refresh"