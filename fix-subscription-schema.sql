-- Fixed subscription schema - handles existing triggers
-- Run this in Supabase SQL Editor

-- ==============================================
-- DROP EXISTING TRIGGERS FIRST
-- ==============================================

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
DROP TRIGGER IF EXISTS update_subscription_usage_updated_at ON subscription_usage;

-- ==============================================
-- CREATE TRIGGERS SAFELY
-- ==============================================

-- Add triggers for updated_at
CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_usage_updated_at 
  BEFORE UPDATE ON subscription_usage 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- VERIFY SETUP
-- ==============================================

-- Check if tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('subscriptions', 'subscription_usage', 'billing_history') 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('subscriptions', 'subscription_usage', 'billing_history');

-- Check if triggers exist
SELECT 
  trigger_name,
  event_object_table,
  CASE 
    WHEN trigger_name LIKE '%updated_at%' 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND trigger_name LIKE '%updated_at%';

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('subscriptions', 'subscription_usage', 'billing_history')
ORDER BY tablename, policyname;
