#!/usr/bin/env node

/**
 * Production Test Script for HeartMail
 * This script tests the production Inngest integration on heartsmail.com
 */

const fetch = require('node-fetch');

const PRODUCTION_URL = 'https://heartsmail.com';

async function testProduction() {
  console.log('🧪 Testing HeartMail Production Inngest Integration...\n');

  try {
    // Test 1: Check if production app is running
    console.log('1. Checking Production App...');
    try {
      const appResponse = await fetch(`${PRODUCTION_URL}/api/inngest`);
      if (appResponse.ok) {
        console.log('✅ Production app is running and Inngest endpoint is accessible');
      } else {
        console.log('❌ Production app or Inngest endpoint is not responding');
        console.log(`   Status: ${appResponse.status}`);
        return;
      }
    } catch (error) {
      console.log('❌ Production app is not accessible:', error.message);
      console.log('   Make sure heartsmail.com is deployed and running');
      return;
    }

    // Test 2: Test scheduled email functionality with real data
    console.log('\n2. Testing Scheduled Email Functionality...');
    console.log('   Note: This requires valid user/recipient UUIDs from your database');
    
    try {
      // You'll need to replace these with real UUIDs from your database
      const testData = {
        userId: 'REPLACE_WITH_REAL_USER_UUID',
        recipientId: 'REPLACE_WITH_REAL_RECIPIENT_UUID', 
        templateId: 'REPLACE_WITH_REAL_TEMPLATE_UUID',
        toEmail: 'test@example.com',
        toName: 'Test User',
        subject: 'Production Test Email',
        bodyHtml: '<h1>Production Test</h1><p>This is a test from production.</p>',
        bodyText: 'Production Test\n\nThis is a test from production.',
        sendAt: new Date(Date.now() + 300000).toISOString() // 5 minutes from now
      };

      console.log('   ⚠️  Update the script with real UUIDs from your database');
      console.log('   ⚠️  Then run: node test-production.js');
      
      // Uncomment when you have real UUIDs:
      /*
      const scheduleResponse = await fetch(`${PRODUCTION_URL}/api/schedule-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      if (scheduleResponse.ok) {
        const result = await scheduleResponse.json();
        console.log('✅ Scheduled email endpoint is working');
        console.log('   Scheduled Email ID:', result.scheduledEmailId);
      } else {
        const error = await scheduleResponse.json();
        console.log('❌ Scheduled email endpoint failed:', error.error);
      }
      */
      
    } catch (error) {
      console.log('❌ Error testing scheduled email:', error.message);
    }

    console.log('\n🎉 Production Test Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Deploy your app to production: vercel --prod');
    console.log('2. Deploy Inngest functions: npm run inngest:deploy');
    console.log('3. Verify functions: npm run inngest:verify');
    console.log('4. Monitor at: https://app.inngest.com');
    console.log('5. Test with real user data');

  } catch (error) {
    console.error('❌ Production test failed:', error.message);
  }
}

// Run the production test
testProduction();
