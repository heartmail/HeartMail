-- Essential Template Optimization for HeartMail
-- Run this in your Supabase SQL Editor

-- Add essential indexes for template performance
CREATE INDEX IF NOT EXISTS idx_templates_user_id_created_at ON templates(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_templates_user_id_category ON templates(user_id, category);
CREATE INDEX IF NOT EXISTS idx_templates_user_id_is_public ON templates(user_id, is_public);

-- Add index for template search functionality
CREATE INDEX IF NOT EXISTS idx_templates_user_search ON templates(user_id, title, content) 
WHERE user_id IS NOT NULL;

-- Add index for public templates
CREATE INDEX IF NOT EXISTS idx_templates_public_created ON templates(created_at DESC) 
WHERE is_public = true;

-- Create a simple function to get user template count
CREATE OR REPLACE FUNCTION get_user_template_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER 
    FROM templates 
    WHERE user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_user_template_count(UUID) TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_user_template_count(UUID) IS 'Returns the total number of templates for a specific user';
