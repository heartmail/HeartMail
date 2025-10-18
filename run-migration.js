const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const schemaPath = path.join(__dirname, 'scheduled-emails-schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  console.log('Running scheduled-emails-schema.sql migration...');
  console.log('SQL Content:');
  console.log('---');
  console.log(sql);
  console.log('---');

  try {
    // Split SQL into individual statements and execute them
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          console.warn(`Warning executing statement: ${error.message}`);
          // Continue with other statements
        }
      }
    }

    console.log('Migration completed!');
    
    // Verify the table exists
    const { data, error } = await supabase
      .from('scheduled_emails')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Error verifying table:', error);
    } else {
      console.log('✅ scheduled_emails table exists and is accessible');
    }

  } catch (error) {
    console.error('Migration failed:', error);
    console.log('\nPlease run the SQL manually in your Supabase SQL Editor:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the SQL content above');
    console.log('4. Click "Run"');
  }
}

runMigration();
