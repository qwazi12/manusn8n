const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

// Ensure we're using LIVE keys
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
console.log('Using Stripe key:', stripeSecretKey ? stripeSecretKey.substring(0, 12) + '...' : 'NOT FOUND');

if (!stripeSecretKey || !stripeSecretKey.startsWith('sk_live_')) {
  console.error('❌ ERROR: Not using live Stripe key!');
  console.error('Current key starts with:', stripeSecretKey ? stripeSecretKey.substring(0, 8) : 'NONE');
  process.exit(1);
}

const stripe = new Stripe(stripeSecretKey);

async function createProducts() {
  try {
    console.log('Creating Stripe products and prices...');

    // 1. Create Starter Product
    const starterProduct = await stripe.products.create({
      name: 'NodePilot Starter',
      description: 'Perfect for individuals getting started with automation - 300 credits/month',
      metadata: {
        plan_id: 'starter',
        credits: '300'
      }
    });

    const starterPrice = await stripe.prices.create({
      product: starterProduct.id,
      unit_amount: 1400, // $14.00
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata: {
        plan_id: 'starter'
      }
    });

    console.log('✅ Starter Product:', starterProduct.id);
    console.log('✅ Starter Price:', starterPrice.id);

    // 2. Create Pro Product
    const proProduct = await stripe.products.create({
      name: 'NodePilot Pro',
      description: 'Most popular plan for power users and small teams - 500 credits/month',
      metadata: {
        plan_id: 'pro',
        credits: '500'
      }
    });

    const proPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 2100, // $21.00
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata: {
        plan_id: 'pro'
      }
    });

    console.log('✅ Pro Product:', proProduct.id);
    console.log('✅ Pro Price:', proPrice.id);

    // 3. Create Credits Product (Pay-as-you-go)
    const creditsProduct = await stripe.products.create({
      name: 'NodePilot Credits',
      description: 'Buy credits as needed with no subscription - 100 credits per purchase',
      metadata: {
        plan_id: 'pay_as_you_go',
        credits: '100'
      }
    });

    const creditsPrice = await stripe.prices.create({
      product: creditsProduct.id,
      unit_amount: 800, // $8.00
      currency: 'usd',
      metadata: {
        plan_id: 'pay_as_you_go'
      }
    });

    console.log('✅ Credits Product:', creditsProduct.id);
    console.log('✅ Credits Price:', creditsPrice.id);

    // Output for updating the code
    console.log('\n📋 Update these Product IDs in your code:');
    console.log(`STRIPE_PRODUCTS = {`);
    console.log(`  starter: '${starterProduct.id}',`);
    console.log(`  pro: '${proProduct.id}',`);
    console.log(`  credits: '${creditsProduct.id}'`);
    console.log(`};`);

    console.log('\n📋 Price IDs:');
    console.log(`STRIPE_PRICES = {`);
    console.log(`  starter: '${starterPrice.id}',`);
    console.log(`  pro: '${proPrice.id}',`);
    console.log(`  credits: '${creditsPrice.id}'`);
    console.log(`};`);

  } catch (error) {
    console.error('❌ Error creating products:', error.message);
  }
}

createProducts();
