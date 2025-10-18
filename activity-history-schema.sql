-- Activity History Table
-- This table tracks all user activities for the History feature

CREATE TABLE IF NOT EXISTS activity_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- 'email_sent', 'email_scheduled', 'recipient_added', 'recipient_updated', 'template_created', 'template_updated', 'settings_changed'
  title VARCHAR(255) NOT NULL, -- Short title for the activity
  description TEXT, -- Detailed description
  metadata JSONB, -- Additional data like recipient name, email subject, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activity_history_user_id ON activity_history(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_history_created_at ON activity_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_history_activity_type ON activity_history(activity_type);

-- Enable Row Level Security
ALTER TABLE activity_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own activity history" ON activity_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity history" ON activity_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity history" ON activity_history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activity history" ON activity_history
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_activity_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_activity_history_updated_at
  BEFORE UPDATE ON activity_history
  FOR EACH ROW
  EXECUTE FUNCTION update_activity_history_updated_at();

-- Insert some sample activities (optional - for testing)
-- INSERT INTO activity_history (user_id, activity_type, title, description, metadata) VALUES
-- ('your-user-id-here', 'email_sent', 'Email sent to Mom', 'Sent a heartfelt message to Mom', '{"recipient_name": "Mom", "email_subject": "Thinking of you"}'),
-- ('your-user-id-here', 'recipient_added', 'Added new recipient', 'Added Dad to your recipient list', '{"recipient_name": "Dad", "recipient_email": "dad@example.com"}'),
-- ('your-user-id-here', 'email_scheduled', 'Email scheduled for Grandma', 'Scheduled weekly email for Grandma', '{"recipient_name": "Grandma", "schedule_date": "2024-01-15"}');
