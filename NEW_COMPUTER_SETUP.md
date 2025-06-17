# 🖥️ Setting Up NodePilot on a New Computer

## Prerequisites

### Required Software
```bash
# Install Node.js (version 18 or higher)
# Download from: https://nodejs.org/

# Install Git
# Download from: https://git-scm.com/

# Install VS Code (recommended)
# Download from: https://code.visualstudio.com/
```

### Optional CLIs
```bash
# Railway CLI (for backend deployment)
npm install -g @railway/cli

# Vercel CLI (for frontend deployment)
npm install -g vercel
```

## Setup Steps

### 1. Clone Repository
```bash
git clone https://github.com/qwazi12/manusn8n.git
cd manusn8n
```

### 2. Install Dependencies
```bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend
npm install
cd ..
```

### 3. Environment Variables

**Create `.env.local` (Frontend):**
```bash
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Configuration
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

**Create `backend/.env` (Backend):**
```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Clerk Configuration
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret

# AI Configuration
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=1d
```

### 4. Test Local Development
```bash
# Terminal 1: Start Frontend
npm run dev
# Runs on http://localhost:8080

# Terminal 2: Start Backend
cd backend
npm run dev
# Runs on http://localhost:4000
```

### 5. Verify Setup
- Frontend: http://localhost:8080
- Backend Health: http://localhost:4000/api/health
- Test authentication and basic features

## Production Deployments

### Current Live Deployments
- **Frontend**: https://manusn8n.vercel.app (Vercel)
- **Backend**: Railway deployment (check Railway dashboard)

### Deploy Commands
```bash
# Deploy Frontend
vercel --prod

# Deploy Backend
cd backend
railway up
```

## Troubleshooting

### Common Issues
1. **Node.js Version**: Ensure Node.js 18+
2. **Environment Variables**: Double-check all keys are correct
3. **Port Conflicts**: Make sure ports 8080 and 4000 are available
4. **Dependencies**: Run `npm install` in both root and backend

### Getting Help
- Check TROUBLESHOOTING.md for detailed solutions
- Review deployment logs in Vercel/Railway dashboards
- Verify environment variables are set correctly

## Security Notes

⚠️ **NEVER commit .env files to git**
⚠️ **Rotate API keys if accidentally exposed**
⚠️ **Use strong JWT secrets in production**

## Success Checklist

- [ ] Node.js 18+ installed
- [ ] Repository cloned
- [ ] Dependencies installed (frontend & backend)
- [ ] Environment variables configured
- [ ] Frontend running on localhost:8080
- [ ] Backend running on localhost:4000
- [ ] Authentication working
- [ ] API endpoints responding

**You're ready to develop! 🚀**

## Quick Setup Script

For automated setup, run:
```bash
./setup-new-computer.sh
```

## Verification

To verify your setup is working:
```bash
node verify-setup.js
```
