# Achilles Workout Tracker - Data Model

## Overview
This document defines the data model for the Achilles Workout Tracker application with persistent backend storage.

## Database Schema

### 1. Users Table
Stores user account information (for future authentication).

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Workout Logs Table
Stores each workout session completed by a user.

```sql
CREATE TABLE workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Workout identification
  phase INTEGER NOT NULL CHECK (phase BETWEEN 1 AND 4),
  week INTEGER NOT NULL CHECK (week BETWEEN 1 AND 4),
  workout_num INTEGER NOT NULL CHECK (workout_num BETWEEN 1 AND 5),

  -- Workout details (denormalized for quick access)
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

CREATE INDEX idx_workout_logs_user ON workout_logs(user_id);
CREATE INDEX idx_workout_logs_completed ON workout_logs(completed);
```

### 3. Exercise Logs Table
Stores exercise data for each workout session.

```sql
CREATE TABLE exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_log_id UUID REFERENCES workout_logs(id) ON DELETE CASCADE,

  -- Exercise details
  exercise_name VARCHAR(255) NOT NULL,
  exercise_order INTEGER NOT NULL, -- Order in the workout (1, 2, 3...)
  target_sets INTEGER NOT NULL,
  target_reps VARCHAR(50) NOT NULL, -- e.g., "8-12", "AMAP", "100 total"

  -- Notes
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exercise_logs_workout ON exercise_logs(workout_log_id);
```

### 4. Set Logs Table
Stores individual set data (weight, reps) for each exercise.

```sql
CREATE TABLE set_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_log_id UUID REFERENCES exercise_logs(id) ON DELETE CASCADE,

  -- Set details
  set_number INTEGER NOT NULL,
  weight VARCHAR(50), -- Store as string to allow "BW", "45 lbs", etc.
  reps VARCHAR(50),   -- Store as string to allow "10", "AMAP", etc.

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_set_logs_exercise ON set_logs(exercise_log_id);
```

## TypeScript Interfaces

### API Request/Response Types

```typescript
// User (for future auth)
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Workout Log (matches database)
interface WorkoutLogDB {
  id: string;
  userId: string;
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

// Exercise Log (matches database)
interface ExerciseLogDB {
  id: string;
  workoutLogId: string;
  exerciseName: string;
  exerciseOrder: number;
  targetSets: number;
  targetReps: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Set Log (matches database)
interface SetLogDB {
  id: string;
  exerciseLogId: string;
  setNumber: number;
  weight: string;
  reps: string;
  createdAt: string;
  updatedAt: string;
}

// Full workout log with nested data (for API responses)
interface WorkoutLogFull extends WorkoutLogDB {
  exercises: (ExerciseLogDB & {
    sets: SetLogDB[];
  })[];
}
```

## API Endpoints

### Workout Logs
- `POST /api/workout-logs` - Create or update a workout log
- `GET /api/workout-logs` - Get all workout logs for current user
- `GET /api/workout-logs/:id` - Get specific workout log with exercises and sets
- `DELETE /api/workout-logs/:id` - Delete a workout log

### Request/Response Examples

#### Create/Update Workout Log
```typescript
// POST /api/workout-logs
{
  phase: 1,
  week: 1,
  workoutNum: 1,
  workoutName: "Workout 1",
  focus: "Legs",
  completed: false,
  exercises: [
    {
      exerciseName: "Leg Press",
      exerciseOrder: 1,
      targetSets: 4,
      targetReps: "15-20",
      notes: "Felt strong today",
      sets: [
        { setNumber: 1, weight: "200", reps: "15" },
        { setNumber: 2, weight: "210", reps: "14" }
      ]
    }
  ]
}
```

## Migration Path

### Phase 1: Backend Setup
1. Choose database (PostgreSQL recommended)
2. Set up Express.js API server
3. Create database tables
4. Implement CRUD endpoints

### Phase 2: Client Migration
1. Create API client service
2. Add syncing logic (localStorage + API)
3. Migrate existing data from localStorage to API

### Phase 3: Authentication
1. Add authentication (e.g., Clerk, Auth0, or custom)
2. Add user_id to all API calls
3. Add login/signup UI

## Technology Recommendations

### Backend
- **Framework**: Express.js or Fastify
- **Database**: PostgreSQL (via Neon, Supabase, or Railway)
- **ORM**: Prisma or Drizzle
- **Deployment**: Cloudflare Workers (with D1) or Railway

### Alternative: Serverless
- **Supabase**: Provides PostgreSQL + REST API + Auth out of the box
- **Firebase**: NoSQL option with real-time sync
- **PlanetScale**: MySQL with generous free tier

## Next Steps
1. Choose backend technology stack
2. Set up database
3. Implement API endpoints
4. Update frontend to use API
