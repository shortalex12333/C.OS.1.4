// Replacement for "Use Cached Response" node (Line 277-287)
// Fixed to properly handle cached responses without forcing templates

const cacheData = $('Format Cache Response').first().json;
const routing = $('Generate Cache Key').first().json;

// Extract cached results safely
const cachedResults = cacheData.cached_data || {};
const confidence = cacheData.confidence || 0.85;

// Build response that matches expected format
const response = {
  index: 0,
  message: {
    role: "assistant",
    content: {
      confidence_score: confidence,
      // Use cached message if available, otherwise indicate cache hit
      message: cachedResults.message || 
               cachedResults.ai_summary || 
               'Retrieved from cache - information previously found',
      ai_summary: cachedResults.ai_summary || 'Cached response',
      documents_used: cachedResults.documents_used || [],
      solutions: cachedResults.solutions || []
    },
    refusal: null,
    annotations: []
  },
  logprobs: null,
  finish_reason: "stop"
};

return [{
  json: response
}];