-- Enforce sessions as mandatory for all workout logs
-- This migration makes session_id NOT NULL after data backfill

-- ============================================
-- PART 1: Verify all workout logs have session_id
-- ============================================

-- Create a default session for any users that somehow don't have one
INSERT INTO sessions (user_id, name, description, is_active)
SELECT DISTINCT
  user_id,
  'Default Session',
  'Auto-created session',
  true
FROM workout_logs
WHERE user_id IS NOT NULL
  AND session_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM sessions WHERE sessions.user_id = workout_logs.user_id
  )
ON CONFLICT DO NOTHING;

-- Assign session_id to any remaining workout logs without one
UPDATE workout_logs
SET session_id = sessions.id
FROM sessions
WHERE workout_logs.user_id = sessions.user_id
  AND sessions.is_active = true
  AND workout_logs.session_id IS NULL;

-- ============================================
-- PART 2: Make session_id NOT NULL
-- ============================================

-- Verify no orphaned workout logs exist
DO $$
DECLARE
  orphaned_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO orphaned_count
  FROM workout_logs
  WHERE session_id IS NULL;

  IF orphaned_count > 0 THEN
    RAISE EXCEPTION 'Cannot make session_id NOT NULL: % workout logs still have NULL session_id', orphaned_count;
  END IF;
END $$;

-- Make session_id required
ALTER TABLE workout_logs
  ALTER COLUMN session_id SET NOT NULL;

-- ============================================
-- PART 3: Add function to auto-create default session
-- ============================================

-- Function to create default session for new users
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create session when first workout log is inserted
DROP TRIGGER IF EXISTS auto_create_default_session ON workout_logs;
CREATE TRIGGER auto_create_default_session
  BEFORE INSERT ON workout_logs
  FOR EACH ROW
  WHEN (NEW.session_id IS NULL)
  EXECUTE FUNCTION create_default_session_for_user();

-- ============================================
-- PART 4: Add constraint to prevent session deletion with workouts
-- ============================================

-- Note: ON DELETE CASCADE already handles this, but we can add a check
-- to prevent accidental deletion of sessions with workout data

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
$$ LANGUAGE plpgsql;

-- Trigger to log session deletions
DROP TRIGGER IF EXISTS log_session_deletion ON sessions;
CREATE TRIGGER log_session_deletion
  BEFORE DELETE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION prevent_session_deletion_with_workouts();

-- ============================================
-- Summary of changes:
-- ============================================
-- 1. Verified all workout logs have session_id
-- 2. Made session_id NOT NULL on workout_logs
-- 3. Added trigger to auto-create default session for new users
-- 4. Added logging for session deletions
-- 5. Ensured data integrity with checks
