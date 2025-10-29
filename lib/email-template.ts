export function createEmailTemplate(subject: string, message: string, from: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>${subject}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
      
      <!-- Outer Container -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            
            <!-- Main Email Container -->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; width: 100%;">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #E63365 0%, #ec4899 50%, #f472b6 100%); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td align="center">
                        <img src="https://fmuhjcrbwuoisjwuvreg.supabase.co/storage/v1/object/public/heartmail-site-bucket/logo.png" 
                             alt="HeartMail Logo" 
                             width="64" 
                             height="64" 
                             style="display: block; margin: 0 auto 16px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">HeartMail</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 15px;">A heartfelt message for you ❤️</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Decorative Hearts Border -->
              <tr>
                <td style="background: white; padding: 16px 0; text-align: center;">
                  <div style="font-size: 20px; letter-spacing: 8px; opacity: 0.3;">
                    💕 💖 💕 💖 💕 💖 💕
                  </div>
                </td>
              </tr>
              
              <!-- Main Content Card -->
              <tr>
                <td style="background: white; padding: 0 40px 40px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td>
                        <!-- Subject/Title -->
                        <h2 style="color: #1f2937; margin: 0 0 24px; font-size: 24px; font-weight: 600; line-height: 1.3; text-align: center; padding-bottom: 16px; border-bottom: 2px solid #fce7f3;">
                          ${subject}
                        </h2>
                        
                        <!-- Message Content -->
                        <div style="color: #374151; line-height: 1.8; font-size: 16px; margin: 24px 0;">
                          ${message}
                        </div>
                        
                        <!-- Decorative Divider -->
                        <div style="margin: 32px 0; text-align: center;">
                          <div style="display: inline-block; width: 60px; height: 3px; background: linear-gradient(90deg, #E63365, #ec4899); border-radius: 2px;"></div>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Sender Info -->
              <tr>
                <td style="background: #fef5f5; padding: 24px 40px; border-top: 1px solid #fce7f3;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td>
                        <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px; text-align: center;">
                          <span style="color: #E63365; font-weight: 600;">From:</span> ${from}
                        </p>
                        <p style="color: #9ca3af; font-size: 13px; margin: 0; text-align: center;">
                          Delivered with love on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background: linear-gradient(135deg, #1f2937 0%, #374151 100%); border-radius: 0 0 16px 16px; padding: 32px 40px; text-align: center;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td align="center">
                        <!-- HeartMail Branding -->
                        <img src="https://fmuhjcrbwuoisjwuvreg.supabase.co/storage/v1/object/public/heartmail-site-bucket/logo.png" 
                             alt="HeartMail" 
                             width="40" 
                             height="40" 
                             style="display: block; margin: 0 auto 12px; border-radius: 8px; opacity: 0.9;" />
                        
                        <p style="color: rgba(255,255,255,0.9); font-size: 15px; margin: 0 0 12px; font-weight: 500;">
                          Sent with 💕 via <span style="color: #f472b6; font-weight: 600;">HeartMail</span>
                        </p>
                        
                        <p style="color: rgba(255,255,255,0.6); font-size: 13px; margin: 0 0 20px; line-height: 1.6;">
                          Keeping hearts connected, one email at a time
                        </p>
                        
                        <!-- CTA Button -->
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                          <tr>
                            <td style="border-radius: 8px; background: linear-gradient(135deg, #E63365, #ec4899);">
                              <a href="https://heartsmail.com" 
                                 target="_blank" 
                                 style="display: inline-block; padding: 12px 32px; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 8px;">
                                Start Sending Love ❤️
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Social/Links -->
                        <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin: 24px 0 0; line-height: 1.6;">
                          © ${new Date().getFullYear()} HeartMail. All rights reserved.<br/>
                          <a href="https://heartsmail.com" style="color: #f472b6; text-decoration: none;">heartsmail.com</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
            </table>
            <!-- End Main Email Container -->
            
          </td>
        </tr>
      </table>
      <!-- End Outer Container -->
      
    </body>
    </html>
  `;
}
