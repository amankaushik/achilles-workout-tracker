-- Fix RLS performance issues by wrapping auth.uid() in SELECT
-- This prevents re-evaluation of auth functions for each row

-- ============================================
-- PART 1: Fix duplicate constraints
-- ============================================

-- Drop duplicate constraint if it exists (keep set_logs_exercise_set_unique)
ALTER TABLE set_logs DROP CONSTRAINT IF EXISTS workout_log_exercise_set_unique;

-- ============================================
-- PART 2: Fix duplicate policies on exercises table
-- ============================================

-- Drop the older duplicate policy
DROP POLICY IF EXISTS "Exercises are viewable by everyone" ON exercises;

-- Keep "Everyone can read exercises" policy (created in migration 009)

-- ============================================
-- PART 3: Update workout_logs policies
-- ============================================

DROP POLICY IF EXISTS "Users can view own workout logs" ON workout_logs;
CREATE POLICY "Users can view own workout logs" ON workout_logs
  FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own workout logs" ON workout_logs;
CREATE POLICY "Users can insert own workout logs" ON workout_logs
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own workout logs" ON workout_logs;
CREATE POLICY "Users can update own workout logs" ON workout_logs
  FOR UPDATE
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own workout logs" ON workout_logs;
CREATE POLICY "Users can delete own workout logs" ON workout_logs
  FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- PART 4: Update exercise_logs policies
-- ============================================

DROP POLICY IF EXISTS "Users can view own exercise logs" ON exercise_logs;
CREATE POLICY "Users can view own exercise logs" ON exercise_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = exercise_logs.workout_log_id
      AND workout_logs.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert own exercise logs" ON exercise_logs;
CREATE POLICY "Users can insert own exercise logs" ON exercise_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = exercise_logs.workout_log_id
      AND workout_logs.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update own exercise logs" ON exercise_logs;
CREATE POLICY "Users can update own exercise logs" ON exercise_logs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = exercise_logs.workout_log_id
      AND workout_logs.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete own exercise logs" ON exercise_logs;
CREATE POLICY "Users can delete own exercise logs" ON exercise_logs
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = exercise_logs.workout_log_id
      AND workout_logs.user_id = (select auth.uid())
    )
  );

-- ============================================
-- PART 5: Update set_logs policies
-- ============================================

DROP POLICY IF EXISTS "Users can view own set logs" ON set_logs;
CREATE POLICY "Users can view own set logs" ON set_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = set_logs.workout_log_id
      AND workout_logs.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert own set logs" ON set_logs;
CREATE POLICY "Users can insert own set logs" ON set_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = set_logs.workout_log_id
      AND workout_logs.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update own set logs" ON set_logs;
CREATE POLICY "Users can update own set logs" ON set_logs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = set_logs.workout_log_id
      AND workout_logs.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete own set logs" ON set_logs;
CREATE POLICY "Users can delete own set logs" ON set_logs
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = set_logs.workout_log_id
      AND workout_logs.user_id = (select auth.uid())
    )
  );

-- ============================================
-- PART 6: Update sessions policies
-- ============================================

DROP POLICY IF EXISTS "Users can view own sessions" ON sessions;
CREATE POLICY "Users can view own sessions" ON sessions
  FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own sessions" ON sessions;
CREATE POLICY "Users can insert own sessions" ON sessions
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own sessions" ON sessions;
CREATE POLICY "Users can update own sessions" ON sessions
  FOR UPDATE
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own sessions" ON sessions;
CREATE POLICY "Users can delete own sessions" ON sessions
  FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- PART 7: Update programs policies
-- ============================================

-- Note: programs table has TWO separate policies for SELECT, which is intentional:
-- 1. "System programs are viewable by everyone" - for is_system = true
-- 2. "Users can view own programs" - for user-created programs
-- Both are needed for the business logic, but we still optimize them

DROP POLICY IF EXISTS "Users can view own programs" ON programs;
CREATE POLICY "Users can view own programs" ON programs
  FOR SELECT
  USING ((select auth.uid()) = created_by);

DROP POLICY IF EXISTS "Users can create own programs" ON programs;
CREATE POLICY "Users can create own programs" ON programs
  FOR INSERT
  WITH CHECK ((select auth.uid()) = created_by AND is_system = false);

DROP POLICY IF EXISTS "Users can update own programs" ON programs;
CREATE POLICY "Users can update own programs" ON programs
  FOR UPDATE
  USING ((select auth.uid()) = created_by AND is_system = false);

DROP POLICY IF EXISTS "Users can delete own programs" ON programs;
CREATE POLICY "Users can delete own programs" ON programs
  FOR DELETE
  USING ((select auth.uid()) = created_by AND is_system = false);

-- ============================================
-- Summary:
-- ============================================
-- 1. Wrapped all auth.uid() calls in (select auth.uid()) for performance
-- 2. Removed duplicate policy "Exercises are viewable by everyone"
-- 3. Dropped duplicate constraint workout_log_exercise_set_unique
-- 4. Fixed 21 RLS policies across 5 tables
--
-- This resolves all performance warnings from Supabase database linter
-- without changing any application functionality