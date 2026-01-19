// Database types matching the schema

export interface Exercise {
  id: string;
  name: string;
  description: string | null;
  muscleGroups: string[] | null;
  equipment: string | null;
  createdAt: string;
}

// Note: No custom User interface needed!
// Supabase Auth manages auth.users table with built-in User type
// Access via: import { User } from '@supabase/supabase-js'

export interface Session {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutLogDB {
  id: string;
  userId: string;
  sessionId: string;
  phase: number;
  week: number;
  workoutNum: number;
  workoutName: string;
  focus: string;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseLogDB {
  id: string;
  workoutLogId: string;
  exerciseId: string | null;
  exerciseName: string;
  exerciseOrder: number;
  targetSets: number;
  targetReps: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SetLogDB {
  id: string;
  exerciseLogId: string;
  workoutLogId: string;
  setNumber: number;
  weight: string | null;
  reps: string | null;
  createdAt: string;
  updatedAt: string;
}

// Nested types for API responses
export interface ExerciseLogWithSets extends ExerciseLogDB {
  sets: SetLogDB[];
}

export interface WorkoutLogFull extends WorkoutLogDB {
  exercises: ExerciseLogWithSets[];
}

// API Request types
export interface CreateWorkoutLogRequest {
  phase: number;
  week: number;
  workoutNum: number;
  workoutName: string;
  focus: string;
  completed: boolean;
  completedAt?: string | null;
  exercises: {
    exerciseName: string;
    exerciseOrder: number;
    targetSets: number;
    targetReps: string;
    notes?: string;
    sets: {
      setNumber: number;
      weight?: string;
      reps?: string;
    }[];
  }[];
}

export interface UpdateWorkoutLogRequest extends Partial<CreateWorkoutLogRequest> {
  id: string;
}

// API Response types
export interface WorkoutLogListResponse {
  workoutLogs: WorkoutLogDB[];
  total: number;
}

export interface WorkoutLogDetailResponse {
  workoutLog: WorkoutLogFull;
}
