-- Seed the default Achilles Program and backfill existing sessions
-- This migration creates the Achilles workout program from the existing WORKOUT_DATA

-- ============================================
-- PART 1: Insert Achilles Program
-- ============================================

INSERT INTO programs (name, description, structure, is_system, created_by)
VALUES (
  'Achilles Program',
  'The complete Achilles training program with 4 phases designed to build strength and muscle.',
  '{
    "1": {
      "name": "Phase I - Foundation",
      "workouts": {
        "1": {"name": "Workout 1", "focus": "Legs", "exercises": [{"name": "Seated Leg Curls or Stability Ball Leg Curls", "sets": 4, "reps": "8-15"}, {"name": "Leg Press", "sets": 4, "reps": "15-20"}, {"name": "Lunges (DB or Barbell)", "sets": 4, "reps": "8-12 steps/leg"}, {"name": "Leg Extensions", "sets": 2, "reps": "20-30"}, {"name": "Calf Raises (Seated)", "sets": 4, "reps": "10-15"}, {"name": "Calf Raises (Standing)", "sets": 4, "reps": "10-15"}]},
        "2": {"name": "Workout 2", "focus": "Chest + Shoulders", "exercises": [{"name": "Low Incline DB Press", "sets": 3, "reps": "10-15"}, {"name": "Rope Facepull", "sets": 3, "reps": "10-15"}, {"name": "Incline Bench Press", "sets": 3, "reps": "10-15"}, {"name": "Seated DB Lateral Raise", "sets": 3, "reps": "10-15"}, {"name": "Chest Supported DB Row (Elbows Flared)", "sets": 3, "reps": "10-15"}]},
        "3": {"name": "Workout 3", "focus": "Back + Arms", "exercises": [{"name": "Chin-ups/Pull-ups", "sets": 3, "reps": "AMAP"}, {"name": "Seated Moderate Grip Row", "sets": 3, "reps": "10-15"}, {"name": "T-Bar Row", "sets": 3, "reps": "10-15"}, {"name": "DB Hammer Curls", "sets": 3, "reps": "10-15"}, {"name": "Cable Tricep Pushdowns", "sets": 3, "reps": "10-15"}]},
        "4": {"name": "Workout 4", "focus": "Chest + Shoulders", "exercises": [{"name": "Dips (Bodyweight)", "sets": 3, "reps": "AMAP"}, {"name": "Flat DB Press", "sets": 3, "reps": "10-15"}, {"name": "Seated DB Shoulder Press", "sets": 3, "reps": "10-15"}, {"name": "Chest Flys", "sets": 3, "reps": "10-15"}, {"name": "Wide Grip Seated Row", "sets": 3, "reps": "10-15"}]},
        "5": {"name": "Workout 5", "focus": "Back + Arms", "exercises": [{"name": "Neutral Grip Pulldowns", "sets": 3, "reps": "10-15"}, {"name": "T-Bar Row", "sets": 3, "reps": "10-15"}, {"name": "Bent Over DB Row", "sets": 3, "reps": "10-15"}, {"name": "Overhead DB French Press", "sets": 3, "reps": "10-15"}, {"name": "Standing Barbell Curls", "sets": 3, "reps": "10-15"}]}
      }
    },
    "2": {
      "name": "Phase II - Building",
      "workouts": {
        "1": {"name": "Workout 1", "focus": "Chest + Shoulders + Arms", "exercises": [{"name": "Incline DB Press", "sets": 4, "reps": "8-12"}, {"name": "DB Shoulder Complex (Front/Side/Overhead)", "sets": 3, "reps": "20,15,10"}, {"name": "Flat Barbell Bench Press", "sets": 4, "reps": "8-12"}, {"name": "Seated Wide Grip Row", "sets": 4, "reps": "8-12"}, {"name": "Tricep Rope Pushdowns", "sets": 4, "reps": "8-12"}, {"name": "Alternating Supinated Cable Curls", "sets": 4, "reps": "8-12"}]},
        "2": {"name": "Workout 2", "focus": "Legs", "exercises": [{"name": "Lying Leg Curls or Stability Ball Leg Curls", "sets": 4, "reps": "10-15"}, {"name": "Single Leg Split Squat", "sets": 4, "reps": "10-15"}, {"name": "DB Goblet Squats", "sets": 4, "reps": "10-15"}, {"name": "Forward and Reverse Lunges", "sets": 4, "reps": "8-12"}, {"name": "Standing Calf Raises", "sets": 8, "reps": "8-12"}]},
        "3": {"name": "Workout 3", "focus": "Chest + Shoulders + Arms", "exercises": [{"name": "Pushups", "sets": 4, "reps": "AMAP"}, {"name": "Flat DB Chest Press", "sets": 4, "reps": "8-12"}, {"name": "Arnold Press", "sets": 4, "reps": "8-12"}, {"name": "DB Power Upright Row", "sets": 4, "reps": "8-12"}, {"name": "DB Hammer Curls", "sets": 4, "reps": "8-12"}, {"name": "Close Grip Bench Press", "sets": 4, "reps": "8-12"}]},
        "4": {"name": "Workout 4", "focus": "Back", "exercises": [{"name": "Wide Grip Pulldown", "sets": 4, "reps": "8-12"}, {"name": "T-Bar Row", "sets": 4, "reps": "8-12"}, {"name": "Machine Row", "sets": 4, "reps": "8-12"}, {"name": "Rope Facepull", "sets": 4, "reps": "8-12"}, {"name": "Chin-ups/Pull-ups", "sets": 4, "reps": "8-12"}]},
        "5": {"name": "Workout 5", "focus": "Chest + Shoulders + Arms", "exercises": [{"name": "Dips", "sets": 4, "reps": "AMAP"}, {"name": "Incline Bench Press", "sets": 4, "reps": "8-12"}, {"name": "Machine Rear Delt Fly", "sets": 4, "reps": "8-12"}, {"name": "Rack Scraper Press", "sets": 4, "reps": "8-12"}, {"name": "EZ Bar Bicep Curls", "sets": 4, "reps": "8-12"}, {"name": "DB French Press", "sets": 4, "reps": "8-12"}]}
      }
    },
    "3": {
      "name": "Phase III - Strength",
      "workouts": {
        "1": {"name": "Workout 1", "focus": "Chest", "exercises": [{"name": "Incline Bench Press", "sets": 5, "reps": "4-8"}, {"name": "DB Flat Bench Press", "sets": 4, "reps": "6-10"}, {"name": "Moderate Grip Pushups", "sets": 3, "reps": "AMAP"}]},
        "2": {"name": "Workout 2", "focus": "Back", "exercises": [{"name": "Rack Pulls", "sets": 5, "reps": "5-8"}, {"name": "Chest Supported DB or T-Bar Row", "sets": 5, "reps": "6-10"}, {"name": "Chin-ups/Pull-ups", "sets": 5, "reps": "AMAP"}]},
        "3": {"name": "Workout 3", "focus": "Legs", "exercises": [{"name": "Barbell Back Squats", "sets": 5, "reps": "6-10"}, {"name": "Barbell Romanian Deadlifts", "sets": 5, "reps": "6-10"}, {"name": "Bodyweight Lunges", "sets": 1, "reps": "100 total"}]},
        "4": {"name": "Workout 4", "focus": "Shoulders", "exercises": [{"name": "Standing Barbell Press", "sets": 5, "reps": "3-5"}, {"name": "Seated DB Shoulder Press", "sets": 4, "reps": "6-10"}, {"name": "Rope Facepull", "sets": 6, "reps": "10-12"}]},
        "5": {"name": "Workout 5", "focus": "Arms", "exercises": [{"name": "EZ-Bar Biceps Curls", "sets": 5, "reps": "6-10"}, {"name": "Close Grip Bench Press", "sets": 5, "reps": "6-10"}, {"name": "Supinated Alternating DB Curls", "sets": 5, "reps": "8-10"}, {"name": "Overhead DB French Press", "sets": 5, "reps": "8-10"}, {"name": "Pronated Cable Curls w/ EZ Curl Bar", "sets": 5, "reps": "10-12"}, {"name": "Cable Triceps Pressdown w/ Rope", "sets": 5, "reps": "10-12"}]}
      }
    },
    "4": {
      "name": "Phase IV - Man of Bronze",
      "workouts": {
        "1": {"name": "Workout 1", "focus": "Legs", "exercises": [{"name": "DB Goblet Squats", "sets": 10, "reps": "10"}, {"name": "Barbell Romanian Deadlifts", "sets": 5, "reps": "8-10"}, {"name": "Calf Raises (Seated)", "sets": 4, "reps": "10-15"}, {"name": "Calf Raises (Standing)", "sets": 4, "reps": "10-15"}]},
        "2": {"name": "Workout 2", "focus": "Chest + Shoulders", "exercises": [{"name": "Incline Bench Press", "sets": 7, "reps": "5"}, {"name": "Bodyweight Dips", "sets": 7, "reps": "6-15"}]},
        "3": {"name": "Workout 3", "focus": "Back", "exercises": [{"name": "Chin-ups/Pull-ups", "sets": 8, "reps": "8"}, {"name": "Cable Rope Facepulls", "sets": 7, "reps": "10"}, {"name": "Seated Close Grip Cable Row", "sets": 6, "reps": "6"}]},
        "4": {"name": "Workout 4", "focus": "Chest + Shoulders", "exercises": [{"name": "Flat DB Press", "sets": 8, "reps": "8"}, {"name": "Seated DB Shoulder Press", "sets": 8, "reps": "8"}, {"name": "Machine Rear Delt Flys", "sets": 7, "reps": "10"}]},
        "5": {"name": "Workout 5", "focus": "Arms", "exercises": [{"name": "Pronated Cable Curls", "sets": 5, "reps": "15"}, {"name": "EZ Bar Bicep Curls", "sets": 5, "reps": "6-8"}, {"name": "Tricep Pushdowns", "sets": 5, "reps": "10-15"}, {"name": "Overhead DB French Press", "sets": 5, "reps": "10-15"}]}
      }
    }
  }'::jsonb,
  true,
  NULL
);

-- ============================================
-- PART 2: Backfill existing sessions with Achilles Program
-- ============================================

-- Update all sessions that don't have a program_id
UPDATE sessions
SET program_id = (SELECT id FROM programs WHERE name = 'Achilles Program' AND is_system = true LIMIT 1)
WHERE program_id IS NULL;

-- ============================================
-- PART 3: Make program_id NOT NULL
-- ============================================

-- Verify no orphaned sessions exist
DO $$
DECLARE
  orphaned_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO orphaned_count
  FROM sessions
  WHERE program_id IS NULL;

  IF orphaned_count > 0 THEN
    RAISE EXCEPTION 'Cannot make program_id NOT NULL: % sessions still have NULL program_id', orphaned_count;
  END IF;
END $$;

-- Make program_id required
ALTER TABLE sessions
  ALTER COLUMN program_id SET NOT NULL;

-- ============================================
-- Summary:
-- ============================================
-- 1. Inserted Achilles Program as a system program
-- 2. Backfilled all existing sessions with Achilles Program ID
-- 3. Made program_id NOT NULL on sessions table
-- 4. All existing users can continue with Achilles Program
-- 5. Future users can choose from available programs when creating sessions
