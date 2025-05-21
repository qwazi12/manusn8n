# Placeholder Documentation

This document lists all placeholder locations in the NodePilot codebase that require integration with external services or customization.

## Backend Placeholders

### AI Service
- **File**: `/backend/src/services/ai/aiService.ts`
- **Description**: Dual-model AI approach with GPT-4.1-nano for drafts and GPT-4.1-mini for polishing
- **Integration Steps**:
  1. Add OpenAI API key to environment variables
  2. Implement actual API calls to OpenAI
  3. Configure model parameters for optimal performance

### Database Service
- **File**: `/backend/src/services/database/supabaseService.ts`
- **Description**: Supabase integration for data storage
- **Integration Steps**:
  1. Add Supabase credentials to environment variables
  2. Create required tables in Supabase
  3. Implement actual database queries

### Cache Service
- **File**: `/backend/src/services/cache/cacheService.ts`
- **Description**: Redis caching for similar requests
- **Integration Steps**:
  1. Set up Redis connection
  2. Configure cache expiration and invalidation
  3. Implement cache key generation strategy

### Authentication
- **File**: `/backend/src/middleware/authMiddleware.ts`
- **Description**: JWT authentication with Clerk integration
- **Integration Steps**:
  1. Configure Clerk authentication
  2. Set up JWT verification
  3. Implement user role management

### Credit System
- **File**: `/backend/src/services/credit/creditService.ts`
- **Description**: Credit management for workflow generation
- **Integration Steps**:
  1. Set up credit allocation rules
  2. Implement credit deduction logic
  3. Connect to payment provider for credit purchases

### Batch Processing
- **File**: `/backend/src/services/batch/batchService.ts`
- **Description**: Batch processing for multiple workflow generation requests
- **Integration Steps**:
  1. Configure batch size and priority rules
  2. Implement job queue management
  3. Set up error handling and retry logic

### Template System
- **File**: `/backend/src/services/templates/templateService.ts`
- **Description**: Precomputed node templates for common patterns
- **Integration Steps**:
  1. Add custom templates to defaultTemplates.ts
  2. Implement template storage in database
  3. Set up template versioning

## Frontend Placeholders

### API Client
- **File**: `/src/lib/api/apiClient.ts`
- **Description**: API client for NodePilot backend
- **Integration Steps**:
  1. Configure API URL in environment variables
  2. Implement authentication token management
  3. Set up error handling and retry logic

### Workflow Visualization
- **File**: `/src/components/workflow/WorkflowVisualizer.tsx`
- **Description**: Interactive visualization of generated workflows
- **Integration Steps**:
  1. Connect to actual workflow data
  2. Implement node type registry
  3. Add export functionality

### Chat Interface
- **File**: `/src/components/chat/EnhancedChatInput.tsx`
- **Description**: Enhanced chat input with file upload
- **Integration Steps**:
  1. Connect to actual API endpoints
  2. Implement file upload functionality
  3. Add real-time status updates

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# OpenAI API
OPENAI_API_KEY=your_openai_api_key

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Redis
REDIS_URL=your_redis_url

# Authentication
CLERK_SECRET_KEY=your_clerk_secret_key
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d

# Application
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000
```

Create a `.env.local` file in the frontend directory with the following variables:

```
# API
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```
