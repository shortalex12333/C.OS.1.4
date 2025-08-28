#!/usr/bin/env node

import fetch from 'node-fetch';

console.log('🚀 WEBHOOK ENDPOINT TEST - FULL PAYLOAD VERIFICATION');
console.log('=' .repeat(70));
console.log('');

// Generate unique test data
const timestamp = Date.now();
const testEmail = `captain.test.${timestamp}@yacht.com`;

const payload = {
  // User Information
  userId: `test-user-${timestamp}`,
  email: testEmail,
  displayName: 'Captain James Mitchell',
  firstName: 'James',
  lastName: 'Mitchell',
  
  // Schedule Information
  selectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  selectedTime: '2:30 PM EST',
  dateTimeLocal: 'Next Week at 2:30 PM EST',
  date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  time: '2:30 PM EST',
  
  // Yacht Details
  yachtSize: '200+ ft',
  yachtLength: 220,
  phone: '+1-555-9876',
  
  // Engagement Analytics
  chatQueriesCount: 25,
  faqQueriesCount: 12,
  topics: [
    'How does CelesteOS handle satellite connectivity?',
    'Can it integrate with Starlink maritime systems?',
    'What are the offline capabilities?',
    'Multi-yacht fleet management features',
    'Crew permission and access control',
    'Data synchronization across multiple vessels',
    'Custom reporting for charter operations',
    'Integration with existing yacht management software'
  ],
  
  // Session Metadata
  sessionId: `session-${timestamp}`,
  timestamp: new Date().toISOString(),
  timezone: 'America/New_York',
  source: 'schedule-call-modal'
};

console.log('📋 SENDING PAYLOAD:');
console.log('─'.repeat(70));
console.log(JSON.stringify(payload, null, 2));
console.log('─'.repeat(70));
console.log('');

// Send to webhook
fetch('https://api.celeste7.ai/webhook/schedule-call', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify(payload)
})
.then(async response => {
  console.log('📡 WEBHOOK RESPONSE:');
  console.log('─'.repeat(70));
  console.log(`Status: ${response.status} ${response.statusText}`);
  console.log(`Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`);
  
  const text = await response.text();
  console.log(`Body: ${text || '(empty response)'}`);
  console.log('─'.repeat(70));
  
  if (response.ok) {
    console.log('✅ SUCCESS - Webhook accepted the payload!');
    console.log('');
    console.log('📊 VERIFYING IN SUPABASE...');
    
    // Wait a moment for processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check Supabase
    const SUPABASE_URL = 'https://vivovcnaapmcfxxfhzxk.supabase.co';
    const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpdm92Y25hYXBtY2Z4eGZoenhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NjQ5ODIsImV4cCI6MjA3MTQ0MDk4Mn0.eUICOqJRP_MyVMNJNlZu3Mc-1-jAG6nQE-Oy0k3Yr0E';
    
    const supabaseResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/schedule_calls?email=eq.${testEmail}&select=*`,
      {
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`
        }
      }
    );
    
    const records = await supabaseResponse.json();
    
    if (records && records.length > 0) {
      console.log('✅ RECORD FOUND IN SUPABASE!');
      console.log('');
      console.log('📊 Database Record:');
      console.log('─'.repeat(70));
      console.log(JSON.stringify(records[0], null, 2));
    } else {
      console.log('⚠️  Record not yet in Supabase.');
      console.log('   (n8n workflow may need to be configured or there may be processing delay)');
    }
  } else {
    console.log('❌ ERROR - Webhook rejected the payload');
  }
})
.catch(error => {
  console.error('❌ REQUEST FAILED:', error.message);
})
.finally(() => {
  console.log('');
  console.log('=' .repeat(70));
  console.log('📍 NEXT STEPS:');
  console.log('1. Check n8n workflow executions');
  console.log('2. Verify Supabase table: https://supabase.com/dashboard/project/vivovcnaapmcfxxfhzxk/editor/schedule_calls');
  console.log(`3. Search for email: ${testEmail}`);
  console.log('=' .repeat(70));
});