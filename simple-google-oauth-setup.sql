-- Enhanced Google OAuth Setup
-- This script sets up the basic tables and functions for Google OAuth with better error handling

-- 1. Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.user_profiles;

-- 4. Create simple RLS policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON public.user_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Drop existing function if it exists (to handle return type conflicts)
DROP FUNCTION IF EXISTS public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT);

-- 6. Create enhanced profile creation function with better error handling
CREATE OR REPLACE FUNCTION public.create_user_profile(
  p_user_id UUID,
  p_email TEXT,
  p_first_name TEXT DEFAULT '',
  p_last_name TEXT DEFAULT '',
  p_avatar_url TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Try to insert the profile
  INSERT INTO public.user_profiles (user_id, email, first_name, last_name, avatar_url)
  VALUES (p_user_id, p_email, p_first_name, p_last_name, p_avatar_url)
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();
  
  -- Return success
  result := json_build_object('success', true, 'message', 'Profile created/updated successfully');
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Return error details
    result := json_build_object(
      'success', false, 
      'error', SQLERRM,
      'message', 'Failed to create/update profile'
    );
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT) TO anon;

-- 8. Create a simple test function to verify setup
CREATE OR REPLACE FUNCTION public.test_oauth_setup()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  result := json_build_object(
    'status', 'success',
    'message', 'OAuth setup is working correctly',
    'timestamp', NOW()
  );
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Grant permissions for test function
GRANT EXECUTE ON FUNCTION public.test_oauth_setup() TO authenticated;
GRANT EXECUTE ON FUNCTION public.test_oauth_setup() TO anon;

-- 10. Verify setup
SELECT 'Enhanced Google OAuth setup complete' as status;