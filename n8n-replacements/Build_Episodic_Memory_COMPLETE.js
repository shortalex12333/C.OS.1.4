// COMPLETE CODE for "Build Episodic Memory" node
// Replace ALL code in this node with the following:

// Enhanced Build Episodic Memory - Clean data organization without templates
const routing = $('Generate Cache Key').first().json;
const inputs = $input.all();

// Initialize memory structure
const memory = {
  documents: [],
  parts: [],
  faults: [],
  emails: [],
  history: [],
  all_raw_data: [],
  metadata: {
    total_inputs: inputs.length,
    total_results: 0,
    search_performed: {
      documents: false,
      parts: false,
      faults: false,
      emails: false
    },
    errors: [],
    empty_results: [],
    search_strategy: routing.search_strategy || 'yacht',
    user_query: routing.original_query || ""
  }
};

// Map node names to data types
const nodeTypeMap = {
  'Search Documents PostgreSQL': 'documents',
  'Search Parts PostgreSQL': 'parts',
  'Search Faults PostgreSQL': 'faults',
  'Search Emails PostgreSQL': 'emails',
  'Get Conversation History PostgreSQL': 'history'
};

// Process inputs based on their node source
inputs.forEach((input, index) => {
  const data = input.json;
  const nodeName = input.nodeName || '';
  
  // Store raw data for debugging
  memory.all_raw_data.push({
    input_index: index,
    node_name: nodeName,
    data_type: nodeTypeMap[nodeName] || 'unknown',
    data: data
  });
  
  // Skip null/undefined data
  if (!data) {
    memory.metadata.empty_results.push({ 
      index, 
      node: nodeName,
      reason: 'null data' 
    });
    return;
  }
  
  // Handle errors
  if (data.error && data.message) {
    memory.metadata.errors.push({
      source: `${nodeName} (Input ${index})`,
      message: data.message,
      error_details: data.error
    });
    return;
  }
  
  // Handle empty success responses
  if (data.success === true && Object.keys(data).length === 1) {
    memory.metadata.empty_results.push({ 
      index, 
      node: nodeName,
      reason: 'no results' 
    });
    return;
  }
  
  // Process data based on node type
  if (nodeTypeMap[nodeName]) {
    const dataType = nodeTypeMap[nodeName];
    
    if (Array.isArray(data) && data.length > 0) {
      memory[dataType] = data;
      memory.metadata.search_performed[dataType] = true;
      memory.metadata.total_results += data.length;
    }
  } else {
    // Handle unknown data types by examining structure
    if (Array.isArray(data) && data.length > 0) {
      const firstItem = data[0];
      
      // Identify by content structure
      if (firstItem.id && (firstItem.title || firstItem.doc_type || firstItem.content)) {
        memory.documents = memory.documents.concat(data);
        memory.metadata.search_performed.documents = true;
      } else if (firstItem.part_number) {
        memory.parts = memory.parts.concat(data);
        memory.metadata.search_performed.parts = true;
      } else if (firstItem.fault_code || firstItem.fault_id) {
        memory.faults = memory.faults.concat(data);
        memory.metadata.search_performed.faults = true;
      } else if (firstItem.subject || firstItem.sender_name) {
        memory.emails = memory.emails.concat(data);
        memory.metadata.search_performed.emails = true;
      }
      
      memory.metadata.total_results += data.length;
    }
  }
});

// Build AI context without forcing templates
let context = `## Search Results Analysis

**User Query:** "${routing.original_query}"
**Search Strategy:** ${routing.search_strategy}
**Total Results Found:** ${memory.metadata.total_results}

`;

// Add document details if found
if (memory.documents.length > 0) {
  context += `### Technical Documents (${memory.documents.length} found)\n\n`;
  
  // Sort by relevance
  const sortedDocs = [...memory.documents].sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
  
  sortedDocs.slice(0, 10).forEach((doc, idx) => {
    context += `**${idx + 1}. ${doc.title || 'Untitled Document'}**\n`;
    context += `- Document ID: ${doc.id}\n`;
    context += `- Type: ${doc.doc_type || 'Unknown'}\n`;
    context += `- Source: ${doc.doc_source || 'Unknown'}\n`;
    context += `- Relevance: ${((doc.relevance || 0) * 100).toFixed(1)}%\n`;
    
    if (doc.equipment_tags && doc.equipment_tags.length > 0) {
      context += `- Equipment: ${doc.equipment_tags.join(', ')}\n`;
    }
    
    if (doc.content) {
      const preview = doc.content.substring(0, 200).replace(/\n/g, ' ');
      context += `- Preview: ${preview}...\n`;
    }
    
    context += `\n`;
  });
} else if (routing.search_documents) {
  context += `### Document Search\n\nNo technical documents found matching "${routing.original_query}".\n\n`;
}

