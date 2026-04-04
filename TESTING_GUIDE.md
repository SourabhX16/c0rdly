# Quick Testing Guide

## 🧪 How to Test Each Feature

### Phase 1 - Critical Fixes

**Test 1: Validation Key Mismatch Fix**
1. Create a form with multiple fields
2. Submit via manual entry - should validate correctly
3. Submit via bulk upload - should map and validate correctly
4. Check that data is stored with `field.id` as keys

**Test 2: Form Save ID**
1. Create a new form
2. Verify you're redirected to `/admin` (not an error page)
3. Edit the form and save
4. Verify changes are saved correctly

**Test 3: Route Structure**
1. From admin dashboard, click "Edit" icon → should go to `/admin/forms/[id]/edit`
2. From forms list, click "Responses" → should go to `/admin/forms/[id]`
3. From responses page, click org name → should go to `/admin/forms/[id]/[org_name]`

### Phase 2 - Admin Features

**Test 4: Copy Share Link**
1. Go to `/admin/forms`
2. Click the link icon on any form card
3. Paste - should be full URL like `https://yoursite.com/f/[share_id]`

**Test 5: Download All Responses**
1. Go to `/admin/forms/[id]` (responses page)
2. Click "Download All Responses"
3. Verify CSV contains all orgs' data for that form

**Test 6: Status Counts**
1. Go to `/admin` dashboard
2. Verify you see stat cards for: Received, In Progress, Done
3. Numbers should match actual submission counts

**Test 7: Org Detail Link**
1. Go to `/admin/submissions`
2. Find any submission row
3. Click "View all responses →" under org name
4. Should navigate to org-specific responses page

### Phase 3 - Client Features

**Test 8: How It Works Section**
1. Go to `/portal`
2. Verify "How It Works" section is visible above form cards
3. Should show 3 numbered steps

**Test 9: CSV Template Download**
1. Go to any public form `/f/[share_id]`
2. Enter org name
3. Click "Bulk Upload"
4. Click "Download CSV Template"
5. Open CSV - headers should match form field labels exactly

**Test 10: Org Name Autocomplete**
1. Go to any public form
2. Type 2+ characters in "Organization Name" field
3. Wait 300ms - dropdown should appear with matching orgs
4. Click a suggestion - should populate the field
5. Click outside - dropdown should close

**Test 11: Client History Performance**
1. Go to `/portal`
2. Scroll to "Track My Submissions"
3. Enter an org name and search
4. Check browser network tab - should be ONE query, not multiple

### Phase 4 - Cleanup

**Test 12: Dead Files Removed**
```bash
# These should return "file not found":
dir app\dashboard\layout.tsx
dir app\dashboard\page.tsx
dir app\dashboard\settings\page.tsx
dir app\admin\print-jobs\page.tsx
dir app\admin\schools\page.tsx
```

**Test 13: React-PDF Removed**
```bash
# Should not appear in package.json:
type package.json | findstr "react-pdf"
```

**Test 14: Rate Limiter Warning**
1. Open `lib/rate-limit.ts`
2. Verify warning comment is present at top

**Test 15: Database Constraints**
```sql
-- Run in Supabase SQL Editor to verify:
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'form_responses' 
AND constraint_name = 'form_responses_status_check';

-- Should return the CHECK constraint

-- Verify indexes:
SELECT indexname FROM pg_indexes 
WHERE tablename = 'form_responses';

-- Should show all new indexes
```

## 🐛 Common Issues & Solutions

### Issue: Autocomplete not working
- Check browser console for errors
- Verify `searchOrganizations` action is exported
- Ensure at least 2 characters are typed

### Issue: CSV template has wrong headers
- Verify form fields have proper `label` values
- Check that `downloadTemplate()` uses `field.label`

### Issue: Validation errors on submission
- Ensure form uses `field.id` consistently
- Check that date fields accept string format (YYYY-MM-DD)

### Issue: Database migration fails
- Run migrations in order (001, 002, 003, 004, 005)
- Check if `pg_trgm` extension is available in your Supabase project

## ✅ Success Criteria

All features working when:
- ✅ Forms save and load correctly
- ✅ Manual submissions validate and save
- ✅ Bulk uploads map columns and validate
- ✅ Org autocomplete suggests existing names
- ✅ CSV templates download with correct headers
- ✅ Admin can view all responses per form
- ✅ Admin can view org-specific responses
- ✅ Status counts display on dashboard
- ✅ All links navigate to correct pages
- ✅ No dead files in codebase
- ✅ Database has proper constraints and indexes
