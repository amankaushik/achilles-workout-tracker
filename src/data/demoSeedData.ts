import { WorkoutLog } from '../types';

/**
 * Pre-seeded workout data for demo mode so History and Stats views
 * have content on first load.
 */
export const DEMO_SEED_WORKOUTS: WorkoutLog = {
  '1-1-1': {
    sessionId: 'demo-session',
    phase: 1,
    week: 1,
    workoutNum: 1,
    workoutName: 'Workout 1',
    focus: 'Legs',
    exercises: [
      {
        name: 'Seated Leg Curls or Stability Ball Leg Curls',
        targetSets: 4,
        targetReps: '8-15',
        sets: [
          { weight: '90', reps: '12', completed: true },
          { weight: '90', reps: '12', completed: true },
          { weight: '90', reps: '10', completed: true },
          { weight: '90', reps: '10', completed: true },
        ],
        notes: '',
      },
      {
        name: 'Leg Press',
        targetSets: 4,
        targetReps: '15-20',
        sets: [
          { weight: '200', reps: '18', completed: true },
          { weight: '200', reps: '17', completed: true },
          { weight: '200', reps: '15', completed: true },
          { weight: '200', reps: '15', completed: true },
        ],
        notes: '',
      },
      {
        name: 'Lunges (DB or Barbell)',
        targetSets: 4,
        targetReps: '8-12 steps/leg',
        sets: [
          { weight: '40', reps: '10', completed: true },
          { weight: '40', reps: '10', completed: true },
          { weight: '40', reps: '8', completed: true },
          { weight: '40', reps: '8', completed: true },
        ],
        notes: 'DB lunges',
      },
      {
        name: 'Leg Extensions',
        targetSets: 2,
        targetReps: '20-30',
        sets: [
          { weight: '60', reps: '25', completed: true },
          { weight: '60', reps: '22', completed: true },
        ],
        notes: '',
      },
      {
        name: 'Calf Raises (Seated)',
        targetSets: 4,
        targetReps: '10-15',
        sets: [
          { weight: '70', reps: '15', completed: true },
          { weight: '70', reps: '14', completed: true },
          { weight: '70', reps: '12', completed: true },
          { weight: '70', reps: '12', completed: true },
        ],
        notes: '',
      },
      {
        name: 'Calf Raises (Standing)',
        targetSets: 4,
        targetReps: '10-15',
        sets: [
          { weight: '100', reps: '15', completed: true },
          { weight: '100', reps: '13', completed: true },
          { weight: '100', reps: '12', completed: true },
          { weight: '100', reps: '10', completed: true },
        ],
        notes: '',
      },
    ],
    savedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    completed: true,
    completedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  '1-1-2': {
    sessionId: 'demo-session',
    phase: 1,
    week: 1,
    workoutNum: 2,
    workoutName: 'Workout 2',
    focus: 'Chest + Shoulders',
    exercises: [
      {
        name: 'Low Incline DB Press',
        targetSets: 3,
        targetReps: '10-15',
        sets: [
          { weight: '55', reps: '12', completed: true },
          { weight: '55', reps: '11', completed: true },
          { weight: '55', reps: '10', completed: true },
        ],
        notes: '',
      },
      {
        name: 'Rope Facepull',
        targetSets: 3,
        targetReps: '10-15',
        sets: [
          { weight: '30', reps: '15', completed: true },
          { weight: '30', reps: '14', completed: true },
          { weight: '30', reps: '12', completed: true },
        ],
        notes: '',
      },
      {
        name: 'Incline Bench Press',
        targetSets: 3,
        targetReps: '10-15',
        sets: [
          { weight: '135', reps: '12', completed: true },
          { weight: '135', reps: '10', completed: true },
          { weight: '135', reps: '10', completed: true },
        ],
        notes: '',
      },
      {
        name: 'Seated DB Lateral Raise',
        targetSets: 3,
        targetReps: '10-15',
        sets: [
          { weight: '20', reps: '14', completed: true },
          { weight: '20', reps: '12', completed: true },
          { weight: '20', reps: '11', completed: true },
        ],
        notes: '',
      },
      {
        name: 'Chest Supported DB Row (Elbows Flared)',
        targetSets: 3,
        targetReps: '10-15',
        sets: [
          { weight: '45', reps: '12', completed: true },
          { weight: '45', reps: '12', completed: true },
          { weight: '45', reps: '10', completed: true },
        ],
        notes: '',
      },
    ],
    savedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    completed: true,
    completedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  '1-1-3': {
    sessionId: 'demo-session',
    phase: 1,
    week: 1,
    workoutNum: 3,
    workoutName: 'Workout 3',
    focus: 'Back + Arms',
    exercises: [
      {
        name: 'Neutral Grip Lat Pulldown',
        targetSets: 3,
        targetReps: '10-15',
        sets: [
          { weight: '120', reps: '12', completed: true },
          { weight: '120', reps: '11', completed: true },
          { weight: '120', reps: '10', completed: true },
        ],
        notes: '',
      },
      {
        name: 'Hammer Curls',
        targetSets: 3,
        targetReps: '10-15',
        sets: [
          { weight: '30', reps: '12', completed: true },
          { weight: '30', reps: '12', completed: true },
          { weight: '30', reps: '10', completed: true },
        ],
        notes: '',
      },
      {
        name: 'Seated Cable Row',
        targetSets: 3,
        targetReps: '10-15',
        sets: [
          { weight: '110', reps: '13', completed: true },
          { weight: '110', reps: '12', completed: true },
          { weight: '110', reps: '11', completed: true },
        ],
        notes: '',
      },
      {
        name: 'Rope Overhead Tricep Extension',
        targetSets: 3,
        targetReps: '10-15',
        sets: [
          { weight: '35', reps: '14', completed: true },
          { weight: '35', reps: '12', completed: true },
          { weight: '35', reps: '11', completed: true },
        ],
        notes: '',
      },
      {
        name: 'Straight Bar Curls (EZ Bar or Straight)',
        targetSets: 2,
        targetReps: '10-15',
        sets: [
          { weight: '50', reps: '12', completed: true },
          { weight: '50', reps: '10', completed: true },
        ],
        notes: 'EZ bar',
      },
    ],
    savedAt: new Date(Date.now() - 86400000).toISOString(),
    completed: true,
    completedAt: new Date(Date.now() - 86400000).toISOString(),
  },
};
