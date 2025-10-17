import { createAdminClient } from './supabase'

export async function initializeNewUser(userId: string, email: string) {
  const supabase = createAdminClient()
  
  try {
    // Create user preferences with default values
    const { error: prefsError } = await supabase
      .from('user_preferences')
      .insert({
        user_id: userId,
        timezone: 'America/New_York',
        email_notifications: true,
        push_notifications: true,
        theme: 'light'
      })

    if (prefsError) {
      console.error('Error creating user preferences:', prefsError)
      // Don't throw here as this is not critical
    }

    // Create a welcome template for the user
    const { error: templateError } = await supabase
      .from('templates')
      .insert({
        user_id: userId,
        title: 'Welcome to HeartMail!',
        content: `Hi there!

Welcome to HeartMail! This is your first template. You can edit this template or create new ones to send heartfelt messages to your loved ones.

To get started:
1. Add recipients in the Recipients section
2. Create or customize templates
3. Schedule your first email

We're excited to help you stay connected with the people you love!

Best regards,
The HeartMail Team`,
        category: 'general',
        is_premium: false,
        is_public: false,
        tags: ['welcome', 'getting-started']
      })

    if (templateError) {
      console.error('Error creating welcome template:', templateError)
      // Don't throw here as this is not critical
    }

    console.log('User initialization completed successfully')
    return { success: true }
  } catch (error) {
    console.error('Error initializing new user:', error)
    return { success: false, error }
  }
}
