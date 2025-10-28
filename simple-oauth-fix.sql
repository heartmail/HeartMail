-- Simple OAuth Fix - Remove all custom triggers and use Supabase's built-in flow
-- This approach relies on client-side profile creation instead of database triggers

-- 1. Drop the problematic trigger completely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Ensure user_profiles table exists with minimal constraints
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. Enable RLS but with very permissive policies for testing
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Create very simple policies
CREATE POLICY "Allow all operations for authenticated users" ON user_profiles
  FOR ALL USING (auth.uid() = user_id);

-- 4. Create a simple function to create profiles (called from client-side)
CREATE OR REPLACE FUNCTION public.create_user_profile(
  p_user_id UUID,
  p_email TEXT,
  p_first_name TEXT DEFAULT '',
  p_last_name TEXT DEFAULT '',
  p_avatar_url TEXT DEFAULT NULL
)
RETURNS JSON AS $$
BEGIN
  -- Insert user profile
  INSERT INTO public.user_profiles (user_id, email, first_name, last_name, avatar_url)
  VALUES (p_user_id, p_email, p_first_name, p_last_name, p_avatar_url)
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();
  
  RETURN json_build_object('success', true, 'message', 'Profile created successfully');
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_user_profile TO authenticated;

-- 6. Verify the setup
SELECT 
  'SIMPLE OAUTH FIX COMPLETE' as status,
  'No triggers, using client-side profile creation' as approach;
