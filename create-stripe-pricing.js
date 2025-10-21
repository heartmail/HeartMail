// Create Stripe Pricing Plans for HeartMail
// Run this script to create all pricing plans

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createPricingPlans() {
  console.log('🚀 Creating HeartMail pricing plans...\n');

  try {
    // 1. Create HeartMail Family Plan (Monthly)
    console.log('📦 Creating HeartMail Family Plan (Monthly)...');
    const familyMonthlyPrice = await stripe.prices.create({
      product: 'prod_TFYlHRHj1RNUnJ', // HeartMail Family Plan
      unit_amount: 999, // $9.99
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        plan_type: 'family',
        billing_period: 'monthly'
      }
    });
    console.log(`✅ Family Monthly: ${familyMonthlyPrice.id}`);

    // 2. Create HeartMail Family Plan (Yearly)
    console.log('📦 Creating HeartMail Family Plan (Yearly)...');
    const familyYearlyPrice = await stripe.prices.create({
      product: 'prod_TFYlHRHj1RNUnJ', // HeartMail Family Plan
      unit_amount: 9999, // $99.99 (save ~$20/year)
      currency: 'usd',
      recurring: {
        interval: 'year',
      },
      metadata: {
        plan_type: 'family',
        billing_period: 'yearly'
      }
    });
    console.log(`✅ Family Yearly: ${familyYearlyPrice.id}`);

    // 3. Create HeartMail Extended Family Plan (Monthly)
    console.log('📦 Creating HeartMail Extended Family Plan (Monthly)...');
    const extendedMonthlyPrice = await stripe.prices.create({
      product: 'prod_TFYlkbatcWyhAs', // HeartMail Extended Family Plan
      unit_amount: 2999, // $29.99
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        plan_type: 'extended',
        billing_period: 'monthly'
      }
    });
    console.log(`✅ Extended Monthly: ${extendedMonthlyPrice.id}`);

    // 4. Create HeartMail Extended Family Plan (Yearly)
    console.log('📦 Creating HeartMail Extended Family Plan (Yearly)...');
    const extendedYearlyPrice = await stripe.prices.create({
      product: 'prod_TFYlkbatcWyhAs', // HeartMail Extended Family Plan
      unit_amount: 29999, // $299.99 (save ~$60/year)
      currency: 'usd',
      recurring: {
        interval: 'year',
      },
      metadata: {
        plan_type: 'extended',
        billing_period: 'yearly'
      }
    });
    console.log(`✅ Extended Yearly: ${extendedYearlyPrice.id}`);

    console.log('\n🎉 All pricing plans created successfully!');
    console.log('\n📋 Price IDs to use in your app:');
    console.log(`Family Monthly: ${familyMonthlyPrice.id}`);
    console.log(`Family Yearly: ${familyYearlyPrice.id}`);
    console.log(`Extended Monthly: ${extendedMonthlyPrice.id}`);
    console.log(`Extended Yearly: ${extendedYearlyPrice.id}`);

    // Save to environment file
    const envContent = `
# Stripe Pricing IDs
NEXT_PUBLIC_STRIPE_FAMILY_MONTHLY_PRICE_ID=${familyMonthlyPrice.id}
NEXT_PUBLIC_STRIPE_FAMILY_YEARLY_PRICE_ID=${familyYearlyPrice.id}
NEXT_PUBLIC_STRIPE_EXTENDED_MONTHLY_PRICE_ID=${extendedMonthlyPrice.id}
NEXT_PUBLIC_STRIPE_EXTENDED_YEARLY_PRICE_ID=${extendedYearlyPrice.id}
`;

    console.log('\n📝 Add these to your .env.local file:');
    console.log(envContent);

  } catch (error) {
    console.error('❌ Error creating pricing plans:', error.message);
  }
}

// Run the script
createPricingPlans();
