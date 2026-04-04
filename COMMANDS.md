# Quick Command Reference

## 🚀 Getting Started

```bash
# Install dependencies (removes @react-pdf/renderer)
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 🗄️ Database Commands

### Run Migration (Required!)
```sql
-- In Supabase SQL Editor, paste and run:
-- File: supabase/migrations/005_add_constraints_indexes.sql
```

### Verify Migration
```sql
-- Check constraint exists
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'form_responses' 
AND constraint_name = 'form_responses_status_check';

-- Check indexes exist
SELECT indexname FROM pg_indexes 
WHERE tablename = 'form_responses';

-- Should show:
-- - idx_form_responses_created_at_desc
-- - idx_form_responses_status
-- - idx_form_responses_form_org
-- - idx_form_responses_org_name_trgm
```

### Test Data (Optional)
```sql
-- Create a test form
INSERT INTO forms (created_by, title, description, fields)
VALUES (
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
  'Test Form',
  'A test form for validation',
  '[
    {"id": "550e8400-e29b-41d4-a716-446655440000", "name": "student_name", "type": "text", "label": "Student Name", "required": true},
    {"id": "550e8400-e29b-41d4-a716-446655440001", "name": "age", "type": "number", "label": "Age", "required": true},
    {"id": "550e8400-e29b-41d4-a716-446655440002", "name": "grade", "type": "select", "label": "Grade", "required": true, "options": ["A", "B", "C"]}
  ]'::jsonb
);

-- Create test submission
INSERT INTO form_responses (form_id, org_name, data, status)
VALUES (
  (SELECT id FROM forms WHERE title = 'Test Form' LIMIT 1),
  'Test School',
  '{"550e8400-e29b-41d4-a716-446655440000": "John Doe", "550e8400-e29b-41d4-a716-446655440001": "15", "550e8400-e29b-41d4-a716-446655440002": "A"}'::jsonb,
  'Received'
);
```

## 🧪 Testing Commands

### Manual Testing
```bash
# Open browser to test pages
start http://localhost:3000/admin
start http://localhost:3000/portal
start http://localhost:3000/f/[share_id]
```

### Check for Dead Files (Should fail)
```bash
dir app\dashboard\layout.tsx        # Should not exist
dir app\dashboard\page.tsx          # Should not exist
dir app\admin\print-jobs\page.tsx   # Should not exist
```

### Check Dependencies
```bash
# Should NOT contain @react-pdf/renderer
type package.json | findstr "react-pdf"

# Should show all dependencies
npm list --depth=0
```

## 📊 Monitoring Commands

### Check Database Performance
```sql
-- Slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE tablename = 'form_responses'
ORDER BY idx_scan DESC;

-- Table size
SELECT pg_size_pretty(pg_total_relation_size('form_responses'));
```

### Check Application Logs
```bash
# Vercel logs (if deployed)
vercel logs

# Local development logs
# Check terminal where `npm run dev` is running
```

## 🔧 Troubleshooting Commands

### Clear Next.js Cache
```bash
rmdir /s /q .next
npm run dev
```

### Reset Database (Careful!)
```sql
-- Drop all form responses
TRUNCATE form_responses CASCADE;

-- Drop all forms
TRUNCATE forms CASCADE;

-- Re-run all migrations
-- Run schema.sql first, then all migration files
```

### Check Supabase Connection
```bash
# In browser console on any page:
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
```

## 📦 Deployment Commands

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Manual Build
```bash
# Build
npm run build

# Test production build locally
npm start

# Check build output
dir .next\server\app
```

## 🔍 Debugging Commands

### TypeScript Check
```bash
npx tsc --noEmit
```

### Find TODO Comments
```bash
findstr /s /i "TODO" *.ts *.tsx
```

### Find Console Logs (Should remove before production)
```bash
findstr /s /i "console.log" *.ts *.tsx
```

### Check Bundle Size
```bash
npm run build
# Check .next/server/app for large files
```

## 📝 Git Commands

### Commit All Changes
```bash
git add .
git commit -m "feat: implement all 15 critical fixes and features"
git push origin main
```

### Create Feature Branch
```bash
git checkout -b feature/additional-improvements
```

### View Changes
```bash
git status
git diff
git log --oneline -10
```

## 🎯 Quick Validation

### One-Command Health Check
```bash
# Run all checks
npm run lint && npx tsc --noEmit && npm run build
```

### Database Health Check
```sql
-- Run in Supabase SQL Editor
SELECT 
  'Forms' as table_name, COUNT(*) as count FROM forms
UNION ALL
SELECT 
  'Responses' as table_name, COUNT(*) as count FROM form_responses
UNION ALL
SELECT 
  'Profiles' as table_name, COUNT(*) as count FROM profiles;
```

## 📚 Documentation Commands

### Generate Type Definitions
```bash
# Supabase generates types automatically
# Check types/database.ts for current definitions
```

### View All Routes
```bash
# List all page files
dir /s /b app\*\page.tsx
```

## 🎉 Success Verification

### All Systems Go Checklist
```bash
# 1. Dependencies installed
npm list --depth=0

# 2. Build succeeds
npm run build

# 3. No TypeScript errors
npx tsc --noEmit

# 4. No lint errors
npm run lint

# 5. Dev server starts
npm run dev
# Then visit http://localhost:3000
```

---

**Pro Tip**: Bookmark this file for quick reference during development and deployment!
