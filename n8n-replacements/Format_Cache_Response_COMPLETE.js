// COMPLETE CODE for "Format Cache Response" node
// Replace ALL code in this node with the following:

// Format Cache Response - Properly handle cache hits and misses
const cacheResult = $input.first().json;
const routing = $('Generate Cache Key').first().json;

let output;

// Check if we have a valid cache hit
if (Array.isArray(cacheResult) && cacheResult.length > 0 && cacheResult[0].results) {
  // Cache hit - extract and format cached data
  const cachedData = cacheResult[0].results;
  const cachedConfidence = cacheResult[0].confidence_score || 0.5;
  
  // Ensure cached data has proper structure
  let formattedCachedData;
  
  // If cached data is already in the correct format, use it
  if (cachedData.episodic_memory || cachedData.documents || cachedData.message) {
    formattedCachedData = cachedData;
  } 
  // Otherwise, wrap it properly
  else {
    formattedCachedData = {
      message: cachedData.message || "Cached response",
      ai_summary: cachedData.ai_summary || cachedData.summary || "Retrieved from cache",
      documents_used: cachedData.documents_used || cachedData.documents || [],
      solutions: cachedData.solutions || [],
      confidence_score: cachedConfidence
    };
  }
  
  output = {
    cache_hit: true,
    cached_data: formattedCachedData,
    confidence: cachedConfidence,
    routing: routing,
    cache_metadata: {
      hit_count: cacheResult[0].hit_count || 1,
      query_hash: routing.cache_key,
      expires_at: cacheResult[0].expires_at
    }
  };
  
} else {
  // Cache miss - prepare for fresh search
  output = {
    cache_hit: false,
    routing: routing,
    cache_metadata: {
      query_hash: routing.cache_key,
      reason: "No cached results found"
    }
  };
}

// Add debugging information
output.debug = {
  cache_input_type: Array.isArray(cacheResult) ? "array" : typeof cacheResult,
  cache_input_length: Array.isArray(cacheResult) ? cacheResult.length : 0,
  has_results: !!(cacheResult && cacheResult[0] && cacheResult[0].results)
};

return [{
  json: output
}];