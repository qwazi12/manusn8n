# Scribe AI — Planning Document

## Project Overview
Scribe is an AI-powered SaaS that allows users to describe a workflow in natural language and receive a fully working, valid n8n JSON automation + explanation. The app will support anonymous generation (3 free) before requiring signup. Monetization is handled via Stripe.

## Goals
- MVP where users can generate valid n8n workflows from natural prompts
- Allow 3 free requests without login, then require account
- Use Claude/GPT-4 with carefully structured prompts
- Store workflow + prompt history (per user)
- Support Pro upgrade via Stripe
- Deliver a clean, dark UI with salmon highlights

## Tech Stack
- **Frontend**: Lovable (Bubble-like builder)
- **Backend**: Node.js + Express (Cursor AI powered)
- **AI Model**: Claude or GPT-4
- **Database**: Supabase (auth, workflow history, user profile)
- **Payments**: Stripe (Pro tier)
- **Deployment**: Vercel / Railway

## File Conventions
- `planning.md`: this doc
- `task.md`: active task list
- `global-rules.md`: system prompt rules for AI assistant
- `prompt-template.txt`: AI generation prompt template

## Rules for Working with AI
- Files should stay < 500 lines
- Keep prompts focused on 1 task at a time
- Always use planning/task markdown files for context
- AI must write unit tests for any backend code
- We handle environment vars manually — never AI
- Restart conversations regularly to avoid LLM drift
- Specific prompts > vague ideas (include structure + examples)

## Constraints
- Use markdown-based project memory, not long convos
- Don’t expose API keys, auth tokens, or DB access in frontend
- All JSON returned by AI must be valid and parseable in n8n
- Credit logic must work client and server side

## Golden Deliverables
- Landing page with working hero → input → response block
- Credit limiter (3 guest, 50 Pro, 30 free/month)
- Full chat-style dashboard with new task + history
- Pro plan upgrade (Stripe flow)
- Admin test account w/ 999 credits for QA

## Stretch Goals (Phase 2)
- GPT Claude comparison toggle
- “Optimize Workflow” follow-up prompt
- Webhook n8n live test preview
- Dark/light theme switcher


