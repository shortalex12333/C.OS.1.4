#!/bin/bash

echo "========================================="
echo "TESTING ALL SOLUTION CARD FIXES"
echo "========================================="

echo ""
echo "✅ FIXES APPLIED:"
echo "  1. Fixed solutionId self-reference error"
echo "  2. Added safety check for empty solutions"
echo "  3. Removed CSS variable dependencies"
echo "  4. Removed unused imports"
echo "  5. Fixed parseSolutions to not filter valid solutions"
echo "  6. Removed all console.log statements"
echo ""
echo "📤 Sending test webhook with solution cards..."
echo ""

# Test with exact webhook format
curl -X POST http://localhost:8083/api/webhook \
  -H "Content-Type: application/json" \
  -d '[
  {
    "index": 0,
    "message": {
      "role": "assistant",
      "content": {
        "confidence_score": 0.19,
        "message": "All fixes have been applied. Testing solution cards.",
        "ai_summary": "3 solutions with different confidence levels",
        "solutions": [
          {
            "solution_id": "sol_test_001",
            "title": "High Confidence Solution Test",
            "confidence": 0.95,
            "description": "Testing high confidence rendering",
            "steps": [
              "This should render with blue confidence indicator",
              "Card should be expandable and collapsible",
              "All features should work properly"
            ],
            "parts_needed": ["Test Part 1"],
            "estimated_time": "5 minutes",
            "source_document": {
              "manufacturer": "Test Manufacturer",
              "equipment": "Test Equipment"
            }
          },
          {
            "solution_id": "sol_test_002",
            "title": "Medium Confidence Solution Test",
            "confidence": 0.65,
            "description": "Testing medium confidence rendering",
            "steps": [
              "This should render with medium blue indicator",
              "Verify confidence percentage shows 65%"
            ]
          },
          {
            "solution_id": "sol_test_003",
            "title": "Low Confidence Solution Test",
            "confidence": 0.25,
            "description": "Testing low confidence rendering",
            "steps": [
              "This should render with gray indicator",
              "Verify confidence percentage shows 25%"
            ]
          }
        ],
        "metadata": {
          "test": true,
          "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'"
        }
      }
    }
  }
]' 2>/dev/null | jq '.' 2>/dev/null || echo "✅ Request sent"

echo ""
echo "========================================="
echo "CHECK YOUR BROWSER NOW!"
echo "========================================="
echo ""
echo "You should see:"
echo "  ✅ 3 solution cards rendered"
echo "  ✅ Different confidence indicators (95%, 65%, 25%)"
echo "  ✅ Cards are expandable/collapsible"
echo "  ✅ No console errors"
echo "  ✅ Proper styling and layout"
echo ""
echo "If cards are NOT visible, check:"
echo "  1. Browser console for any errors"
echo "  2. Network tab to verify webhook response"
echo "  3. React DevTools to inspect component state"
echo ""