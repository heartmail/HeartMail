-- Fix Google OAuth Database Error
-- This script creates a robust trigger function that handles errors gracefully

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create a more robust trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert user profile (with error handling)
  BEGIN
    INSERT INTO public.user_profiles (user_id, email, first_name, last_name, avatar_url)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'given_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', NEW.raw_user_meta_data->>'family_name', ''),
      NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Failed to create user profile: %', SQLERRM;
  END;

  -- Insert user preferences (with error handling)
  BEGIN
    INSERT INTO public.user_preferences (user_id, timezone, email_notifications, push_notifications, theme)
    VALUES (NEW.id, 'America/New_York', true, true, 'light')
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Failed to create user preferences: %', SQLERRM;
  END;

  -- Insert default free subscription (with error handling)
  BEGIN
    INSERT INTO public.subscriptions (user_id, plan, status)
    VALUES (NEW.id, 'free', 'active')
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Failed to create subscription: %', SQLERRM;
  END;

  -- Create initial subscription usage record (with error handling)
  BEGIN
    INSERT INTO public.subscription_usage (user_id, month_year, emails_sent_this_month, recipients_created)
    VALUES (NEW.id, TO_CHAR(NOW() AT TIME ZONE 'UTC', 'YYYY-MM'), 0, 0)
    ON CONFLICT (user_id, month_year) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Failed to create subscription usage: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Test the function by checking if it exists
SELECT 
  'TRIGGER FUNCTION CREATED' as status,
  proname as function_name,
  prosrc as function_body
FROM pg_proc 
WHERE proname = 'handle_new_user' 
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
