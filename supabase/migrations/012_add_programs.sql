-- Add programs table to support multiple training programs
-- Programs define the structure of phases, weeks, and workouts

-- ============================================
-- PART 1: Create programs table
-- ============================================

CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  structure JSONB NOT NULL, -- Stores the complete workout program structure
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_system BOOLEAN DEFAULT FALSE, -- True for built-in programs
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for programs
CREATE INDEX IF NOT EXISTS idx_programs_created_by ON programs(created_by);
CREATE INDEX IF NOT EXISTS idx_programs_is_system ON programs(is_system);

-- ============================================
-- PART 2: Enable RLS for programs table
-- ============================================

ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

-- System programs are viewable by everyone
CREATE POLICY "System programs are viewable by everyone" ON programs
  FOR SELECT
  USING (is_system = true);

-- Users can view programs they created
CREATE POLICY "Users can view own programs" ON programs
  FOR SELECT
  USING (auth.uid() = created_by);

-- Users can create their own programs
CREATE POLICY "Users can create own programs" ON programs
  FOR INSERT
  WITH CHECK (auth.uid() = created_by AND is_system = false);

-- Users can update their own programs
CREATE POLICY "Users can update own programs" ON programs
  FOR UPDATE
  USING (auth.uid() = created_by AND is_system = false);

-- Users can delete their own programs
CREATE POLICY "Users can delete own programs" ON programs
  FOR DELETE
  USING (auth.uid() = created_by AND is_system = false);

-- ============================================
-- PART 3: Add trigger for updated_at timestamp
-- ============================================

DROP TRIGGER IF EXISTS update_programs_updated_at ON programs;
CREATE TRIGGER update_programs_updated_at
  BEFORE UPDATE ON programs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Summary:
-- ============================================
-- 1. Created programs table with JSONB structure field
-- 2. Added RLS policies for system and user programs
-- 3. System programs (is_system = true) are visible to all users
-- 4. Users can create and manage their own custom programs
-- 5. Added trigger for automatic updated_at updates
