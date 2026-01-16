# Authentication Setup Guide

This branch adds user authentication using Supabase Auth.

## Features Added

- ✅ Email/Password authentication via Supabase Auth UI
- ✅ Protected routes - users must log in to access the app
- ✅ User-specific workout data (each user sees only their own workouts)
- ✅ Automatic user record creation on first login
- ✅ Logout functionality with user email display in header
- ✅ Row Level Security (RLS) enabled for multi-user data isolation

## How It Works

### Authentication Flow

1. **Unauthenticated Users**: See a login/signup screen
2. **New Users**: Can sign up with email and password
3. **Existing Users**: Can log in with their credentials
4. **Authenticated Users**: Access the full workout tracking app
5. **Logout**: Users can log out from the header

### Data Isolation

- Each user has their own workout data
- RLS policies ensure users can only access their own records
- User ID from Supabase Auth is used as the primary key
- Automatic user record creation in `users` table on first login

### Components

**New Components:**
- `src/contexts/AuthContext.tsx` - Global auth state management
- `src/components/Auth.tsx` - Login/signup UI using Supabase Auth UI

**Modified Components:**
- `src/App.tsx` - Adds auth check and shows Auth component when not logged in
- `src/components/Header.tsx` - Displays user email and logout button
- `src/services/api.ts` - Uses authenticated user ID instead of temp user
- `src/main.tsx` - Wraps app with AuthProvider

### Styling

Added auth-specific styles in `src/index.css`:
- `.auth-container` - Centered login screen
- `.auth-card` - Styled auth form card
- `.user-section` - Header user info section
- `.logout-btn` - Logout button styling
- Supabase Auth UI theme overrides to match app design

## Setup Instructions

### 1. Enable Email Auth in Supabase

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable "Email" provider
3. Configure email templates (optional)
4. Set site URL to your deployment URL

### 2. Run Database Migration

Run the RLS enablement migration in Supabase SQL Editor:

```bash
# File: supabase/migrations/005_enable_rls_for_auth.sql
```

This migration:
- Re-enables RLS on all tables
- Creates policies that check `auth.uid()` for authenticated users
- Ensures users can only access their own data

### 3. Update Environment Variables (If Deploying)

Ensure these are set in Cloudflare Pages:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Test Authentication

**Local Testing:**
```bash
npm run dev
```

1. You should see the login/signup screen
2. Create a new account with email/password
3. After signup, check your email for confirmation (if email confirmation is enabled)
4. Log in and verify you can access the app
5. Create a workout and verify it saves
6. Log out and log back in - verify your data persists
7. Create a second account and verify you don't see the first account's data

**Production Testing:**
1. Deploy to Cloudflare Pages
2. Visit the deployed URL
3. Sign up with a real email address
4. Verify email confirmation works
5. Test workout creation and data persistence

## Migration from Temp User

If you have existing data from the temp user development phase:

### Option 1: Fresh Start (Recommended)

1. Run migration `005_enable_rls_for_auth.sql`
2. Delete temp user data:
```sql
DELETE FROM workout_logs
WHERE user_id = '00000000-0000-0000-0000-000000000000';
```
3. Users start with clean slate

### Option 2: Migrate Temp User Data

If you want to preserve temp user data:

1. Create a real user account
2. Get the user ID from `auth.users` table
3. Update temp user's data:
```sql
UPDATE workout_logs
SET user_id = 'real-user-uuid-here'
WHERE user_id = '00000000-0000-0000-0000-000000000000';
```
4. Run migration `005_enable_rls_for_auth.sql`

## Security Features

### Row Level Security (RLS)

All tables have RLS policies that:
- Verify `auth.uid()` matches the user_id
- Prevent users from seeing or modifying others' data
- Allow only authenticated users to access data
- Cascade permissions through foreign keys

### Auth Policies

**Users Table:**
- Users can view/update/insert only their own record
- Auto-created on first login if doesn't exist

**Workout Logs:**
- Full CRUD only for own workout logs (where `user_id = auth.uid()`)

**Exercise Logs & Set Logs:**
- Access controlled through parent workout_log ownership
- Uses EXISTS clauses to verify ownership chain

## API Changes

### Before (Temp User):
```typescript
const TEMP_USER_ID = '00000000-0000-0000-0000-000000000000';
async function ensureUser() {
  return TEMP_USER_ID;
}
```

### After (Authenticated User):
```typescript
async function getCurrentUserId() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No authenticated user');
  return user.id;
}
```

All API functions now use `getCurrentUserId()` instead of `ensureUser()`.

## Troubleshooting

### "No authenticated user" errors
- User is not logged in or session expired
- Check if `user` is null in AuthContext
- Verify Supabase URL and anon key are correct

### Can't see my data after logging in
- RLS policies might not be enabled
- Run migration `005_enable_rls_for_auth.sql`
- Check Supabase Dashboard → Authentication → Policies

### Email confirmation not working
- Check Supabase Dashboard → Authentication → Email Templates
- Verify SMTP settings if using custom email
- Check spam folder for confirmation emails

### Build errors
- Run `npm install` to ensure auth packages are installed
- Check that all imports are correct
- Verify TypeScript types are up to date

## Dependencies Added

```json
{
  "@supabase/auth-ui-react": "^0.4.7",
  "@supabase/auth-ui-shared": "^0.1.8"
}
```

## Next Steps

After authentication is working:

1. **Email Confirmation**: Enable email confirmation in Supabase for security
2. **Password Reset**: Add forgot password functionality
3. **Profile Management**: Allow users to update their name/email
4. **Social Logins**: Add Google/GitHub OAuth providers (optional)
5. **Multi-Factor Auth**: Enable MFA for additional security (optional)

## Testing Checklist

- [ ] User can sign up with email/password
- [ ] User can log in with credentials
- [ ] User can log out
- [ ] Logged-in user can create workouts
- [ ] Logged-in user can view workout history
- [ ] Logged-in user can delete workouts
- [ ] User data persists across sessions
- [ ] Different users see different data
- [ ] User email shows in header
- [ ] Logout button works
- [ ] App redirects to login when not authenticated
- [ ] RLS prevents unauthorized data access
