-- Simplified Custom Variables System
-- Store custom variables in recipients table as JSONB (already implemented)
-- No separate table needed - keep it simple!

-- Add custom_variables column to recipients table (if not exists)
ALTER TABLE recipients 
ADD COLUMN IF NOT EXISTS custom_variables JSONB DEFAULT '{}';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_recipients_custom_variables 
ON recipients USING GIN (custom_variables);

-- Create function to get all custom variable keys across all recipients for a user
CREATE OR REPLACE FUNCTION get_user_custom_variables(user_id_param UUID)
RETURNS TEXT[] AS $$
DECLARE
    all_keys TEXT[] := '{}';
    recipient_record RECORD;
    key_record RECORD;
BEGIN
    -- Loop through all recipients for the user
    FOR recipient_record IN 
        SELECT custom_variables 
        FROM recipients 
        WHERE user_id = user_id_param 
        AND custom_variables IS NOT NULL
        AND custom_variables != '{}'
    LOOP
        -- Extract keys from the JSONB object
        FOR key_record IN 
            SELECT jsonb_object_keys(recipient_record.custom_variables) as key_name
        LOOP
            -- Add key to array if not already present
            IF NOT (key_record.key_name = ANY(all_keys)) THEN
                all_keys := all_keys || key_record.key_name;
            END IF;
        END LOOP;
    END LOOP;
    
    RETURN all_keys;
END;
$$ LANGUAGE plpgsql;

-- Create function to get recipient's custom variable value
CREATE OR REPLACE FUNCTION get_recipient_custom_variable(
  recipient_id_param UUID,
  var_name TEXT
)
RETURNS TEXT AS $$
DECLARE
  var_value TEXT;
BEGIN
  SELECT custom_variables->>var_name INTO var_value
  FROM recipients 
  WHERE id = recipient_id_param;
  
  RETURN COALESCE(var_value, '');
END;
$$ LANGUAGE plpgsql;
