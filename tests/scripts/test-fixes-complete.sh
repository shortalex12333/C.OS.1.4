#!/bin/bash

echo "🔧 Testing Tutorial and Color Fixes - Complete Verification"
echo "========================================================="

echo ""
echo "1. Development Server Status:"
if curl -s -m 5 -o /dev/null -w "%{http_code}" "http://localhost:8085" | grep -q "200"; then
    echo "   ✅ Development server running on http://localhost:8085"
else
    echo "   ❌ Development server not responding"
    exit 1
fi

echo ""
echo "2. Testing Tutorial Logic (Frontend):"
echo "   Opening localhost:8085 in browser..."
open "http://localhost:8085"

echo ""
echo "3. Manual Test Checklist:"
echo "   🎯 Tutorial Tests:"
echo "   • Login with shortalex@hotmail.co.uk / Password1!"
echo "   • Check if tutorial appears for existing user"
echo "   • Clear localStorage and login again - tutorial should show"
echo "   • Complete tutorial - should not show again"
echo ""
echo "   🎨 Color Scheme Tests:"
echo "   • Login form: Blue gradient buttons (not purple)"
echo "   • Chat avatars: Both user and AI should be blue (not purple)"  
echo "   • Overall UI: Consistent blue theme throughout"

echo ""
echo "4. Browser Console Checks:"
echo "   Look for these success messages:"
echo "   • '🎓 Triggering tutorial for new user'"
echo "   • '🔄 Synced webhook service with Supabase user'"
echo "   • No color scheme related errors"

echo ""
echo "5. Production Deployment Test:"
echo "   After verifying locally, deploy with:"
echo "   git add -A && git commit -m 'Fix tutorials and restore blue color scheme'"
echo "   VERCEL_TOKEN=qLPxwbSZpnPBtngQOlK2zijg vercel --prod --yes --token qLPxwbSZpnPBtngQOlK2zijg"

echo ""
echo "✅ Test script ready - Please verify the fixes manually in browser"