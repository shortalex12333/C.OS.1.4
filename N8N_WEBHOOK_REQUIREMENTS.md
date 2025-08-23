# N8N Webhook Response Format Requirements for Yacht AI Solution Cards

## Critical Requirement: Update the `/webhook/text-chat-fast` Response Structure

### Current Problem
The webhook is currently returning a format that our frontend cannot parse into solution cards. We need to restructure the response to match our frontend's expectations EXACTLY.

---

## REQUIRED JSON STRUCTURE (MUST MATCH EXACTLY)

The webhook MUST return responses in ONE of these two formats:

### Format 1: When Solutions Are Found (Technical Queries)
```json
{
  "response": {
    "success": true,
    "query_id": "unique-query-id-here",
    "message": "Clear explanation of what was found or the issue being addressed",
    "confidence_score": 0.85,
    "solutions": [
      {
        "solution_id": "sol_001",
        "title": "Replace Fuel Filter",
        "confidence": 0.92,
        "confidence_score": 0.92,
        "source": {
          "title": "Yacht Maintenance Manual",
          "page": 47,
          "revision": "2024.1"
        },
        "steps": [
          {
            "text": "Turn off the engine and allow it to cool completely",
            "type": "warning",
            "isBold": true
          },
          {
            "text": "Locate the fuel filter near the engine compartment",
            "type": "normal",
            "isBold": false
          },
          {
            "text": "Place a catch pan under the filter to collect fuel",
            "type": "tip",
            "isBold": false
          },
          {
            "text": "Remove the old filter using the filter wrench",
            "type": "normal",
            "isBold": false
          },
          {
            "text": "Install new filter, ensuring proper seal",
            "type": "normal",
            "isBold": false
          }
        ],
        "parts_needed": ["Fuel Filter #FF-2345", "O-ring seal #OR-123"],
        "estimated_time": "45 minutes",
        "difficulty": "moderate",
        "safety_warnings": [
          "Ensure engine is completely cool",
          "No open flames or smoking",
          "Wear safety goggles and gloves"
        ],
        "tools_required": [
          "Filter wrench",
          "Catch pan",
          "Shop towels",
          "New fuel filter"
        ],
        "equipment": ["Fuel System", "Engine"],
        "fault_codes": ["P0171", "P0174"],
        "procedure_link": "https://manual.yacht.com/procedures/fuel-filter-replacement",
        "tracking_data": {
          "equipment": "fuel system",
          "system": "fuel",
          "component": "filter",
          "fault_code": "P0171"
        }
      },
      {
        "solution_id": "sol_002",
        "title": "Check Fuel Pump Pressure",
        "confidence": 0.78,
        "confidence_score": 0.78,
        "source": {
          "title": "Engine Diagnostics Guide",
          "page": 23
        },
        "steps": [
          {
            "text": "Connect fuel pressure gauge to test port",
            "type": "normal",
            "isBold": false
          },
          {
            "text": "Start engine and observe pressure reading",
            "type": "normal",
            "isBold": false
          },
          {
            "text": "Pressure should be between 35-45 PSI",
            "type": "tip",
            "isBold": true
          }
        ],
        "parts_needed": [],
        "estimated_time": "20 minutes",
        "tools_required": ["Fuel pressure gauge", "Safety glasses"]
      },
      {
        "solution_id": "sol_003",
        "title": "Inspect Fuel Lines for Blockage",
        "confidence": 0.65,
        "confidence_score": 0.65,
        "source": {
          "title": "Troubleshooting Manual",
          "page": 89
        },
        "steps": [
          {
            "text": "Visually inspect all accessible fuel lines",
            "type": "normal",
            "isBold": false
          },
          {
            "text": "Look for kinks, cracks, or deterioration",
            "type": "normal",
            "isBold": false
          }
        ],
        "estimated_time": "30 minutes"
      }
    ],
    "sources": ["Yacht Maintenance Manual", "Engine Diagnostics Guide"],
    "metadata": {
      "query": "original user query text here",
      "session_id": "session-id",
      "conversation_id": "conversation-id",
      "yacht_id": "yacht-id",
      "user_id": "user-id",
      "intent": "technical_query",
      "entities_found": {
        "equipment": 2,
        "faults": 2,
        "measurements": 1
      },
      "patterns_identified": {
        "equipment": ["fuel pump", "fuel filter"],
        "faults": ["P0171", "P0174"]
      },
      "search_performed": true,
      "documents_found": 3,
      "processing_time_ms": 2500,
      "awaiting_feedback": true
    }
  }
}
```

### Format 2: When NO Solutions (Greetings, General Chat)
```json
{
  "response": {
    "success": true,
    "query_id": "unique-query-id",
    "message": "Hello! I'm Celeste, your yacht AI assistant. How can I help you today?",
    "confidence_score": 0.5,
    "solutions": [],
    "sources": [],
    "metadata": {
      "intent": "greeting",
      "search_performed": false
    }
  }
}
```

