# Deployment TODO for Supabase Backend Integration

## Pre-Deployment: Supabase Setup

### 1. Run Database Migrations

**Critical: Run these migrations in order in your Supabase SQL Editor**

https://supabase.com/dashboard/project/yfnrkjszmlyzvsvowytt/sql

#### Step 1: Create Core Schema
```sql
-- Run: supabase/migrations/001_initial_schema.sql
-- Creates 5 tables: users, workout_logs, exercise_logs, set_logs, exercises
-- Enables RLS on all tables
```

#### Step 2: Seed Exercises
```sql
-- Run: supabase/migrations/002_seed_exercises.sql
-- Populates exercises table with all 67 Achilles program exercises
```

#### Step 3: Setup for Development (Temp User)
```sql
-- Run: supabase/migrations/DISABLE_RLS_FOR_DEV.sql
-- Disables RLS for development without authentication
-- This is temporary until we add real auth
```

### 2. Verify Database Setup

- [ ] Go to Supabase Dashboard → Table Editor
- [ ] Verify 5 tables exist: `exercises`, `users`, `workout_logs`, `exercise_logs`, `set_logs`
- [ ] Check `exercises` table has 67 rows (all Achilles exercises)
- [ ] Verify RLS is disabled on user tables (for development)
- [ ] Check that temp user exists: `00000000-0000-0000-0000-000000000000`

## Deployment: Cloudflare Pages

### 3. Add Environment Variables

Go to Cloudflare Pages → Your Project → Settings → Environment Variables

Add the following for both **Production** and **Preview** environments:

```
VITE_SUPABASE_URL=https://yfnrkjszmlyzvsvowytt.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_imTl-md9qRKI8W9oG1Zcyw_vwLHbWhQ
```

**Important:** These are build-time variables (VITE_ prefix), not runtime variables.

### 4. Deploy Branch

- [ ] Push to GitHub (already done)
- [ ] Cloudflare Pages will auto-deploy the `feature/supabase-backend` branch
- [ ] Wait for build to complete
- [ ] Get preview URL from Cloudflare dashboard

### 5. Test Deployment

#### Basic Functionality Tests

- [ ] Open deployed preview URL
- [ ] Verify app loads without "Failed to sync with server" error
- [ ] Start a new workout (any phase/week/workout)
- [ ] Enter data for at least 2 exercises with sets/reps/weight
- [ ] Click "Mark Complete"
- [ ] Check Supabase Dashboard → Table Editor → `workout_logs` - verify workout appears
- [ ] Check `exercise_logs` table - verify all exercises saved
- [ ] Check `set_logs` table - verify all sets saved

#### History Tests

- [ ] Click History icon in header
- [ ] Verify saved workout appears in history
- [ ] Click on the workout entry
- [ ] Verify all exercise data displays correctly
- [ ] Verify weights, reps, and notes are preserved

#### Sync Tests

- [ ] Open app in a new browser tab/window
- [ ] Verify workout appears in history (loaded from database)
- [ ] Delete a workout from history
- [ ] Refresh the page
- [ ] Verify workout is gone (deleted from database)

#### Multi-Device Tests (Optional)

- [ ] Open app on mobile device
- [ ] Log a workout on mobile
- [ ] Open app on desktop
- [ ] Verify workout synced and appears in history

### 6. Browser Console Checks

Open browser DevTools → Console while testing:

- [ ] No "Failed to sync with server" errors
- [ ] No 401 Unauthorized errors
- [ ] No RLS policy violation errors (42501)
- [ ] No foreign key constraint errors (23503)
- [ ] Auto-save should log "Loading workout data..." on initial load

Expected console output should be minimal with only:
- Initial API fetch on load
- Background saves when editing workouts

## Post-Deployment: Cleanup

### 7. Clean Up Test Data (Optional)

After testing, you may want to clear test data:

```sql
-- Run in Supabase SQL Editor
DELETE FROM workout_logs WHERE user_id = '00000000-0000-0000-0000-000000000000';
-- Cascade will delete related exercise_logs and set_logs
```

### 8. Create Pull Request (When Ready)

Once testing is complete and everything works:

- [ ] Go to: https://github.com/amankaushik/achilles-workout-tracker/pull/new/feature/supabase-backend
- [ ] Create PR from `feature/supabase-backend` to `master`
- [ ] Add description summarizing changes
- [ ] Merge when approved

### 9. Production Deployment

After merging to master:

- [ ] Cloudflare will auto-deploy to production
- [ ] Verify environment variables are set for production environment
- [ ] Test production URL
- [ ] Monitor Supabase logs for any errors

## Future: Adding Authentication

When you're ready to add real user authentication:

### 10. Enable RLS and Authentication

```sql
-- Run: supabase/migrations/DISABLE_RLS_FOR_DEV.sql lines 39-42
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE set_logs ENABLE ROW LEVEL SECURITY;
```

Then create proper RLS policies using `auth.uid()` for authenticated users.

### 11. Integrate Supabase Auth

- [ ] Add Supabase Auth UI components
- [ ] Update API calls to use `auth.getSession()` instead of temp user
- [ ] Create proper RLS policies for authenticated users
- [ ] Test multi-user scenarios
- [ ] Migrate data from temp user to real users if needed

## Troubleshooting

### Common Issues

**"Failed to sync with server"**
- Check environment variables are set in Cloudflare Pages
- Verify Supabase URL and anon key are correct
- Check Supabase Dashboard → API Settings for correct values

**"401 Unauthorized" errors**
- RLS might still be enabled - run DISABLE_RLS_FOR_DEV.sql
- Check Supabase anon key is correct

**"Foreign key constraint" errors**
- RLS is blocking exercise_logs inserts
- Run DISABLE_RLS_FOR_DEV.sql migration

**Only some exercises saving**
- Check browser console for specific errors
- Verify all migrations ran successfully
- Check Supabase Dashboard → Logs for backend errors

**Data not appearing in history**
- Click History icon to trigger refresh
- Check browser console for API errors
- Verify data exists in Supabase Table Editor

## Support Files

- **Setup Guide**: See `SETUP_SUPABASE.md` for detailed setup instructions
- **Data Model**: See `docs/data-model.md` for database schema documentation
- **Test Tool**: Open `test-supabase.html` in browser to test database connection

## Notes

- The app currently uses a temporary user ID for all users
- All workout data is shared (single user mode)
- LocalStorage is used as a write-through cache for instant updates
- Database is the source of truth - data is fetched on app load
- Auto-save runs 500ms after each input change
