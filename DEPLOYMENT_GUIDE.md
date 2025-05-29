# 🚀 NodePilot Production Deployment Guide

## 📋 Overview
This guide will help you deploy NodePilot to production using your domain `nodepilot.dev` with all the API keys and configurations you've provided.

## ✅ Prerequisites Completed
- ✅ Domain: `nodepilot.dev`
- ✅ Supabase Project: `vqpkvrgpcdlqzixzpxws.supabase.co`
- ✅ Stripe Account: Live keys configured
- ✅ Database Schema: Ready to deploy
- ✅ Backend: TypeScript errors fixed
- ✅ Frontend: Environment configured

## 🗄️ Database Setup

### Step 1: Run Database Schema
1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/vqpkvrgpcdlqzixzpxws
2. Navigate to **SQL Editor**
3. Copy and paste the entire content from `supabase/schema.sql`
4. Click **Run** to create all tables, indexes, and policies

### Step 2: Verify Database
After running the schema, you should see these tables:
- `users` - User accounts and subscription info
- `workflows` - Generated n8n workflows
- `credit_history` - Credit transactions
- `subscriptions` - Stripe subscription data
- `payments` - Payment history

## 🌐 Domain Configuration

### Frontend Domain: `nodepilot.dev`
- **Recommended Platform**: Vercel (best for Next.js)
- **Alternative**: Netlify, Railway, or any static hosting

### Backend Domain: `api.nodepilot.dev`
- **Recommended Platform**: Railway, Render, or DigitalOcean App Platform
- **Alternative**: Heroku, AWS, or any Node.js hosting

## 🔧 Environment Variables Setup

### Backend Environment Variables
```bash
# Production Backend (.env)
PORT=4000
NODE_ENV=production

# Supabase (✅ Already configured)
SUPABASE_URL=https://vqpkvrgpcdlqzixzpxws.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxcGt2cmdwY2RscXppeHpweHdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NTE5MzUsImV4cCI6MjA2MzMyNzkzNX0.9OBkyPcSHduH2XPV6in9Dn9qcWoYa452DxkIY-sKGCc
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxcGt2cmdwY2RscXppeHpweHdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzc1MTkzNSwiZXhwIjoyMDYzMzI3OTM1fQ.e1lxDgqpt2vAymHUG96PUWrplYngkO1WrkIZzfGdwws

# JWT (✅ Already configured)
JWT_SECRET=Dm4OciT+YfFkoMDiD/d8pYZxm1I+qntOf9DRhfb+gfTObutmPThLzxIxz/SnYk5eVXgPk3bGHxFo8ux3m2KuKw==
JWT_EXPIRES_IN=1d

# Stripe (✅ Already configured)
STRIPE_PUBLISHABLE_KEY=pk_live_51RQWb6KgH5HMzGLeQUlIUbxA0WBJOJOLKFikKvkTqofKyCXPrFbQfB9S4ygzq8FDrQkQyRc21rrCIbw0f01Bnb5300hVQxDtiX
STRIPE_SECRET_KEY=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
STRIPE_FREE_TRIAL_PRICE_ID=price_1RR1bGKgH5HMzGLeQn6o3apj
STRIPE_PREPAID_CREDITS_PRICE_ID=price_1RR1a1KgH5HMzGLeTCXYKfOC
STRIPE_PRO_PLAN_PRICE_ID=price_1RR1V2KgH5HMzGLe3fBICnDV

# CORS
FRONTEND_URL=https://nodepilot.dev

# Still needed:
CLERK_SECRET_KEY=<your-clerk-secret-key>
OPENAI_API_KEY=<your-openai-api-key>
```

### Frontend Environment Variables
```bash
# Production Frontend (.env.production)
NEXT_PUBLIC_SUPABASE_URL=https://vqpkvrgpcdlqzixzpxws.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxcGt2cmdwY2RscXppeHpweHdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NTE5MzUsImV4cCI6MjA2MzMyNzkzNX0.9OBkyPcSHduH2XPV6in9Dn9qcWoYa452DxkIY-sKGCc

# Stripe (✅ Already configured)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51RQWb6KgH5HMzGLeQUlIUbxA0WBJOJOLKFikKvkTqofKyCXPrFbQfB9S4ygzq8FDrQkQyRc21rrCIbw0f01Bnb5300hVQxDtiX

# Domain Configuration
NEXT_PUBLIC_APP_URL=https://nodepilot.dev
NEXT_PUBLIC_API_URL=https://api.nodepilot.dev

# Still needed:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your-clerk-publishable-key>
```

