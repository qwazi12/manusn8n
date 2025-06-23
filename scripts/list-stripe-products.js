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

async function listProducts() {
  try {
    console.log('🔍 Fetching products from your LIVE Stripe account...\n');

    // List all products
    const products = await stripe.products.list({
      limit: 20,
      active: true
    });

    console.log('📦 Found', products.data.length, 'active products:\n');

    for (const product of products.data) {
      console.log(`🏷️  Product: ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Description: ${product.description || 'No description'}`);
      
      // Get prices for this product
      const prices = await stripe.prices.list({
        product: product.id,
        active: true
      });

      if (prices.data.length > 0) {
        console.log(`   💰 Prices:`);
        prices.data.forEach(price => {
          const amount = price.unit_amount ? `$${(price.unit_amount / 100).toFixed(2)}` : 'Free';
          const interval = price.recurring ? ` per ${price.recurring.interval}` : ' one-time';
          console.log(`      - ${price.id}: ${amount}${interval}`);
        });
      }
      console.log('');
    }

    // Find NodePilot products specifically
    console.log('🎯 NodePilot Products:');
    const nodePilotProducts = products.data.filter(p => 
      p.name.toLowerCase().includes('nodepilot')
    );

    if (nodePilotProducts.length === 0) {
      console.log('❌ No NodePilot products found!');
      return;
    }

    console.log('\n📋 Copy these IDs to your code:\n');
    
    for (const product of nodePilotProducts) {
      const prices = await stripe.prices.list({
        product: product.id,
        active: true
      });

      const planId = product.name.toLowerCase().includes('starter') ? 'starter' :
                   product.name.toLowerCase().includes('pro') ? 'pro' :
                   product.name.toLowerCase().includes('credits') ? 'credits' : 'unknown';

      console.log(`// ${product.name}`);
      console.log(`${planId}: {`);
      console.log(`  product_id: '${product.id}',`);
      if (prices.data[0]) {
        console.log(`  price_id: '${prices.data[0].id}'`);
      }
      console.log(`},`);
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error fetching products:', error.message);
  }
}

listProducts();
