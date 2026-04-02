# c0rdly

> Multi-tenant SaaS platform for Indian printing presses to manage school report card generation and bulk PDF printing.

## Features

- **Bulk CSV Upload** — Upload hundreds of students at once with auto-validation
- **Pixel-Perfect PDFs** — Generate CBSE & State Board report cards matching physical print layouts
- **Dynamic Subjects** — Subjects auto-adjust per class, stored as flexible JSONB
- **School Isolation** — Row-Level Security ensures each school sees only their data
- **Multi-School Admin** — Printing press admin dashboard to manage all schools and batch-generate PDFs
- **Excel Export** — Download student data as structured spreadsheets
- **Session Management** — Switch between academic years (2024-25, 2025-26)
- **School Branding** — Upload school logos that appear on PDF report cards
- **Student Photos** — Upload and display student photos in report cards
- **Rate Limiting** — Protection against bulk upload abuse

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router, RSC, TypeScript) |
| Backend | Supabase (Auth, Postgres + RLS, Storage) |
| Styling | Tailwind CSS v4 (`@theme` tokens) |
| PDF Engine | `@react-pdf/renderer` |
| CSV Parsing | `papaparse` |
| Excel Export | `xlsx` |
| ZIP/Download | `jszip` + `file-saver` |
| Icons | `lucide-react` |
| Deployment | Vercel + Supabase (Free Tier) |

## Quick Start

```bash
# 1. Clone & install
git clone https://github.com/SourabhX16/c0rdly.git
cd c0rdly
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

### Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings → API** and copy your **Project URL** and **anon public** key
3. Paste them into `.env.local`
4. Go to **SQL Editor**, paste the contents of `supabase/schema.sql`, and run it

### Run

```bash
npm run dev
```

Open  : https://c0rdly.vercel.app

### Create Admin User

1. Sign up via the app (creates a `school` role by default)
2. In Supabase SQL Editor, run:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE contact_email = 'your@email.com';
   ```

## Project Structure

```
c0rdly/
├── app/
│   ├── page.tsx              # Landing page
│   ├── login/                # Auth (login/signup)
│   ├── dashboard/            # School portal
│   │   ├── students/         # CRUD + bulk upload
│   │   ├── settings/         # School profile & logo
│   │   └── upload/           # CSV bulk upload
│   └── admin/                # Admin portal
│       ├── schools/          # Manage all schools
│       └── print-jobs/       # Batch PDF generation
├── components/
│   ├── dashboard/            # School-facing components
│   ├── admin/                # Admin-facing components
│   └── pdf/                  # Report card PDF template
├── actions/                  # Server actions (CRUD)
├── lib/                      # Utilities, Supabase clients
├── types/                    # TypeScript interfaces
└── supabase/                 # Database schema + RLS policies
```

## Architecture

- **JSONB for marks** — Different subjects per class without schema changes
- **Upsert for reports** — One report card per student per session
- **Client-side PDF generation** — No server load; works on free tier
- **Server Components by default** — Only `'use client'` where interactivity is needed
- **URL-based session state** — Deep-linkable, server-accessible academic year selection

## Deploy

```bash
vercel --prod
```

Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel project settings.

## License

MIT
