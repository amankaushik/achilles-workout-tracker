-- Add sessions table and session_id to workout_logs
-- This migration adds session support while maintaining backwards compatibility

-- ============================================
-- PART 1: Create sessions table
-- ============================================

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for sessions
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_is_active ON sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_user_active ON sessions(user_id, is_active);

-- Ensure only one active session per user (enforced by unique partial index)
CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_one_active_per_user
  ON sessions(user_id)
  WHERE is_active = true;

-- ============================================
-- PART 2: Add session_id to workout_logs
-- ============================================

-- Add session_id column (nullable initially for migration)
ALTER TABLE workout_logs
  ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES sessions(id) ON DELETE CASCADE;

-- Create index for session_id
CREATE INDEX IF NOT EXISTS idx_workout_logs_session_id ON workout_logs(session_id);

-- ============================================
-- PART 3: Create default sessions for existing users
-- ============================================

-- Create a default session for each user that has workout logs but no session
INSERT INTO sessions (user_id, name, description, is_active)
SELECT DISTINCT
  user_id,
  'Default Session',
  'Auto-created session for existing workouts',
  true
FROM workout_logs
WHERE user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM sessions WHERE sessions.user_id = workout_logs.user_id
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- PART 4: Backfill workout_logs with session_id
-- ============================================

-- Assign all existing workout logs to their user's active session
UPDATE workout_logs
SET session_id = sessions.id
FROM sessions
WHERE workout_logs.user_id = sessions.user_id
  AND sessions.is_active = true
  AND workout_logs.session_id IS NULL;

-- ============================================
-- PART 5: Update unique constraint to include session_id
-- ============================================

-- Drop the old unique constraint
ALTER TABLE workout_logs
  DROP CONSTRAINT IF EXISTS workout_logs_user_id_phase_week_workout_num_key;

-- Add new unique constraint that includes session_id
-- This allows the same workout to exist in different sessions
ALTER TABLE workout_logs
  ADD CONSTRAINT workout_logs_session_workout_unique
  UNIQUE (session_id, phase, week, workout_num);

-- ============================================
-- PART 6: Enable RLS for sessions table
-- ============================================

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions" ON sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own sessions
CREATE POLICY "Users can insert own sessions" ON sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions" ON sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own sessions
CREATE POLICY "Users can delete own sessions" ON sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- PART 7: Add trigger for updated_at timestamp
-- ============================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for sessions table
DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Summary of changes:
-- ============================================
-- 1. Created sessions table with RLS policies
-- 2. Added session_id column to workout_logs (nullable for now)
-- 3. Created default sessions for all existing users
-- 4. Backfilled workout_logs.session_id for existing data
-- 5. Updated unique constraint to include session_id
-- 6. Added indexes for performance
-- 7. Enforced one active session per user via unique index
