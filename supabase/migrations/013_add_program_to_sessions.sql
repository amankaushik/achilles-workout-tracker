-- Add program_id to sessions table
-- Sessions are now tied to a specific program

-- ============================================
-- PART 1: Add program_id column to sessions
-- ============================================

-- Add program_id column (nullable initially for migration)
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS program_id UUID REFERENCES programs(id) ON DELETE RESTRICT;

-- Create index for program_id
CREATE INDEX IF NOT EXISTS idx_sessions_program_id ON sessions(program_id);

-- ============================================
-- PART 2: Update unique constraint
-- ============================================

-- A user can have multiple sessions, but only one can be active at a time
-- The existing unique index idx_sessions_one_active_per_user already handles this
-- No changes needed to unique constraints

-- ============================================
-- Summary:
-- ============================================
-- 1. Added program_id column to sessions (nullable for now)
-- 2. Foreign key constraint with ON DELETE RESTRICT (can't delete program if sessions exist)
-- 3. Created index for performance
-- 4. Next migration will backfill existing sessions and make program_id NOT NULL