// Add email details if found
if (memory.emails.length > 0) {
  context += `### Email Correspondence (${memory.emails.length} found)\n\n`;
  
  // Sort by date
  const sortedEmails = [...memory.emails].sort((a, b) => 
    new Date(b.date_sent || 0).getTime() - new Date(a.date_sent || 0).getTime()
  );
  
  sortedEmails.slice(0, 10).forEach((email, idx) => {
    context += `**${idx + 1}. ${email.subject || 'No Subject'}**\n`;
    context += `- From: ${email.sender_name || 'Unknown'}\n`;
    context += `- Date: ${email.date_sent || 'Unknown'}\n`;
    
    if (email.equipment_mentioned) {
      context += `- Equipment: ${email.equipment_mentioned}\n`;
    }
    
    if (email.priority) {
      context += `- Priority: ${email.priority}\n`;
    }
    
    if (email.body) {
      const preview = email.body.substring(0, 150).replace(/\n/g, ' ');
      context += `- Preview: ${preview}...\n`;
    }
    
    context += `\n`;
  });
} else if (routing.search_emails) {
  context += `### Email Search\n\nNo emails found matching "${routing.original_query}".\n\n`;
}

// Add parts information if found
if (memory.parts.length > 0) {
  context += `### Parts Information (${memory.parts.length} found)\n\n`;
  memory.parts.slice(0, 10).forEach((part, idx) => {
    context += `**${idx + 1}. Part ${part.part_number}**\n`;
    context += `- Manufacturer: ${part.manufacturer || 'Unknown'}\n`;
    context += `- Description: ${part.description || 'No description'}\n`;
    if (part.price_usd) {
      context += `- Price: $${part.price_usd}\n`;
    }
    if (part.typical_location) {
      context += `- Location: ${part.typical_location}\n`;
    }
    context += `\n`;
  });
}

// Add fault codes if found
if (memory.faults.length > 0) {
  context += `### Fault Codes (${memory.faults.length} found)\n\n`;
  memory.faults.slice(0, 10).forEach((fault, idx) => {
    context += `**${idx + 1}. ${fault.fault_code}**\n`;
    context += `- Description: ${fault.fault_id || 'No description'}\n`;
    context += `- Engine: ${fault.engine_manufacturer || 'Unknown'} ${fault.engine_models || ''}\n`;
    if (fault.spn) {
      context += `- SPN: ${fault.spn}\n`;
    }
    if (fault.fmi) {
      context += `- FMI: ${fault.fmi}\n`;
    }
    context += `\n`;
  });
} else if (routing.search_faults) {
  context += `### Fault Code Search\n\nNo fault codes found matching the query.\n\n`;
}

// Add conversation history if present
if (memory.history.length > 0) {
  context += `### Recent Conversation Context\n\n`;
  memory.history.slice(0, 3).forEach((item, idx) => {
    context += `${idx + 1}. Previous query: "${item.query_text}"\n`;
    if (item.ai_reply_summary) {
      context += `   Response: ${item.ai_reply_summary}\n`;
    }
    context += `\n`;
  });
}

// If no results at all, be clear
if (memory.metadata.total_results === 0) {
  context += `### No Results Found\n\n`;
  context += `No documents, emails, parts, or fault codes were found matching your query: "${routing.original_query}"\n\n`;
  context += `This could mean:\n`;
  context += `1. The specific information is not in our database\n`;
  context += `2. The query might need different keywords\n`;
  context += `3. The documentation may be filed under a different category\n\n`;
  context += `Consider:\n`;
  context += `- Using more general terms\n`;
  context += `- Checking for alternative nomenclature\n`;
  context += `- Breaking the query into smaller parts\n`;
}

// Add instructions for AI
context += `\n## Response Instructions\n\n`;
context += `Based on the search results above, provide a helpful response that:\n`;
context += `1. Directly addresses the user's query\n`;
context += `2. References specific documents when available\n`;
context += `3. Is honest about what was or wasn't found\n`;
context += `4. Suggests alternatives if no direct match was found\n`;
context += `5. Maintains a conversational, helpful tone\n`;

// Return enhanced structure
return [{
  json: {
    episodic_memory: memory,
    ai_context: context,
    routing: routing,
    cache_key: routing.cache_key,
    search_summary: {
      total_inputs: memory.metadata.total_inputs,
      total_results: memory.metadata.total_results,
      documents_found: memory.documents.length,
      emails_found: memory.emails.length,
      parts_found: memory.parts.length,
      faults_found: memory.faults.length,
      searches_performed: Object.entries(memory.metadata.search_performed)
        .filter(([_, performed]) => performed)
        .map(([type, _]) => type),
      has_errors: memory.metadata.errors.length > 0,
      empty_searches: memory.metadata.empty_results.filter(e => e.node).map(e => e.node)
    }
  }
}];