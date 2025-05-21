# NodePilot Backend Implementation Plan

## Overview

This document outlines the plan for implementing a placeholder-based backend structure for NodePilot, extending the existing GitHub repository. The backend will be built with Express.js and TypeScript, with clearly marked placeholders for external services and APIs.

## Current State Analysis

The existing codebase has:
- Next.js frontend with React and TypeScript
- Clerk for authentication
- Supabase for database operations
- API routes for workflow generation (with placeholder logic)
- Credit system implementation (basic)

## Backend Structure

### 1. Express.js Server Setup

```
/backend
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Custom middleware
│   ├── models/           # Data models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   ├── app.ts            # Express application setup
│   └── server.ts         # Server entry point
├── .env.example          # Environment variables template
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript configuration
└── README.md             # Setup instructions
```

### 2. Core Modules

#### 2.1 AI Service Module

```
/services/ai/
├── aiService.ts          # Main AI service interface
├── draftService.ts       # GPT-4.1-nano for drafts
├── polishService.ts      # GPT-4.1-mini for polishing
├── promptTemplates.ts    # AI prompt templates
└── types.ts              # Type definitions
```

**Placeholder Implementation:**
- Mock responses for workflow generation
- Clear documentation for API integration
- Type definitions for request/response structures

#### 2.2 Credit System Module

```
/services/credit/
├── creditService.ts      # Credit management
├── subscriptionService.ts # Subscription handling
└── types.ts              # Type definitions
```

**Placeholder Implementation:**
- Local credit tracking
- Subscription plan definitions
- Integration points with payment providers

#### 2.3 Caching System Module

```
/services/cache/
├── cacheService.ts       # Cache interface
├── redisAdapter.ts       # Redis implementation
├── localAdapter.ts       # Local fallback
└── types.ts              # Type definitions
```

**Placeholder Implementation:**
- In-memory cache for development
- Redis client configuration
- Cache key generation and invalidation

#### 2.4 Workflow Module

```
/services/workflow/
├── workflowService.ts    # Workflow operations
├── templateService.ts    # Node templates
├── validationService.ts  # Workflow validation
└── types.ts              # Type definitions
```

**Placeholder Implementation:**
- Workflow generation logic
- Template management
- JSON structure validation

### 3. API Routes

```
/routes/
├── auth.routes.ts        # Authentication routes
├── workflow.routes.ts    # Workflow generation routes
├── credit.routes.ts      # Credit management routes
├── user.routes.ts        # User management routes
└── index.ts              # Route aggregation
```

### 4. Database Integration

```
/services/database/
├── supabaseService.ts    # Supabase client
├── migrations/           # Database migrations
└── types.ts              # Type definitions
```

**Placeholder Implementation:**
- Database schema definitions
- Query builders
- Migration scripts

### 5. Authentication Integration

```
/services/auth/
├── authService.ts        # Authentication interface
├── clerkAdapter.ts       # Clerk integration
└── types.ts              # Type definitions
```

**Placeholder Implementation:**
- JWT validation
- User session management
- Role-based access control

## Integration Points

### 1. Frontend to Backend Integration

- API client in frontend code
- Authentication token passing
- Error handling and status codes

### 2. External Service Integration

- OpenAI API for GPT-4.1-nano and GPT-4.1-mini
- Redis for caching
- Supabase for database operations
- Clerk for authentication

## Placeholder Strategy

All placeholders will follow this format:

```typescript
// PLACEHOLDER: [Description of what needs to be added]
// INTEGRATION: [Instructions for integrating with real service]
// EXAMPLE: [Example code for reference]

// Temporary implementation
return mockResponse();
```

## Implementation Phases

1. **Core Structure Setup**
   - Express.js server configuration
   - Middleware setup
   - Route definitions

2. **Service Layer Implementation**
   - AI service with placeholders
   - Credit system
   - Caching system
   - Workflow service

3. **API Endpoint Implementation**
   - Workflow generation
   - Credit management
   - User operations

4. **Integration Layer**
   - Database connections
   - Authentication hooks
   - External service clients

5. **Testing and Documentation**
   - Unit tests with mocks
   - API documentation
   - Setup instructions
