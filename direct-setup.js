// Direct Supabase Setup - Run this with: node direct-setup.js

async function setupDatabase() {
  console.log('🚀 Setting up your Supabase database...\n');

  const SUPABASE_URL = 'https://vivovcnaapmcfxxfhzxk.supabase.co';
  const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpdm92Y25hYXBtY2Z4eGZoenhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NjQ5ODIsImV4cCI6MjA3MTQ0MDk4Mn0.eUICOqJRP_MyVMNJNlZu3Mc-1-jAG6nQE-Oy0k3Yr0E';

  // First, let's test if the table already exists
  console.log('📊 Checking if schedule_calls table exists...');
  
  try {
    const checkResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/schedule_calls?select=id&limit=1`,
      {
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        }
      }
    );

    if (checkResponse.ok) {
      console.log('✅ Table already exists! Your database is ready.\n');
      
      // Test by fetching count
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
      
      const count = countResponse.headers.get('content-range')?.split('/')[1] || '0';
      console.log(`📈 Current records in table: ${count}`);
      return;
    }

    if (checkResponse.status === 404 || checkResponse.status === 400) {
      console.log('⚠️  Table does not exist yet.\n');
      console.log('📋 Please create it manually using these steps:\n');
      console.log('1️⃣  Open this link in your browser:');
      console.log('   👉 https://supabase.com/dashboard/project/vivovcnaapmcfxxfhzxk/sql/new\n');
      console.log('2️⃣  Copy ALL the SQL below:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      const createTableSQL = `-- COPY THIS ENTIRE SQL AND PASTE IN SUPABASE SQL EDITOR

CREATE TABLE IF NOT EXISTS schedule_calls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "firstName" VARCHAR(255) NOT NULL,
    "lastName" VARCHAR(255) DEFAULT '',
    email VARCHAR(255) NOT NULL,
    yacht_length INTEGER,
    time VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    chat_queries_count INTEGER DEFAULT 0,
    faq_queries_count INTEGER DEFAULT 0,
    topics JSONB DEFAULT '[]'::jsonb,
    phone VARCHAR(50),
    yacht_size VARCHAR(100),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    timezone VARCHAR(100),
    session_id TEXT,
    source VARCHAR(100) DEFAULT 'schedule-call-modal'
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_schedule_calls_email ON schedule_calls(email);
CREATE INDEX IF NOT EXISTS idx_schedule_calls_created_at ON schedule_calls(created_at DESC);

-- Enable RLS
ALTER TABLE schedule_calls ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Enable access for all" ON schedule_calls
FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON schedule_calls TO anon, authenticated, service_role;

-- Test insert to verify
INSERT INTO schedule_calls ("firstName", "lastName", email, time, date) 
VALUES ('Test', 'Setup', 'test@setup.com', '2:00 PM', CURRENT_DATE)
RETURNING *;`;

      console.log(createTableSQL);
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('3️⃣  Click the green "RUN" button\n');
      console.log('4️⃣  You should see a test row appear, confirming success!\n');
    }

  } catch (error) {
    console.error('❌ Error checking database:', error.message);
    console.log('\n💡 Manual setup required - follow the steps above.');
  }
}

// Test the webhook endpoint
async function testWebhook() {
  console.log('\n\n🧪 Testing webhook endpoint...\n');
  
  try {
    const testData = {
      userId: 'test-' + Date.now(),
      email: 'test@example.com',
      displayName: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      selectedDate: new Date().toISOString(),
      selectedTime: '2:30 PM',
      dateTimeLocal: `${new Date().toLocaleDateString()} at 2:30 PM`,
      phone: '+1-555-TEST',
      yachtSize: '80-120 ft',
      chatQueriesCount: 5,
      faqQueriesCount: 3,
      topics: ['Test Topic 1', 'Test Topic 2'],
      timestamp: new Date().toISOString(),
      timezone: 'America/New_York',
      source: 'test-script'
    };

    const response = await fetch('https://api.celeste7.ai/webhook/schedule-call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Webhook is working!');
      console.log('📥 Response:', JSON.stringify(result, null, 2));
    } else {
      console.log('⚠️  Webhook returned an error:', result);
    }
  } catch (error) {
    console.error('❌ Webhook test failed:', error.message);
  }
}

// Run both functions
(async () => {
  await setupDatabase();
  await testWebhook();
})();