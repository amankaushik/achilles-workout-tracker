# Supabase Integration Setup Guide

This guide will help you complete the Supabase integration for the Achilles Workout Tracker.

## Prerequisites

- Supabase project credentials are already configured in `.env.local`
- Project URL: `https://yfnrkjszmlyzvsvowytt.supabase.co`

## Step 1: Install Dependencies

Run npm install to add the Supabase client:

```bash
npm install
```

This will install `@supabase/supabase-js` and other dependencies.

## Step 2: Run Database Migrations

You need to execute the SQL migration files in your Supabase project.

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://supabase.com/dashboard/project/yfnrkjszmlyzvsvowytt
2. Navigate to **SQL Editor** in the left sidebar
3. Create a new query
4. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
5. Click **Run** to execute the migration
6. Repeat steps 3-5 for `supabase/migrations/002_seed_exercises.sql`

### Option B: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Link your project
supabase link --project-ref yfnrkjszmlyzvsvowytt

# Run migrations
supabase db push
```

## Step 3: Verify Database Setup

After running the migrations:

1. Go to **Table Editor** in Supabase Dashboard
2. You should see 5 tables:
   - `exercises` - Pre-populated with all Achilles exercises
   - `users` - Empty (will be auto-created)
   - `workout_logs` - Empty
   - `exercise_logs` - Empty
   - `set_logs` - Empty

3. Click on the `exercises` table and verify it contains exercises like:
   - "Leg Press"
   - "Incline Bench Press"
   - "Chin-ups/Pull-ups"
   - etc.

## Step 4: Test the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open the app in your browser (usually http://localhost:5173)

3. Test the following:
   - **Initial load**: App should load without errors (may show "Loading workout data...")
   - **Create workout**: Track a workout and save it
   - **Reload**: Refresh the page - your workout should persist
   - **View history**: Check that saved workouts appear in history
   - **Delete workout**: Delete a workout entry

4. Verify data in Supabase:
   - Go to **Table Editor** > `workout_logs`
   - You should see your saved workouts
   - Check `exercise_logs` and `set_logs` for exercise/set data

## Step 5: Build and Deploy

Once everything works locally:

1. Build the project:
   ```bash
   npm run build
   ```

2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Add Supabase backend integration

   - Add database schema with 5 tables
   - Seed exercises table with all Achilles exercises
   - Integrate Supabase client
   - Update storage hook with API sync
   - Add loading states and error handling

   Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
   git push
   ```

3. The app will auto-deploy to Cloudflare Pages

## How It Works

### Data Flow

1. **Save**: When you save a workout:
   - Data is saved to localStorage immediately (instant feedback)
   - Data is synced to Supabase in the background

2. **Load**: When you open the app:
   - LocalStorage data loads first (instant)
   - Supabase data is fetched and merged (API data takes precedence)

3. **Delete**: When you delete a workout:
   - Removed from localStorage immediately
   - Deleted from Supabase in the background

### Database Structure

- **exercises**: Master list of all exercises (pre-seeded, read-only)
- **users**: User accounts (currently uses a temporary user)
- **workout_logs**: High-level workout sessions
- **exercise_logs**: Exercises performed in each workout
- **set_logs**: Individual sets (weight/reps) for each exercise

### Row Level Security (RLS)

All tables have RLS enabled:
- Users can only see their own data
- Exercises table is publicly readable
- Temporary user ID used until authentication is added

## Troubleshooting

### Error: "Missing Supabase environment variables"

- Check that `.env.local` exists with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart the dev server after creating `.env.local`

### Error: "Failed to sync with server"

- Check Supabase Dashboard for any database errors
- Verify migrations ran successfully
- Check browser console for detailed error messages

### Data not persisting

- Check **Table Editor** in Supabase to see if data is being saved
- Look for JavaScript errors in browser console
- Verify RLS policies are active (check **Authentication** > **Policies**)

### Exercises not found warnings

- Check that `002_seed_exercises.sql` ran successfully
- Verify `exercises` table has data
- Exercise names must match exactly (case-sensitive)

## Next Steps (Future Enhancements)

1. **Authentication**: Add real user authentication (Supabase Auth)
2. **Offline Support**: Add service worker for true offline capability
3. **Data Migration**: Migrate any existing localStorage data to Supabase
4. **Analytics**: Track workout progress over time
5. **Social Features**: Share workouts with others

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check Supabase Dashboard > **Logs** for backend errors
3. Review the migration SQL files for any syntax errors
