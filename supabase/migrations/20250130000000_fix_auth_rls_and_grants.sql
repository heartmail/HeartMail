-- Fix RLS and grants for GoTrue (supabase_auth_admin)
-- This must be run as supabase_admin role

-- Disable RLS on auth tables (required for GoTrue to insert users)
ALTER TABLE auth.users           DISABLE ROW LEVEL SECURITY;
ALTER TABLE auth.identities      DISABLE ROW LEVEL SECURITY;
ALTER TABLE auth.refresh_tokens  DISABLE ROW LEVEL SECURITY;

-- Grant GoTrue role access to auth schema and tables
GRANT USAGE ON SCHEMA auth TO supabase_auth_admin;

GRANT SELECT, INSERT, UPDATE, DELETE ON auth.users           TO supabase_auth_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON auth.identities      TO supabase_auth_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON auth.refresh_tokens  TO supabase_auth_admin;

-- Grant sequence access (for auto-increment IDs)
DO $$
DECLARE 
  r RECORD;
BEGIN
  FOR r IN
    SELECT c.relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'auth' AND c.relkind = 'S'
  LOOP
    BEGIN
      EXECUTE format('GRANT USAGE, SELECT ON SEQUENCE auth.%I TO supabase_auth_admin', r.relname);
    EXCEPTION WHEN OTHERS THEN
      -- Skip if sequence doesn't exist or grant fails
      NULL;
    END;
  END LOOP;
END $$;

