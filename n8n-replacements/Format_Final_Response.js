// Replacement for "Format Final Response" node (Line 265-275)
// This node should pass through AI responses without templating

const items = [];

// Get inputs
const aiResponse = $input.first().json;
const episodicMemory = $node["Build Episodic Memory"].json.episodic_memory || {};

// Get documents for reference (but don't template the message)
const documents = episodicMemory.documents || [];

// Process documents for documents_used field
const documentsUsed = documents
  .filter(doc => doc.relevance > 0.3)
  .slice(0, 5)
  .map(doc => ({
    id: doc.id,
    fault_code: doc.title?.match(/Fault Code ([A-Z]-?\d+)/)?.[1] || "N/A",
    source: doc.doc_source || "Unknown",
    type: doc.doc_type || "document",
    url: doc.url || doc.document_url || doc.public_url || 
         `https://vivovcnaapmcfxxfhzxk.supabase.co/functions/v1/document-display/${doc.doc_type}/${doc.id}`
  }));

// Calculate actual confidence based on document relevance
const avgConfidence = documents.length > 0
  ? documents.reduce((sum, d) => sum + (d.relevance || 0), 0) / documents.length
  : aiResponse.message?.content?.confidence_score || 0;

// Build response - PRESERVE AI's original message
const enrichedResponse = {
  ...aiResponse,
  message: {
    ...aiResponse.message,
    content: {
      ...aiResponse.message.content,
      // CRITICAL: Use AI's actual message, not a template
      message: aiResponse.message?.content?.message || 
               aiResponse.message?.content?.ai_summary ||
               "I couldn't find specific information about that in our documentation.",
      
      // Keep the AI's confidence or calculate from documents
      confidence_score: parseFloat((aiResponse.message?.content?.confidence_score || avgConfidence || 0).toFixed(2)),
      
      // Preserve AI summary
      ai_summary: aiResponse.message?.content?.ai_summary || 
                  `Searched ${documents.length} documents`,
      
      // Add document references
      documents_used: documentsUsed,
      
      // Pass through solutions if they exist, otherwise empty array
      solutions: aiResponse.message?.content?.solutions || []
    }
  }
};

items.push({ json: enrichedResponse });
return items;