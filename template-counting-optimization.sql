-- Template Counting and Performance Optimization
-- This script optimizes the database for template counting and management

-- Add indexes for better template query performance
CREATE INDEX IF NOT EXISTS idx_templates_user_id_created_at ON templates(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_templates_user_id_category ON templates(user_id, category);
CREATE INDEX IF NOT EXISTS idx_templates_user_id_is_public ON templates(user_id, is_public);
CREATE INDEX IF NOT EXISTS idx_templates_user_id_is_premium ON templates(user_id, is_premium);

-- Add composite index for template search and filtering
CREATE INDEX IF NOT EXISTS idx_templates_user_search ON templates(user_id, title, content) 
WHERE user_id IS NOT NULL;

-- Add index for template tags (if using array operations)
CREATE INDEX IF NOT EXISTS idx_templates_tags_gin ON templates USING GIN(tags) 
WHERE tags IS NOT NULL;

-- Add index for template public visibility
CREATE INDEX IF NOT EXISTS idx_templates_public_created ON templates(created_at DESC) 
WHERE is_public = true;

-- Add index for template category filtering
CREATE INDEX IF NOT EXISTS idx_templates_category_public ON templates(category, created_at DESC) 
WHERE is_public = true;

-- Create a function to get template count for a user
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

-- Create a function to get template count by category for a user
CREATE OR REPLACE FUNCTION get_user_template_count_by_category(user_uuid UUID, template_category TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER 
    FROM templates 
    WHERE user_id = user_uuid 
    AND category = template_category::template_category
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get public template count
CREATE OR REPLACE FUNCTION get_public_template_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER 
    FROM templates 
    WHERE is_public = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get template count by category (public)
CREATE OR REPLACE FUNCTION get_public_template_count_by_category(template_category TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER 
    FROM templates 
    WHERE is_public = true 
    AND category = template_category::template_category
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies for template counting functions
GRANT EXECUTE ON FUNCTION get_user_template_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_template_count_by_category(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_public_template_count() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_public_template_count_by_category(TEXT) TO authenticated, anon;

-- Create a materialized view for template statistics (optional, for analytics)
CREATE MATERIALIZED VIEW IF NOT EXISTS template_stats AS
SELECT 
  user_id,
  COUNT(*) as total_templates,
  COUNT(*) FILTER (WHERE is_public = true) as public_templates,
  COUNT(*) FILTER (WHERE is_premium = true) as premium_templates,
  COUNT(*) FILTER (WHERE category = 'love') as love_templates,
  COUNT(*) FILTER (WHERE category = 'family') as family_templates,
  COUNT(*) FILTER (WHERE category = 'health') as health_templates,
  COUNT(*) FILTER (WHERE category = 'holiday') as holiday_templates,
  COUNT(*) FILTER (WHERE category = 'birthday') as birthday_templates,
  COUNT(*) FILTER (WHERE category = 'general') as general_templates,
  MAX(created_at) as latest_template_created,
  MIN(created_at) as first_template_created
FROM templates
GROUP BY user_id;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_template_stats_user_id ON template_stats(user_id);

-- Create function to refresh template stats
CREATE OR REPLACE FUNCTION refresh_template_stats()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW template_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for template stats
GRANT SELECT ON template_stats TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_template_stats() TO service_role;

-- Add trigger to automatically refresh stats when templates change
CREATE OR REPLACE FUNCTION trigger_refresh_template_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Refresh stats in background (non-blocking)
  PERFORM pg_notify('refresh_template_stats', '');
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for template changes
DROP TRIGGER IF EXISTS template_stats_refresh_insert ON templates;
DROP TRIGGER IF EXISTS template_stats_refresh_update ON templates;
DROP TRIGGER IF EXISTS template_stats_refresh_delete ON templates;

CREATE TRIGGER template_stats_refresh_insert
  AFTER INSERT ON templates
  FOR EACH ROW
  EXECUTE FUNCTION trigger_refresh_template_stats();

CREATE TRIGGER template_stats_refresh_update
  AFTER UPDATE ON templates
  FOR EACH ROW
  EXECUTE FUNCTION trigger_refresh_template_stats();

CREATE TRIGGER template_stats_refresh_delete
  AFTER DELETE ON templates
  FOR EACH ROW
  EXECUTE FUNCTION trigger_refresh_template_stats();

-- Add comments for documentation
COMMENT ON FUNCTION get_user_template_count(UUID) IS 'Returns the total number of templates for a specific user';
COMMENT ON FUNCTION get_user_template_count_by_category(UUID, TEXT) IS 'Returns the number of templates for a user in a specific category';
COMMENT ON FUNCTION get_public_template_count() IS 'Returns the total number of public templates';
COMMENT ON FUNCTION get_public_template_count_by_category(TEXT) IS 'Returns the number of public templates in a specific category';
COMMENT ON MATERIALIZED VIEW template_stats IS 'Aggregated template statistics per user for analytics and reporting';