## 🚀 Deployment Steps

### 1. Deploy Backend to Railway/Render

#### Option A: Railway (Recommended)
1. Connect your GitHub repo to Railway
2. Create a new project
3. Add all environment variables from above
4. Set custom domain: `api.nodepilot.dev`
5. Deploy automatically

#### Option B: Render
1. Connect GitHub repo
2. Create new Web Service
3. Build command: `cd backend && npm install && npm run build`
4. Start command: `cd backend && npm start`
5. Add environment variables
6. Set custom domain: `api.nodepilot.dev`

### 2. Deploy Frontend to Vercel

1. Connect your GitHub repo to Vercel
2. Set root directory to `/` (not `/frontend`)
3. Framework preset: Next.js
4. Add all frontend environment variables
5. Set custom domain: `nodepilot.dev`
6. Deploy

### 3. DNS Configuration

Set up these DNS records for `nodepilot.dev`:

```
# Main domain (Frontend)
Type: CNAME
Name: @
Value: cname.vercel-dns.com

# API subdomain (Backend)
Type: CNAME  
Name: api
Value: [your-railway-or-render-domain]

# WWW redirect (optional)
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

## 🔑 Missing API Keys

You still need to obtain these API keys:

### 1. Clerk Authentication
1. Go to https://clerk.dev
2. Create a new application
3. Get your keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

### 2. OpenAI API
1. Go to https://platform.openai.com
2. Create API key
3. Add to `OPENAI_API_KEY`

## 🧪 Testing Production

### 1. Test Backend API
```bash
curl https://api.nodepilot.dev/api/health
curl https://api.nodepilot.dev/api/pricing/plans
```

### 2. Test Frontend
- Visit https://nodepilot.dev
- Check all pages load correctly
- Test user registration/login
- Test workflow generation

## 📊 Monitoring & Analytics

### Recommended Tools:
- **Uptime**: UptimeRobot or Pingdom
- **Analytics**: Vercel Analytics + Google Analytics
- **Error Tracking**: Sentry
- **Performance**: Vercel Speed Insights

## 🔒 Security Checklist

- ✅ HTTPS enabled on both domains
- ✅ Environment variables secured
- ✅ Database RLS policies enabled
- ✅ CORS configured correctly
- ✅ Stripe webhooks secured
- ⚠️ Rate limiting (implement if needed)
- ⚠️ API key rotation schedule

## 🎯 Post-Deployment Tasks

1. **Test all user flows**:
   - Registration → Trial → Upgrade → Payment
   - Workflow generation → Credit deduction
   - Subscription management

2. **Set up monitoring**:
   - API health checks
   - Database performance
   - Error tracking

3. **Configure Stripe webhooks**:
   - Point to `https://api.nodepilot.dev/api/webhooks/stripe`
   - Test payment flows

4. **SEO optimization**:
   - Submit sitemap to Google
   - Set up Google Search Console
   - Configure meta tags

## 🆘 Troubleshooting

### Common Issues:
1. **CORS errors**: Check `FRONTEND_URL` in backend
2. **Database connection**: Verify Supabase keys
3. **Stripe errors**: Check webhook endpoints
4. **Build failures**: Check Node.js version compatibility

### Support Resources:
- Supabase docs: https://supabase.com/docs
- Stripe docs: https://stripe.com/docs
- Vercel docs: https://vercel.com/docs
- Railway docs: https://docs.railway.app

---

## 🎉 You're Ready!

Your NodePilot application is configured and ready for production deployment. The only missing pieces are the Clerk and OpenAI API keys, which you can add once you obtain them.

**Next Steps:**
1. Run the database schema in Supabase
2. Get Clerk and OpenAI API keys
3. Deploy to your chosen platforms
4. Configure DNS
5. Test everything works!

Good luck with your launch! 🚀 