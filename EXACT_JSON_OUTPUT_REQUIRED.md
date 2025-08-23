# EXACT JSON OUTPUT REQUIRED FROM N8N WEBHOOK

## THIS IS THE EXACT JSON YOUR WEBHOOK MUST RETURN

### SCENARIO 1: Technical Query with Solutions
**User Query:** "fuel pump not working"

**EXACT JSON OUTPUT REQUIRED:**
```json
[
  {
    "response": {
      "success": true,
      "query_id": "8cb696c4-06e8-4290-9950-5dd5eefddd90",
      "message": "I found 3 potential solutions for your fuel pump issue. The most likely cause is a clogged fuel filter, but I've also included electrical and pressure-related diagnostics.",
      "confidence_score": 0.85,
      "solutions": [
        {
          "solution_id": "sol_001",
          "title": "Replace Clogged Fuel Filter",
          "confidence": 0.92,
          "confidence_score": 0.92,
          "source": {
            "title": "Yacht Maintenance Manual",
            "page": 156,
            "revision": "2024.1"
          },
          "steps": [
            {
              "text": "Turn off the engine and allow it to cool for at least 30 minutes",
              "type": "warning",
              "isBold": true
            },
            {
              "text": "Close the fuel supply valve from the tank",
              "type": "warning",
              "isBold": false
            },
            {
              "text": "Place a suitable container under the fuel filter to catch spillage",
              "type": "normal",
              "isBold": false
            },
            {
              "text": "Using two wrenches, hold the filter body and loosen the inlet fitting",
              "type": "normal",
              "isBold": false
            },
            {
              "text": "Remove the outlet fitting and allow fuel to drain",
              "type": "normal",
              "isBold": false
            },
            {
              "text": "Remove the old filter and note the flow direction arrow",
              "type": "tip",
              "isBold": false
            },
            {
              "text": "Install new filter with arrow pointing toward engine",
              "type": "normal",
              "isBold": true
            },
            {
              "text": "Tighten fittings to 25 ft-lbs using torque wrench",
              "type": "normal",
              "isBold": false
            },
            {
              "text": "Open fuel valve and check for leaks before starting engine",
              "type": "warning",
              "isBold": true
            },
            {
              "text": "Prime the fuel system according to engine manufacturer specs",
              "type": "tip",
              "isBold": false
            }
          ],
          "parts_needed": [
            "Fuel Filter Racor 500FG",
            "Replacement O-ring kit #RK500FG",
            "Diesel fuel additive (optional)"
          ],
          "estimated_time": "45 minutes",
          "difficulty": "moderate",
          "safety_warnings": [
            "Ensure adequate ventilation - diesel fumes are harmful",
            "No smoking or open flames in engine room",
            "Wear nitrile gloves - prolonged diesel contact harmful to skin",
            "Have fire extinguisher readily accessible"
          ],
          "tools_required": [
            "17mm and 19mm wrenches",
            "Torque wrench (15-30 ft-lbs range)",
            "Drain pan (minimum 2 gallon capacity)",
            "Shop towels",
            "Safety glasses"
          ],
          "equipment": ["Fuel System", "Primary Filter", "Racor Filter Assembly"],
          "fault_codes": ["P0087", "P0088", "P0093"],
          "procedure_link": "https://manual.yacht.com/procedures/fuel-filter-replacement",
          "tracking_data": {
            "equipment": "fuel pump",
            "system": "fuel",
            "component": "filter",
            "fault_code": "P0087"
          },
          "documents_used": ["Yacht Maintenance Manual v2024.1", "Racor Service Bulletin 2023-14"]
        },
        {
          "solution_id": "sol_002",
          "title": "Test Fuel Pump Electrical Circuit",
          "confidence": 0.78,
          "confidence_score": 0.78,
          "source": {
            "title": "Electrical Diagnostics Manual",
            "page": 89,
            "revision": "2023.4"
          },
          "steps": [
            {
              "text": "Locate fuel pump relay in engine room electrical panel",
              "type": "normal",
              "isBold": false
            },
            {
              "text": "With ignition ON, engine OFF, listen for pump priming (2-3 seconds)",
              "type": "normal",
              "isBold": false
            },
            {
              "text": "Using multimeter, check for 12V at pump connector with key ON",
              "type": "normal",
              "isBold": false
            },
            {
              "text": "If no voltage present, test relay and associated 15A fuse",
              "type": "tip",
              "isBold": true
            },
            {
              "text": "Check pump ground connection for corrosion or looseness",
              "type": "normal",
              "isBold": false
            },
            {
              "text": "Measure pump resistance - should be 0.5-2.0 ohms",
              "type": "normal",
              "isBold": false
            },
            {
              "text": "If pump tests bad, replacement is required",
              "type": "warning",
              "isBold": true
            }
          ],
          "parts_needed": [
            "Fuel pump relay #70987 (if faulty)",
            "15A blade fuse (if blown)",
            "Dielectric grease for connections"
          ],
          "estimated_time": "30 minutes",
          "difficulty": "moderate",
          "safety_warnings": [
            "Disconnect battery negative before working on wiring",
            "Fuel vapors may be present - ensure ventilation"
          ],
          "tools_required": [
            "Digital multimeter",
            "Test light",
            "Wire brush for cleaning connections",
            "Electrical contact cleaner"
          ],
          "equipment": ["Electrical System", "Fuel Pump Circuit"],
          "fault_codes": ["P0230", "P0231", "P0232"],
          "procedure_link": "https://manual.yacht.com/electrical/fuel-pump-diagnosis"
        },
        {
          "solution_id": "sol_003",
          "title": "Check Fuel System Pressure",
          "confidence": 0.65,
          "confidence_score": 0.65,
          "source": {
            "title": "Engine Troubleshooting Guide",
            "page": 234
          },
          "steps": [
            {
              "text": "Install fuel pressure gauge at test port on fuel rail",
              "type": "normal",
              "isBold": false
            },
            {
              "text": "Pressure should be 35-45 PSI at idle for diesel engines",
              "type": "tip",
              "isBold": true
            },
            {
              "text": "If pressure is low, problem is before fuel rail",
              "type": "normal",
              "isBold": false
            },
            {
              "text": "If pressure is high, check return line for blockage",
              "type": "warning",
              "isBold": false
            }
          ],
          "parts_needed": [],
          "estimated_time": "20 minutes",
          "difficulty": "easy",
          "tools_required": [
            "Fuel pressure test kit",
            "Shop towels"
          ],
          "tracking_data": {
            "equipment": "fuel pump",
            "system": "fuel",
            "component": "pressure",
            "fault_code": ""
          }
        }
      ],
      "sources": [
        "Yacht Maintenance Manual v2024.1",
        "Electrical Diagnostics Manual v2023.4",
        "Engine Troubleshooting Guide"
      ],
      "metadata": {
        "query": "fuel pump not working",
        "session_id": "session_ae8321f3-d639-4a2e-97e2-14af1d7a10bd",
        "conversation_id": "conversation_1754982373201",
        "yacht_id": "default_yacht",
        "user_id": "ae8321f3-d639-4a2e-97e2-14af1d7a10bd",
        "intent": "technical_query",
        "entities_found": {
          "equipment": 1,
          "faults": 1,
          "measurements": 0
        },
        "patterns_identified": {
          "equipment": ["fuel pump"],
          "faults": ["not working"]
        },
        "memory_used": {
          "short_term": 1,
          "episodic": 0,
          "pattern_matches": 2,
          "tokens": 450
        },
        "tokens_used": {
          "query": 7,
          "response": 450,
          "ai_summary": 45,
          "memory_loaded": 0
        },
        "search_performed": true,
        "documents_found": 3,
        "processing_time_ms": 3441,
        "awaiting_feedback": true
      }
    }
  }
]
```

