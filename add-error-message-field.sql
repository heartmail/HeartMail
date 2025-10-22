-- Add error_message field to scheduled_emails table if it doesn't exist
ALTER TABLE scheduled_emails 
ADD COLUMN IF NOT EXISTS error_message TEXT;
