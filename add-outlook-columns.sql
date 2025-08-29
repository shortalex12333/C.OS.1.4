-- Add missing columns to yacht_emails table for Outlook-style display
ALTER TABLE yacht_emails 
ADD COLUMN IF NOT EXISTS sender_title TEXT,
ADD COLUMN IF NOT EXISTS sender_company TEXT,
ADD COLUMN IF NOT EXISTS signature_block TEXT,
ADD COLUMN IF NOT EXISTS sender_avatar_url TEXT;

-- Update existing records with sample data for testing
UPDATE yacht_emails 
SET 
  sender_title = CASE 
    WHEN sender_name ILIKE '%captain%' THEN 'Captain'
    WHEN sender_name ILIKE '%manager%' THEN 'Manager'
    WHEN sender_name ILIKE '%engineer%' THEN 'Engineer'
    WHEN sender_name ILIKE '%director%' OR sender_email ILIKE '%celeste7%' THEN 'Director'
    ELSE 'Staff'
  END,
  sender_company = CASE 
    WHEN sender_email ILIKE '%celeste7%' THEN 'CELESTE7 LTD'
    WHEN sender_email ILIKE '%yacht%' THEN yacht_name
    WHEN yacht_name IS NOT NULL THEN yacht_name
    ELSE 'Maritime Services'
  END,
  signature_block = sender_name || E'\n' || 
    COALESCE(
      CASE 
        WHEN sender_name ILIKE '%captain%' THEN 'Captain'
        WHEN sender_name ILIKE '%manager%' THEN 'Manager'  
        WHEN sender_name ILIKE '%engineer%' THEN 'Engineer'
        WHEN sender_name ILIKE '%director%' OR sender_email ILIKE '%celeste7%' THEN 'Director'
        ELSE 'Staff'
      END, '') || E'\n' ||
    COALESCE(yacht_name, 'Maritime Operations') || E'\n' ||
    sender_email
WHERE sender_title IS NULL OR sender_company IS NULL OR signature_block IS NULL;

-- Verify the changes
SELECT 
  id,
  sender_name,
  sender_title,
  sender_company,
  LEFT(signature_block, 100) as signature_preview,
  attachment_count,
  has_attachments
FROM yacht_emails 
WHERE sender_title IS NOT NULL 
LIMIT 5;