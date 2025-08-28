// Supabase Database Setup Script
// Run this with: node setup-database.js

const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials
const SUPABASE_URL = 'https://vivovcnaapmcfxxfhzxk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpdm92Y25hYXBtY2Z4eGZoenhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NjQ5ODIsImV4cCI6MjA3MTQ0MDk4Mn0.eUICOqJRP_MyVMNJNlZu3Mc-1-jAG6nQE-Oy0k3Yr0E';

// IMPORTANT: You need to use the SERVICE_ROLE_KEY to create tables
// Get this from your Supabase dashboard: Settings > API > service_role key
const SERVICE_ROLE_KEY = 'YOUR_SERVICE_ROLE_KEY_HERE'; // <-- YOU NEED TO ADD THIS

console.log('🚀 Supabase Database Setup Script\n');

if (SERVICE_ROLE_KEY === 'YOUR_SERVICE_ROLE_KEY_HERE') {
  console.error('❌ ERROR: Please add your SERVICE_ROLE_KEY to this script!');
  console.log('\n📋 How to get your SERVICE_ROLE_KEY:');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Select your project (vivovcnaapmcfxxfhzxk)');
  console.log('3. Go to Settings (gear icon) → API');
  console.log('4. Copy the "service_role" key (starts with eyJ...)');
  console.log('5. Replace YOUR_SERVICE_ROLE_KEY_HERE in this script\n');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false
  }
});

const SQL_COMMANDS = `
-- Create the schedule_calls table
CREATE TABLE IF NOT EXISTS schedule_calls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) DEFAULT '',
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
    source VARCHAR(100) DEFAULT 'schedule-call-modal',
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_schedule_calls_email ON schedule_calls(email);
CREATE INDEX IF NOT EXISTS idx_schedule_calls_created_at ON schedule_calls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_schedule_calls_date ON schedule_calls(date);
CREATE INDEX IF NOT EXISTS idx_schedule_calls_user_id ON schedule_calls(user_id);
CREATE INDEX IF NOT EXISTS idx_schedule_calls_topics_gin ON schedule_calls USING GIN (topics);
`;

async function setupDatabase() {
  try {
    console.log('📊 Creating schedule_calls table...\n');
    
    // Execute SQL using Supabase RPC or direct query
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: SQL_COMMANDS 
    }).single();

    if (error) {
      // If RPC doesn't exist, provide manual instructions
      console.log('⚠️  Automatic setup not available. Please run this SQL manually:\n');
      console.log('📋 Steps:');
      console.log('1. Go to https://supabase.com/dashboard/project/vivovcnaapmcfxxfhzxk/sql/new');
      console.log('2. Copy and paste the SQL from: supabase-table-setup-fixed.sql');
      console.log('3. Click "Run" button\n');
      
      console.log('Or use this minimal setup SQL:\n');
      console.log('```sql');
      console.log(SQL_COMMANDS);
      console.log('```\n');
      
      return;
    }

    console.log('✅ Database setup completed successfully!\n');
    
    // Test the table
    console.log('🧪 Testing the table...');
    const { data: testData, error: testError } = await supabase
      .from('schedule_calls')
      .select('*')
      .limit(1);
    
    if (!testError) {
      console.log('✅ Table is working correctly!\n');
      console.log('📊 Table structure verified');
      console.log('🚀 Ready to receive webhook data\n');
    } else {
      console.log('⚠️  Table created but test query failed:', testError.message);
    }
    
  } catch (err) {
    console.error('❌ Setup failed:', err.message);
    console.log('\n💡 Please set up manually using the Supabase dashboard');
  }
}

// Run the setup
setupDatabase();