---

### SCENARIO 2: Simple Greeting (No Solutions)
**User Query:** "hello"

**EXACT JSON OUTPUT REQUIRED:**
```json
[
  {
    "response": {
      "success": true,
      "query_id": "6d846592-e0a7-4f90-ae84-a3b981f11b5e",
      "message": "Hello! I'm Celeste, your yacht's AI assistant. I can help you with:\n\n• Engine diagnostics and troubleshooting\n• Maintenance procedures and schedules\n• Fault code analysis\n• Parts identification and sourcing\n• Safety protocols and procedures\n\nWhat system would you like assistance with today?",
      "confidence_score": 0.5,
      "solutions": [],
      "sources": [],
      "metadata": {
        "query": "hello",
        "session_id": "session_ae8321f3-d639-4a2e-97e2-14af1d7a10bd",
        "conversation_id": "conversation_1754982362832",
        "yacht_id": "default_yacht",
        "user_id": "ae8321f3-d639-4a2e-97e2-14af1d7a10bd",
        "intent": "greeting",
        "entities_found": {
          "equipment": 0,
          "faults": 0,
          "measurements": 0
        },
        "patterns_identified": {
          "equipment": [],
          "faults": []
        },
        "search_performed": false,
        "documents_found": 0,
        "processing_time_ms": 485,
        "awaiting_feedback": false
      }
    }
  }
]
```

