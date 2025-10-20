const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function migrateActivityHistory() {
  console.log('🚀 Creating activity_history table...')
  
  try {
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create activity_history table for tracking user activities
        CREATE TABLE IF NOT EXISTS activity_history (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          activity_type TEXT NOT NULL CHECK (activity_type IN (
            'email_sent', 
            'email_scheduled', 
            'email_delivered',
            'recipient_added', 
            'recipient_updated', 
            'template_created', 
            'template_updated', 
            'settings_changed'
          )),
          title TEXT NOT NULL,
          description TEXT,
          metadata JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_activity_history_user_id ON activity_history(user_id);
        CREATE INDEX IF NOT EXISTS idx_activity_history_activity_type ON activity_history(activity_type);
        CREATE INDEX IF NOT EXISTS idx_activity_history_created_at ON activity_history(created_at);

        -- Enable RLS
        ALTER TABLE activity_history ENABLE ROW LEVEL SECURITY;

        -- Create RLS policies
        CREATE POLICY "Users can view own activities" ON activity_history
          FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Users can insert own activities" ON activity_history
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update own activities" ON activity_history
          FOR UPDATE USING (auth.uid() = user_id);

        CREATE POLICY "Users can delete own activities" ON activity_history
          FOR DELETE USING (auth.uid() = user_id);
      `
    })

    if (error) {
      console.error('❌ Error creating activity_history table:', error)
      process.exit(1)
    }

    console.log('✅ activity_history table created successfully!')
    console.log('📋 Table includes:')
    console.log('   - email_sent activities')
    console.log('   - email_scheduled activities')
    console.log('   - recipient_added/updated activities')
    console.log('   - template_created/updated activities')
    console.log('   - Proper RLS policies for user data security')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

migrateActivityHistory()
