# NodePilot System Architecture & Infrastructure

## **🏗️ COMPLETE SYSTEM OVERVIEW**

NodePilot is a sophisticated AI-powered SaaS platform that converts natural language into production-ready n8n workflows using a hybrid AI architecture, optimized databases, and cloud infrastructure.

---

## **🌐 INFRASTRUCTURE STACK**

### **Frontend Deployment**
- **Platform**: Vercel (Production)
- **Domain**: https://nodepilot.dev
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript + React
- **Styling**: Tailwind CSS + Shadcn/ui components
- **Auto-deployment**: GitHub integration with instant updates

### **Backend Deployment**
- **Platform**: Railway (Production)
- **URL**: https://manusn8n-production.up.railway.app
- **Framework**: Express.js + Node.js
- **Language**: TypeScript
- **Auto-deployment**: GitHub integration with Railway CLI

### **Database Infrastructure**
- **Primary Database**: Supabase PostgreSQL
- **URL**: https://vqpkvrgpcdlqzixzpxws.supabase.co
- **Features**: Row Level Security (RLS), Real-time subscriptions, Vector storage
- **Backup**: Automated daily backups with point-in-time recovery

### **AI Services**
- **Primary AI**: OpenAI GPT-4o (Intent classification, optimization)
- **Workflow AI**: Claude Sonnet 4 (n8n workflow generation)
- **Hybrid Architecture**: Intelligent routing between AI providers

---

## **🧠 AI ARCHITECTURE BREAKDOWN**

### **Hybrid AI Flow**
```
User Input → Frontend → Backend → AI Router
                                     ↓
                            Intent Classification
                                 (OpenAI GPT-4o)
                                     ↓
                    ┌─────────────────┴─────────────────┐
                    ↓                                   ↓
            Workflow Request                    General Conversation
                    ↓                                   ↓
        Prompt Optimization (OpenAI)           Conversation Handler
                    ↓                              (OpenAI)
        Template Matching System                       ↓
                    ↓                            Response to User
        Workflow Generation (Claude)
                    ↓
        Validation & Quality Check
                    ↓
        Production-Ready JSON
```

### **AI Component Responsibilities**

**OpenAI GPT-4o (Intelligence Layer):**
- Intent classification and routing
- Prompt optimization and enhancement
- Template matching and selection
- General conversation handling
- Memory management and scoring

**Claude Sonnet 3.5 (Generation Layer):**
- Core n8n workflow JSON generation
- Complex automation logic creation
- Production-ready code output
- Best practices implementation

---

## **📊 DATABASE ARCHITECTURE**

### **Core Tables Structure**

**User Management:**
```sql
users (Supabase UUID primary keys)
├── clerk_user_id (external auth reference)
├── email, name, subscription_tier
└── created_at, updated_at

subscriptions
├── user_id → users.id
├── stripe_subscription_id
├── status, current_period_end
└── plan_details (JSON)

credit_history
├── user_id → users.id
├── amount, transaction_type
├── workflow_generation_id
└── remaining_balance
```

**AI System Tables:**
```sql
ai_prompts (13 specialized prompts)
├── name (intent_classification, main_prompt, etc.)
├── content (full prompt text)
├── is_active, created_at
└── 32,000+ total characters

node_patterns (3,905 optimized patterns)
├── node_type, node_name
├── node_config (JSON)
├── use_case, is_featured
└── performance_metrics

workflow_tips (138 best practices)
├── tip_title, tip_content
├── category, is_active
└── application_context
```

**Workflow Management:**
```sql
workflow_templates (10 real templates)
├── name, description, category
├── workflow_json (complete n8n JSON)
├── node_count, complexity_level
└── use_cases, integrations

workflow_generations
├── user_id, conversation_id
├── prompt, workflow_json
├── generation_time_ms, model_used
└── status, optimization_used

conversation_messages
├── conversation_id, user_id
├── role (user/assistant)
├── content, metadata
└── timestamp
```

### **Performance Optimizations**
- **Indexes**: All foreign keys and frequently queried columns
- **RLS Policies**: Row-level security on all user data
- **Connection Pooling**: Optimized database connections
- **Query Optimization**: Efficient joins and data retrieval

---

## **🔄 REQUEST FLOW ARCHITECTURE**

