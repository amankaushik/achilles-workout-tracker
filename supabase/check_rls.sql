-- Check current RLS status and policies

-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('workout_logs', 'exercise_logs', 'set_logs', 'users');

-- Check existing policies on workout_logs
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('workout_logs', 'exercise_logs', 'set_logs', 'users')
ORDER BY tablename, policyname;
