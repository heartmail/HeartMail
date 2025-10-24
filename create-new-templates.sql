-- Create new templates with {{first_name}} and {{relationship}} variables
-- These templates will be inserted into the templates table

INSERT INTO templates (id, user_id, title, content, category, is_premium, is_public, tags, created_at, updated_at) VALUES
-- Template 1: Simple Check-in
(gen_random_uuid(), NULL, 'Simple Check-in', 'Hi {{first_name}}! 

Just wanted to check in and see how you''re doing. Hope you''re having a wonderful day!

Love,
Your {{relationship}}', 'love', false, true, ARRAY['check-in', 'simple', 'love'], NOW(), NOW()),

-- Template 2: Thinking of You
(gen_random_uuid(), NULL, 'Thinking of You', 'Dear {{first_name}},

I''ve been thinking about you lately and wanted to reach out. You mean so much to me as my {{relationship}}.

Hope this message brings a smile to your face!

With love,
Your {{relationship}}', 'love', false, true, ARRAY['thinking', 'love', 'family'], NOW(), NOW()),

-- Template 3: Daily Encouragement
(gen_random_uuid(), NULL, 'Daily Encouragement', 'Good morning {{first_name}}! 

I hope you have an amazing day ahead. Remember that you''re loved and appreciated as my {{relationship}}.

You''ve got this!

Your {{relationship}}', 'general', false, true, ARRAY['encouragement', 'daily', 'motivation'], NOW(), NOW()),

-- Template 4: Gratitude Message
(gen_random_uuid(), NULL, 'Gratitude Message', 'Hi {{first_name}},

I wanted to take a moment to tell you how grateful I am to have you as my {{relationship}}. You bring so much joy to my life.

Thank you for being you!

With gratitude,
Your {{relationship}}', 'general', false, true, ARRAY['gratitude', 'appreciation', 'family'], NOW(), NOW()),

-- Template 5: Weekend Wishes
(gen_random_uuid(), NULL, 'Weekend Wishes', 'Happy weekend {{first_name}}! 

I hope you get to relax and enjoy some time for yourself. You deserve it as my wonderful {{relationship}}.

Have a great weekend!

Your {{relationship}}', 'general', false, true, ARRAY['weekend', 'wishes', 'family'], NOW(), NOW()),

-- Template 6: Health Check-in
(gen_random_uuid(), NULL, 'Health Check-in', 'Hi {{first_name}},

I hope you''re feeling well and taking care of yourself. As your {{relationship}}, I care about your health and happiness.

Let me know if you need anything!

Your {{relationship}}', 'health', false, true, ARRAY['health', 'care', 'family'], NOW(), NOW()),

-- Template 7: Memory Sharing
(gen_random_uuid(), NULL, 'Memory Sharing', 'Dear {{first_name}},

I was just thinking about that time we [shared memory]. You''re such an important part of my life as my {{relationship}}.

Thanks for all the wonderful memories!

Your {{relationship}}', 'general', false, true, ARRAY['memories', 'nostalgia', 'family'], NOW(), NOW()),

-- Template 8: Support Message
(gen_random_uuid(), NULL, 'Support Message', 'Hi {{first_name}},

I know things might be challenging right now, but I want you to know that I''m here for you as your {{relationship}}. You''re stronger than you know.

I believe in you!

Your {{relationship}}', 'general', false, true, ARRAY['support', 'encouragement', 'family'], NOW(), NOW());