### **Complete User Journey**
```
1. User Types Message
   ↓
2. Frontend (/api/chat/message/route.ts)
   ├── Validates user authentication (Clerk)
   ├── Manages conversation history
   ├── Processes file uploads (if any)
   └── Routes to backend

3. Backend (/api/chat/message)
   ├── Loads all 13 AI prompts from database
   ├── Initializes conversation history
   ├── Calls AI processing pipeline
   └── Manages credit deduction

4. AI Processing Pipeline
   ├── Intent Classification (OpenAI)
   │   ├── Analyzes message content
   │   ├── Classifies: workflow_request vs general_conversation
   │   └── Extracts entities and confidence score
   │
   ├── Workflow Path (if workflow_request)
   │   ├── Prompt Optimization (OpenAI)
   │   ├── Template Matching System
   │   ├── Node Pattern Selection (3,905 patterns)
   │   ├── Workflow Generation (Claude)
   │   └── Validation & Quality Check
   │
   └── Conversation Path (if general_conversation)
       ├── Conversation Handler (OpenAI)
       ├── Platform knowledge integration
       └── Helpful response generation

5. Response Processing
   ├── Credit deduction (1 credit per interaction)
   ├── Conversation history update
   ├── Performance metrics logging
   └── Response formatting

6. Frontend Response
   ├── Displays AI response
   ├── Shows workflow JSON (if generated)
   ├── Updates credit counter
   └── Maintains conversation context
```

### **Error Handling & Fallbacks**
- **AI Service Failures**: Automatic fallback between providers
- **Database Timeouts**: Retry logic with exponential backoff
- **Rate Limiting**: Intelligent request queuing
- **Validation Errors**: Comprehensive error reporting

---

## **⚡ PERFORMANCE ARCHITECTURE**

### **Speed Optimizations**
- **Pre-loaded Patterns**: 3,905 node configurations in memory
- **Template Caching**: Instant access to 10 workflow templates
- **Prompt Optimization**: Enhanced requests for better AI output
- **Hybrid AI Routing**: Right AI for the right task

### **Current Performance Metrics**
- **Simple Workflows**: 15-20 seconds generation time
- **Complex Workflows**: 30-45 seconds generation time
- **Success Rate**: 90%+ on first attempt
- **Database Queries**: <100ms average response time

### **Scalability Features**
- **Horizontal Scaling**: Vercel and Railway auto-scaling
- **Database Scaling**: Supabase managed PostgreSQL
- **AI Rate Limiting**: Intelligent request distribution
- **Caching Strategy**: Multi-layer caching system

---

## **🔐 SECURITY ARCHITECTURE**

### **Authentication & Authorization**
- **Frontend Auth**: Clerk authentication service
- **API Security**: JWT token validation
- **Database Security**: Row Level Security (RLS) policies
- **User Isolation**: Complete data separation per user

### **Data Protection**
- **Encryption**: TLS 1.3 for all communications
- **API Keys**: Secure environment variable management
- **Database**: Encrypted at rest and in transit
- **Backup Security**: Encrypted automated backups

### **Access Control**
```
User Permissions:
├── Own conversations and workflows only
├── Template access (read-only)
├── Credit usage tracking
└── Subscription management

Admin Permissions:
├── AI prompt management
├── System monitoring
├── User support access
└── Performance analytics
```

---

## **💳 BILLING & SUBSCRIPTION ARCHITECTURE**

### **Payment Processing**
- **Provider**: Stripe (production keys configured)
- **Plans**: Free Trial, Starter ($14), Pro ($21), Pay-As-You-Go ($8/100)
- **Credit System**: 1 credit per chat interaction
- **Auto-billing**: Subscription management with customer portal

### **Credit Management**
```
Credit Flow:
User Action → Credit Check → AI Processing → Credit Deduction → Balance Update
                ↓
        Insufficient Credits → Billing Prompt → Stripe Checkout
```

### **Subscription Features**
- **Trial Management**: 7-day free trial with 25 credits
- **Usage Tracking**: Real-time credit monitoring
- **Billing Portal**: Stripe customer portal integration
- **Plan Upgrades**: Seamless tier transitions

---

## **📈 MONITORING & ANALYTICS**

### **System Monitoring**
- **Health Checks**: `/api/health` endpoint with system status
- **Performance Tracking**: Generation time and success rates
- **Error Logging**: Comprehensive error tracking and alerts
- **Usage Analytics**: User behavior and feature adoption

