const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkDatabase() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  console.log('🔍 Checking HeartMail Database Structure...\n');

  try {
    // Check if scheduled_emails table exists
    console.log('1. Checking scheduled_emails table...');
    const { data: scheduledEmails, error: scheduledEmailsError } = await supabase
      .from('scheduled_emails')
      .select('id')
      .limit(1);

    if (scheduledEmailsError) {
      console.log('❌ scheduled_emails table does not exist or is not accessible');
      console.log('   Error:', scheduledEmailsError.message);
    } else {
      console.log('✅ scheduled_emails table exists and is accessible');
    }

    // Check recipients table
    console.log('\n2. Checking recipients table...');
    const { data: recipients, error: recipientsError } = await supabase
      .from('recipients')
      .select('id')
      .limit(1);

    if (recipientsError) {
      console.log('❌ recipients table does not exist or is not accessible');
      console.log('   Error:', recipientsError.message);
    } else {
      console.log('✅ recipients table exists and is accessible');
    }

    // Check templates table
    console.log('\n3. Checking templates table...');
    const { data: templates, error: templatesError } = await supabase
      .from('templates')
      .select('id')
      .limit(1);

    if (templatesError) {
      console.log('❌ templates table does not exist or is not accessible');
      console.log('   Error:', templatesError.message);
    } else {
      console.log('✅ templates table exists and is accessible');
    }

    // Check subscriptions table
    console.log('\n4. Checking subscriptions table...');
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('subscriptions')
      .select('id')
      .limit(1);

    if (subscriptionsError) {
      console.log('❌ subscriptions table does not exist or is not accessible');
      console.log('   Error:', subscriptionsError.message);
    } else {
      console.log('✅ subscriptions table exists and is accessible');
    }

    // Check users table
    console.log('\n5. Checking users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (usersError) {
      console.log('❌ users table does not exist or is not accessible');
      console.log('   Error:', usersError.message);
    } else {
      console.log('✅ users table exists and is accessible');
    }

    console.log('\n📋 Database Check Summary:');
    console.log('If any tables show ❌, you need to run the SQL migrations manually in your Supabase SQL Editor.');
    console.log('\nTo run migrations manually:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Run the scheduled-emails-schema.sql file');
    console.log('4. Run the complete-subscription-setup.sql file if needed');

  } catch (error) {
    console.error('Database check failed:', error);
  }
}

checkDatabase();
