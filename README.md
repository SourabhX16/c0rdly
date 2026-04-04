# c0rdly

> Multi-tenant SaaS platform for Indian printing presses to manage school report card generation and bulk PDF printing.

## ⚠️ IMPORTANT: Implementation Complete

**All 15 critical fixes and features have been implemented!** See:
- 📋 [SUMMARY.md](./SUMMARY.md) - Quick overview of all changes
- 📖 [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md) - Detailed implementation notes
- 🧪 [TESTING_GUIDE.md](./TESTING_GUIDE.md) - How to test each feature
- 🚀 [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Deployment steps
- 🏗️ [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture

### Quick Start After Implementation

1. **Run database migration:**
   ```sql
   -- In Supabase SQL Editor, run:
   supabase/migrations/005_add_constraints_indexes.sql
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Test the application:**
   ```bash
   npm run dev
   ```
   Then follow [TESTING_GUIDE.md](./TESTING_GUIDE.md)

---

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

- **Dynamic Forms** — Create custom forms with drag-drop builder
- **JSONB for form data** — Flexible field storage without schema changes
- **Field ID consistency** — Validation and storage use same keys (✅ FIXED)
- **Org name autocomplete** — Fuzzy search for existing organizations (✅ NEW)
- **CSV template generation** — One-click download with correct headers (✅ NEW)
- **Single-query optimization** — Replaced loops with efficient queries (✅ FIXED)
- **Database constraints** — Status validation and performance indexes (✅ NEW)
- **Server Components by default** — Only `'use client'` where interactivity is needed
- **URL-based routing** — Deep-linkable form responses and org details

## Deploy

```bash
vercel --prod
```

Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel project settings.

## License

MIT
