#!/bin/bash

# HeartMail Deployment Script for heartsmail.com
# This script helps deploy your HeartMail application to production

echo "🚀 HeartMail Deployment Script"
echo "=============================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the HeartMail project root directory"
    exit 1
fi

echo "📋 Pre-deployment Checklist:"
echo ""

# Check environment variables
echo "🔍 Checking environment variables..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local file found"
    
    # Check for required variables
    if grep -q "NEXT_PUBLIC_APP_URL=https://heartsmail.com" .env.local; then
        echo "✅ Production URL configured"
    else
        echo "⚠️  Warning: NEXT_PUBLIC_APP_URL should be set to https://heartsmail.com"
    fi
    
    if grep -q "STRIPE_SECRET_KEY=sk_live_" .env.local; then
        echo "✅ Live Stripe keys configured"
    else
        echo "⚠️  Warning: Make sure you're using live Stripe keys for production"
    fi
else
    echo "❌ .env.local file not found"
    echo "Please create .env.local with your production environment variables"
    exit 1
fi

echo ""
echo "🏗️  Building application..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building for production..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "🌐 Domain Configuration:"
echo "========================="
echo "Domain: heartsmail.com"
echo "Production URL: https://heartsmail.com"
echo "Webhook URL: https://heartsmail.com/api/stripe/webhook"
echo ""

echo "📋 Stripe Dashboard Configuration:"
echo "=================================="
echo "1. Go to Stripe Dashboard → Webhooks"
echo "2. Add endpoint: https://heartsmail.com/api/stripe/webhook"
echo "3. Select events:"
echo "   - checkout.session.completed"
echo "   - customer.subscription.updated"
echo "   - customer.subscription.deleted"
echo "   - invoice.payment_succeeded"
echo "   - invoice.payment_failed"
echo "4. Copy the webhook secret and update your environment variables"
echo ""

echo "🗄️  Database Setup:"
echo "==================="
echo "1. Go to your Supabase dashboard"
echo "2. Run the subscription-schema.sql script"
echo "3. Verify all tables are created:"
echo "   - subscriptions"
echo "   - subscription_usage"
echo "   - billing_history"
echo ""

echo "🧪 Testing Commands:"
echo "===================="
echo "Local testing:"
echo "  npm run dev"
echo "  stripe listen --forward-to localhost:3000/api/stripe/webhook"
echo ""
echo "Production testing:"
echo "  node test-stripe-integration.js"
echo ""

echo "🚀 Deployment Options:"
echo "======================"
echo "1. Vercel (Recommended for Next.js):"
echo "   - Connect your GitHub repository"
echo "   - Set environment variables in Vercel dashboard"
echo "   - Deploy automatically"
echo ""
echo "2. Netlify:"
echo "   - Connect your GitHub repository"
echo "   - Set environment variables in Netlify dashboard"
echo "   - Deploy automatically"
echo ""
echo "3. Custom Server:"
echo "   - Upload the .next folder to your server"
echo "   - Install Node.js dependencies"
echo "   - Start with: npm start"
echo ""

echo "✅ Deployment script completed!"
echo ""
echo "📞 Next Steps:"
echo "1. Deploy your application to heartsmail.com"
echo "2. Configure Stripe webhooks in your dashboard"
echo "3. Run the database schema in Supabase"
echo "4. Test the complete subscription flow"
echo "5. Monitor webhook delivery in Stripe Dashboard"
echo ""
echo "🎉 Your HeartMail service will be live at https://heartsmail.com!"