---

### SCENARIO 3: Location Query with Solution
**User Query:** "Where is the main engine kept?"

**EXACT JSON OUTPUT REQUIRED:**
```json
[
  {
    "response": {
      "success": true,
      "query_id": "loc_7584930284_kdj3h4",
      "message": "The main engine is located in the engine room, typically in the aft (rear) section of the yacht below the main deck. Here's a guide to accessing and identifying the main engine location.",
      "confidence_score": 0.95,
      "solutions": [
        {
          "solution_id": "sol_001",
          "title": "Main Engine Location & Access Guide",
          "confidence": 0.95,
          "confidence_score": 0.95,
          "source": {
            "title": "Yacht Layout & Systems Manual",
            "page": 12,
            "revision": "2024.1"
          },
          "steps": [
            {
              "text": "The main engine is located in the ENGINE ROOM",
              "type": "normal",
              "isBold": true
            },
            {
              "text": "Access via main deck hatch near stern or companionway stairs",
              "type": "normal",
              "isBold": false
            },
            {
              "text": "Engine room is typically 2-3 meters below main deck level",
              "type": "tip",
              "isBold": false
            },
            {
              "text": "Ensure engine room ventilation is running before entry",
              "type": "warning",
              "isBold": true
            },
            {
              "text": "Main engine is center-mounted on vibration dampeners",
              "type": "normal",
              "isBold": false
            },
            {
              "text": "Port side: Fuel system and filters",
              "type": "normal",
              "isBold": false
            },
            {
              "text": "Starboard side: Cooling system and sea water intake",
              "type": "normal",
              "isBold": false
            },
            {
              "text": "Forward: Transmission and prop shaft coupling",
              "type": "normal",
              "isBold": false
            },
            {
              "text": "Aft: Exhaust system and muffler",
              "type": "normal",
              "isBold": false
            }
          ],
          "parts_needed": [],
          "estimated_time": "5 minutes to access",
          "difficulty": "easy",
          "safety_warnings": [
            "Never enter engine room with engine running without hearing protection",
            "Check for fuel or oil leaks before entering",
            "Ensure adequate lighting before descending",
            "Have someone on deck aware of your entry"
          ],
          "tools_required": [
            "Flashlight or headlamp",
            "Hearing protection (if engine running)",
            "Non-slip footwear"
          ],
          "equipment": ["Main Engine", "Engine Room", "Propulsion System"],
          "procedure_link": "https://manual.yacht.com/layout/engine-room-access",
          "tracking_data": {
            "equipment": "main engine",
            "system": "propulsion",
            "component": "engine",
            "fault_code": ""
          }
        }
      ],
      "sources": ["Yacht Layout & Systems Manual v2024.1"],
      "metadata": {
        "query": "Where is the main engine kept?",
        "session_id": "session_ae8321f3-d639-4a2e-97e2-14af1d7a10bd",
        "conversation_id": "conversation_1754982373201",
        "yacht_id": "default_yacht",
        "user_id": "ae8321f3-d639-4a2e-97e2-14af1d7a10bd",
        "intent": "location_query",
        "entities_found": {
          "equipment": 1,
          "faults": 0,
          "measurements": 0
        },
        "patterns_identified": {
          "equipment": ["main engine"],
          "faults": []
        },
        "search_performed": true,
        "documents_found": 1,
        "processing_time_ms": 1250,
        "awaiting_feedback": true
      }
    }
  }
]
```

---

## CRITICAL REQUIREMENTS - READ CAREFULLY

### 1. ARRAY WRAPPER
The ENTIRE response must be wrapped in square brackets `[ ]` as an array.

### 2. RESPONSE OBJECT
Inside the array, have ONE object with a `response` property containing all data.

### 3. MANDATORY FIELDS AT RESPONSE LEVEL
Every response MUST have these fields inside `response`:
- `success`: boolean (true/false)
- `query_id`: string (unique identifier)
- `message`: string (human-readable response)
- `confidence_score`: number (0.0 to 1.0)
- `solutions`: array (NEVER null, use empty array `[]` if no solutions)
- `sources`: array (can be empty)
- `metadata`: object (with query details)

