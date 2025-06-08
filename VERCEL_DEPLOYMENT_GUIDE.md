# 🚀 NodePilot Vercel Deployment Guide

## Overview
This guide will help you deploy your NodePilot application with:
- **Frontend (Next.js)** → Vercel
- **Backend (Express.js)** → Railway (free tier)

## 📋 Prerequisites

1. **GitHub Repository** ✅ (Already done: https://github.com/qwazi12/manusn8n.git)
2. **Vercel Account** - Sign up at https://vercel.com
3. **Railway Account** - Sign up at https://railway.app
4. **API Keys Ready**:
   - Clerk Publishable & Secret Keys
   - Supabase URL & Anon Key
   - OpenAI API Key

## 🎯 Step 1: Deploy Backend to Railway

### 1.1 Create Railway Project
1. Go to https://railway.app
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository: `qwazi12/manusn8n`
5. Select the `backend` folder as the root directory

### 1.2 Configure Railway Environment Variables
Add these environment variables in Railway dashboard:

```bash
# Required Environment Variables
NODE_ENV=production
PORT=4000

# Supabase Configuration
SUPABASE_URL=https://vqpkvrgpcdlqzixzpxws.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxcGt2cmdwY2RscXppeHpweHdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NTE5MzUsImV4cCI6MjA2MzMyNzkzNX0.9OBkyPcSHduH2XPV6in9Dn9qcWoYa452DxkIY-sKGCc
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxcGt2cmdwY2RscXppeHpweHdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzc1MTkzNSwiZXhwIjoyMDYzMzI3OTM1fQ.e1lxDgqpt2vAymHUG96PUWrplYngkO1WrkIZzfGdwws

# Clerk Configuration
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key

# OpenAI Configuration
OPENAI_API_KEY=sk-proj-Aac1bEo5iOOor4ZiIR84hyqn6oTL9cOFGD7UpKE9dEIVw584vpMCfzD2qNzdIU7qgSijXwp0LYT3BlbkFJg6YzRKzq1PD8sjjR

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-for-production
JWT_EXPIRES_IN=1d

# Redis (Optional - will use local cache if not provided)
REDIS_URL=redis://localhost:6379
```

### 1.3 Deploy Backend
1. Railway will automatically detect the Node.js project
2. It will run `npm install` and `npm run build`
3. Then start with `npm start`
4. Note your Railway URL (e.g., `https://your-app-name.railway.app`)

## 🎯 Step 2: Deploy Frontend to Vercel

### 2.1 Create Vercel Project
1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository: `qwazi12/manusn8n`
4. Vercel will auto-detect it's a Next.js project

### 2.2 Configure Vercel Environment Variables
Add these in Vercel dashboard (Project Settings → Environment Variables):

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_c3RlcmxpbmctZ2hvdWwtNTcuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://vqpkvrgpcdlqzixzpxws.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxcGt2cmdwY2RscXppeHpweHdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NTE5MzUsImV4cCI6MjA2MzMyNzkzNX0.9OBkyPcSHduH2XPV6in9Dn9qcWoYa452DxkIY-sKGCc

# API Configuration (Replace with your Railway URL)
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app/api

# Webhook Secret (for Clerk webhook)
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 2.3 Deploy Frontend
1. Click "Deploy"
2. Vercel will build and deploy your Next.js app
3. Note your Vercel URL (e.g., `https://your-app.vercel.app`)

## 🎯 Step 3: Update Webhook URLs

### 3.1 Update Clerk Webhook
1. Go to Clerk Dashboard → Webhooks
2. Update the webhook URL to: `https://your-app.vercel.app/api/webhooks/clerk`

### 3.2 Test the Deployment
1. Visit your Vercel URL
2. Sign up for a new account
3. Try generating a workflow
4. Check that credits are deducted properly

## 🔧 Step 4: Custom Domain (Optional)

### 4.1 Add Custom Domain to Vercel
1. In Vercel dashboard, go to Project Settings → Domains
2. Add your custom domain (e.g., `nodepilot.dev`)
3. Follow DNS configuration instructions

### 4.2 Add Custom Domain to Railway
1. In Railway dashboard, go to Settings → Domains
2. Add your API subdomain (e.g., `api.nodepilot.dev`)
3. Update `NEXT_PUBLIC_API_URL` in Vercel to use the custom domain

## ✅ Verification Checklist

- [ ] Backend deployed to Railway and accessible
- [ ] Frontend deployed to Vercel and accessible
- [ ] User registration works (Clerk webhook)
- [ ] User can sign in/out
- [ ] Workflow generation works
- [ ] Credits are deducted properly
- [ ] Database operations work (Supabase)

## 🚨 Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure your Railway backend allows your Vercel domain
2. **Webhook Failures**: Check Clerk webhook URL and secret
3. **API Connection**: Verify `NEXT_PUBLIC_API_URL` points to Railway
4. **Database Errors**: Check Supabase service role key

### Debug Steps:
1. Check Railway logs for backend errors
2. Check Vercel function logs for frontend errors
3. Check Clerk dashboard for webhook delivery status
4. Check Supabase dashboard for database activity

## 🎉 Success!

Your NodePilot application should now be fully deployed and accessible at:
- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-backend.railway.app

Both services are on free tiers and will scale automatically as needed.
