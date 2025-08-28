// Replacement for "Build Episodic Memory" node (Line 161-171)
// Simplified to focus on organizing data without pre-formatting responses

const routing = $('Generate Cache Key').first().json;
const inputs = $input.all();

// Initialize memory structure
const memory = {
  documents: [],
  parts: [],
  faults: [],
  emails: [],
  history: [],
  metadata: {
    total_results: 0,
    search_strategy: routing.search_strategy || 'yacht',
    user_query: routing.original_query
  }
};

// Process all inputs and categorize them
inputs.forEach((input) => {
  const data = input.json;
  const nodeName = input.nodeName || '';
  
  if (!data || data.error) return;
  
  // Handle PostgreSQL search results
  if (Array.isArray(data) && data.length > 0) {
    const firstItem = data[0];
    
    // Identify data type by content
    if (firstItem.title || firstItem.content || firstItem.doc_type) {
      memory.documents = memory.documents.concat(data);
    } else if (firstItem.part_number) {
      memory.parts = memory.parts.concat(data);
    } else if (firstItem.fault_code || firstItem.fault_id) {
      memory.faults = memory.faults.concat(data);
    } else if (firstItem.subject || firstItem.sender_name) {
      memory.emails = memory.emails.concat(data);
    } else if (firstItem.query_text) {
      memory.history = memory.history.concat(data);
    }
    
    memory.metadata.total_results += data.length;
  }
});

// Build context for AI without forcing templates
let ai_context = `## Search Results for: "${routing.original_query}"

Search Strategy: ${routing.search_strategy}
Total Results Found: ${memory.metadata.total_results}

`;

// Add document summaries if found
if (memory.documents.length > 0) {
  ai_context += `### Technical Documents (${memory.documents.length} found)\n\n`;
  memory.documents.slice(0, 5).forEach((doc, idx) => {
    ai_context += `${idx + 1}. **${doc.title}**\n`;
    ai_context += `   - Source: ${doc.doc_source || 'Unknown'}\n`;
    ai_context += `   - Type: ${doc.doc_type || 'document'}\n`;
    ai_context += `   - Relevance: ${((doc.relevance || 0) * 100).toFixed(1)}%\n\n`;
  });
}

// Add emails if found
if (memory.emails.length > 0) {
  ai_context += `### Email Correspondence (${memory.emails.length} found)\n\n`;
  memory.emails.slice(0, 5).forEach((email, idx) => {
    ai_context += `${idx + 1}. **${email.subject}**\n`;
    ai_context += `   - From: ${email.sender_name}\n`;
    ai_context += `   - Date: ${email.date_sent}\n\n`;
  });
}

// Add parts if found
if (memory.parts.length > 0) {
  ai_context += `### Parts Information (${memory.parts.length} found)\n\n`;
  memory.parts.slice(0, 5).forEach((part, idx) => {
    ai_context += `${idx + 1}. Part ${part.part_number} - ${part.manufacturer}\n`;
    ai_context += `   - ${part.description}\n\n`;
  });
}

// Add fault codes if found
if (memory.faults.length > 0) {
  ai_context += `### Fault Codes (${memory.faults.length} found)\n\n`;
  memory.faults.slice(0, 5).forEach((fault, idx) => {
    ai_context += `${idx + 1}. ${fault.fault_code} - ${fault.fault_id}\n`;
    ai_context += `   - Engine: ${fault.engine_manufacturer}\n\n`;
  });
}

// If no results found, be clear about it
if (memory.metadata.total_results === 0) {
  ai_context += `### No Results Found

No documents, emails, parts, or fault codes were found matching your query.
This could mean:
1. The specific information is not in our database
2. Try using different search terms
3. The documentation may be filed under a different category

`;
}

// Return the organized data
return [{
  json: {
    episodic_memory: memory,
    ai_context: ai_context,
    routing: routing,
    cache_key: routing.cache_key,
    search_summary: {
      total_results: memory.metadata.total_results,
      documents_found: memory.documents.length,
      emails_found: memory.emails.length,
      parts_found: memory.parts.length,
      faults_found: memory.faults.length
    }
  }
}];