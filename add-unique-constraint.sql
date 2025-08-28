-- Add unique constraint to prevent double bookings
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/vivovcnaapmcfxxfhzxk/sql/new

-- First, clean up any existing duplicate date/time combinations
-- (This will keep the oldest booking for each date/time)
DELETE FROM schedule_calls a
USING schedule_calls b
WHERE a.date = b.date 
  AND a.time = b.time 
  AND a.created_at > b.created_at;

-- Now add the unique constraint
ALTER TABLE schedule_calls 
ADD CONSTRAINT unique_date_time_booking 
UNIQUE (date, time);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_schedule_calls_date_time 
ON schedule_calls(date, time);

-- Test the constraint by trying to insert a duplicate (this should fail)
-- INSERT INTO schedule_calls (firstname, lastname, email, time, date) 
-- VALUES ('Test', 'Constraint', 'test@constraint.com', '2:30 PM', '2025-08-29');

-- If you see an error about duplicate key, the constraint is working!