---

## CRITICAL FIELD SPECIFICATIONS

### 1. **response.solutions[]** - REQUIRED (can be empty array)
This is an ARRAY of solution objects. Each solution MUST have:

#### Required Fields for Each Solution:
- `solution_id` (string): Unique identifier like "sol_001"
- `title` (string): Clear, action-oriented title like "Replace Fuel Filter"
- `confidence` (number): 0.0 to 1.0 confidence score
- `confidence_score` (number): DUPLICATE of confidence (for compatibility)

#### Optional but Recommended Fields:
- `source` (object): 
  - `title` (string): Document name
  - `page` (number): Page number
  - `revision` (string): Document version
- `steps` (array): Array of step objects OR strings
  - If object: `{ text: "step text", type: "warning|tip|normal", isBold: true|false }`
  - If string: Just the step text
- `parts_needed` (array of strings): Part numbers and descriptions
- `estimated_time` (string): Human-readable time like "45 minutes"
- `difficulty` (string): "easy", "moderate", "difficult"
- `safety_warnings` (array of strings): Safety precautions
- `tools_required` (array of strings): Required tools
- `equipment` (array of strings): Related equipment
- `fault_codes` (array of strings): Relevant fault codes
- `procedure_link` (string): URL to full procedure

### 2. **response.message** - REQUIRED
- NOT "answer" - must be "message"
- Contains the conversational response text
- Can include markdown formatting

### 3. **response.success** - REQUIRED
- Boolean: true/false
- Indicates if the query was processed successfully

### 4. **response.confidence_score** - REQUIRED
- Number between 0.0 and 1.0
- Overall confidence in the response

### 5. **response.query_id** - REQUIRED
- Unique identifier for this query
- Used for tracking and feedback

---

## STEP TYPE SPECIFICATIONS

When creating steps, use these type values for proper icon display:
- `"warning"` - Shows ⚠️ warning icon (use for safety-critical steps)
- `"tip"` - Shows 💡 lightbulb icon (use for helpful hints)
- `"normal"` - Shows ✓ checkmark icon (use for standard steps)

---

## IMPORTANT NOTES FOR N8N WORKFLOW

### 1. Array Structure is Critical
The frontend expects `response.solutions` to be an ARRAY, even if empty:
- ✅ CORRECT: `"solutions": []`
- ✅ CORRECT: `"solutions": [{ solution object }]`
- ❌ WRONG: `"solutions": null`
- ❌ WRONG: `"solutions": { single object }`
- ❌ WRONG: Missing the field entirely

### 2. Confidence Score Duplication
Each solution needs BOTH fields (for compatibility):
- `confidence`: 0.85
- `confidence_score`: 0.85

### 3. Response Wrapping
Everything MUST be wrapped in a `response` object:
- ❌ WRONG: `{ "solutions": [...], "message": "..." }`
- ✅ CORRECT: `{ "response": { "solutions": [...], "message": "..." } }`

### 4. Fallback for Non-Technical Queries
When user asks non-technical questions (greetings, general chat):
- Set `solutions` to empty array `[]`
- Set `confidence_score` to 0.5 or lower
- Provide conversational `message`
- Set `metadata.intent` to "greeting" or "general"

---

## TESTING YOUR IMPLEMENTATION

After updating your N8N workflow, test with these queries:

### Test 1: Technical Query (Should Return Solutions)
Query: "fuel pump not working"
Expected: 1-3 solution cards with steps

### Test 2: Greeting (Should Return Empty Solutions)
Query: "hello"
Expected: Empty solutions array, greeting message

### Test 3: Equipment Query (Should Return Solutions)
Query: "how to replace oil filter"
Expected: Solution cards with parts and tools

---

## FRONTEND BEHAVIOR

When the frontend receives the response:
1. It checks for `response.solutions` array
2. If solutions exist, it displays expandable solution cards
3. Each card shows:
   - Title with confidence indicator (color-coded circle)
   - Source document reference
   - Expandable steps with icons
   - Parts, tools, time estimates (if provided)
   - Raw JSON debug view (for testing)
4. If no solutions, it just shows the message text

---

## DEBUGGING

The frontend will log to browser console:
```
🔍 Webhook Response Structure: { full structure }
✅ Detected Yacht AI format with solutions
📋 Found 3 solution card(s): [array of solutions]
```

Each solution card will also show the raw JSON at the bottom for debugging during MVP phase.

---

## QUESTIONS TO VERIFY

1. Can your N8N workflow transform the current response format to include `response.solutions[]` array?
2. Can you map your current "items" and "parts" data into the solution structure?
3. Can you generate step-by-step procedures for each solution?
4. Can you ensure the response is wrapped in a `response` object?
5. Can you handle both technical queries (with solutions) and general queries (without solutions)?

The frontend is ready and waiting for this exact structure. Once your webhook returns data in this format, the solution cards will automatically appear in the UI.