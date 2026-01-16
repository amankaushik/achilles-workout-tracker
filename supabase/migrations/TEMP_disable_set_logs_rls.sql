-- TEMPORARY FIX: Disable RLS on set_logs for development
-- This allows the temp user to work without authentication issues
-- TODO: Re-enable proper RLS when adding real authentication

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own set logs" ON set_logs;
DROP POLICY IF EXISTS "Users can insert own set logs" ON set_logs;
DROP POLICY IF EXISTS "Users can update own set logs" ON set_logs;
DROP POLICY IF EXISTS "Users can delete own set logs" ON set_logs;
DROP POLICY IF EXISTS "Temp user can manage all set logs" ON set_logs;

-- Temporarily disable RLS on set_logs
ALTER TABLE set_logs DISABLE ROW LEVEL SECURITY;

-- Note: When you add authentication later, re-enable RLS with:
-- ALTER TABLE set_logs ENABLE ROW LEVEL SECURITY;
-- And create proper policies for authenticated users