### 4. SOLUTION STRUCTURE
Each object in the `solutions` array MUST have:
- `solution_id`: string (like "sol_001", "sol_002")
- `title`: string (clear action title)
- `confidence`: number (0.0 to 1.0)
- `confidence_score`: number (SAME as confidence - duplicate required)

### 5. STEPS STRUCTURE
Each step in the `steps` array MUST be an object with:
```json
{
  "text": "The actual step instruction text",
  "type": "warning" | "tip" | "normal",
  "isBold": true | false
}
```

### 6. SOURCE STRUCTURE (if provided)
```json
{
  "title": "Document Name",
  "page": 123,
  "revision": "2024.1"
}
```

---

## VALIDATION CHECKLIST

Before returning any response, verify:

✅ Response is wrapped in array brackets `[ ]`
✅ Has `response` object inside array
✅ Has `response.success` (boolean)
✅ Has `response.query_id` (string)
✅ Has `response.message` (string)
✅ Has `response.confidence_score` (number)
✅ Has `response.solutions` (array, even if empty)
✅ Each solution has `solution_id` (string)
✅ Each solution has `title` (string)
✅ Each solution has `confidence` AND `confidence_score` (both same number)
✅ Each step is an object with `text`, `type`, and `isBold`
✅ Step types are only: "warning", "tip", or "normal"

---

## WHAT NOT TO DO - COMMON MISTAKES

❌ **WRONG:** Missing array wrapper
```json
{
  "response": { ... }
}
```

❌ **WRONG:** Missing response wrapper
```json
[
  {
    "success": true,
    "solutions": []
  }
]
```

❌ **WRONG:** Solutions as null
```json
{
  "response": {
    "solutions": null
  }
}
```

❌ **WRONG:** Steps as strings
```json
"steps": ["Step 1", "Step 2"]
```

❌ **WRONG:** Missing confidence_score duplicate
```json
{
  "solution_id": "sol_001",
  "confidence": 0.85
  // Missing: "confidence_score": 0.85
}
```

❌ **WRONG:** Using "answer" instead of "message"
```json
{
  "response": {
    "answer": "text"  // Should be "message"
  }
}
```

---

## COPY THIS STRUCTURE EXACTLY

This is the skeleton to use for EVERY response:

```json
[
  {
    "response": {
      "success": true,
      "query_id": "GENERATE_UNIQUE_ID",
      "message": "YOUR_RESPONSE_TEXT",
      "confidence_score": 0.0_TO_1.0,
      "solutions": [
        {
          "solution_id": "sol_001",
          "title": "SOLUTION_TITLE",
          "confidence": 0.0_TO_1.0,
          "confidence_score": 0.0_TO_1.0,
          "source": {
            "title": "DOCUMENT_NAME",
            "page": PAGE_NUMBER,
            "revision": "VERSION"
          },
          "steps": [
            {
              "text": "STEP_TEXT",
              "type": "warning|tip|normal",
              "isBold": true_or_false
            }
          ],
          "parts_needed": [],
          "estimated_time": "TIME_STRING",
          "difficulty": "easy|moderate|difficult",
          "safety_warnings": [],
          "tools_required": [],
          "equipment": [],
          "fault_codes": [],
          "procedure_link": "URL_IF_AVAILABLE",
          "tracking_data": {
            "equipment": "",
            "system": "",
            "component": "",
            "fault_code": ""
          }
        }
      ],
      "sources": [],
      "metadata": {
        "query": "ORIGINAL_USER_QUERY",
        "session_id": "SESSION_ID",
        "conversation_id": "CONVERSATION_ID",
        "yacht_id": "YACHT_ID",
        "user_id": "USER_ID",
        "intent": "technical_query|greeting|general",
        "entities_found": {
          "equipment": 0,
          "faults": 0,
          "measurements": 0
        },
        "patterns_identified": {
          "equipment": [],
          "faults": []
        },
        "search_performed": true_or_false,
        "documents_found": NUMBER,
        "processing_time_ms": NUMBER,
        "awaiting_feedback": true_or_false
      }
    }
  }
]
```

THIS IS THE EXACT FORMAT. COPY IT. USE IT. DO NOT DEVIATE.