# NodePilot — Automated Code Review & GitHub Backup Protocol

This document defines the mandatory review process that AI Coding Assistants (Claude, Cursor, GPT) and developers must follow before committing code to GitHub for the NodePilot SaaS project.

> **Golden Rule:** No code shall be committed to GitHub without fully passing this checklist.

## 📋 Table of Contents
- [Code Review Protocol](#-code-review-protocol)
- [GitHub Backup Protocol](#-github-backup-protocol)
- [Automated Workflows](#-automated-workflows)
- [Emergency Procedures](#-emergency-procedures)

## 🧪 Code Review Protocol

### Pre-Review Checklist
Before submitting any code for review, ensure:

- [ ] All tests pass (`npm test`)
- [ ] No TypeScript/linter errors
- [ ] Files < 500 lines (as per golden rules)
- [ ] Follows project structure
- [ ] Uses proper TypeScript types
- [ ] Follows naming conventions
- [ ] Includes proper comments
- [ ] No sensitive data exposed
- [ ] No dead code or commented-out blocks
- [ ] No unfinished TODOs

### Review Areas

#### 1. TypeScript & Type Safety
- [ ] All components have proper types
- [ ] No `any` types used
- [ ] Proper interface definitions
- [ ] Type guards where needed
- [ ] Proper error handling types
- [ ] No unused imports or variables

#### 2. Component Structure
- [ ] Follows modular architecture
- [ ] Proper file organization
- [ ] Uses shadcn/ui components
- [ ] Implements error boundaries
- [ ] Includes loading states
- [ ] Follows Next.js 13+ conventions
- [ ] Functions follow Single Responsibility Principle
- [ ] No duplicated logic

#### 3. Testing Coverage
- [ ] Unit tests for components
- [ ] Integration tests for features
- [ ] Error case handling
- [ ] Loading state tests
- [ ] Proper test documentation
- [ ] Test coverage > 80%
- [ ] Mock external services (Supabase, Stripe, AI)
- [ ] Tests organized in `/tests/`

#### 4. Security
- [ ] No hardcoded secrets
- [ ] Proper environment variable usage
- [ ] Input validation
- [ ] Error handling
- [ ] Authentication checks
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] `.env` matches `.env.example`

#### 5. Performance
- [ ] Proper React hooks usage
- [ ] Memoization where needed
- [ ] Lazy loading implemented
- [ ] Optimized images/assets
- [ ] Proper state management
- [ ] Bundle size optimization

#### 6. Documentation
- [ ] README updates
- [ ] Code comments
- [ ] Type documentation
- [ ] API documentation
- [ ] Changelog updates
- [ ] Migration guides if needed
- [ ] Complex logic explained with `# Reason: why`

#### 7. Routing & Navigation
| Route | Expected Behavior |
|-------|------------------|
| `/` | Public Landing Page |
| `/dashboard` | Post-login Homepage |
| `/workflows` | Workflow History |
| `/workflows/[id]` | Workflow Details View |
| `/settings` | Account Management |
| `/login` | Login Page |
| `/signup` | Signup Page |
| `/logout` | Logs out & redirects to `/login` |

- [ ] No 404s (unless intended)
- [ ] All sidebar/menu items link correctly
- [ ] Correct route protection & redirects
- [ ] Dashboard auto-redirect after login/signup

#### 8. Database Schema
- [ ] `profiles` table → Exists & stores user profile + credits
- [ ] `workflows` table → Exists & stores workflow JSON & metadata
- [ ] Row Level Security (RLS) active for all tables
- [ ] Auto-profile creation trigger works on signup
- [ ] Credits deduct/update logic working properly

#### 9. UI/UX Standards
- [ ] Tailwind CSS used exclusively
- [ ] shadcn/ui components used consistently
- [ ] Salmon accent color: `#FA8072`
- [ ] Dark Mode by default
- [ ] Mobile responsiveness
- [ ] Lucide Icons for all icons
- [ ] Loading Skeletons for async states
- [ ] No broken layouts or padding bugs

#### 10. AI Workflow Generation
- [ ] Claude prompts focused and example-driven
- [ ] AI output is valid n8n JSON
- [ ] Clear step-by-step explanations
- [ ] No hallucinated functions/libraries
- [ ] Proper `.env` usage for secrets
- [ ] Human-readable node names

## 🔄 GitHub Backup Protocol

### Daily Backup Process

1. **Pre-Backup Checks**
   ```bash
   # Check for uncommitted changes
   git status
   
   # Run tests
   npm test
   
   # Check for linting errors
   npm run lint
   ```

2. **Commit Process**
   ```bash
   # Stage all changes
   git add .
   
   # Create commit with standardized message
   git commit -m "feat: [Area] - Clear description"
   
   # Push to main branch
   git push origin main
   ```

### Branch Management

| Branch Type | Format | Purpose |
|------------|--------|---------|
| Feature | `feature/[feature-name]` | New features |
| Bug Fix | `fix/[bug-name]` | Bug fixes |
| Hotfix | `hotfix/[issue-name]` | Urgent fixes |
| Documentation | `docs/[topic]` | Documentation updates |
| Release | `release/[version]` | Version releases |

### Pull Request Process

1. **Create PR**
   - From feature/fix branch
   - Include detailed description
   - Link related issues
   - Add screenshots if UI changes

2. **Review Requirements**
   - At least 2 approvals
   - All checks pass
   - No merge conflicts
   - Documentation updated

3. **Merge Process**
   - Squash and merge
   - Delete source branch
   - Update related issues
   - Update changelog

## 🤖 Automated Workflows

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: NodePilot CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
```

### Automated Checks

- ESLint on every commit
- TypeScript compilation
- Test coverage
- Build verification
- Dependency updates
- Security scanning

## 🚨 Emergency Procedures

### Data Loss Prevention

1. **Regular Backups**
   - Daily automated backups
   - Weekly manual verification
   - Monthly full system backup

2. **Recovery Process**
   ```bash
   # Verify backup integrity
   git fsck
   
   # Restore from backup
   git checkout [commit-hash]
   
   # Force push if necessary
   git push -f origin main
   ```

### Security Incidents

1. **Immediate Actions**
   - Revoke compromised credentials
   - Notify team members
   - Lock down repository
   - Begin investigation

2. **Post-Incident**
   - Document incident
   - Update security protocols
   - Review access controls
   - Implement additional safeguards

## 📝 Protocol Updates

This protocol should be reviewed and updated:
- Monthly for minor updates
- Quarterly for major revisions
- After any security incident
- When new tools are adopted

Last Updated: [Current Date]
Version: 1.0.0 