### **AI Performance Metrics**
- **Intent Classification Accuracy**: Success rate tracking
- **Workflow Generation Quality**: User feedback integration
- **Response Time Optimization**: Continuous performance tuning
- **Model Performance**: A/B testing between AI providers

---

## **🚀 DEPLOYMENT ARCHITECTURE**

### **CI/CD Pipeline**
```
Code Changes → GitHub → Automatic Deployment
                          ↓
                    ┌─────────────────┐
                    ↓                 ↓
            Vercel (Frontend)    Railway (Backend)
                    ↓                 ↓
            Production Ready    Production Ready
```

### **Environment Management**
- **Development**: Local development with hot reload
- **Staging**: Automatic preview deployments
- **Production**: https://nodepilot.dev (live system)
- **Database**: Single Supabase instance with environment separation

### **Backup & Recovery**
- **Code**: GitHub version control with full history
- **Database**: Automated daily backups with point-in-time recovery
- **AI Prompts**: Markdown backup files in repository
- **Configuration**: Environment variables securely managed

---

## **🔧 MAINTENANCE & OPERATIONS**

### **System Updates**
- **AI Prompts**: Database-driven with instant updates
- **Node Patterns**: Automated loading from training data
- **Templates**: Real workflow JSON from production examples
- **Code Deployments**: Zero-downtime rolling updates

### **Performance Optimization**
- **Database Tuning**: Query optimization and indexing
- **AI Model Selection**: Continuous evaluation of AI providers
- **Caching Strategy**: Multi-layer caching for speed
- **Resource Monitoring**: Proactive scaling and optimization

---

## **🔍 TECHNICAL IMPLEMENTATION DETAILS**

### **Frontend Technology Stack**
```typescript
// Core Framework
Next.js 14 (App Router)
├── TypeScript for type safety
├── React 18 with Server Components
├── Tailwind CSS for styling
└── Shadcn/ui component library

// Key Dependencies
├── @clerk/nextjs (Authentication)
├── @supabase/supabase-js (Database)
├── lucide-react (Icons)
└── next-themes (Dark mode)
```

### **Backend Technology Stack**
```typescript
// Core Framework
Express.js + Node.js
├── TypeScript for type safety
├── Winston for logging
├── Helmet for security
└── CORS for cross-origin requests

// AI Integration
├── OpenAI SDK (GPT-4o)
├── Anthropic SDK (Claude Sonnet 3.5)
├── Custom AI routing logic
└── Prompt management system

// Database Integration
├── Supabase client
├── Connection pooling
├── Query optimization
└── Real-time subscriptions
```

### **API Endpoint Architecture**
```
Frontend APIs (/api/):
├── /chat/message (Main chat interface)
├── /workflow/fast-generate (Optimized generation)
├── /health (System status)
├── /billing/* (Stripe integration)
└── /clerk/* (Authentication webhooks)

Backend APIs (/api/):
├── /chat/message (AI processing)
├── /workflows/* (Workflow management)
├── /credits/* (Credit system)
├── /users/* (User management)
└── /health (Backend status)
```

---

## **📊 DATA FLOW ARCHITECTURE**

### **Real-time Data Synchronization**
```
User Action → Frontend State → API Call → Backend Processing → Database Update → Real-time Sync
                                                                      ↓
                                                              Supabase Realtime
                                                                      ↓
                                                              Frontend Update
```

### **Conversation Management**
```sql
-- Conversation Flow
conversations
├── id (UUID)
├── user_id → users.id
├── title (auto-generated)
├── created_at, updated_at
└── metadata (JSON)

conversation_messages
├── id (UUID)
├── conversation_id → conversations.id
├── user_id → users.id
├── role ('user' | 'assistant')
├── content (message text)
├── metadata (files, generation_info)
└── timestamp
```

### **Credit System Flow**
```
Credit Transaction:
User Request → Credit Check → Processing → Credit Deduction → Balance Update
                ↓
        credit_history table:
        ├── transaction_id (UUID)
        ├── user_id → users.id
        ├── amount (negative for deduction)
        ├── transaction_type ('chat_interaction')
        ├── workflow_generation_id (if applicable)
        └── remaining_balance (calculated)
```

---

## **🛡️ SECURITY IMPLEMENTATION**

### **Authentication Flow**
```
User Login → Clerk Authentication → JWT Token → API Validation → Database Access
                                        ↓
                                 Token Verification:
                                 ├── Signature validation
                                 ├── Expiration check
                                 ├── User existence verification
                                 └── Permission validation
```

