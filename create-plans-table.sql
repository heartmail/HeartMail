-- Create Plans Table for HeartMail
-- Run this in your Supabase SQL Editor

-- Create the plans table
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  email_limit INTEGER, -- NULL = unlimited
  recipients_limit INTEGER, -- NULL = unlimited
  templates_limit INTEGER, -- NULL = unlimited
  stripe_price_id TEXT,
  stripe_product_id TEXT,
  features JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the three plans
INSERT INTO plans (name, display_name, price_monthly, email_limit, recipients_limit, templates_limit, features, sort_order) VALUES
('free', 'Free', 0.00, 3, 2, 3, '{"scheduling": false, "premiumTemplates": false, "prioritySupport": false, "customBranding": false}', 1),
('family', 'Family', 9.00, 300, NULL, NULL, '{"scheduling": true, "premiumTemplates": true, "prioritySupport": true, "customBranding": false}', 2),
('extended', 'Extended', 29.00, NULL, NULL, NULL, '{"scheduling": true, "premiumTemplates": true, "prioritySupport": true, "customBranding": true}', 3)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  price_monthly = EXCLUDED.price_monthly,
  email_limit = EXCLUDED.email_limit,
  recipients_limit = EXCLUDED.recipients_limit,
  templates_limit = EXCLUDED.templates_limit,
  features = EXCLUDED.features,
  updated_at = NOW();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_plans_name ON plans(name);
CREATE INDEX IF NOT EXISTS idx_plans_active ON plans(is_active);

-- Enable RLS for plans (read-only for all authenticated users)
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for plans
DROP POLICY IF EXISTS "Authenticated users can view plans" ON plans;
CREATE POLICY "Authenticated users can view plans" ON plans
  FOR SELECT USING (auth.role() = 'authenticated');
