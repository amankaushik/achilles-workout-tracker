import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useSession } from './contexts/SessionContext';
import { useWorkoutStorage } from './hooks/useWorkoutStorage';
import { ExerciseLog } from './types';

import Auth from './components/Auth';
import Header from './components/Header';
import SideNav from './components/SideNav';
import Toast from './components/Toast';
import Footer from './components/Footer';
import CreateSessionModal from './components/CreateSessionModal';
import ProgramDetailView from './components/ProgramDetailView';
import PhaseSelection from './components/PhaseSelection';
import WeekSelection from './components/WeekSelection';
import WorkoutSelection from './components/WorkoutSelection';
import WorkoutPreview from './components/WorkoutPreview';
import WorkoutTracking from './components/WorkoutTracking';
import HistoryView from './components/HistoryView';
import HistoryDetail from './components/HistoryDetail';
import AbsView from './components/AbsView';
import ProgramSelection from './components/ProgramSelection';

const StatsView = lazy(() => import('./components/StatsView'));

const VIEWS = {
  PROGRAMS: 'programs',
  PROGRAM_DETAIL: 'programDetail',
  PHASE: 'phase',
  WEEK: 'week',
  WORKOUT: 'workout',
  WORKOUT_PREVIEW: 'workoutPreview',
  TRACKING: 'tracking',
  HISTORY: 'history',
  HISTORY_DETAIL: 'historyDetail',
  STATS: 'stats',
  ABS: 'abs'
} as const;

