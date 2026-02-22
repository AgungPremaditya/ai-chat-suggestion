# CLAUDE.md

## Project Overview

Enterprise dashboard built with Next.js, featuring dark/light mode theming.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, class-variance-authority, tailwind-merge, clsx
- **Icons**: lucide-react
- **Package Manager**: pnpm

## Project Structure

```
app/           → Next.js App Router (layout, page, globals.css)
components/    → Dashboard components (header, sidebar, stat-card, activity-card, theme-*)
components/ui/ → Shared UI primitives (button, card, input) — shadcn/ui style
lib/           → Utilities (utils.ts)
```

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
- Use Tailwind CSS utility classes; avoid custom CSS where possible
