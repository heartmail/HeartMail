-- Sample data for HeartMail
-- Run this after creating the schema

-- Sample templates (public templates that all users can see)
INSERT INTO templates (id, user_id, title, content, category, is_public, tags) VALUES
(
  uuid_generate_v4(),
  NULL, -- NULL means it's a system template
  'Thinking of You',
  'Dear {{recipient_name}},\n\nI hope this email finds you well. I''ve been thinking about you lately and wanted to reach out to let you know how much you mean to me.\n\n{{personal_message}}\n\nWith love,\n{{sender_name}}',
  'love',
  true,
  ARRAY['love', 'family', 'thinking']
),
(
  uuid_generate_v4(),
  NULL,
  'Weekly Family Update',
  'Dear {{recipient_name}},\n\nI hope you''re doing well! Here''s what''s been happening in our family this week:\n\n{{personal_message}}\n\nWe miss you and can''t wait to see you soon!\n\nLove,\n{{sender_name}}',
  'family',
  true,
  ARRAY['family', 'update', 'weekly']
),
(
  uuid_generate_v4(),
  NULL,
  'Birthday Wishes',
  'Happy Birthday {{recipient_name}}!\n\nI hope your special day is filled with joy, laughter, and all the things that make you happy. You deserve all the happiness in the world!\n\n{{personal_message}}\n\nWith love and birthday wishes,\n{{sender_name}}',
  'birthday',
  true,
  ARRAY['birthday', 'celebration', 'special']
),
(
  uuid_generate_v4(),
  NULL,
  'Health Check-in',
  'Dear {{recipient_name}},\n\nI wanted to check in and see how you''re feeling. Your health and wellbeing are so important to me.\n\n{{personal_message}}\n\nPlease take care of yourself, and don''t hesitate to reach out if you need anything.\n\nWith love and concern,\n{{sender_name}}',
  'health',
  true,
  ARRAY['health', 'care', 'concern']
),
(
  uuid_generate_v4(),
  NULL,
  'Holiday Greetings',
  'Dear {{recipient_name}},\n\nI hope this holiday season brings you joy, peace, and wonderful memories with your loved ones.\n\n{{personal_message}}\n\nWishing you a wonderful holiday and a happy new year!\n\nWith warm holiday wishes,\n{{sender_name}}',
  'holiday',
  true,
  ARRAY['holiday', 'season', 'greetings']
);

-- Create a function to get service role key (you'll need to replace this with your actual service role key)
-- For now, we'll create a placeholder that you can update later