### **Row Level Security (RLS) Policies**
```sql
-- Example RLS Policy
CREATE POLICY "Users can only access their own data"
ON conversations
FOR ALL
USING (user_id = auth.uid());

-- Applied to all user tables:
├── conversations
├── conversation_messages
├── workflow_generations
├── credit_history
└── subscriptions
```

### **API Security Measures**
- **Rate Limiting**: 100 requests per minute per user
- **Input Validation**: Comprehensive request sanitization
- **SQL Injection Prevention**: Parameterized queries only
- **XSS Protection**: Content Security Policy headers
- **CSRF Protection**: SameSite cookie configuration

---

## **⚙️ OPERATIONAL ARCHITECTURE**

### **Environment Configuration**
```bash
# Production Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://vqpkvrgpcdlqzixzpxws.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[secure_key]
OPENAI_API_KEY=[secure_key]
CLAUDE_API_KEY=[secure_key]
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=[public_key]
CLERK_SECRET_KEY=[secure_key]
STRIPE_PUBLISHABLE_KEY=[public_key]
STRIPE_SECRET_KEY=[secure_key]
```

### **Logging & Monitoring**
```typescript
// Winston Logger Configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console()
  ]
});
```

### **Error Handling Strategy**
```typescript
// Comprehensive Error Handling
try {
  // AI Processing
} catch (error) {
  if (error instanceof OpenAIError) {
    // Fallback to Claude
  } else if (error instanceof DatabaseError) {
    // Retry with exponential backoff
  } else {
    // Log and return user-friendly error
  }
}
```

---

## **📈 PERFORMANCE OPTIMIZATION**

### **Database Query Optimization**
```sql
-- Optimized Indexes
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON conversation_messages(conversation_id);
CREATE INDEX idx_patterns_featured ON node_patterns(is_featured) WHERE is_featured = true;
CREATE INDEX idx_templates_active ON workflow_templates(is_active) WHERE is_active = true;
```

### **Caching Strategy**
```typescript
// Multi-layer Caching
├── Browser Cache (Static assets)
├── CDN Cache (Vercel Edge Network)
├── Application Cache (Node.js memory)
├── Database Cache (Supabase connection pooling)
└── AI Response Cache (Prompt-based caching)
```

### **AI Performance Optimization**
```typescript
// Intelligent AI Routing
const selectAIProvider = (task: string, complexity: number) => {
  if (task === 'intent_classification') return 'openai';
  if (task === 'workflow_generation') return 'claude';
  if (complexity > 8) return 'claude';
  return 'openai';
};
```

---

## **🔄 SYSTEM INTEGRATION POINTS**

### **External Service Integration**
```
NodePilot System Integrations:
├── Clerk (Authentication & User Management)
├── Supabase (Database & Real-time)
├── OpenAI (GPT-4o for Intelligence)
├── Anthropic (Claude for Generation)
├── Stripe (Payment Processing)
├── Vercel (Frontend Hosting)
├── Railway (Backend Hosting)
└── GitHub (Version Control & CI/CD)
```

### **Webhook Architecture**
```typescript
// Webhook Endpoints
├── /api/clerk/webhook (User lifecycle events)
├── /api/stripe/webhook (Payment events)
└── /api/supabase/webhook (Database events)

// Webhook Security
├── Signature verification
├── Timestamp validation
├── Idempotency handling
└── Error recovery
```

---

## **🚀 DEPLOYMENT & SCALING**

### **Auto-scaling Configuration**
```yaml
# Vercel (Frontend)
- Auto-scaling: Unlimited
- Edge Network: Global CDN
- Build Time: ~2 minutes
- Zero-downtime deployments

# Railway (Backend)
- Auto-scaling: Based on CPU/Memory
- Health Checks: /api/health endpoint
- Build Time: ~3 minutes
- Rolling deployments
```

### **Disaster Recovery Plan**
```
Recovery Procedures:
├── Database: Point-in-time recovery (Supabase)
├── Code: GitHub repository restoration
├── Configuration: Environment variable backup
├── AI Prompts: Markdown file restoration
└── User Data: Automated daily backups
```

**Total System Capacity**: Production-ready SaaS platform serving AI-powered n8n workflow generation with enterprise-grade architecture, security, and scalability.
