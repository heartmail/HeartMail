-- Add missing columns to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Create index for username lookups (useful for checking uniqueness)
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username) WHERE username IS NOT NULL;

-- Create RPC function to check if username exists
CREATE OR REPLACE FUNCTION check_username_exists(username_to_check TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE username = username_to_check
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RPC function to create user profile
CREATE OR REPLACE FUNCTION create_user_profile(
    p_user_id UUID,
    p_email TEXT,
    p_first_name TEXT DEFAULT '',
    p_last_name TEXT DEFAULT '',
    p_avatar_url TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_profile_id UUID;
BEGIN
    -- Insert or update user profile
    INSERT INTO user_profiles (user_id, email, first_name, last_name, avatar_url)
    VALUES (p_user_id, p_email, p_first_name, p_last_name, p_avatar_url)
    ON CONFLICT (user_id) DO UPDATE
    SET 
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = NOW()
    RETURNING id INTO v_profile_id;
    
    RETURN json_build_object(
        'success', true,
        'profile_id', v_profile_id
    );
EXCEPTION
    WHEN others THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM,
            'message', 'Failed to create user profile'
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

