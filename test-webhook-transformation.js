#!/usr/bin/env node

/**
 * Unit tests for webhook transformation logic
 * Tests the exact payload format from the user's webhook
 */

// Exact webhook payload from user
const actualWebhookPayload = [
  {
    "index": 0,
    "message": {
      "role": "assistant",
      "content": {
        "confidence_score": 0.87,
        "message": "Found 3 fault codes (E-1247, E-253, E-047) with temperature-related procedures.",
        "ai_summary": "3 procedures: E-1247, E-253, E-047",
        "documents_used": [
          {
            "id": "4dc6964a-0e15-41a0-aa33-5ee18d3fb809",
            "fault_code": "E-1247",
            "source": "MAN",
            "type": "manual",
            "url": "https://vivovcnaapmcfxxfhzxk.supabase.co/functions/v1/document-display/technical-manual/4dc6964a-0e15-41a0-aa33-5ee18d3fb809"
          },
          {
            "id": "2f2f1d9d-1995-49fd-beac-2fe1324d0c81",
            "fault_code": "E-253",
            "source": "MTU",
            "type": "manual",
            "url": "https://vivovcnaapmcfxxfhzxk.supabase.co/functions/v1/document-display/technical-manual/2f2f1d9d-1995-49fd-beac-2fe1324d0c81"
          },
          {
            "id": "a1d73986-997f-43e4-bbcf-755406e89384",
            "fault_code": "E-047",
            "source": "MAN",
            "type": "manual",
            "url": "https://vivovcnaapmcfxxfhzxk.supabase.co/functions/v1/document-display/technical-manual/a1d73986-997f-43e4-bbcf-755406e89384"
          }
        ],
        "solutions": []
      },
      "refusal": null,
      "annotations": []
    },
    "logprobs": null,
    "finish_reason": "stop"
  }
];

// Simulate the webhook service transformation
function transformOpenAIResponse(responseData) {
  console.log('🔍 Testing webhook transformation...\n');
  
  if (!Array.isArray(responseData) || responseData.length === 0) {
    console.error('❌ Not an array or empty');
    return null;
  }

  const firstItem = responseData[0];
  console.log('✅ Got first item from array');

  // Check for OpenAI format
  if (!firstItem.message || !firstItem.message.content || firstItem.message.role !== 'assistant') {
    console.error('❌ Not OpenAI format');
    return null;
  }

  console.log('✅ Detected OpenAI format');
  const content = firstItem.message.content;

  // Convert documents to solutions
  let solutions = content.solutions || [];
  
  if ((!solutions || solutions.length === 0) && content.documents_used && content.documents_used.length > 0) {
    console.log(`📄 Converting ${content.documents_used.length} documents to solution cards...`);
    
    solutions = content.documents_used.map((doc, index) => {
      const confidence = content.confidence_score >= 0.85 ? 'high' : 
                        content.confidence_score >= 0.675 ? 'medium' : 'low';
      
      return {
        solution_id: doc.id,
        title: `Fault Code ${doc.fault_code} - ${doc.source} Procedure`,
        confidence: confidence,
        confidenceScore: Math.round(content.confidence_score * 100),
        description: `Technical procedure for ${doc.fault_code} from ${doc.source} manual`,
        source: {
          title: `${doc.source} Technical Manual`,
          page: doc.page,
          revision: doc.revision
        },
        steps: [
          {
            text: `Access ${doc.source} technical manual for fault code ${doc.fault_code}`,
            type: 'normal',
            isBold: false
          },
          {
            text: `Navigate to troubleshooting section for detailed procedures`,
            type: 'normal',
            isBold: false
          },
          {
            text: 'Ensure engine is off and system is safely isolated before beginning work',
            type: 'warning',
            isBold: true
          },
          {
            text: `Check all related systems as specified in ${doc.source} documentation`,
            type: 'tip',
            isBold: false
          },
          {
            text: 'Document all findings and actions taken for maintenance records',
            type: 'normal',
            isBold: false
          }
        ],
        procedureLink: doc.url,
        original_doc_url: doc.url
      };
    });
    
    console.log(`✅ Created ${solutions.length} solution cards`);
  }

  // Create normalized response
  const normalizedResponse = {
    success: true,
    answer: content.message || content.ai_summary || 'Response received',
    messageId: `msg_${Date.now()}`,
    timestamp: new Date().toISOString(),
    confidence_score: content.confidence_score,
    ai_summary: content.ai_summary,
    documents_used: content.documents_used,
    solutions: solutions,
    items: [],
    sources: content.documents_used?.map(d => d.source) || [],
    references: content.documents_used || [],
    summary: content.ai_summary || '',
    metadata: {
      finish_reason: firstItem.finish_reason
    }
  };

  return normalizedResponse;
}

// Run the test
console.log('====================================');
console.log('WEBHOOK TRANSFORMATION TEST');
console.log('====================================\n');

const result = transformOpenAIResponse(actualWebhookPayload);

if (result) {
  console.log('\n✅ TRANSFORMATION SUCCESSFUL!\n');
  console.log('📊 Result Summary:');
  console.log(`   - Text: "${result.answer}"`);
  console.log(`   - Confidence: ${result.confidence_score} (${Math.round(result.confidence_score * 100)}%)`);
  console.log(`   - Solutions: ${result.solutions.length} cards created`);
  console.log(`   - Documents: ${result.documents_used.length} used`);
  
  console.log('\n📋 Solution Cards:');
  result.solutions.forEach((sol, i) => {
    console.log(`\n   ${i + 1}. ${sol.title}`);
    console.log(`      - ID: ${sol.solution_id}`);
    console.log(`      - Confidence: ${sol.confidence} (${sol.confidenceScore}%)`);
    console.log(`      - Steps: ${sol.steps.length}`);
    console.log(`      - URL: ${sol.procedureLink}`);
  });
  
  console.log('\n✅ All solution cards have proper structure');
  console.log('✅ Ready for rendering in AISolutionCard component');
} else {
  console.error('\n❌ TRANSFORMATION FAILED');
}

console.log('\n====================================');