# NodePilot - AI-Powered N8N Workflow Generator

NodePilot is an AI-powered SaaS platform that generates n8n automation workflows from natural language prompts. Built with Next.js, Express.js, and powered by OpenAI's GPT-4.

## 🚀 Features

- **AI Workflow Generation**: Convert natural language descriptions into n8n JSON workflows
- **Credit System**: Free trial with 75 credits, Pro plan with 500 credits, Pay-as-you-go options
- **User Authentication**: Secure authentication powered by Clerk
- **Modern UI**: Dark mode interface with Tailwind CSS and shadcn/ui components
- **Real-time Processing**: Fast workflow generation with step-by-step explanations

## 🛠 Tech Stack

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Clerk** - Authentication
- **Framer Motion** - Animations

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Supabase** - Database
- **OpenAI GPT-4** - AI workflow generation
- **JWT** - Token management

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Clerk account
- OpenAI API key

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd nodepilot
```

### 2. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd backend
npm install
```

### 3. Environment Configuration

#### Backend Environment
Copy the example environment file:
```bash
cd backend
cp .env.example .env
```

Update `backend/.env` with your actual values:

```env
# Backend Environment Configuration
PORT=4000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Clerk Configuration
CLERK_SECRET_KEY=your-clerk-secret-key

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-for-development-only
JWT_EXPIRES_IN=1d

# CORS Configuration
FRONTEND_URL=http://localhost:8080
```

#### Frontend Environment
Create `.env.local` in the root directory:

```env
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### 4. Database Setup

#### Supabase Schema
Run the following SQL in your Supabase SQL editor:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  credits INTEGER DEFAULT 75,
  plan TEXT DEFAULT 'free',
  trial_start TIMESTAMP DEFAULT NOW(),
  subscription_id TEXT,
  plan_expiry TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Workflows table
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  workflow_json JSONB NOT NULL,
  credits_used INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Credit history table
CREATE TABLE credit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL, -- 'usage', 'purchase', 'trial', 'subscription'
  description TEXT,
  workflow_id UUID REFERENCES workflows(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_workflows_user_id ON workflows(user_id);
CREATE INDEX idx_credit_history_user_id ON credit_history(user_id);
```

### 5. Getting API Keys

#### Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > API
4. Copy the Project URL and anon public key

#### Clerk
1. Go to [clerk.com](https://clerk.com)
2. Create a new application
3. Go to Developers > API Keys
4. Copy the publishable key and secret key

#### OpenAI
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an API key
3. Copy the API key

## 🚀 Running the Application

### Development Mode

**Start Backend (Terminal 1):**
```bash
cd backend
npm run dev
```

**Start Frontend (Terminal 2):**
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:8080
- Backend API: http://localhost:4000

### Production Build

**Build Frontend:**
```bash
npm run build
npm start
```

**Build Backend:**
```bash
cd backend
npm run build
npm start
```

## 📁 Project Structure

```
nodepilot/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (protected)/       # Protected pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                  # Utility functions
├── backend/              # Express.js backend
│   ├── src/
│   │   ├── config/       # Configuration
│   │   ├── middleware/   # Express middleware
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── utils/        # Utilities
│   └── dist/             # Compiled JavaScript
└── public/               # Static assets
```

## 🔍 API Endpoints

### Authentication
- `POST /api/auth/webhook` - Clerk webhook for user sync

### Workflows
- `POST /api/generate-workflow` - Generate n8n workflow from prompt
- `GET /api/workflows` - Get user workflows
- `GET /api/workflows/:id` - Get specific workflow

### Pricing & Credits
- `GET /api/pricing/plans` - Get pricing plans
- `POST /api/pricing/initialize-trial` - Initialize free trial
- `POST /api/pricing/upgrade-to-pro` - Upgrade to Pro plan
- `GET /api/pricing/user-status` - Get user credit status

### Health
- `GET /api/health` - API health check

## 🧪 Testing

**Backend Tests:**
```bash
cd backend
npm test
```

**Frontend Tests:**
```bash
npm test
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Conflicts**
   - Frontend runs on port 8080
   - Backend runs on port 4000
   - Make sure both ports are available

2. **Environment Variables**
   - Ensure all required environment variables are set
   - Check that API keys are valid and not expired

3. **Database Connection**
   - Verify Supabase URL and keys are correct
   - Ensure database schema is properly set up

4. **TypeScript Errors**
   - Run `npm run build` to check for compilation errors
   - Ensure all dependencies are installed

### Logs
- Backend logs are available in the console when running `npm run dev`
- Check browser console for frontend errors

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support, please contact [support@nodepilot.com](mailto:support@nodepilot.com) or create an issue in the repository.
