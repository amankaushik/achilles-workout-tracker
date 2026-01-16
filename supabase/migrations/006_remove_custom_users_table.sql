-- Remove custom users table and use Supabase's auth.users instead
-- This migration cleans up the unnecessary custom users table

-- Step 1: Drop foreign key constraint from workout_logs to custom users table
ALTER TABLE workout_logs DROP CONSTRAINT IF EXISTS workout_logs_user_id_fkey;

-- Step 2: Add foreign key to auth.users instead
ALTER TABLE workout_logs ADD CONSTRAINT workout_logs_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 3: Drop all policies on users table
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Allow users operations" ON users;

-- Step 4: Drop the custom users table
DROP TABLE IF EXISTS users;

-- Note: auth.users is managed by Supabase Auth and contains:
-- - id (UUID, primary key)
-- - email
-- - created_at
-- - updated_at
-- - user_metadata (JSONB for custom fields like name)
-- No need to create or manage this table ourselves!
