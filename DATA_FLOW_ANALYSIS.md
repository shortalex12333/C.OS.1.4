# Solution Cards Data Flow Analysis

## Current Flow (BROKEN):

1. **N8N Webhook sends:**
```json
[
  {
    "index": 0,
    "message": {
      "role": "assistant",
      "content": {
        "confidence_score": 0.87,
        "message": "Found 3 fault codes...",
        "ai_summary": "3 procedures: E-1247, E-253, E-047",
        "documents_used": [...],
        "solutions": []
      }
    },
    "logprobs": null,
    "finish_reason": "stop"
  }
]
```

2. **webhookServiceComplete.ts (Line 638-655):**
   - Receives array, gets `firstItem = responseData[0]`
   - Looks for `firstItem.response` (DOESN'T EXIST)
   - Falls back to `firstItem.answer` (DOESN'T EXIST)
   - Creates responseData with empty values
   - MISSES the actual data at `firstItem.message.content`

3. **App.tsx (Line 345):**
   - Receives malformed response from webhook service
   - Sets `content: response.data` (incomplete data)
   - Creates ChatMessage with wrong structure

4. **ChatMessage.tsx (Line 66-114):**
   - Tries to parse content
   - Has handler for OpenAI format but never receives it
   - Solutions creation code exists but data doesn't arrive

## Problem Summary:
- webhookServiceComplete.ts is NOT extracting `firstItem.message.content`
- The OpenAI completion format is not recognized
- Solutions are never created because documents_used is not accessible

## Fix Required:
Update webhookServiceComplete.ts line 639-655 to properly handle OpenAI format.