type ViewType = typeof VIEWS[keyof typeof VIEWS];

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const { currentSession, currentProgram, programs, sessions, isLoading: sessionLoading, createSession } = useSession();
  const [view, setView] = useState<ViewType | null>(null);
  const [viewingProgram, setViewingProgram] = useState<string | null>(null);
  const [currentPhase, setCurrentPhase] = useState<number | null>(null);
  const [currentWeek, setCurrentWeek] = useState<number | null>(null);
  const [currentWorkout, setCurrentWorkout] = useState<number | null>(null);
  const [selectedHistoryKey, setSelectedHistoryKey] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isRefreshingHistory, setIsRefreshingHistory] = useState(false);
  const [isCreateSessionModalOpen, setIsCreateSessionModalOpen] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  const {
    workoutLog,
    saveWorkout,
    deleteWorkout,
    getWorkout,
    hasWeekData,
    isLoading,
    syncError,
    refreshFromApi
  } = useWorkoutStorage(currentSession?.id || null);

  const showToast = useCallback((message: string) => {
    setToast(message);
  }, []);

  // Initialize view based on session state
  useEffect(() => {
    // Wait for session loading to complete and auth to finish
    if (sessionLoading || authLoading) return;

    // Only initialize once
    if (hasInitialized) return;

    if (currentSession && currentProgram) {
      // Existing user with active session -> go to phase selection (active program dashboard)
      setViewingProgram(currentSession.programId);
      setView(VIEWS.PHASE);
      setHasInitialized(true);
    } else if (!currentSession) {
      // No active session -> go to programs list
      setView(VIEWS.PROGRAMS);
      setHasInitialized(true);
    }
  }, [sessionLoading, authLoading, currentSession, currentProgram, hasInitialized]);

  // When session switches, navigate to that session's dashboard
  useEffect(() => {
    if (hasInitialized && currentSession && currentProgram) {
      // Also update view if we are just switching sessions even if program is same, 
      // ensuring we land on the dashboard
      setViewingProgram(currentSession.programId);
      setView(VIEWS.PHASE);
      setCurrentPhase(null);
      setCurrentWeek(null);
      setCurrentWorkout(null);
      setSelectedHistoryKey(null);
    }
  }, [currentSession?.id, currentProgram, hasInitialized]);

  // Check if there's an in-progress workout
  const hasInProgressWorkout = useCallback(() => {
    if (!currentPhase || !currentWeek || !currentWorkout) return false;
    const key = `${currentPhase}-${currentWeek}-${currentWorkout}`;
    const workout = getWorkout(key);
    return workout !== undefined && !workout.completed;
  }, [currentPhase, currentWeek, currentWorkout, getWorkout]);

  const handleCreateSession = async (programId: string, name: string, description: string, makeActive: boolean) => {
    try {
      const newSession = await createSession(programId, name, description, makeActive);
      if (makeActive) {
        showToast(`Switched to ${newSession.name}`);
      } else {
        showToast('Session created successfully');
      }
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  };

  const handleSessionSwitchBlocked = () => {
    showToast('Complete or exit your current workout first');
  };

  const handleSaveWorkout = useCallback((exercises: ExerciseLog[], markComplete: boolean) => {
    if (currentPhase === null || currentWeek === null || currentWorkout === null || !currentSession || !currentProgram) return;

    const key = `${currentPhase}-${currentWeek}-${currentWorkout}`;
    const existingEntry = getWorkout(key);
    const workout = currentProgram[currentPhase].workouts[currentWorkout];
    const now = new Date().toISOString();

    saveWorkout(key, {
      sessionId: currentSession.id,
      phase: currentPhase,
      week: currentWeek,
      workoutNum: currentWorkout,
      workoutName: workout.name,
      focus: workout.focus,
      exercises,
      savedAt: now,
      completed: markComplete || (existingEntry?.completed || false),
      completedAt: markComplete ? now : (existingEntry?.completedAt || null)
    });

    // Only show toast and redirect when marking complete
    if (markComplete) {
      showToast('Workout completed!');
      setTimeout(() => {
        setView(VIEWS.WORKOUT);
      }, 500);
    }
  }, [currentPhase, currentWeek, currentWorkout, currentSession, currentProgram, getWorkout, saveWorkout, showToast, setView]);

  // Show auth screen if not logged in (AFTER all hooks are called)
  if (authLoading || sessionLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  // Wait for initial view to be determined
  if (!hasInitialized || view === null) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  // If user has an active session but program hasn't loaded yet, wait
  if (currentSession && !currentProgram) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading program...</p>
      </div>
    );
  }

  const handleSelectPhase = (phase: number) => {
    setCurrentPhase(phase);
    setView(VIEWS.WEEK);
  };

  const handleSelectWeek = (week: number) => {
    setCurrentWeek(week);
    setView(VIEWS.WORKOUT);
  };

  const handleSelectWorkout = (workout: number) => {
    setCurrentWorkout(workout);

    // Check if workout has already been started
    if (currentPhase !== null && currentWeek !== null) {
      const key = `${currentPhase}-${currentWeek}-${workout}`;
      const existingData = getWorkout(key);

      // If workout has data (in progress), skip preview and go straight to tracking
      if (existingData) {
        setView(VIEWS.TRACKING);
        return;
      }
    }

    // Otherwise, show preview for new workout
    setView(VIEWS.WORKOUT_PREVIEW);
  };

  const handleStartWorkout = () => {
    setView(VIEWS.TRACKING);
  };

  const handleBackToPrograms = () => {
    setView(VIEWS.PROGRAMS);
    setViewingProgram(null);
  };

  const handleSelectProgram = (programId: string) => {
    setViewingProgram(programId);
    setView(VIEWS.PROGRAM_DETAIL);
  };

  const handleStartWorkoutsFromProgram = () => {
    // Navigate to phase selection (assuming active session is for this program)
    setView(VIEWS.PHASE);
  };

  const handleCreateSessionFromProgram = () => {
    if (viewingProgram) {
      setSelectedProgramId(viewingProgram);
    }
    setIsCreateSessionModalOpen(true);
  };

  const handleSelectHistoryEntry = (key: string) => {
    setSelectedHistoryKey(key);
    setView(VIEWS.HISTORY_DETAIL);
  };

  const handleDeleteHistoryEntry = () => {
    if (selectedHistoryKey && window.confirm('Are you sure you want to delete this workout entry?')) {
      deleteWorkout(selectedHistoryKey);
      showToast('Entry deleted');
      setView(VIEWS.HISTORY);
    }
  };

  const handleBack = (toView: ViewType) => {
    setView(toView);
  };

  const handleHistoryClick = () => {
    setIsRefreshingHistory(true);
    refreshFromApi().finally(() => setIsRefreshingHistory(false));
    setView(VIEWS.HISTORY);
    setSelectedHistoryKey(null);
  };

  const handleStatsClick = () => {
    setView(VIEWS.STATS);
  };

  const handleAbsClick = () => {
    setView(VIEWS.ABS);
  };

  const renderView = () => {
    if (!view) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Loading...</p>
        </div>
      );
    }

    switch (view) {
      case VIEWS.PROGRAMS:
        return (
          <ProgramSelection
            onProgramSelected={() => setView(VIEWS.PHASE)}
            onViewProgram={handleSelectProgram}
          />
        );

      case VIEWS.PROGRAM_DETAIL:
        if (!viewingProgram) return null;
        const program = programs.find(p => p.id === viewingProgram);
        if (!program) return null;
        return (
          <ProgramDetailView
            program={program}
            sessions={sessions}
            workoutLog={workoutLog}
            onBack={handleBackToPrograms}
            onStartWorkouts={handleStartWorkoutsFromProgram}
            onCreateSession={handleCreateSessionFromProgram}
            onSelectHistoryEntry={handleSelectHistoryEntry}
            selectedHistoryKey={selectedHistoryKey}
            onDeleteHistoryEntry={handleDeleteHistoryEntry}
            onBackFromHistoryDetail={() => setSelectedHistoryKey(null)}
            isRefreshingHistory={isRefreshingHistory}
          />
        );

      case VIEWS.PHASE:
        const activeProgram = currentSession ? programs.find(p => p.id === currentSession.programId) : null;
        return (
          <PhaseSelection
            onSelectPhase={handleSelectPhase}
            programName={activeProgram?.name}
            sessionName={currentSession?.name}
          />
        );

      case VIEWS.WEEK:
        if (currentPhase === null) return null;
        return (
          <WeekSelection
            phase={currentPhase}
            hasWeekData={hasWeekData}
            onSelectWeek={handleSelectWeek}
            onBack={() => handleBack(VIEWS.PHASE)}
          />
        );

      case VIEWS.WORKOUT:
        if (currentPhase === null || currentWeek === null) return null;
        return (
          <WorkoutSelection
            phase={currentPhase}
            week={currentWeek}
            workoutLog={workoutLog}
            onSelectWorkout={handleSelectWorkout}
            onBack={() => handleBack(VIEWS.WEEK)}
          />
        );

      case VIEWS.WORKOUT_PREVIEW:
        if (currentPhase === null || currentWeek === null || currentWorkout === null) return null;
        return (
          <WorkoutPreview
            phase={currentPhase}
            week={currentWeek}
            workoutNum={currentWorkout}
            onStartWorkout={handleStartWorkout}
            onBack={() => handleBack(VIEWS.WORKOUT)}
          />
        );

      case VIEWS.TRACKING:
        if (currentPhase === null || currentWeek === null || currentWorkout === null) return null;
        const key = `${currentPhase}-${currentWeek}-${currentWorkout}`;
        return (
          <WorkoutTracking
            phase={currentPhase}
            week={currentWeek}
            workoutNum={currentWorkout}
            existingData={getWorkout(key)}
            onSave={handleSaveWorkout}
            onBack={() => handleBack(VIEWS.WORKOUT)}
          />
        );

      case VIEWS.HISTORY:
        return (
          <HistoryView
            workoutLog={workoutLog}
            onSelectEntry={handleSelectHistoryEntry}
            onBack={() => handleBack(VIEWS.PHASE)}
            isRefreshing={isRefreshingHistory}
          />
        );

      case VIEWS.HISTORY_DETAIL:
        if (!selectedHistoryKey || !workoutLog[selectedHistoryKey]) return null;
        return (
          <HistoryDetail
            data={workoutLog[selectedHistoryKey]}
            onBack={() => handleBack(VIEWS.HISTORY)}
            onDelete={handleDeleteHistoryEntry}
          />
        );

      case VIEWS.STATS:
        return (
          <Suspense fallback={<div>Loading stats...</div>}>
            <StatsView
              workoutLog={workoutLog}
              onBack={() => handleBack(VIEWS.PHASE)}
            />
          </Suspense>
        );

      case VIEWS.ABS:
        return <AbsView onBack={() => handleBack(VIEWS.PHASE)} />;


      default:
        return (
          <ProgramSelection
            onProgramSelected={() => setView(VIEWS.PHASE)}
            onViewProgram={handleSelectProgram}
          />
        );
    }
  };

  if (isLoading) {
    return (
      <>
        <Header
          onCreateSession={() => setIsCreateSessionModalOpen(true)}
          onSessionSwitchBlocked={handleSessionSwitchBlocked}
          hasInProgressWorkout={hasInProgressWorkout()}
          onMenuClick={toggleSidebar}
        />
        <div className="app-layout">
          <SideNav
            onBackToPrograms={handleBackToPrograms}
            onHistoryClick={handleHistoryClick}
            onStatsClick={handleStatsClick}
            onAbsClick={handleAbsClick}
            isOpen={isSidebarOpen}
            showSessionNav={false} // Always false during initial loading/sync
          />
          <main className="main-content">
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <p>Loading workout data...</p>
            </div>
          </main>
        </div>
        <Footer />
      </>
    );
  }

  // Calculate whether to show session items in SideNav
  const showSessionNav = !!currentSession &&
    view !== VIEWS.PROGRAMS &&
    view !== VIEWS.PROGRAM_DETAIL;

  return (
    <>
      <Header
        onCreateSession={() => setIsCreateSessionModalOpen(true)}
        onSessionSwitchBlocked={handleSessionSwitchBlocked}
        hasInProgressWorkout={hasInProgressWorkout()}
        onMenuClick={toggleSidebar}
      />
      <div className="app-layout">
        <SideNav
          onBackToPrograms={handleBackToPrograms}
          onHistoryClick={handleHistoryClick}
          onStatsClick={handleStatsClick}
          onAbsClick={handleAbsClick}
          isOpen={isSidebarOpen}
          showSessionNav={showSessionNav}
        />
        <main className="main-content">
          {syncError && (
            <div style={{ padding: '0.5rem', backgroundColor: '#ff6b6b', color: 'white', textAlign: 'center' }}>
              {syncError}
            </div>
          )}
          {renderView()}
        </main>
      </div>
      <CreateSessionModal
        isOpen={isCreateSessionModalOpen}
        onClose={() => {
          setIsCreateSessionModalOpen(false);
          setSelectedProgramId(null);
        }}
        onSubmit={handleCreateSession}
        programs={programs}
        preselectedProgramId={selectedProgramId}
      />
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      <Footer />
    </>
  );
}
