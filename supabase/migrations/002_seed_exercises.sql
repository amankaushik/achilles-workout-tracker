-- Seed exercises table with all Achilles program exercises
-- Extracted from workoutData.ts

INSERT INTO exercises (name, muscle_groups, equipment) VALUES
  -- Leg Exercises
  ('Seated Leg Curls or Stability Ball Leg Curls', ARRAY['hamstrings', 'legs'], 'machine or stability ball'),
  ('Lying Leg Curls or Stability Ball Leg Curls', ARRAY['hamstrings', 'legs'], 'machine or stability ball'),
  ('Leg Press', ARRAY['quadriceps', 'glutes', 'legs'], 'machine'),
  ('Lunges (DB or Barbell)', ARRAY['quadriceps', 'glutes', 'legs'], 'dumbbell or barbell'),
  ('Forward and Reverse Lunges', ARRAY['quadriceps', 'glutes', 'legs'], 'bodyweight or weighted'),
  ('Bodyweight Lunges', ARRAY['quadriceps', 'glutes', 'legs'], 'bodyweight'),
  ('Leg Extensions', ARRAY['quadriceps', 'legs'], 'machine'),
  ('Single Leg Split Squat', ARRAY['quadriceps', 'glutes', 'legs'], 'dumbbell'),
  ('DB Goblet Squats', ARRAY['quadriceps', 'glutes', 'legs'], 'dumbbell'),
  ('Barbell Back Squats', ARRAY['quadriceps', 'glutes', 'legs'], 'barbell'),
  ('Barbell Romanian Deadlifts', ARRAY['hamstrings', 'glutes', 'back'], 'barbell'),
  ('Calf Raises (Seated)', ARRAY['calves', 'legs'], 'machine'),
  ('Calf Raises (Standing)', ARRAY['calves', 'legs'], 'machine'),
  ('Standing Calf Raises', ARRAY['calves', 'legs'], 'machine'),

  -- Chest Exercises
  ('Low Incline DB Press', ARRAY['chest', 'shoulders', 'triceps'], 'dumbbell'),
  ('Incline DB Press', ARRAY['chest', 'shoulders', 'triceps'], 'dumbbell'),
  ('Incline Bench Press', ARRAY['chest', 'shoulders', 'triceps'], 'barbell'),
  ('Flat DB Press', ARRAY['chest', 'shoulders', 'triceps'], 'dumbbell'),
  ('DB Flat Bench Press', ARRAY['chest', 'shoulders', 'triceps'], 'dumbbell'),
  ('Flat DB Chest Press', ARRAY['chest', 'shoulders', 'triceps'], 'dumbbell'),
  ('Flat Barbell Bench Press', ARRAY['chest', 'shoulders', 'triceps'], 'barbell'),
  ('Chest Flys', ARRAY['chest'], 'cable or dumbbell'),
  ('Pushups', ARRAY['chest', 'shoulders', 'triceps'], 'bodyweight'),
  ('Moderate Grip Pushups', ARRAY['chest', 'shoulders', 'triceps'], 'bodyweight'),
  ('Dips (Bodyweight)', ARRAY['chest', 'triceps', 'shoulders'], 'bodyweight'),
  ('Dips', ARRAY['chest', 'triceps', 'shoulders'], 'bodyweight or weighted'),
  ('Bodyweight Dips', ARRAY['chest', 'triceps', 'shoulders'], 'bodyweight'),

  -- Shoulder Exercises
  ('Rope Facepull', ARRAY['shoulders', 'upper back'], 'cable'),
  ('Cable Rope Facepulls', ARRAY['shoulders', 'upper back'], 'cable'),
  ('Seated DB Lateral Raise', ARRAY['shoulders'], 'dumbbell'),
  ('Seated DB Shoulder Press', ARRAY['shoulders', 'triceps'], 'dumbbell'),
  ('DB Shoulder Complex (Front/Side/Overhead)', ARRAY['shoulders'], 'dumbbell'),
  ('Arnold Press', ARRAY['shoulders', 'triceps'], 'dumbbell'),
  ('DB Power Upright Row', ARRAY['shoulders', 'traps'], 'dumbbell'),
  ('Standing Barbell Press', ARRAY['shoulders', 'triceps'], 'barbell'),
  ('Machine Rear Delt Fly', ARRAY['shoulders', 'upper back'], 'machine'),
  ('Machine Rear Delt Flys', ARRAY['shoulders', 'upper back'], 'machine'),
  ('Rack Scraper Press', ARRAY['shoulders', 'triceps'], 'barbell'),

  -- Back Exercises
  ('Chest Supported DB Row (Elbows Flared)', ARRAY['back', 'shoulders'], 'dumbbell'),
  ('Chin-ups/Pull-ups', ARRAY['back', 'biceps'], 'bodyweight'),
  ('Seated Moderate Grip Row', ARRAY['back', 'biceps'], 'cable'),
  ('T-Bar Row', ARRAY['back', 'biceps'], 'barbell'),
  ('Wide Grip Seated Row', ARRAY['back', 'biceps'], 'cable'),
  ('Neutral Grip Pulldowns', ARRAY['back', 'biceps'], 'cable'),
  ('Bent Over DB Row', ARRAY['back', 'biceps'], 'dumbbell'),
  ('Seated Wide Grip Row', ARRAY['back', 'biceps'], 'cable'),
  ('Wide Grip Pulldown', ARRAY['back', 'biceps'], 'cable'),
  ('Machine Row', ARRAY['back', 'biceps'], 'machine'),
  ('Chest Supported DB or T-Bar Row', ARRAY['back', 'biceps'], 'dumbbell or barbell'),
  ('Rack Pulls', ARRAY['back', 'traps', 'hamstrings'], 'barbell'),
  ('Seated Close Grip Cable Row', ARRAY['back', 'biceps'], 'cable'),

  -- Bicep Exercises
  ('DB Hammer Curls', ARRAY['biceps', 'forearms'], 'dumbbell'),
  ('Standing Barbell Curls', ARRAY['biceps'], 'barbell'),
  ('Alternating Supinated Cable Curls', ARRAY['biceps'], 'cable'),
  ('EZ Bar Bicep Curls', ARRAY['biceps'], 'barbell'),
  ('EZ-Bar Biceps Curls', ARRAY['biceps'], 'barbell'),
  ('Supinated Alternating DB Curls', ARRAY['biceps'], 'dumbbell'),
  ('Pronated Cable Curls w/ EZ Curl Bar', ARRAY['biceps', 'forearms'], 'cable'),
  ('Pronated Cable Curls', ARRAY['biceps', 'forearms'], 'cable'),

  -- Tricep Exercises
  ('Cable Tricep Pushdowns', ARRAY['triceps'], 'cable'),
  ('Tricep Rope Pushdowns', ARRAY['triceps'], 'cable'),
  ('Overhead DB French Press', ARRAY['triceps'], 'dumbbell'),
  ('DB French Press', ARRAY['triceps'], 'dumbbell'),
  ('Cable Triceps Pressdown w/ Rope', ARRAY['triceps'], 'cable'),
  ('Tricep Pushdowns', ARRAY['triceps'], 'cable'),
  ('Close Grip Bench Press', ARRAY['triceps', 'chest'], 'barbell')
ON CONFLICT (name) DO NOTHING;
