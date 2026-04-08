# c0rdly

> Dynamic form management platform with bulk data collection, organization tracking, and admin analytics.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://c0rdly-gray.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com)

**🚀 [Live Demo](https://c0rdly.vercel.app)**

## Features

- **Dynamic Form Builder** — Drag-and-drop interface to create custom forms with multiple field types
- **Bulk Data Upload** — CSV/Excel import with auto-validation and error reporting
- **Organization Management** — Track submissions by organization with fuzzy search autocomplete
- **Public Form Sharing** — Generate shareable links for external data collection
- **Client Portal** — Dedicated portal for organizations to view their forms
- **Advanced Filtering** — Search and filter submissions by status, organization, and date
- **Audit Logging** — Track all form and submission changes with timestamps
- **JSONB Storage** — Flexible field storage without schema migrations
- **Row-Level Security** — Supabase RLS ensures data isolation
- **Export Capabilities** — Download submission data and CSV templates

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router, Server Components, TypeScript) |
| Backend | Supabase (Auth, Postgres + RLS) |
| Styling | Tailwind CSS |
| CSV/Excel | `papaparse`, `xlsx` |
| Icons | `lucide-react` |
| Deployment | Vercel + Supabase |

## Quick Start

```bash
# 1. Clone & install
git clone https://github.com/SourabhX16/c0rdly.git
cd c0rdly
npm install

# 2. Set up environment
cp .env.example .env.local
# Add your Supabase credentials:
# NEXT_PUBLIC_SUPABASE_URL=your-project-url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Copy **Project URL** and **anon key** from Settings → API
3. Run `supabase/schema.sql` in SQL Editor
4. Run migrations in `supabase/migrations/` folder

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Create Admin User

```sql
-- In Supabase SQL Editor:
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

## Project Structure

```
c0rdly/
├── app/
│   ├── page.tsx              # Landing page
│   ├── login/                # Auth (login/signup)
│   ├── portal/               # Client portal (public forms)
│   ├── admin/                # Admin portal
│   │   ├── page.tsx          # Dashboard with stats
│   │   ├── forms/            # Dynamic form management
│   │   │   ├── [id]/         # Form responses overview
│   │   │   │   ├── edit/     # Form builder
│   │   │   │   └── [org_name]/ # Org-specific responses
│   │   ├── submissions/      # All submissions table
│   │   ├── organizations/    # Org management
│   │   └── audit/            # Audit logs
│   └── f/[shareId]/          # Public form submission
├── components/
│   ├── admin/                # Admin components
│   │   ├── FormBuilder.tsx   # Drag-drop form builder
│   │   └── SubmissionsTable.tsx # Advanced filtering
│   ├── public/               # Public form components
│   │   ├── PublicFormClient.tsx # Manual entry
│   │   └── BulkUploadClient.tsx # CSV/Excel upload
│   └── portal/               # Client portal components
├── actions/                  # Server actions (CRUD)
├── lib/                      # Utilities, Supabase clients
├── types/                    # TypeScript interfaces
└── supabase/                 # Database schema + migrations
    ├── schema.sql            # Initial schema
    └── migrations/
        └── 005_add_constraints_indexes.sql # ✅ NEW
```

## Architecture

- **Dynamic Forms** — Drag-drop form builder with real-time preview
- **JSONB Storage** — Flexible field storage without schema migrations
- **Field ID Consistency** — Unified validation and storage keys
- **Organization Autocomplete** — Fuzzy search for existing organizations
- **CSV Template Generation** — Auto-generated templates with correct headers
- **Optimized Queries** — Single-query bulk operations
- **Database Constraints** — Status validation and performance indexes
- **Server Components** — RSC by default, client components only where needed
- **URL-based Routing** — Deep-linkable forms and submissions

## Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/SourabhX16/c0rdly)

```bash
vercel --prod
```

**Environment Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` — Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Your Supabase anon key

## License

MIT
