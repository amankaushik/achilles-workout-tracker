export interface Exercise {
  name: string;
  sets: number;
  reps: string;
}

export interface Workout {
  name: string;
  focus: string;
  exercises: Exercise[];
}

export interface Phase {
  name: string;
  workouts: Record<number, Workout>;
}

export type WorkoutDataType = Record<number, Phase>;

export interface SetData {
  weight: string;
  reps: string;
  completed?: boolean;
}

export interface ExerciseLog {
  name: string;
  targetSets: number;
  targetReps: string;
  sets: SetData[];
  notes: string;
}

export interface WorkoutLogEntry {
  sessionId: string;
  phase: number;
  week: number;
  workoutNum: number;
  workoutName: string;
  focus: string;
  exercises: ExerciseLog[];
  savedAt: string;
  completed: boolean;
  completedAt: string | null;
}

export type WorkoutLog = Record<string, WorkoutLogEntry>;
