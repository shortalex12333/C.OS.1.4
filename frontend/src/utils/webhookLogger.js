// Phase 1: Webhook Response Logger
// Temporary utility to understand real data structure

export function logWebhookResponse(response) {
  console.group('🔍 Webhook Response Analysis');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Full Response:', response);
  
  // Check for response wrapper
  if (response?.response) {
    console.log('✓ Has response wrapper');
    console.log('Response keys:', Object.keys(response.response));
    
    // Check for answer text
    if (response.response.answer) {
      console.log('Answer:', response.response.answer.substring(0, 100) + '...');
    }
    
    // Check for solutions array
    if (response.response.solutions) {
      console.log('Solutions count:', response.response.solutions.length);
      if (response.response.solutions[0]) {
        console.log('First solution structure:');
        console.log('  - Keys:', Object.keys(response.response.solutions[0]));
        console.log('  - Sample:', response.response.solutions[0]);
      }
    }
    
    // Check for items array
    if (response.response.items) {
      console.log('Items count:', response.response.items.length);
      if (response.response.items[0]) {
        console.log('First item structure:');
        console.log('  - Keys:', Object.keys(response.response.items[0]));
        console.log('  - Sample:', response.response.items[0]);
      }
    }
    
    // Check for sources
    if (response.response.sources) {
      console.log('Sources:', response.response.sources);
    }
  }
  
  console.groupEnd();
  
  // Save to localStorage for later analysis
  try {
    const logs = JSON.parse(localStorage.getItem('webhookLogs') || '[]');
    logs.push({
      timestamp: Date.now(),
      query: response.query || 'unknown',
      responseKeys: response.response ? Object.keys(response.response) : [],
      hasSolutions: !!(response.response?.solutions),
      hasItems: !!(response.response?.items),
      solutionCount: response.response?.solutions?.length || 0,
      itemCount: response.response?.items?.length || 0
    });
    localStorage.setItem('webhookLogs', JSON.stringify(logs.slice(-10)));
    console.log('📝 Log saved to localStorage (webhookLogs)');
  } catch (e) {
    console.error('Failed to save log:', e);
  }
}

// Helper to analyze all logged responses
export function analyzeWebhookLogs() {
  const logs = JSON.parse(localStorage.getItem('webhookLogs') || '[]');
  
  console.group('📊 Webhook Log Analysis');
  console.log('Total logs:', logs.length);
  
  const stats = {
    totalLogs: logs.length,
    withSolutions: logs.filter(l => l.hasSolutions).length,
    withItems: logs.filter(l => l.hasItems).length,
    avgSolutions: logs.reduce((sum, l) => sum + l.solutionCount, 0) / logs.length,
    avgItems: logs.reduce((sum, l) => sum + l.itemCount, 0) / logs.length,
    uniqueResponseTypes: [...new Set(logs.map(l => l.responseKeys.sort().join(',')))]
  };
  
  console.table(stats);
  console.log('Response type patterns:', stats.uniqueResponseTypes);
  console.groupEnd();
  
  return stats;
}

// Add this to window for easy console access
if (typeof window !== 'undefined') {
  window.analyzeWebhookLogs = analyzeWebhookLogs;
  console.log('💡 Tip: Run window.analyzeWebhookLogs() in console to see stats');
}