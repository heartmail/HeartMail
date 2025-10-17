#!/usr/bin/env node

/**
 * HeartMail Stripe Integration Test Script
 * 
 * This script tests the Stripe integration for both local and production environments.
 * Run with: node test-stripe-integration.js
 */

const https = require('https');
const http = require('http');

// Configuration
const config = {
  local: {
    baseUrl: 'http://localhost:3000',
    name: 'Local Development'
  },
  production: {
    baseUrl: 'https://heartsmail.com',
    name: 'Production'
  }
};

// Test functions
async function testStripeConnection(environment) {
  console.log(`\n🔍 Testing Stripe Connection - ${environment.name}`);
  console.log(`URL: ${environment.baseUrl}/api/test-stripe`);
  
  try {
    const response = await fetch(`${environment.baseUrl}/api/test-stripe`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Stripe connection successful');
      console.log(`📦 Products found: ${data.products.length}`);
      data.products.forEach(product => {
        console.log(`   - ${product.name} (${product.active ? 'Active' : 'Inactive'})`);
      });
    } else {
      console.log('❌ Stripe connection failed');
      console.log(`Error: ${data.error}`);
    }
  } catch (error) {
    console.log('❌ Connection failed');
    console.log(`Error: ${error.message}`);
  }
}

async function testWebhookEndpoint(environment) {
  console.log(`\n🔗 Testing Webhook Endpoint - ${environment.name}`);
  console.log(`URL: ${environment.baseUrl}/api/stripe/webhook`);
  
  try {
    const response = await fetch(`${environment.baseUrl}/api/stripe/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test-signature'
      },
      body: JSON.stringify({ test: true })
    });
    
    if (response.status === 400) {
      console.log('✅ Webhook endpoint is accessible (expected signature error)');
    } else {
      console.log(`⚠️  Unexpected response: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Webhook endpoint not accessible');
    console.log(`Error: ${error.message}`);
  }
}

async function testPricingPage(environment) {
  console.log(`\n💰 Testing Pricing Page - ${environment.name}`);
  console.log(`URL: ${environment.baseUrl}/pricing`);
  
  try {
    const response = await fetch(`${environment.baseUrl}/pricing`);
    
    if (response.ok) {
      console.log('✅ Pricing page is accessible');
    } else {
      console.log(`❌ Pricing page failed: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Pricing page not accessible');
    console.log(`Error: ${error.message}`);
  }
}

async function testDashboard(environment) {
  console.log(`\n📊 Testing Dashboard - ${environment.name}`);
  console.log(`URL: ${environment.baseUrl}/dashboard`);
  
  try {
    const response = await fetch(`${environment.baseUrl}/dashboard`);
    
    if (response.ok) {
      console.log('✅ Dashboard is accessible');
    } else if (response.status === 401 || response.status === 302) {
      console.log('✅ Dashboard is protected (expected for unauthenticated users)');
    } else {
      console.log(`⚠️  Unexpected response: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Dashboard not accessible');
    console.log(`Error: ${error.message}`);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 HeartMail Stripe Integration Test');
  console.log('=====================================');
  
  // Test local environment
  console.log('\n🏠 LOCAL ENVIRONMENT TESTS');
  console.log('==========================');
  await testStripeConnection(config.local);
  await testWebhookEndpoint(config.local);
  await testPricingPage(config.local);
  await testDashboard(config.local);
  
  // Test production environment
  console.log('\n🌐 PRODUCTION ENVIRONMENT TESTS');
  console.log('================================');
  await testStripeConnection(config.production);
  await testWebhookEndpoint(config.production);
  await testPricingPage(config.production);
  await testDashboard(config.production);
  
  console.log('\n✨ Test completed!');
  console.log('\n📋 Next Steps:');
  console.log('1. Ensure your development server is running: npm run dev');
  console.log('2. Deploy to production: heartsmail.com');
  console.log('3. Configure Stripe webhooks in your dashboard');
  console.log('4. Test the complete subscription flow');
}

// Run tests
runTests().catch(console.error);
