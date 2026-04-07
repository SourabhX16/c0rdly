# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

c0rdly (branded as GPRS) is a dynamic form management platform for an Indian printing press. Admins create forms; organizations submit data via manual entry or bulk CSV/Excel upload. Built on Next.js App Router with Supabase backend.

## Commands

```bash
npm run dev       # Start dev server (Next.js 16 with Turbopack)
npm run build     # Production build
npm run lint      # ESLint
```

No test framework is configured.

## Tech Stack

- **Next.js 16** (App Router, Server Components, Turbopack)
- **React 19**, **TypeScript 5**
- **Supabase** (Auth, PostgreSQL, RLS, Storage) via `@supabase/ssr` for cookie-based SSR auth
- **Tailwind CSS v4** with custom design tokens in `globals.css`
- **Zod v4** for validation schemas
- **@dnd-kit** for drag-drop form builder
- **papaparse** + **xlsx** for CSV/Excel import
- **fast-levenshtein** for fuzzy CSV column mapping

## Architecture

### Auth & Roles

Two roles: `admin` and `client`, stored in `profiles.role`. Shared `/login` page; middleware reads the role and redirects to `/admin` or `/portal`. Layouts enforce role-based access server-side.

- `middleware.ts` — Auth check + role-based redirect for all routes
- `lib/supabase/middleware.ts` — Supabase SSR client for middleware (cookie refresh)
- `lib/supabase/server.ts` — Supabase client for server components/actions (uses `cookies()`)
- `lib/supabase/client.ts` — Supabase browser client for client components

### Route Structure

```
/login                          → Shared login
/admin                          → Admin dashboard (role-guarded)
/admin/forms/new                → Create form → redirects to [id]/edit
/admin/forms/[id]              → Form responses overview (org list)
/admin/forms/[id]/edit          → Form builder/editor
/admin/forms/[id]/[org_name]   → Org-specific responses
/admin/submissions              → All submissions table
/admin/organizations            → Org management
/admin/audit                    → Audit logs
/portal                         → Client portal (redirects admins)
/f/[shareId]                    → Public form (no auth)
/f/new-org                      → New organization registration
```

### Server Actions

All mutations are server actions in `actions/` directory. Actions use `createClient()` from `@/lib/supabase/server` and call `revalidatePath()` after mutations. Admin operations also call `logAuditAction()`.

- `actions/auth.ts` — signOut, getCurrentUser
- `actions/forms.ts` — getForms, getFormById, saveForm, deleteForm
- `actions/submissions.ts` — getSubmissions, submitResponse, searchOrganizations, etc.
- `actions/organizations.ts` — CRUD for organizations
- `actions/export.ts` — Export submissions (filesystem-based, Windows-specific path)
- `app/actions/form.ts` — Form/submission actions (bulk submit, org aggregation, share-ID lookup)

### Data Model (Supabase/PostgreSQL)

- **profiles**: `id` (FK to auth.users), `role` (admin|client), `organization_name`, contact fields
- **forms**: `id`, `created_by`, `title`, `description`, `fields` (JSONB array of FormField), `share_url_id` (UUID)
- **form_responses**: `id`, `form_id`, `org_name`, `data` (JSONB keyed by field.id), `raw_file_path`, `status` (Received|In Progress|Done)
- **audit_logs**: `id`, `admin_id`, `action`, `target_type`, `target_id`, `details` (JSONB)
- **organizations**: `id`, `name` (UNIQUE), contact fields, `created_by`

**Critical**: JSONB data keys use `field.id` (UUID), not `field.name`. Validation schemas must also use `field.id`.

### Design System ("Midnight Galaxy" theme)

Dark theme defined in `globals.css` and `.stitch/DESIGN.md`. Key custom CSS classes:
- `glass-card`, `glass-card-elevated`, `glass-card-floating`, `crystal-card`
- `btn-primary`, `btn-secondary`, `btn-danger`
- `input-dark`, `badge-*`, `nav-active`, `gradient-indigo-bar`, `gradient-text`
- Animations: `animate-fade-in`, `animate-crystallize`, `stagger-children`

Fonts: Space Grotesk (display), Inter (body). Colors: Cosmic Navy `#0F172A`, Deep Abyss `#020617`, Electric Indigo `#4F46E5`.

### Key Components

- `components/admin/FormBuilder.tsx` — Drag-drop form builder (client component, uses @dnd-kit)
- `components/public/PublicFormClient.tsx` — Manual entry + mode selector
- `components/public/BulkUploadClient.tsx` — CSV/Excel upload with column auto-mapping
- `components/admin/SubmissionsTable.tsx` — Filtering, sorting, pagination

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Copy `.env.example` to `.env.local` and fill in Supabase credentials.

## Database Setup

1. Run `supabase/schema.sql` in Supabase SQL Editor
2. Run all migrations in `supabase/migrations/` in order (002, 003, 004, 005)

## Known Issues

- Rate limiting (`lib/rate-limit.ts`) is in-memory only — resets on cold start. Needs Supabase-based replacement.
- `actions/export.ts` uses a hardcoded Windows filesystem path — needs generalization for production.