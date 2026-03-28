# CLAUDE.md

## Project Overview

Enterprise dashboard built with Next.js, featuring dark/light mode theming, Supabase authentication, and an AI-assisted inquiry management system.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, class-variance-authority, tailwind-merge, clsx
- **Icons**: lucide-react
- **Backend**: Supabase (auth, database, storage)
- **AI**: OpenAI SDK (`openai`) — GPT-4o-mini by default, configurable via `OPENAI_MODEL` env
- **Email**: Nodemailer — SMTP email sending
- **Charts**: Recharts — analytics dashboard
- **Rich Text**: TipTap (WYSIWYG editor for replies)
- **Package Manager**: pnpm

## Project Structure

```
app/
├── layout.tsx                        → Root layout
├── page.tsx                          → Home/redirect
├── globals.css                       → Global styles (includes .ProseMirror editor styles)
├── auth/
│   ├── page.tsx                      → Login/signup page (Supabase OAuth)
│   └── callback/route.ts             → OAuth callback handler
├── submit-inquiry/
│   └── page.tsx                      → Public inquiry submission form (no auth required)
├── api/
│   ├── submit-inquiry/route.ts       → API: save inquiry + honeypot/rate-limit checks
│   └── upload-attachment/route.ts    → API: upload files to Supabase Storage
└── dashboard/
    ├── inquiries/
    │   ├── page.tsx                  → Inquiries list (auth-protected)
    │   └── [id]/
    │       ├── page.tsx              → Inquiry detail + lead info + reply preview
    │       └── reply/
    │           └── page.tsx          → TipTap WYSIWYG reply editor
    ├── leads/page.tsx                → Leads list
    ├── analytics/page.tsx            → Analytics
    └── settings/page.tsx             → Settings

components/
├── header.tsx                        → Dashboard header (user info, sign-out)
├── sidebar.tsx                       → Navigation sidebar
├── stat-card.tsx                     → Stat card
├── activity-card.tsx                 → Activity card
├── theme-provider.tsx                → Dark/light theme provider
├── theme-toggle.tsx                  → Theme toggle button
└── ui/                               → Shared UI primitives (shadcn/ui style)
    ├── button.tsx
    ├── card.tsx
    └── input.tsx

lib/
├── utils.ts                          → cn() utility
└── supabase/
    ├── client.ts                     → Browser Supabase client
    ├── server.ts                     → Server-side Supabase client
    └── middleware.ts                 → Supabase session refresh middleware

supabase/migrations/                  → SQL migrations (run via Supabase CLI)
middleware.ts                         → Next.js middleware (auth session guard)
```

## Database Schema

- **inquiries** — public form submissions (name, email, phone, message, attachments, source, consent)
- **leads** — AI-processed lead data (category, status, confidence_score, summary, recommended_reply, final_reply, replied_at)
- **ai_jobs** — AI processing job log

## Implemented Features

- ✅ Auth (Supabase OAuth, session guard via middleware)
- ✅ Public inquiry form (honeypot + rate limiting)
- ✅ File attachment upload (Supabase Storage)
- ✅ AI auto-categorize leads (hot/warm/cold) with confidence score + summary
- ✅ AI job tracking (`ai_jobs` table — model, tokens, success/fail, timing)
- ✅ TipTap WYSIWYG reply editor with default draft template
- ✅ Email sending via Nodemailer (triggered on reply submit)
- ✅ Inquiry list: search (name/email/message), filter by source, pagination (8/page)
- ✅ Analytics dashboard (Recharts)
- ✅ Dark/light mode toggle (theme-provider + theme-toggle)
- ✅ Empty states (inquiry list)
- ✅ Lead status auto-update to "replied" after email sent

## TODO / Not Yet Implemented

- ❌ Realtime notifications (Supabase realtime — new inquiry badge/toast)
- ❌ Timeline per inquiry (UI history: received → AI processed → replied at)
- ❌ Email templates (save/load custom reply templates)
- ❌ Skeleton loading (replace Loader2 spinner with skeleton screens)
- ❌ Export CSV (inquiry list download)

## Key Patterns

- `middleware.ts` protects all `/dashboard/*` routes; `/submit-inquiry` and `/auth` are public
- Public inquiry form uses honeypot field + rate limiting (Supabase function) to prevent spam
- File uploads go to Supabase Storage bucket; URL is stored as text in `inquiries.attachments`
- TipTap editor uses `immediatelyRender: false` (SSR safety); content is set via a separate `useEffect` that watches both editor readiness and fetched data
- `.ProseMirror` styles in `globals.css` handle editor typography (bold, lists, spacing) — no `@tailwindcss/typography` dependency

## Commands

```bash
pnpm dev       # Start dev server
pnpm build     # Production build
pnpm lint      # Run ESLint
```

## Conventions

- Use shadcn/ui patterns for UI primitives in `components/ui/`
- Use `cn()` from `lib/utils.ts` for conditional class merging
- Keep components in `components/` at the top level; shared primitives in `components/ui/`
- Use Tailwind CSS utility classes; avoid custom CSS where possible (exception: `.ProseMirror` editor styles)
