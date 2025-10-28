-- HeartMail Database Audit and Optimization Script
-- Run this in your Supabase SQL Editor to check for issues and optimize

-- ==============================================
-- 1. CHECK FOR DUPLICATE TABLES
-- ==============================================
SELECT 
  'DUPLICATE TABLES CHECK' as audit_section,
  table_name,
  table_type,
  table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'user_profiles')
ORDER BY table_name;

-- ==============================================
-- 2. CHECK TABLE STRUCTURES AND CONSTRAINTS
-- ==============================================
SELECT 
  'TABLE STRUCTURE AUDIT' as audit_section,
  t.table_name,
  c.column_name,
  c.data_type,
  c.is_nullable,
  c.column_default,
  CASE WHEN pk.column_name IS NOT NULL THEN 'PRIMARY KEY' 
       WHEN fk.column_name IS NOT NULL THEN 'FOREIGN KEY'
       WHEN uq.column_name IS NOT NULL THEN 'UNIQUE'
       ELSE 'NORMAL' END as constraint_type
FROM information_schema.tables t
LEFT JOIN information_schema.columns c ON t.table_name = c.table_name AND t.table_schema = c.table_schema
LEFT JOIN (
  SELECT ku.table_name, ku.column_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage ku ON tc.constraint_name = ku.constraint_name
  WHERE tc.constraint_type = 'PRIMARY KEY'
) pk ON c.table_name = pk.table_name AND c.column_name = pk.column_name
LEFT JOIN (
  SELECT ku.table_name, ku.column_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage ku ON tc.constraint_name = ku.constraint_name
  WHERE tc.constraint_type = 'FOREIGN KEY'
) fk ON c.table_name = fk.table_name AND c.column_name = fk.column_name
LEFT JOIN (
  SELECT ku.table_name, ku.column_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage ku ON tc.constraint_name = ku.constraint_name
  WHERE tc.constraint_type = 'UNIQUE'
) uq ON c.table_name = uq.table_name AND c.column_name = uq.column_name
WHERE t.table_schema = 'public' 
  AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name, c.ordinal_position;

-- ==============================================
-- 3. CHECK FOR MISSING INDEXES
-- ==============================================
SELECT 
  'MISSING INDEXES CHECK' as audit_section,
  schemaname,
  tablename,
  attname as column_name,
  n_distinct,
  correlation
FROM pg_stats 
WHERE schemaname = 'public' 
  AND n_distinct > 100  -- High cardinality columns that should be indexed
  AND NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = pg_stats.schemaname 
      AND tablename = pg_stats.tablename 
      AND indexdef LIKE '%' || pg_stats.attname || '%'
  )
ORDER BY n_distinct DESC;

-- ==============================================
-- 4. CHECK FOR ORPHANED RECORDS
-- ==============================================
-- Check for orphaned recipients
SELECT 
  'ORPHANED RECORDS CHECK' as audit_section,
  'recipients' as table_name,
  COUNT(*) as orphaned_count
FROM recipients r
LEFT JOIN auth.users u ON r.user_id = u.id
WHERE u.id IS NULL;

-- Check for orphaned templates
SELECT 
  'ORPHANED RECORDS CHECK' as audit_section,
  'templates' as table_name,
  COUNT(*) as orphaned_count
FROM templates t
LEFT JOIN auth.users u ON t.user_id = u.id
WHERE u.id IS NULL;

-- Check for orphaned scheduled_emails
SELECT 
  'ORPHANED RECORDS CHECK' as audit_section,
  'scheduled_emails' as table_name,
  COUNT(*) as orphaned_count
FROM scheduled_emails se
LEFT JOIN auth.users u ON se.user_id = u.id
WHERE u.id IS NULL;

-- Check for orphaned user_profiles
SELECT 
  'ORPHANED RECORDS CHECK' as audit_section,
  'user_profiles' as table_name,
  COUNT(*) as orphaned_count
FROM user_profiles up
LEFT JOIN auth.users u ON up.user_id = u.id
WHERE u.id IS NULL;

-- ==============================================
-- 5. CHECK ROW LEVEL SECURITY POLICIES
-- ==============================================
SELECT 
  'RLS POLICIES CHECK' as audit_section,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ==============================================
-- 6. CHECK FOR UNUSED TABLES
-- ==============================================
SELECT 
  'UNUSED TABLES CHECK' as audit_section,
  t.table_name,
  COALESCE(s.n_tup_ins, 0) as inserts,
  COALESCE(s.n_tup_upd, 0) as updates,
  COALESCE(s.n_tup_del, 0) as deletes,
  COALESCE(s.n_live_tup, 0) as live_rows
FROM information_schema.tables t
LEFT JOIN pg_stat_user_tables s ON t.table_name = s.relname
WHERE t.table_schema = 'public' 
  AND t.table_type = 'BASE TABLE'
ORDER BY COALESCE(s.n_live_tup, 0) DESC;

-- ==============================================
-- 7. CHECK FOR DUPLICATE DATA
-- ==============================================
-- Check for duplicate recipients per user
SELECT 
  'DUPLICATE DATA CHECK' as audit_section,
  'recipients' as table_name,
  user_id,
  email,
  COUNT(*) as duplicate_count
FROM recipients
GROUP BY user_id, email
HAVING COUNT(*) > 1;

-- Check for duplicate templates per user
SELECT 
  'DUPLICATE DATA CHECK' as audit_section,
  'templates' as table_name,
  user_id,
  title,
  COUNT(*) as duplicate_count
FROM templates
GROUP BY user_id, title
HAVING COUNT(*) > 1;

-- ==============================================
-- 8. CHECK TABLE SIZES AND STORAGE
-- ==============================================
SELECT 
  'TABLE SIZES CHECK' as audit_section,
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ==============================================
-- 9. CHECK FOR MISSING FOREIGN KEY CONSTRAINTS
-- ==============================================
SELECT 
  'MISSING FOREIGN KEYS CHECK' as audit_section,
  t.table_name,
  c.column_name,
  c.data_type,
  CASE 
    WHEN c.column_name LIKE '%_id' AND c.column_name != 'id' THEN 'SHOULD HAVE FK'
    ELSE 'OK'
  END as fk_status
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public' 
  AND t.table_type = 'BASE TABLE'
  AND c.column_name LIKE '%_id' 
  AND c.column_name != 'id'
  AND NOT EXISTS (
    SELECT 1 FROM information_schema.key_column_usage kcu
    JOIN information_schema.table_constraints tc ON kcu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND kcu.table_name = t.table_name
      AND kcu.column_name = c.column_name
  )
ORDER BY t.table_name, c.column_name;

-- ==============================================
-- 10. CHECK FOR POTENTIAL PERFORMANCE ISSUES
-- ==============================================
-- Check for tables without proper indexes on foreign keys
SELECT 
  'PERFORMANCE ISSUES CHECK' as audit_section,
  t.table_name,
  c.column_name,
  'Missing index on foreign key' as issue
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public' 
  AND t.table_type = 'BASE TABLE'
  AND c.column_name LIKE '%_id' 
  AND c.column_name != 'id'
  AND NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
      AND tablename = t.table_name 
      AND indexdef LIKE '%' || c.column_name || '%'
  )
ORDER BY t.table_name, c.column_name;
