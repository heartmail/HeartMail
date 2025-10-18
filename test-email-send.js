const { Resend } = require('resend');
require('dotenv').config({ path: '.env.local' });

async function testEmailSend() {
  console.log('📧 Testing email sending with current API key...');
  
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not found');
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    console.log('📧 Attempting to send test email...');
    const { data, error } = await resend.emails.send({
      from: 'HeartMail <noreply@letter.heartsmail.com>',
      to: ['heartmailio@gmail.com'],
      subject: 'Test Email from HeartMail API',
      html: '<p>This is a test email to verify the API key works!</p>',
    });

    if (error) {
      console.error('❌ Email send error:', error);
      if (error.message?.includes('invalid')) {
        console.log('💡 The API key appears to be invalid or expired');
        console.log('💡 Please get a new API key from your Resend dashboard');
      }
    } else {
      console.log('✅ Email sent successfully!');
      console.log('📧 Message ID:', data?.id);
    }
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
}

testEmailSend();
