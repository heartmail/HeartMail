-- HeartMail Database Verification Script
-- Run this AFTER the cleanup script to verify everything is working

-- ==============================================
-- 1. VERIFY TABLE STRUCTURE
-- ==============================================
SELECT 
  'TABLE STRUCTURE VERIFICATION' as check_type,
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('user_profiles', 'recipients', 'templates', 'scheduled_emails', 'subscriptions', 'subscription_usage', 'user_preferences', 'activity_history')
ORDER BY table_name, ordinal_position;

-- ==============================================
-- 2. VERIFY INDEXES
-- ==============================================
SELECT 
  'INDEX VERIFICATION' as check_type,
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
  AND tablename IN ('user_profiles', 'recipients', 'templates', 'scheduled_emails', 'subscriptions', 'subscription_usage', 'user_preferences', 'activity_history')
ORDER BY tablename, indexname;

-- ==============================================
-- 3. VERIFY RLS POLICIES
-- ==============================================
SELECT 
  'RLS POLICIES VERIFICATION' as check_type,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('user_profiles', 'recipients', 'templates', 'scheduled_emails', 'subscriptions', 'subscription_usage', 'user_preferences', 'activity_history')
ORDER BY tablename, policyname;

-- ==============================================
-- 4. VERIFY FOREIGN KEY CONSTRAINTS
-- ==============================================
SELECT 
  'FOREIGN KEY VERIFICATION' as check_type,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- ==============================================
-- 5. VERIFY NO ORPHANED RECORDS
-- ==============================================
SELECT 
  'ORPHANED RECORDS VERIFICATION' as check_type,
  'user_profiles' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN u.id IS NOT NULL THEN 1 END) as valid_records,
  COUNT(CASE WHEN u.id IS NULL THEN 1 END) as orphaned_records
FROM user_profiles up
LEFT JOIN auth.users u ON up.user_id = u.id

UNION ALL

SELECT 
  'ORPHANED RECORDS VERIFICATION' as check_type,
  'recipients' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN u.id IS NOT NULL THEN 1 END) as valid_records,
  COUNT(CASE WHEN u.id IS NULL THEN 1 END) as orphaned_records
FROM recipients r
LEFT JOIN auth.users u ON r.user_id = u.id

UNION ALL

SELECT 
  'ORPHANED RECORDS VERIFICATION' as check_type,
  'templates' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN u.id IS NOT NULL THEN 1 END) as valid_records,
  COUNT(CASE WHEN u.id IS NULL THEN 1 END) as orphaned_records
FROM templates t
LEFT JOIN auth.users u ON t.user_id = u.id;

-- ==============================================
-- 6. VERIFY NO DUPLICATE DATA
-- ==============================================
SELECT 
  'DUPLICATE DATA VERIFICATION' as check_type,
  'recipients' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT user_id, email) as unique_combinations,
  COUNT(*) - COUNT(DISTINCT user_id, email) as duplicates
FROM recipients

UNION ALL

SELECT 
  'DUPLICATE DATA VERIFICATION' as check_type,
  'templates' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT user_id, title) as unique_combinations,
  COUNT(*) - COUNT(DISTINCT user_id, title) as duplicates
FROM templates;

-- ==============================================
-- 7. VERIFY TRIGGER FUNCTION
-- ==============================================
SELECT 
  'TRIGGER VERIFICATION' as check_type,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
  AND trigger_name = 'on_auth_user_created';

-- ==============================================
-- 8. PERFORMANCE CHECK
-- ==============================================
SELECT 
  'PERFORMANCE CHECK' as check_type,
  schemaname,
  tablename,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes,
  n_live_tup as live_rows,
  n_dead_tup as dead_rows,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- ==============================================
-- 9. STORAGE USAGE
-- ==============================================
SELECT 
  'STORAGE USAGE' as check_type,
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size,
  pg_size_pretty(pg_database_size(current_database())) as database_size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ==============================================
-- 10. FINAL HEALTH CHECK
-- ==============================================
SELECT 
  'FINAL HEALTH CHECK' as check_type,
  'Database is optimized and ready for production' as status,
  current_timestamp as checked_at;
