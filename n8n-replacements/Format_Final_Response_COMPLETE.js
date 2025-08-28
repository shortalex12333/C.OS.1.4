// COMPLETE CODE for "Format Final Response" node
// Replace ALL code in this node with the following:

// AI Response Enricher - Preserves conversational tone while adding document references
const items = [];

// Get inputs
const aiResponse = $input.first().json;
const episodicMemory = $node["Build Episodic Memory"].json.episodic_memory || {};

// Extract documents from search results
const documents = (episodicMemory.documents || [])
  .filter(doc => doc && doc.id)
  .sort((a, b) => (b.relevance || 0) - (a.relevance || 0));

// Process documents for the documents_used field
const documentsUsed = documents
  .slice(0, 5) // Limit to top 5 most relevant
  .map(doc => ({
    id: doc.id,
    fault_code: doc.title?.match(/Fault Code ([A-Z]-?\d+)/)?.[1] || "N/A",
    source: doc.doc_source || "Unknown",
    type: doc.doc_type || "document",
    url: doc.url || doc.document_url || doc.public_url || 
         `https://vivovcnaapmcfxxfhzxk.supabase.co/functions/v1/document-display/${doc.doc_type || 'technical-manual'}/${doc.id}`
  }));

// Calculate confidence based on actual document relevance
let confidence = 0;
if (documents.length > 0) {
  confidence = documents.reduce((sum, d) => sum + (d.relevance || 0), 0) / documents.length;
} else if (aiResponse.message?.content?.confidence_score !== undefined) {
  confidence = aiResponse.message.content.confidence_score;
}

// Process solutions if they exist in AI response
let solutions = aiResponse.message?.content?.solutions || [];

// If AI didn't provide solutions but we have documents, create basic solution references
if (solutions.length === 0 && documents.length > 0) {
  solutions = documents.slice(0, 3).map((doc, idx) => {
    const confidenceScore = doc.relevance || 0.5;
    const confidenceLevel = confidenceScore >= 0.7 ? 'high' : confidenceScore >= 0.5 ? 'medium' : 'low';
    
    return {
      solution_id: `sol_${String(idx + 1).padStart(3, '0')}`,
      title: doc.title || `Document ${idx + 1}`,
      confidence: confidenceLevel,
      confidenceScore: parseFloat(confidenceScore.toFixed(2)),
      description: doc.content?.substring(0, 200) || "See document for details",
      source: {
        title: doc.title || "Technical Document",
        page: doc.page_number || "N/A",
        revision: doc.revision || "Current"
      },
      steps: [],
      procedureLink: doc.url || "#",
      parts_needed: [],
      estimated_time: "",
      safety_warnings: []
    };
  });
}

// Build the enriched response - PRESERVE THE AI'S MESSAGE
const enrichedResponse = {
  index: 0,
  message: {
    role: "assistant",
    content: {
      // CRITICAL: Preserve the AI's actual message
      message: aiResponse.message?.content?.message || 
               aiResponse.message?.content?.ai_summary ||
               (documents.length === 0 
                 ? "I couldn't find specific information about that in our documentation. Could you try rephrasing your query or provide more details?"
                 : `I found ${documents.length} relevant documents in our system.`),
      
      // Use actual confidence score
      confidence_score: parseFloat(confidence.toFixed(2)),
      
      // Preserve or generate AI summary
      ai_summary: aiResponse.message?.content?.ai_summary || 
                  (documents.length > 0 
                    ? `Found ${documents.length} relevant documents`
                    : "No specific documents found"),
      
      // Add document references
      documents_used: documentsUsed,
      
      // Include solutions
      solutions: solutions
    },
    refusal: null,
    annotations: []
  },
  logprobs: null,
  finish_reason: "stop"
};

// Add metadata for debugging (optional)
enrichedResponse.metadata = {
  documents_searched: documents.length,
  confidence_calculation: confidence > 0 ? "from_documents" : "from_ai",
  search_strategy: episodicMemory.metadata?.search_strategy || "unknown"
};

items.push({ json: enrichedResponse });
return items;