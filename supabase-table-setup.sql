-- Create the schedule_calls table for storing call scheduling requests
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
    
    -- Additional useful fields for analytics
    phone VARCHAR(50),
    yacht_size VARCHAR(100),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    timezone VARCHAR(100),
    session_id TEXT,
    source VARCHAR(100) DEFAULT 'schedule-call-modal',
    
    -- Indexes for common queries
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_schedule_calls_email ON schedule_calls(email);
CREATE INDEX IF NOT EXISTS idx_schedule_calls_created_at ON schedule_calls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_schedule_calls_date ON schedule_calls(date);
CREATE INDEX IF NOT EXISTS idx_schedule_calls_user_id ON schedule_calls(user_id);

-- Create a GIN index for JSONB topics column for efficient searching
CREATE INDEX IF NOT EXISTS idx_schedule_calls_topics_gin ON schedule_calls USING GIN (topics);

-- Enable Row Level Security
ALTER TABLE schedule_calls ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow service accounts and admins to read/write all data
CREATE POLICY "Service accounts can manage schedule_calls" ON schedule_calls
    FOR ALL USING (
        current_setting('role') = 'service_role' OR
        current_setting('role') = 'postgres'
    );

-- Allow authenticated users to read only their own records
CREATE POLICY "Users can view own schedule_calls" ON schedule_calls
    FOR SELECT USING (
        auth.uid() = user_id OR
        current_setting('role') = 'service_role'
    );

-- Grant necessary permissions
GRANT ALL ON schedule_calls TO service_role;
GRANT SELECT ON schedule_calls TO authenticated;

-- Create a view for analytics (optional)
CREATE OR REPLACE VIEW schedule_calls_analytics AS
SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as total_requests,
    AVG(chat_queries_count) as avg_chat_queries,
    AVG(faq_queries_count) as avg_faq_queries,
    COUNT(DISTINCT email) as unique_users,
    ARRAY_AGG(DISTINCT yacht_size) FILTER (WHERE yacht_size IS NOT NULL) as yacht_sizes,
    -- Extract common topics
    (
        SELECT ARRAY_AGG(DISTINCT topic->>'question')
        FROM schedule_calls sc
        CROSS JOIN JSONB_ARRAY_ELEMENTS(sc.topics) AS topic
        WHERE DATE_TRUNC('month', sc.created_at) = DATE_TRUNC('month', schedule_calls.created_at)
        LIMIT 10
    ) as top_topics
FROM schedule_calls
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Grant access to the analytics view
GRANT SELECT ON schedule_calls_analytics TO authenticated;
GRANT ALL ON schedule_calls_analytics TO service_role;

-- Create a function to extract engagement insights
CREATE OR REPLACE FUNCTION get_user_engagement_insights(user_email TEXT)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_requests', COUNT(*),
        'avg_chat_queries', AVG(chat_queries_count),
        'avg_faq_queries', AVG(faq_queries_count),
        'total_topics', SUM(jsonb_array_length(topics)),
        'unique_topics', (
            SELECT COUNT(DISTINCT topic->>'question')
            FROM schedule_calls sc
            CROSS JOIN jsonb_array_elements(sc.topics) AS topic
            WHERE sc.email = user_email
        ),
        'preferred_times', ARRAY_AGG(DISTINCT time),
        'yacht_sizes', ARRAY_AGG(DISTINCT yacht_size) FILTER (WHERE yacht_size IS NOT NULL),
        'last_request', MAX(created_at)
    ) INTO result
    FROM schedule_calls 
    WHERE email = user_email;
    
    RETURN COALESCE(result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_user_engagement_insights TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_engagement_insights TO service_role;

-- Sample query to test the table (commented out)
/*
-- Test insert
INSERT INTO schedule_calls (
    firstName, lastName, email, yacht_length, time, date, 
    chat_queries_count, faq_queries_count, topics,
    phone, yacht_size, timezone, source
) VALUES (
    'John', 'Doe', 'john.doe@example.com', 85, '2:30 PM', '2024-02-15',
    5, 3, '[{"question": "How does CelesteOS work?", "timestamp": "2024-01-15T10:30:00Z"}]'::jsonb,
    '+1-555-123-4567', '80-120 ft', 'America/New_York', 'schedule-call-modal'
);

-- Test select
SELECT * FROM schedule_calls WHERE email = 'john.doe@example.com';

-- Test analytics view
SELECT * FROM schedule_calls_analytics;

-- Test engagement insights function
SELECT get_user_engagement_insights('john.doe@example.com');
*/