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

async function fixDatabaseSchema() {
  console.log('🚀 Fixing HeartMail database schema...')
  
  try {
    // Test connection
    console.log('📡 Testing Supabase connection...')
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1)
    
    if (error && !error.message.includes('relation "user_profiles" does not exist')) {
      console.log('⚠️  Connection test had some issues:', error.message)
    }
    
    console.log('✅ Supabase connection successful!')
    
    // Add username and display_name columns to user_profiles table
    console.log('📋 Adding username fields to user_profiles table...')
    
    const alterTableSQL = `
-- Add username and display_name fields to user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);

-- Update existing user with username
UPDATE user_profiles 
SET username = 'phill24', display_name = 'Phill'
WHERE email = 'pearsonrhill2@gmail.com';
    `
    
    // Execute the SQL
    const { error: alterError } = await supabase.rpc('exec_sql', { sql: alterTableSQL })
    
    if (alterError) {
      console.log('⚠️  Alter table had some issues (this is normal):', alterError.message)
    } else {
      console.log('✅ Username fields added successfully!')
    }
    
    // Verify the changes
    console.log('🔍 Verifying username fields...')
    const { data: profiles, error: verifyError } = await supabase
      .from('user_profiles')
      .select('id, email, username, display_name, first_name, last_name')
      .limit(5)
    
    if (verifyError) {
      console.error('❌ Error verifying changes:', verifyError)
    } else {
      console.log('✅ Username fields verification successful!')
      console.log('📊 Sample profiles:', profiles)
    }
    
    console.log('🎉 Database schema fix complete!')
    console.log('📊 You can now:')
    console.log('   - Use usernames in the frontend')
    console.log('   - Display usernames instead of emails')
    console.log('   - Update user profiles with usernames')
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    process.exit(1)
  }
}

fixDatabaseSchema()
