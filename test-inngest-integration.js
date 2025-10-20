#!/usr/bin/env node

/**
 * Test script to verify Inngest integration
 * This script tests the scheduled emailing functionality
 */

const fetch = require('node-fetch');

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL_LOCAL || 'http://localhost:3000';
const INNGEST_DEV_URL = 'http://localhost:8289';

async function testInngestIntegration() {
  console.log('🧪 Testing Inngest Integration for HeartMail...\n');

  try {
    // Test 1: Check if Inngest dev server is running
    console.log('1. Checking Inngest Dev Server...');
    try {
      const devResponse = await fetch(`${INNGEST_DEV_URL}/health`);
      if (devResponse.ok) {
        console.log('✅ Inngest Dev Server is running at', INNGEST_DEV_URL);
      } else {
        console.log('❌ Inngest Dev Server is not responding');
        return;
      }
    } catch (error) {
      console.log('❌ Inngest Dev Server is not running. Please start it with:');
      console.log('   npx inngest-cli@latest dev -u http://localhost:3000/api/inngest');
      return;
    }

    // Test 2: Check if Next.js app is running
    console.log('\n2. Checking Next.js App...');
    try {
      const appResponse = await fetch(`${BASE_URL}/api/inngest`);
      if (appResponse.ok) {
        console.log('✅ Next.js app is running and Inngest endpoint is accessible');
      } else {
        console.log('❌ Next.js app or Inngest endpoint is not responding');
        return;
      }
    } catch (error) {
      console.log('❌ Next.js app is not running. Please start it with:');
      console.log('   npm run dev');
      return;
    }

    // Test 3: Test the test function
    console.log('\n3. Testing Inngest Functions...');
    try {
      const testResponse = await fetch(`${BASE_URL}/api/inngest/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'test/hello',
          data: { message: 'Hello from HeartMail test!' }
        })
      });

      if (testResponse.ok) {
        console.log('✅ Test function endpoint is working');
      } else {
        console.log('❌ Test function endpoint failed:', testResponse.status);
      }
    } catch (error) {
      console.log('❌ Error testing function:', error.message);
    }

    // Test 4: Test scheduled email functionality
    console.log('\n4. Testing Scheduled Email Functionality...');
    try {
      // Generate proper UUIDs for testing
      const crypto = require('crypto');
      const generateUUID = () => crypto.randomUUID();
      
      const scheduleResponse = await fetch(`${BASE_URL}/api/schedule-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: generateUUID(),
          recipientId: generateUUID(),
          templateId: generateUUID(),
          toEmail: 'test@example.com',
          toName: 'Test User',
          subject: 'Test Scheduled Email',
          bodyHtml: '<h1>Test Email</h1><p>This is a test scheduled email.</p>',
          bodyText: 'Test Email\n\nThis is a test scheduled email.',
          sendAt: new Date(Date.now() + 60000).toISOString() // 1 minute from now
        })
      });

      if (scheduleResponse.ok) {
        const result = await scheduleResponse.json();
        console.log('✅ Scheduled email endpoint is working');
        console.log('   Scheduled Email ID:', result.scheduledEmailId);
      } else {
        const error = await scheduleResponse.json();
        console.log('❌ Scheduled email endpoint failed:', error.error);
      }
    } catch (error) {
      console.log('❌ Error testing scheduled email:', error.message);
    }

    console.log('\n🎉 Inngest Integration Test Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Visit http://localhost:8289 to see the Inngest Dev Server UI');
    console.log('2. Check your database for scheduled_emails table');
    console.log('3. Monitor function executions in the Inngest UI');
    console.log('4. Test with real email addresses in production');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testInngestIntegration();
