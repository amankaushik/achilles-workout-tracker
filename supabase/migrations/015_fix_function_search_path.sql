-- Fix function search path security warnings
-- Add SET search_path to prevent search path hijacking attacks

-- ============================================
-- Fix update_updated_at_column function
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = 'public';

-- ============================================
-- Fix create_default_session_for_user function
-- ============================================

CREATE OR REPLACE FUNCTION create_default_session_for_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create if this is a new user with no sessions
  IF NOT EXISTS (
    SELECT 1 FROM sessions WHERE user_id = NEW.user_id
  ) THEN
    INSERT INTO sessions (user_id, name, description, is_active)
    VALUES (
      NEW.user_id,
      'Default Session',
      'Your first training session',
      true
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public';

-- ============================================
-- Fix prevent_session_deletion_with_workouts function
-- ============================================

CREATE OR REPLACE FUNCTION prevent_session_deletion_with_workouts()
RETURNS TRIGGER AS $$
DECLARE
  workout_count INTEGER;
BEGIN
  -- Count workouts in this session
  SELECT COUNT(*) INTO workout_count
  FROM workout_logs
  WHERE session_id = OLD.id;

  -- Allow deletion (CASCADE will handle cleanup)
  -- This is just for logging/auditing if needed
  IF workout_count > 0 THEN
    RAISE NOTICE 'Deleting session % with % workout logs (CASCADE)', OLD.id, workout_count;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql
SET search_path = 'public';

-- ============================================
-- Summary:
-- ============================================
-- 1. Added SET search_path = 'public' to update_updated_at_column
-- 2. Added SET search_path = 'public' to create_default_session_for_user
-- 3. Added SET search_path = 'public' to prevent_session_deletion_with_workouts
-- This fixes search path security warnings by using an immutable search_path
-- while still allowing functions to access public schema tables
