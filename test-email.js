const { Resend } = require('resend');
require('dotenv').config({ path: '.env.local' });

async function testEmail() {
  console.log('Testing email sending...');
  console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Set' : 'Not set');
  
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not found in environment');
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: 'HeartMail <onboarding@resend.dev>',
      to: ['heartmailio@gmail.com'],
      subject: 'Test Email from HeartMail',
      html: '<p>This is a test email from HeartMail!</p>',
    });

    if (error) {
      console.error('❌ Resend error:', error);
    } else {
      console.log('✅ Email sent successfully:', data);
    }
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
}

testEmail();
