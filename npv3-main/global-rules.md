# NodePilot — Global Rules & Golden Guidelines

These rules are designed to guide all development and AI coding behavior when working on NodePilot — an AI-powered SaaS platform that generates n8n automation workflows from natural language prompts.

## 🧠 Project Awareness & Context Rules

- Always read: `PLANNING.md` before coding anything
- Always check: `TASK.md` before starting new tasks
- If the task doesn't exist in `TASK.md`, add it with today's date and short description
- Keep all knowledge about NodePilot's purpose:
  - AI-powered automation assistant
  - Generates n8n JSON workflows
  - Educates users with step-by-step explanations
  - Uses Claude for AI generation
  - Tailored around n8n best practices
  - Prioritize user experience, clarity, and learning-first interfaces

## 🛡️ Code Structure & Modularity

- Never exceed 500 lines per file
- Prefer modular architecture: split large files
- Organize code cleanly:
  - Components → `/components/ui`
  - Pages → `/app/(protected)/` or `/(auth)/`
  - Utility functions → `/lib/`
  - Clear, relative imports preferred

## 🪪 Testing Best Practices

Every new feature must have:
1. 1 happy-path test
2. 1 edge case
3. 1 failure case

All tests live in `/tests/`:
- `/tests/<feature>/` for feature-specific tests
- `/tests/utils/` for helper functions
- `/tests/api/` for endpoint tests
- Mock external services (DB, API, AI)
- Prioritize testing critical logic (not trivial UI details unless essential)

## ✅ Documentation & Task Hygiene

- Update `README.md` when anything structural changes (install, usage, env setup)
- Update `TASK.md` after each task is done
- Use inline comments for tricky logic with `# Reason:` annotations
- Comment for the next dev not just yourself
- Explain "why" over "what" in code comments

## 🔐 Environment & Security

- Never generate or handle sensitive API keys or secrets directly
- All sensitive variables must come from `.env`
- Never hardcode secrets anywhere
- Use Supabase for environment-managed secrets
- Auth-protected routes only where necessary
- Logout must destroy session cleanly

## 🌈 Styling & Design Conventions

- Use Tailwind CSS for all styling
- Use shadcn/ui components for buttons, inputs, layout pieces
- Lucide icons only for iconography
- Consistent Salmon accent: #FA8072
- Default Dark Mode UX
- Minimal, clean, human-friendly UI
- Always add skeleton loaders for loading states

## 🧠 AI Prompt Engineering Rules

AI's purpose = Only generate n8n workflows and explain them.

Workflows must:
- Follow n8n structure strictly
- Be copy-paste ready JSON
- Include step-by-step explanations in plain language
- Always guide Claude with clear instructions & examples
- Instruct Claude to prioritize best practices for n8n workflows (e.g., error handling nodes, environment variables usage, readable node naming)

## 🛠 AI Coding Practices

- Start fresh conversations often
- One task per prompt
- Provide examples in the prompt when possible
- Be explicit about what file to update, change, or create
- Never hallucinate libraries or functions
- Confirm file paths exist before referencing
- Never delete production code unless explicitly instructed
- Must NEVER generate or suggest code outside n8n JSON workflows unless explicitly told to

## 🌍 Project Behavior & Routing Rules

### Sidebar Routes:
| Sidebar Item | Route | Behavior / Notes |
|-------------|-------|------------------|
| Home | `/` | Takes user to the public Landing Page |
| My Workflows | `/workflows` | Displays log/history of all user-generated workflows |
| Settings | `/settings` | Personal Account Management Page |
| Logout | `/logout` | Logs user out securely (Supabase) and redirects to `/login` |

### Page Routing Notes:
- Dashboard (Post-login Landing) → `/dashboard` optional clean user-friendly welcome page
- Auto redirect logged-in users trying to access `/` to `/dashboard`
- Any unknown routes redirect to `/404` error page
- Smooth page transitions (loading skeletons) for `/workflows` & `/settings`
- Reuse components across pages for consistency

## ☑️ Final Golden Reminders

NodePilot codebase must be:
- Modular
- Human-friendly
- Clear for any future dev to jump into
- Prioritize long-term maintainability over shortcuts
- Be flexible & adaptive in approach — but rigid about security & code clarity
- Ask questions when in doubt. Never assume missing context 