// Comprehensive webhook test with all fields
import fetch from 'node-fetch';

async function testComprehensiveWebhook() {
  console.log('🚀 Testing Schedule Call Webhook with ALL fields...\n');
  console.log('=' .repeat(60));
  
  // Create comprehensive test payload
  const testPayload = {
    // User identification
    userId: `user-${Date.now()}`,
    email: 'captain.johnson@megayacht.com',
    displayName: 'Captain Robert Johnson',
    firstName: 'Robert',
    lastName: 'Johnson',
    
    // Scheduling details
    selectedDate: new Date('2025-02-15').toISOString(),
    selectedTime: '3:00 PM EST',
    dateTimeLocal: 'February 15, 2025 at 3:00 PM EST',
    date: '2025-02-15',
    time: '3:00 PM EST',
    
    // Yacht information
    yachtSize: '120-180 ft',
    yachtLength: 150,
    phone: '+1-555-YACHT-99',
    
    // User engagement metrics
    chatQueriesCount: 12,
    faqQueriesCount: 7,
    topics: [
      'Integration with existing yacht management systems',
      'Offline capabilities while at sea',
      'Multi-crew access and permissions',
      'Data synchronization between vessels',
      'Custom reporting for yacht operations'
    ],
    
    // Session information
    sessionId: `session-${Date.now()}`,
    timestamp: new Date().toISOString(),
    timezone: 'America/New_York',
    source: 'schedule-call-modal',
    
    // Additional context
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    referrer: 'https://celeste7.ai/ask-alex',
    ipAddress: '192.168.1.100'
  };

  console.log('\n📋 PAYLOAD BEING SENT:\n');
  console.log(JSON.stringify(testPayload, null, 2));
  console.log('\n' + '=' .repeat(60));

  try {
    console.log('\n📤 Sending to webhook endpoint...');
    const response = await fetch('https://api.celeste7.ai/webhook/schedule-call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'CelesteOS-Test-Script/1.0'
      },
      body: JSON.stringify(testPayload)
    });

    console.log(`\n📊 Response Status: ${response.status} ${response.statusText}`);
    console.log(`📍 Response Headers:`);
    console.log(`   Content-Type: ${response.headers.get('content-type')}`);
    console.log(`   Date: ${response.headers.get('date')}`);
    
    const responseText = await response.text();
    console.log('\n📥 RAW RESPONSE:');
    console.log(responseText);

    if (response.ok) {
      console.log('\n✅ SUCCESS! Webhook accepted the payload.');
      
      // Try to parse as JSON if possible
      try {
        const responseData = JSON.parse(responseText);
        console.log('\n📊 PARSED RESPONSE DATA:');
        console.log(JSON.stringify(responseData, null, 2));
      } catch (e) {
        console.log('(Response is not JSON formatted)');
      }
      
      console.log('\n🎯 NEXT STEPS:');
      console.log('1. Check your n8n workflow: https://n8n.io/workflows');
      console.log('2. Check Supabase for the new record:');
      console.log('   https://supabase.com/dashboard/project/vivovcnaapmcfxxfhzxk/editor/schedule_calls');
      console.log('3. Check your email for the notification (if configured)');
      
    } else {
      console.log('\n❌ ERROR! Webhook returned an error status.');
      console.log('Please check your webhook configuration.');
    }

  } catch (error) {
    console.error('\n❌ REQUEST FAILED:', error.message);
    console.error('Error details:', error);
  }

  console.log('\n' + '=' .repeat(60));
  console.log('Test completed at:', new Date().toLocaleString());
}

// Now test reading from Supabase
async function verifySupabaseData() {
  console.log('\n\n🔍 VERIFYING DATA IN SUPABASE...\n');
  console.log('=' .repeat(60));
  
  const SUPABASE_URL = 'https://vivovcnaapmcfxxfhzxk.supabase.co';
  const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpdm92Y25hYXBtY2Z4eGZoenhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NjQ5ODIsImV4cCI6MjA3MTQ0MDk4Mn0.eUICOqJRP_MyVMNJNlZu3Mc-1-jAG6nQE-Oy0k3Yr0E';

  try {
    // Fetch recent records
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/schedule_calls?order=created_at.desc&limit=5`,
      {
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log(`\n📊 Found ${data.length} recent schedule calls:\n`);
      
      data.forEach((record, index) => {
        console.log(`Record ${index + 1}:`);
        console.log(`  📧 Email: ${record.email}`);
        console.log(`  👤 Name: ${record.firstName} ${record.lastName}`);
        console.log(`  📅 Date: ${record.date} at ${record.time}`);
        console.log(`  🛥️ Yacht Size: ${record.yacht_size || 'Not specified'}`);
        console.log(`  💬 Chat Queries: ${record.chat_queries_count}`);
        console.log(`  ❓ FAQ Queries: ${record.faq_queries_count}`);
        console.log(`  📝 Topics: ${record.topics ? JSON.stringify(record.topics).substring(0, 50) + '...' : 'None'}`);
        console.log(`  🕐 Created: ${new Date(record.created_at).toLocaleString()}`);
        console.log('  ' + '-'.repeat(56));
      });
      
      // Get total count
      const countResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/schedule_calls?select=*`,
        {
          headers: {
            'apikey': ANON_KEY,
            'Authorization': `Bearer ${ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'count=exact',
            'Range': '0-0'
          }
        }
      );
      
      const totalCount = countResponse.headers.get('content-range')?.split('/')[1] || '0';
      console.log(`\n📈 Total records in database: ${totalCount}`);
      
    } else {
      console.log('❌ Could not fetch data from Supabase');
      console.log('Status:', response.status, response.statusText);
    }

  } catch (error) {
    console.error('❌ Error checking Supabase:', error.message);
  }
  
  console.log('\n' + '=' .repeat(60));
}

// Run both tests
(async () => {
  await testComprehensiveWebhook();
  await verifySupabaseData();
})();