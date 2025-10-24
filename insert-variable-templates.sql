-- Insert new variable-enabled templates
-- This script replaces old templates with new ones that support template variables

-- First, delete all existing templates (optional - you can keep them if you want)
-- DELETE FROM templates;

-- Insert new variable-enabled templates
INSERT INTO templates (id, user_id, title, content, category, is_premium, is_public, tags, created_at, updated_at) VALUES
-- Daily Check-in Template
(gen_random_uuid(), NULL, 'Daily Check-in', 'Hi {{first_name}}! 💕

I just wanted to take a moment to tell you how much you mean to me. Even though we might not talk every day, you''re always in my thoughts.

Hope you''re having a wonderful day!

Love,
{{full_name}}', 'love', false, true, ARRAY['daily', 'check-in', 'love'], NOW(), NOW()),

-- Weekly Family Update Template
(gen_random_uuid(), NULL, 'Weekly Family Update', 'Hey {{first_name}}! 👋

Hope you''re doing well! I wanted to share what''s been happening in my life this week and catch up with you.

How have you been? I''d love to hear about your week too!

Talk soon,
{{full_name}}', 'family', false, true, ARRAY['weekly', 'family', 'update'], NOW(), NOW()),

-- Monthly Love Letter Template
(gen_random_uuid(), NULL, 'Monthly Love Letter', 'My dear {{first_name}},

Another month has passed, and I find myself thinking about you even more. You bring so much joy to my life, and I''m grateful for our {{relationship}}.

I hope this month brings you happiness and wonderful moments.

With love,
{{full_name}}', 'love', false, true, ARRAY['monthly', 'love', 'letter'], NOW(), NOW()),

-- Birthday Wishes Template
(gen_random_uuid(), NULL, 'Birthday Wishes', 'Happy Birthday {{first_name}}! 🎉

Another year around the sun! I hope this special day is filled with love, laughter, and all the happiness you deserve.

You mean the world to me, and I''m so grateful to have you in my life.

Celebrate big today!

Love,
{{full_name}}', 'birthday', false, true, ARRAY['birthday', 'celebration', 'special'], NOW(), NOW()),

-- Thinking of You Template
(gen_random_uuid(), NULL, 'Thinking of You', 'Hi {{first_name}},

I was just thinking about you and wanted to reach out. Sometimes the best moments are the simple ones where we connect with the people we care about.

Hope you''re having a great day!

{{full_name}}', 'general', false, true, ARRAY['thinking', 'simple', 'connection'], NOW(), NOW()),

-- Gratitude Message Template
(gen_random_uuid(), NULL, 'Gratitude Message', 'Dear {{first_name}},

I wanted to take a moment to express my gratitude for having you in my life. You bring so much joy and meaning to my days.

Thank you for being such an important part of my life.

With appreciation,
{{full_name}}', 'general', false, true, ARRAY['gratitude', 'appreciation', 'thanks'], NOW(), NOW()),

-- Encouragement Note Template
(gen_random_uuid(), NULL, 'Encouragement Note', 'Hey {{first_name}},

I know life can be challenging sometimes, but I want you to know that I believe in you. You''re stronger than you know and capable of amazing things.

You''ve got this!

Your {{relationship}},
{{full_name}}', 'general', false, true, ARRAY['encouragement', 'support', 'motivation'], NOW(), NOW()),

-- Holiday Greetings Template
(gen_random_uuid(), NULL, 'Holiday Greetings', 'Dear {{first_name}},

Wishing you a wonderful holiday season! This time of year always reminds me of the special people in my life, and you''re definitely one of them.

Hope you''re surrounded by love and joy this season.

Happy holidays!
{{full_name}}', 'holiday', false, true, ARRAY['holiday', 'season', 'greetings'], NOW(), NOW());

-- Verify the templates were inserted
SELECT 
  id,
  title,
  category,
  is_public,
  tags,
  created_at
FROM templates 
WHERE is_public = true
ORDER BY category, title;
