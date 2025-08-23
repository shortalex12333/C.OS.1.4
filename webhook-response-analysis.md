# Webhook Response Analysis

## Query: "Where is the main engine kept?"

## Current Response Structure:
```json
{
  "success": true,
  "query_id": "qry_1755972232423_yrajqgi",
  "conversation_id": "conv_1755972232423",
  "response": {
    "items": ["001-043-140: Mounting Bracket for 19inch MFD"],
    "sources": ["Verified Parts Database"],
    "references": ["001-043-140"],
    "summary": "Found 1 relevant parts with documentation",
    "answer": "📦 **Found 1 Maritime Parts**..."
  },
  "metadata": {
    "search_strategy": "equipment_diagnosis",
    "confidence": 0.9,
    "parts_found": 1,
    "intent_type": "technical_query",
    "detected": {
      "fault_codes": [],
      "equipment": ["main engine"],
      "parts": [],
      "symptoms": []
    }
  },
  "metrics": {
    "processing_time_ms": 1957
  }
}
```

## ❌ MISSING for Solution Cards:

### Required Fields NOT Present:
1. **`response.solutions[]` array** - This is the main issue!
2. **`response.confidence_score`** at response level
3. **`response.message`** (has `answer` instead)
4. **`response.success`** flag

### Solution Card Structure Needed:
```json
{
  "response": {
    "success": true,
    "message": "Found solutions for main engine location",
    "confidence_score": 0.9,
    "solutions": [
      {
        "solution_id": "sol_001",
        "title": "Main Engine Location Guide",
        "confidence": 0.9,
        "steps": [
          "Step 1: Access engine room",
          "Step 2: Main engine is center-mounted"
        ],
        "parts_needed": ["001-043-140"],
        "estimated_time": "N/A",
        "safety_warnings": ["Ensure engine is off"],
        "tools_required": [],
        "tracking_data": {
          "equipment": "main engine",
          "system": "propulsion",
          "component": "engine",
          "fault_code": ""
        }
      }
    ]
  }
}
```

## Current Format vs Required Format:

| Field | Current Response | Required for Cards |
|-------|-----------------|-------------------|
| Structure | Flat response | Nested `response.solutions[]` |
| Solutions | Missing | Array of solution objects |
| Confidence | In metadata (0.9) | In each solution |
| Steps | Missing | Array in each solution |
| Parts | In items/references | `parts_needed` in solution |
| Title | Missing | Required for each card |
| Safety | Missing | `safety_warnings` array |
| Tools | Missing | `tools_required` array |
| Time | Missing | `estimated_time` string |

## Summary:
The current webhook response does NOT contain the `solutions[]` array structure needed for solution cards. It's returning parts/documentation info but not in the solution card format.