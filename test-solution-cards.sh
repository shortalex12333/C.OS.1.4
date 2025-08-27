#!/bin/bash

# Test solution cards rendering with exact webhook format

echo "🧪 Testing solution cards rendering..."

# Send test data through webhook
curl -X POST http://localhost:8083/api/webhook/test \
  -H "Content-Type: application/json" \
  -d '[
  {
    "index": 0,
    "message": {
      "role": "assistant",
      "content": {
        "confidence_score": 0.19,
        "message": "Testing solution cards display functionality",
        "ai_summary": "3 solutions found for testing",
        "solutions": [
          {
            "solution_id": "test_001",
            "title": "Test Solution Card 1",
            "confidence": 0.85,
            "description": "This is a test solution card to verify rendering",
            "steps": [
              "Step 1: Check if card renders",
              "Step 2: Verify styling matches design",
              "Step 3: Test expand/collapse functionality"
            ],
            "parts_needed": ["Test Part 1", "Test Part 2"],
            "estimated_time": "5 minutes"
          },
          {
            "solution_id": "test_002",
            "title": "Test Solution Card 2",
            "confidence": 0.65,
            "description": "Second test card with medium confidence",
            "steps": [
              "Verify confidence indicator color",
              "Check card layout",
              "Test interaction"
            ],
            "estimated_time": "3 minutes"
          }
        ]
      }
    }
  }
]'

echo "✅ Test data sent - Check browser console for debug logs"