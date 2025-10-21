// Test Stripe Portal Configuration
// Run this to verify your Stripe portal configuration

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function testPortalConfiguration() {
  try {
    console.log('🔍 Testing Stripe Portal Configuration...\n');
    
    // Test 1: Check if the portal configuration exists
    console.log('1. Checking portal configuration...');
    try {
      const config = await stripe.billingPortal.configurations.retrieve('bpc_1SKhbw8h6OhnnNXPTyeUFoVh');
      console.log('✅ Portal configuration found:');
      console.log(`   - ID: ${config.id}`);
      console.log(`   - Active: ${config.active}`);
      console.log(`   - Default: ${config.is_default}`);
      console.log(`   - Features: ${JSON.stringify(config.features, null, 2)}`);
    } catch (error) {
      console.log('❌ Portal configuration not found or invalid:');
      console.log(`   Error: ${error.message}`);
      
      // List available configurations
      console.log('\n📋 Available portal configurations:');
      const configs = await stripe.billingPortal.configurations.list({ limit: 10 });
      configs.data.forEach(config => {
        console.log(`   - ${config.id} (${config.active ? 'Active' : 'Inactive'})`);
      });
    }
    
    // Test 2: Test portal session creation with a test customer
    console.log('\n2. Testing portal session creation...');
    try {
      // Create a test customer
      const testCustomer = await stripe.customers.create({
        email: 'test@example.com',
        name: 'Test Customer'
      });
      
      console.log(`✅ Test customer created: ${testCustomer.id}`);
      
      // Create portal session
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: testCustomer.id,
        return_url: 'https://example.com/return',
        configuration: 'bpc_1SKhbw8h6OhnnNXPTyeUFoVh'
      });
      
      console.log('✅ Portal session created successfully:');
      console.log(`   - URL: ${portalSession.url}`);
      console.log(`   - Return URL: ${portalSession.return_url}`);
      
      // Clean up test customer
      await stripe.customers.del(testCustomer.id);
      console.log('🧹 Test customer cleaned up');
      
    } catch (error) {
      console.log('❌ Portal session creation failed:');
      console.log(`   Error: ${error.message}`);
    }
    
    // Test 3: Check account settings
    console.log('\n3. Checking Stripe account settings...');
    try {
      const account = await stripe.accounts.retrieve();
      console.log('✅ Account information:');
      console.log(`   - ID: ${account.id}`);
      console.log(`   - Country: ${account.country}`);
      console.log(`   - Default currency: ${account.default_currency}`);
      console.log(`   - Charges enabled: ${account.charges_enabled}`);
      console.log(`   - Payouts enabled: ${account.payouts_enabled}`);
    } catch (error) {
      console.log('❌ Account retrieval failed:');
      console.log(`   Error: ${error.message}`);
    }
    
    console.log('\n🎉 Portal configuration test completed!');
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

// Run the test
testPortalConfiguration();
