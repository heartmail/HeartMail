const { Resend } = require('resend');
require('dotenv').config({ path: '.env.local' });

async function testResendKey() {
  console.log('🔑 Testing Resend API Key...');
  console.log('API Key:', process.env.RESEND_API_KEY ? 'Set' : 'Not set');
  console.log('API Key (first 10 chars):', process.env.RESEND_API_KEY?.substring(0, 10) + '...');
  
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not found in environment');
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    // Test the API key by trying to get domains
    console.log('🔍 Testing API key by fetching domains...');
    const { data, error } = await resend.domains.list();

    if (error) {
      console.error('❌ Resend API error:', error);
      console.log('💡 This means your API key is invalid or expired');
      console.log('💡 Please check your Resend dashboard for a new API key');
    } else {
      console.log('✅ API key is valid!');
      console.log('📧 Available domains:', data?.data?.map(d => d.name) || 'None');
    }
  } catch (error) {
    console.error('❌ Error testing API key:', error);
  }
}

testResendKey();
