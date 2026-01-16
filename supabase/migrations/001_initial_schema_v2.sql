-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  muscle_groups TEXT[],
  equipment VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for exercises
CREATE INDEX IF NOT EXISTS idx_exercises_name ON exercises(name);

-- Note: No custom users table needed!
-- Supabase Auth manages auth.users with: id, email, created_at, updated_at, user_metadata

-- Create workout_logs table
-- user_id references auth.users(id) from Supabase Auth
CREATE TABLE IF NOT EXISTS workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Workout identification
  phase INTEGER NOT NULL CHECK (phase BETWEEN 1 AND 4),
  week INTEGER NOT NULL CHECK (week BETWEEN 1 AND 4),
  workout_num INTEGER NOT NULL CHECK (workout_num BETWEEN 1 AND 5),
  workout_name VARCHAR(100) NOT NULL,
  focus VARCHAR(100) NOT NULL,

  -- Status
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Unique constraint: user can only have one log per workout
  UNIQUE(user_id, phase, week, workout_num)
);

-- Create indexes for workout_logs
CREATE INDEX IF NOT EXISTS idx_workout_logs_user ON workout_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_completed ON workout_logs(completed);
CREATE INDEX IF NOT EXISTS idx_workout_logs_phase_week ON workout_logs(phase, week);

-- Create exercise_logs table
CREATE TABLE IF NOT EXISTS exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_log_id UUID REFERENCES workout_logs(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE RESTRICT,

  -- Exercise details for this specific workout
  exercise_name VARCHAR(255) NOT NULL, -- Denormalized for convenience
  exercise_order INTEGER NOT NULL,
  target_sets INTEGER NOT NULL,
  target_reps VARCHAR(50) NOT NULL,
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for exercise_logs
CREATE INDEX IF NOT EXISTS idx_exercise_logs_workout ON exercise_logs(workout_log_id);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_exercise ON exercise_logs(exercise_id);

-- Create set_logs table
CREATE TABLE IF NOT EXISTS set_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_log_id UUID REFERENCES exercise_logs(id) ON DELETE CASCADE,

  -- Set details
  set_number INTEGER NOT NULL,
  weight VARCHAR(50),
  reps VARCHAR(50),

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for set_logs
CREATE INDEX IF NOT EXISTS idx_set_logs_exercise ON set_logs(exercise_log_id);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE set_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exercises (public read access)
CREATE POLICY "Exercises are viewable by everyone"
  ON exercises FOR SELECT
  USING (true);

-- RLS Policies for workout_logs (users can only access their own logs)
CREATE POLICY "Users can view own workout logs"
  ON workout_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout logs"
  ON workout_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout logs"
  ON workout_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout logs"
  ON workout_logs FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for exercise_logs (cascade from workout_logs)
CREATE POLICY "Users can view own exercise logs"
  ON exercise_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = exercise_logs.workout_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own exercise logs"
  ON exercise_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = exercise_logs.workout_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own exercise logs"
  ON exercise_logs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = exercise_logs.workout_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own exercise logs"
  ON exercise_logs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = exercise_logs.workout_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

-- RLS Policies for set_logs (cascade from exercise_logs)
CREATE POLICY "Users can view own set logs"
  ON set_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM exercise_logs
      JOIN workout_logs ON workout_logs.id = exercise_logs.workout_log_id
      WHERE exercise_logs.id = set_logs.exercise_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own set logs"
  ON set_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exercise_logs
      JOIN workout_logs ON workout_logs.id = exercise_logs.workout_log_id
      WHERE exercise_logs.id = set_logs.exercise_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own set logs"
  ON set_logs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM exercise_logs
      JOIN workout_logs ON workout_logs.id = exercise_logs.workout_log_id
      WHERE exercise_logs.id = set_logs.exercise_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own set logs"
  ON set_logs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM exercise_logs
      JOIN workout_logs ON workout_logs.id = exercise_logs.workout_log_id
      WHERE exercise_logs.id = set_logs.exercise_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );
