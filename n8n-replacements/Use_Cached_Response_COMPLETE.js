// COMPLETE CODE for "Use Cached Response" node
// Replace ALL code in this node with the following:

// Use cached results properly without forcing templates
const cacheData = $('Format Cache Response').first().json;
const routing = $('Generate Cache Key').first().json;

// Extract cached results safely
const cachedResults = cacheData.cached_data || {};
const confidence = cacheData.confidence || 0.5;

// Check if we have valid cached data
const hasCachedData = cachedResults && (
  cachedResults.message || 
  cachedResults.documents || 
  cachedResults.ai_summary ||
  cachedResults.results
);

// Build properly formatted response from cache
let response;

if (hasCachedData) {
  // If cached data has the full structure, use it
  if (cachedResults.index !== undefined && cachedResults.message) {
    response = cachedResults;
  } 
  // Otherwise, build the response structure
  else {
    response = {
      index: 0,
      message: {
        role: "assistant",
        content: {
          confidence_score: cachedResults.confidence_score || confidence,
          message: cachedResults.message || 
                   cachedResults.ai_summary || 
                   "Retrieved from cache - this information was found in a previous search.",
          ai_summary: cachedResults.ai_summary || 
                      cachedResults.summary || 
                      "Cached response",
          documents_used: cachedResults.documents_used || 
                          cachedResults.documents || 
                          [],
          solutions: cachedResults.solutions || []
        },
        refusal: null,
        annotations: []
      },
      logprobs: null,
      finish_reason: "stop"
    };
  }
} else {
  // No valid cache data - return minimal response
  response = {
    index: 0,
    message: {
      role: "assistant",
      content: {
        confidence_score: 0,
        message: "Cache hit but no valid data found. Please retry your query.",
        ai_summary: "Cache miss",
        documents_used: [],
        solutions: []
      },
      refusal: null,
      annotations: []
    },
    logprobs: null,
    finish_reason: "stop"
  };
}

// Add metadata about cache hit
response.metadata = {
  cache_hit: true,
  cache_key: routing.cache_key,
  search_strategy: routing.search_strategy,
  original_query: routing.original_query,
  cached_at: cachedResults.cached_at || new Date().toISOString()
};

return [{
  json: response
}];