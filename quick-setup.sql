-- QUICK SETUP: Copy and paste this into Supabase SQL Editor
-- Go to: https://supabase.com/dashboard/project/vivovcnaapmcfxxfhzxk/sql/new

-- Create the main table
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
    source VARCHAR(100) DEFAULT 'schedule-call-modal'
);

-- Create essential indexes
CREATE INDEX IF NOT EXISTS idx_schedule_calls_email ON schedule_calls(email);
CREATE INDEX IF NOT EXISTS idx_schedule_calls_created_at ON schedule_calls(created_at DESC);

-- Enable Row Level Security
ALTER TABLE schedule_calls ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policy for service role
CREATE POLICY "Enable all access for service role" ON schedule_calls
    FOR ALL USING (true)
    WITH CHECK (true);

-- Grant permissions
GRANT ALL ON schedule_calls TO service_role;
GRANT SELECT ON schedule_calls TO authenticated;

-- Test insert to verify it works
INSERT INTO schedule_calls (
    firstName, lastName, email, time, date, 
    chat_queries_count, faq_queries_count, topics
) VALUES (
    'Test', 'User', 'test@example.com', '2:30 PM', CURRENT_DATE,
    1, 1, '[{"question": "Test topic"}]'::jsonb
) RETURNING *;

-- If you see a result, the table is working!
-- You can delete the test row with:
-- DELETE FROM schedule_calls WHERE email = 'test@example.com';