#!/bin/bash

echo "🔍 COMPREHENSIVE SOLUTION CARD VERIFICATION"
echo "==========================================="

# Test with the exact webhook format
echo "📤 Sending test webhook with solution cards..."

curl -X POST http://localhost:8083/api/webhook \
  -H "Content-Type: application/json" \
  -d '[
  {
    "index": 0,
    "message": {
      "role": "assistant",
      "content": {
        "confidence_score": 0.19,
        "message": "Testing comprehensive solution card rendering",
        "ai_summary": "3 manufacturer procedures found",
        "documents_used": [
          {
            "id": "doc_001",
            "source": "Maintenance Manual",
            "type": "manual"
          }
        ],
        "solutions": [
          {
            "solution_id": "sol_001",
            "title": "Check Engine Coolant System",
            "confidence": 0.95,
            "description": "Official procedure from manufacturer manual",
            "steps": [
              "Turn off the engine and let it cool",
              "Check coolant level in reservoir",
              "Inspect for leaks around connections"
            ],
            "parts_needed": ["Coolant fluid", "Pressure tester"],
            "estimated_time": "30 minutes",
            "safety_warnings": ["Ensure engine is cool before opening"],
            "source_document": {
              "id": "doc_001",
              "fault_code": "E-001",
              "equipment": "Engine",
              "manufacturer": "Yanmar",
              "doc_type": "manual",
              "relevance": 0.95
            }
          },
          {
            "solution_id": "sol_002",
            "title": "Diagnostic Scan Procedure",
            "confidence": 0.65,
            "description": "Run full system diagnostics",
            "steps": [
              "Connect diagnostic tool to OBD port",
              "Run complete system scan",
              "Document all error codes"
            ],
            "estimated_time": "15 minutes"
          },
          {
            "solution_id": "sol_003",
            "title": "Manual System Reset",
            "confidence": 0.35,
            "description": "Low confidence fallback option",
            "steps": [
              "Disconnect battery terminals",
              "Wait 30 seconds",
              "Reconnect and test system"
            ],
            "safety_warnings": ["May lose system settings"]
          }
        ],
        "metadata": {
          "search_performed": true,
          "documents_found": 10,
          "manuals_used": 3
        }
      },
      "refusal": null,
      "annotations": []
    },
    "logprobs": null,
    "finish_reason": "stop"
  }
]' 2>/dev/null

echo ""
echo "✅ Test webhook sent!"
echo ""
echo "📋 CHECKLIST - Check browser for:"
echo "  1. ✓ Solution cards should be visible"
echo "  2. ✓ Three cards with different confidence levels (95%, 65%, 35%)"
echo "  3. ✓ Confidence indicators should show as colored circles"
echo "  4. ✓ Cards should be collapsible/expandable"
echo "  5. ✓ Steps should be visible when expanded"
echo "  6. ✓ Safety warnings should display with warning icon"
echo ""
echo "🔍 Console logs to check:"
echo "  - '🎯 OpenAI format detected' with solution count"
echo "  - '🔍 Solutions ready to render' with solution data"
echo "  - '🎨 AISolutionCard rendering' with solutions array"
echo ""
echo "If cards are NOT visible, check browser console for errors!"