# Scribe AI — Task List

## ✅ MVP Sprint 1: Core Foundation

- [x] Set up Claude + GPT API keys
- [x] Create planning.md + task.md
- [x] Create system prompt template
- [x] Build basic prompt → response backend using Cursor
- [x] Allow /generateWorkflow API endpoint with mock return
- [ ] Set up Supabase project, enable email login
- [ ] Build DB tables: users, workflows, usage_log
- [ ] Configure Lovable page structure
- [ ] Create hero section with prompt input
- [ ] Connect Lovable to backend API
- [ ] Limit guests to 3 requests via local/session storage
- [ ] Create login/signup modal
- [ ] Create dashboard route and protect it

---

## ⏳ Sprint 2: Stripe + Pro

- [ ] Add credit tracker to Supabase (free vs pro)
- [ ] Add Stripe integration (Pro = 50 credits/month)
- [ ] Trigger Supabase update on payment webhook
- [ ] Swap dashboard greeting to username (not email)
- [ ] Display credits left in dashboard sidebar or header
- [ ] Upgrade modal from settings dropdown

---

## ⏳ Sprint 3: UI Finalization

- [ ] Replace chat input with Vercel-style component
- [ ] Add attach image (stub upload function)
- [ ] Add “Clone Screenshot” and “Upload Project” CTA buttons
- [ ] Integrate HeroWithMockup on landing page
- [ ] Mobile hamburger sidebar for dashboard
- [ ] Full dark + salmon theme polish

---

## ⏳ Sprint 4: Validation + Launch

- [ ] Validate Claude outputs: 95% JSON parse success rate
- [ ] Add basic copy/export JSON buttons
- [ ] QA across mobile, tablet, desktop
- [ ] Deploy backend to Railway with .env
- [ ] Deploy frontend to Vercel
- [ ] Custom domain setup (e.g. scribeai.dev)
- [ ] Final walkthrough for Product Hunt launch

---

## 🧠 Bonus Ideas

- [ ] Add prompt memory per task
- [ ] Prompt examples carousel on landing
- [ ] Support auto-generating docs alongside workflows


