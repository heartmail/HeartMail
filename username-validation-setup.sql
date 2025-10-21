-- HeartMail Username Validation Setup
-- Run these commands in your Supabase SQL Editor to set up proper username validation

-- 1. Create a dedicated usernames table for validation
CREATE TABLE IF NOT EXISTS usernames (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create index for fast username lookups
CREATE INDEX IF NOT EXISTS idx_usernames_username ON usernames(username);
CREATE INDEX IF NOT EXISTS idx_usernames_user_id ON usernames(user_id);

-- 3. Add RLS policies for the usernames table
ALTER TABLE usernames ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own username
CREATE POLICY "Users can view their own username" ON usernames
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own username
CREATE POLICY "Users can insert their own username" ON usernames
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own username
CREATE POLICY "Users can update their own username" ON usernames
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own username
CREATE POLICY "Users can delete their own username" ON usernames
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Create a function to check if username exists
CREATE OR REPLACE FUNCTION check_username_exists(username_to_check TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(SELECT 1 FROM usernames WHERE username = username_to_check);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create a function to add username for a user
CREATE OR REPLACE FUNCTION add_username(user_uuid UUID, username_text TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if username already exists
  IF check_username_exists(username_text) THEN
    RETURN FALSE;
  END IF;
  
  -- Insert the username
  INSERT INTO usernames (user_id, username) 
  VALUES (user_uuid, username_text);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create a function to update username for a user
CREATE OR REPLACE FUNCTION update_username(user_uuid UUID, old_username TEXT, new_username TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if new username already exists (excluding current user)
  IF EXISTS(SELECT 1 FROM usernames WHERE username = new_username AND user_id != user_uuid) THEN
    RETURN FALSE;
  END IF;
  
  -- Update the username
  UPDATE usernames 
  SET username = new_username, updated_at = NOW()
  WHERE user_id = user_uuid AND username = old_username;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON usernames TO authenticated;
GRANT EXECUTE ON FUNCTION check_username_exists(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION add_username(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_username(UUID, TEXT, TEXT) TO authenticated;

-- 8. Verify the setup
SELECT 'Username validation setup complete!' as status;
SELECT 'Usernames table created with RLS policies' as info;
SELECT 'Functions created for username management' as functions;
