export function createEmailTemplate(subject: string, message: string, from: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Nunito', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #fef5f5 0%, #fce7f3 100%); min-height: 100vh;">
        
        <!-- Header with Logo -->
        <div style="text-align: center; padding: 40px 20px 20px;">
          <div style="margin-bottom: 20px;">
            <img src="https://fmuhjcrbwuoisjwuvreg.supabase.co/storage/v1/object/public/heartmail-site-bucket/logo.png" 
                 alt="HeartMail Logo" 
                 style="width: 80px; height: 80px; border-radius: 16px; box-shadow: 0 8px 16px rgba(0,0,0,0.1);"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
            <div style="display: none; width: 80px; height: 80px; background: linear-gradient(135deg, #E63365, #f093fb); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 32px;">💕</div>
          </div>
          <h1 style="color: #E63365; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">HeartMail</h1>
          <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 18px; font-weight: 400;">Keeping hearts connected, one email at a time</p>
        </div>

        <!-- Main Content -->
        <div style="background: white; margin: 0 20px; border-radius: 16px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <div style="padding: 40px 30px;">
            <h2 style="color: #374151; margin: 0 0 24px 0; font-size: 28px; font-weight: 600; line-height: 1.2;">${subject}</h2>
            <div style="color: #4b5563; line-height: 1.7; font-size: 18px; white-space: pre-wrap;">${message}</div>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 30px 20px 40px;">
          <div style="margin-bottom: 20px;">
            <img src="https://fmuhjcrbwuoisjwuvreg.supabase.co/storage/v1/object/public/heartmail-site-bucket/logo.png" 
                 alt="HeartMail" 
                 style="width: 32px; height: 32px; border-radius: 8px;"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
            <div style="display: none; width: 32px; height: 32px; background: linear-gradient(135deg, #E63365, #f093fb); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px;">💕</div>
          </div>
          <p style="color: #6b7280; font-size: 16px; margin: 0 0 8px 0;">Sent with 💕 via HeartMail</p>
          <p style="color: #9ca3af; font-size: 14px; margin: 0;">From: ${from}</p>
        </div>

      </div>
    </body>
    </html>
  `;
}
