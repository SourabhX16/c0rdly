# Deployment Checklist

## 📋 Pre-Deployment Steps

### 1. Database Migration
- [ ] Backup your Supabase database
- [ ] Run migration: `supabase/migrations/005_add_constraints_indexes.sql`
- [ ] Verify constraints: 
  ```sql
  SELECT * FROM information_schema.check_constraints 
  WHERE constraint_name = 'form_responses_status_check';
  ```
- [ ] Verify indexes:
  ```sql
  SELECT indexname FROM pg_indexes WHERE tablename = 'form_responses';
  ```

### 2. Dependencies
- [ ] Remove old dependencies: `npm uninstall @react-pdf/renderer`
- [ ] Install fresh: `npm install`
- [ ] Verify no peer dependency warnings

### 3. Environment Variables
- [ ] Verify `.env.local` has:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Code Verification
- [ ] Run TypeScript check: `npx tsc --noEmit`
- [ ] Run linter: `npm run lint`
- [ ] Build test: `npm run build`

### 5. Data Migration (if needed)
If you have existing form_responses with incorrect data structure:
```sql
-- Check if any responses use field.name instead of field.id
SELECT id, form_id, data FROM form_responses LIMIT 10;

-- If migration needed, create a script to transform data keys
-- This is form-specific and depends on your existing data
```

## 🚀 Deployment Steps

### Option A: Vercel Deployment
1. [ ] Push code to GitHub
2. [ ] Connect Vercel to repository
3. [ ] Add environment variables in Vercel dashboard
4. [ ] Deploy
5. [ ] Test production URL

### Option B: Manual Deployment
1. [ ] Build: `npm run build`
2. [ ] Test build locally: `npm start`
3. [ ] Deploy `.next` folder to hosting
4. [ ] Configure environment variables on host

## ✅ Post-Deployment Verification

### Critical Path Testing
1. [ ] **Admin Login**
   - Navigate to `/login`
   - Login with admin credentials
   - Verify redirect to `/admin`

2. [ ] **Form Creation**
   - Create a new form with 3+ fields
   - Save and verify redirect works
   - Check form appears in forms list

3. [ ] **Public Form Access**
   - Copy share link from form card
   - Open in incognito window
   - Verify form loads correctly

4. [ ] **Manual Submission**
   - Enter org name (type 2+ chars, verify autocomplete)
   - Fill form manually
   - Submit and verify success message

5. [ ] **Bulk Upload**
   - Download CSV template
   - Add 3 rows of data
   - Upload and verify mapping
   - Submit and verify success

6. [ ] **Admin Response View**
   - Go to `/admin/forms/[id]`
   - Verify org list shows
   - Click org name
   - Verify responses display correctly

7. [ ] **CSV Export**
   - From form responses page, click "Download All Responses"
   - Verify CSV contains all data
   - Check column headers match field labels

8. [ ] **Status Management**
   - Go to `/admin/submissions`
   - Change a submission status
   - Verify it updates without page refresh

9. [ ] **Client Portal**
   - Go to `/portal`
   - Verify "How It Works" section visible
   - Verify form cards display
   - Test submission tracking with org name

## 🔍 Monitoring

### Key Metrics to Watch
- [ ] Form submission success rate
- [ ] Bulk upload error rate
- [ ] Page load times (especially `/admin/submissions`)
- [ ] Database query performance

### Error Monitoring
- [ ] Set up Sentry or similar error tracking
- [ ] Monitor Supabase logs for query errors
- [ ] Check Vercel logs for server action failures

## 🐛 Rollback Plan

If critical issues occur:

1. **Database Rollback**
   ```sql
   -- Remove constraints
   ALTER TABLE form_responses DROP CONSTRAINT IF EXISTS form_responses_status_check;
   
   -- Remove indexes
   DROP INDEX IF EXISTS idx_form_responses_created_at_desc;
   DROP INDEX IF EXISTS idx_form_responses_status;
   DROP INDEX IF EXISTS idx_form_responses_form_org;
   DROP INDEX IF EXISTS idx_form_responses_org_name_trgm;
   ```

2. **Code Rollback**
   - Revert to previous Git commit
   - Redeploy previous version

3. **Data Recovery**
   - Restore from Supabase backup
   - Re-run previous migration state

## 📞 Support Contacts

- **Database Issues**: Check Supabase dashboard
- **Deployment Issues**: Check Vercel logs
- **Code Issues**: Review GitHub commit history

## 🎉 Success Indicators

Deployment is successful when:
- ✅ All 15 features from implementation plan work
- ✅ No console errors on any page
- ✅ Form submissions save correctly
- ✅ CSV exports contain proper data
- ✅ Autocomplete suggests existing orgs
- ✅ Admin can manage all submissions
- ✅ Database queries are fast (<500ms)
- ✅ No 404 errors on navigation

---

**Last Updated**: After completing all 15 implementation steps
**Migration Version**: 005_add_constraints_indexes.sql
