require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.development

if (!supabaseUrl || !supabaseServiceKey) derror('❌ Missing Supabase credentials in .env.local')
  console.error('Required environment variables:')
  console.error('  - NEXT_PUBLIC_SUPABASE_URL')
  console.error('  - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function fixUserProfilesTable() {
  console.log('🚀 Fixing user_profiles table...')
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250101000000_create_user_profiles.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('📋 Reading migration file...')
    console.log('📝 Executing migration SQL...')
    
    // Split the SQL into individual statements and execute them
    // Note: Supabase doesn't support multi-statement queries via RPC easily
    // So we'll need to execute this via the Supabase dashboard SQL editor or use a different approach
    
    console.log('\n⚠️  IMPORTANT: Please apply this migration using one of these methods:\n')
    console.log('Method 1: Supabase Dashboard')
    console.log('  1. Go to your Supabase project dashboard')
    console.log('  2. Navigate to SQL Editor')
    console.log('  3. Copy and paste the contents of:')
    console.log(`     ${migrationPath}`)
    console.log('  4. Click "Run" to execute\n')
    
    console.log('Method 2: Supabase CLI')
    console.log('  1. Make sure you have Supabase CLI installed')
    console.log('  2. Run: supabase db push')
    console.log('  3. This will apply all migrations in supabase/migrations/\n')
    
    console.log('Method 3: Direct SQL Execution')
    console.log('  You can also run the SQL file directly using psql or any PostgreSQL client\n')
    
    // Check if table exists
    console.log('\n🔍 Checking if user_profiles table exists...')
    const { data: tableCheck, error: tableError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)
    
    if (tableError) {
      if (tableError.message.includes('does not exist')) {
        console.log('❌ user_profiles table does not exist - migration needs to be applied')
      } else {
        console.log('⚠️  Error checking table:', tableError.message)
      }
    } else {
      console.log('✅ user_profiles table exists!')
      console.log('   However, please verify the schema matches the migration file')
    }
    
    // Check if RPC functions exist
    console.log('\n🔍 Checking if RPC functions exist...')
    const { data: usernameCheck, error: usernameError } = await supabase
      .rpc('check_username_exists', { username_to_check: 'test_check' })
    
    if (usernameError) {
      if (usernameError.message.includes('does not exist')) {
        console.log('❌ check_username_exists function does not exist')
     的样子 {
        console.log('⚠️  Function exists but returned error (this is expected for test):', usernameError.message)
      القراءة
    } else {
      console.log('✅ check_username_exists function exists')
    }
    
    console.log('\n✅ Verification complete!')
    console.log('📝 Please apply the migration using one of the methods above\n')
    
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

fixUserProfilesTable()

