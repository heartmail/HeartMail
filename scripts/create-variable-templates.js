require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const variableTemplates = [
  {
    title: "Daily Check-in",
    content: `Hi {{first_name}}! 💕

I just wanted to take a moment to tell you how much you mean to me. Even though we might not talk every day, you're always in my thoughts.

Hope you're having a wonderful day!

Love,
{{full_name}}`,
    category: "daily",
    is_premium: false,
    is_public: true
  },
  {
    title: "Weekly Family Update", 
    content: `Hey {{first_name}}! 👋

Hope you're doing well! I wanted to share what's been happening in my life this week and catch up with you.

How have you been? I'd love to hear about your week too!

Talk soon,
{{full_name}}`,
    category: "weekly",
    is_premium: false,
    is_public: true
  },
  {
    title: "Monthly Love Letter",
    content: `My dear {{first_name}},

Another month has passed, and I find myself thinking about you even more. You bring so much joy to my life, and I'm grateful for our {{relationship}}.

I hope this month brings you happiness and wonderful moments.

With love,
{{full_name}}`,
    category: "monthly", 
    is_premium: false,
    is_public: true
  },
  {
    title: "Birthday Wishes",
    content: `Happy Birthday {{first_name}}! 🎉

Another year around the sun! I hope this special day is filled with love, laughter, and all the happiness you deserve.

You mean the world to me, and I'm so grateful to have you in my life.

Celebrate big today!

Love,
{{full_name}}`,
    category: "special",
    is_premium: false,
    is_public: true
  },
  {
    title: "Thinking of You",
    content: `Hi {{first_name}},

I was just thinking about you and wanted to reach out. Sometimes the best moments are the simple ones where we connect with the people we care about.

Hope you're having a great day!

{{full_name}}`,
    category: "general",
    is_premium: false,
    is_public: true
  },
  {
    title: "Gratitude Message",
    content: `Dear {{first_name}},

I wanted to take a moment to express my gratitude for having you in my life. You bring so much joy and meaning to my days.

Thank you for being such an important part of my life.

With appreciation,
{{full_name}}`,
    category: "gratitude",
    is_premium: false,
    is_public: true
  },
  {
    title: "Encouragement Note",
    content: `Hey {{first_name}},

I know life can be challenging sometimes, but I want you to know that I believe in you. You're stronger than you know and capable of amazing things.

You've got this!

Your {{relationship}},
{{full_name}}`,
    category: "encouragement",
    is_premium: false,
    is_public: true
  },
  {
    title: "Holiday Greetings",
    content: `Dear {{first_name}},

Wishing you a wonderful holiday season! This time of year always reminds me of the special people in my life, and you're definitely one of them.

Hope you're surrounded by love and joy this season.

Happy holidays!
{{full_name}}`,
    category: "holiday",
    is_premium: false,
    is_public: true
  }
]

async function createVariableTemplates() {
  try {
    console.log('🗑️ Removing old templates...')
    
    // Delete all existing templates
    const { error: deleteError } = await supabase
      .from('templates')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all templates
    
    if (deleteError) {
      console.error('Error deleting old templates:', deleteError)
      return
    }
    
    console.log('✅ Old templates removed')
    
    console.log('📝 Creating new variable-enabled templates...')
    
    // Insert new templates
    const { data, error } = await supabase
      .from('templates')
      .insert(variableTemplates)
      .select()
    
    if (error) {
      console.error('Error creating templates:', error)
      return
    }
    
    console.log(`✅ Created ${data.length} new variable-enabled templates:`)
    data.forEach(template => {
      console.log(`  - ${template.title} (${template.category})`)
    })
    
    console.log('\n🎉 Variable template system ready!')
    console.log('📋 Available variables: {{first_name}}, {{last_name}}, {{full_name}}, {{email}}, {{relationship}}')
    
  } catch (error) {
    console.error('Script error:', error)
  }
}

// Run the script
createVariableTemplates()
