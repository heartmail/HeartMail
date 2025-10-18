-- Photo Management Database Schema
-- This script adds photo storage and management capabilities to HeartMail

-- Add profile photo to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS photo_updated_at TIMESTAMP WITH TIME ZONE;

-- Create user_photos table for photo library
CREATE TABLE IF NOT EXISTS user_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  is_profile_photo BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add public template flag to templates table
ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS template_photos JSONB DEFAULT '[]';

-- Create template_photos table for photos embedded in templates
CREATE TABLE IF NOT EXISTS template_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
  photo_id UUID REFERENCES user_photos(id) ON DELETE CASCADE,
  position JSONB, -- {x, y, width, height, rotation} for positioning
  z_index INTEGER DEFAULT 0, -- for layering
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_photos_user_id ON user_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_user_photos_is_profile ON user_photos(is_profile_photo);
CREATE INDEX IF NOT EXISTS idx_templates_is_public ON templates(is_public);
CREATE INDEX IF NOT EXISTS idx_template_photos_template_id ON template_photos(template_id);
CREATE INDEX IF NOT EXISTS idx_template_photos_photo_id ON template_photos(photo_id);

-- Add RLS policies for user_photos
ALTER TABLE user_photos ENABLE ROW LEVEL SECURITY;

-- Users can only see their own photos
CREATE POLICY "Users can view own photos" ON user_photos
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own photos
CREATE POLICY "Users can insert own photos" ON user_photos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own photos
CREATE POLICY "Users can update own photos" ON user_photos
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own photos
CREATE POLICY "Users can delete own photos" ON user_photos
  FOR DELETE USING (auth.uid() = user_id);

-- Add RLS policies for template_photos
ALTER TABLE template_photos ENABLE ROW LEVEL SECURITY;

-- Users can only see template photos for their own templates
CREATE POLICY "Users can view own template photos" ON template_photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM templates 
      WHERE templates.id = template_photos.template_id 
      AND templates.user_id = auth.uid()
    )
  );

-- Users can insert template photos for their own templates
CREATE POLICY "Users can insert own template photos" ON template_photos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM templates 
      WHERE templates.id = template_photos.template_id 
      AND templates.user_id = auth.uid()
    )
  );

-- Users can update template photos for their own templates
CREATE POLICY "Users can update own template photos" ON template_photos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM templates 
      WHERE templates.id = template_photos.template_id 
      AND templates.user_id = auth.uid()
    )
  );

-- Users can delete template photos for their own templates
CREATE POLICY "Users can delete own template photos" ON template_photos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM templates 
      WHERE templates.id = template_photos.template_id 
      AND templates.user_id = auth.uid()
    )
  );

-- Update templates RLS to allow public templates to be viewed by anyone
CREATE POLICY "Public templates are viewable by anyone" ON templates
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_user_photos_updated_at 
  BEFORE UPDATE ON user_photos 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_template_photos_updated_at 
  BEFORE UPDATE ON template_photos 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
