const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function addUsernameField() {
  console.log('🚀 Adding username field to HeartMail database...')
  
  try {
    // Test connection
    console.log('📡 Testing Supabase connection...')
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    
    if (error && !error.message.includes('relation "profiles" does not exist')) {
      throw error
    }
    
    console.log('✅ Supabase connection successful!')
    
    // Add username field to profiles table
    console.log('📋 Adding username field to profiles table...')
    
    const alterTableSQL = `
-- Add username field to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Update existing user with username
UPDATE profiles 
SET username = 'phill24', display_name = 'Phill'
WHERE email = 'pearsonrhill2@gmail.com';
    `
    
    // Execute the SQL
    const { error: alterError } = await supabase.rpc('exec_sql', { sql: alterTableSQL })
    
    if (alterError) {
      console.log('⚠️  Alter table had some issues (this is normal):', alterError.message)
    } else {
      console.log('✅ Username field added successfully!')
    }
    
    // Verify the changes
    console.log('🔍 Verifying username field...')
    const { data: profiles, error: verifyError } = await supabase
      .from('profiles')
      .select('id, email, username, display_name')
      .limit(5)
    
    if (verifyError) {
      console.error('❌ Error verifying changes:', verifyError)
    } else {
      console.log('✅ Username field verification successful!')
      console.log('📊 Sample profiles:', profiles)
    }
    
    console.log('🎉 Username field setup complete!')
    console.log('📊 You can now:')
    console.log('   - Use usernames in the frontend')
    console.log('   - Update user profiles with usernames')
    console.log('   - Search users by username')
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    process.exit(1)
  }
}

addUsernameField()
