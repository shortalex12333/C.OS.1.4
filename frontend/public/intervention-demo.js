// Intervention System Test & Demo
// Add this to your browser console to test interventions

window.testIntervention = () => {
  const sampleIntervention = {
    intervention_id: 'test_intervention_' + Date.now(),
    message: 'Low energy detected. 10 pushups now?',
    priority: 8,
    final_priority: 83,
    delivery_timestamp: new Date().toISOString(),
    created_at: new Date().toISOString(),
    personalization_data: {
      pattern_confidence: 0.8
    },
    expected_impact: 'high',
    breakthrough_potential: 7.5,
    status: 'pending'
  };

  // Send to our intervention API
  fetch('http://localhost:3001/api/interventions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sampleIntervention)
  })
  .then(response => response.json())
  .then(data => {
    console.log('✅ Intervention delivered:', data);
    
    // Trigger the frontend event
    const event = new CustomEvent('intervention-received', { 
      detail: {
        id: sampleIntervention.intervention_id,
        message: sampleIntervention.message,
        priority: sampleIntervention.priority,
        delivery_timestamp: sampleIntervention.delivery_timestamp,
        created_at: sampleIntervention.created_at,
        pattern_confidence: sampleIntervention.personalization_data?.pattern_confidence,
        expected_impact: sampleIntervention.expected_impact,
        breakthrough_potential: sampleIntervention.breakthrough_potential,
        status: sampleIntervention.status,
        rawData: sampleIntervention
      }
    });
    window.dispatchEvent(event);
  })
  .catch(error => {
    console.error('❌ Intervention delivery failed:', error);
  });
};

// Auto-trigger a test intervention after 5 seconds
setTimeout(() => {
  console.log('🎯 Testing intervention system...');
  window.testIntervention();
}, 5000);

console.log('📋 Intervention test script loaded!');
console.log('🎯 Use window.testIntervention() to test the system');
console.log('⏱️  Auto-test will run in 5 seconds...');