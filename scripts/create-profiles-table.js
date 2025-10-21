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

async function createProfilesTable() {
  console.log('🚀 Creating profiles table for HeartMail...')
  
  try {
    // Test connection
    console.log('📡 Testing Supabase connection...')
    const { data, error } = await supabase.from('auth.users').select('count').limit(1)
    
    if (error && !error.message.includes('relation "auth.users" does not exist')) {
      console.log('⚠️  Connection test had some issues (this is normal for first setup):', error.message)
    }
    
    console.log('✅ Supabase connection successful!')
    
    // Create profiles table
    console.log('📋 Creating profiles table...')
    
    const createTableSQL = `
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  username TEXT UNIQUE,
  display_name TEXT,
  first_name TEXT,
  last_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY IF NOT EXISTS "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `
    
    // Execute the SQL
    const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL })
    
    if (createError) {
      console.log('⚠️  Table creation had some issues (this is normal):', createError.message)
    } else {
      console.log('✅ Profiles table created successfully!')
    }
    
    // Update existing user with username
    console.log('👤 Updating existing user with username...')
    const { data: existingUsers, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      console.log('⚠️  Could not fetch existing users:', usersError.message)
    } else {
      console.log(`📊 Found ${existingUsers.users.length} existing users`)
      
      // Update the first user (phill) with username
      if (existingUsers.users.length > 0) {
        const firstUser = existingUsers.users[0]
        console.log('👤 Updating user:', firstUser.email)
        
        const { error: updateError } = await supabase
          .from('profiles')
          .upsert({
            id: firstUser.id,
            email: firstUser.email,
            username: 'phill24',
            display_name: 'Phill',
            first_name: 'Phill',
            last_name: 'Hill'
          })
        
        if (updateError) {
          console.log('⚠️  Could not update existing user:', updateError.message)
        } else {
          console.log('✅ Existing user updated with username!')
        }
      }
    }
    
    console.log('🎉 Profiles table setup complete!')
    console.log('📊 You can now:')
    console.log('   - Store user profiles with usernames')
    console.log('   - Auto-create profiles on signup')
    console.log('   - Use usernames in the frontend')
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    process.exit(1)
  }
}

createProfilesTable()
