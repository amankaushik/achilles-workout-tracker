import { useState, lazy, Suspense } from 'react';
import { Program } from '../types/database';
import { Session } from '../types/database';
import { WorkoutLogEntry } from '../types';
import ProgramPreview from './ProgramPreview';
import HistoryView from './HistoryView';
import HistoryDetail from './HistoryDetail';
import AbsView from './AbsView';

const StatsView = lazy(() => import('./StatsView'));

interface ProgramDetailViewProps {
  program: Program;
  sessions: Session[];
  workoutLog: Record<string, WorkoutLogEntry>;
  onBack: () => void;
  onStartWorkouts: () => void;
  onCreateSession: () => void;
  onSelectHistoryEntry: (key: string) => void;
  selectedHistoryKey: string | null;
  onDeleteHistoryEntry: () => void;
  onBackFromHistoryDetail: () => void;
  isRefreshingHistory: boolean;
}

type TabType = 'preview' | 'workouts' | 'history' | 'history-detail' | 'stats' | 'abs';

export default function ProgramDetailView({
  program,
  sessions,
  workoutLog,
  onBack,
  onStartWorkouts,
  onCreateSession,
  onSelectHistoryEntry,
  selectedHistoryKey,
  onDeleteHistoryEntry,
  onBackFromHistoryDetail,
  isRefreshingHistory
}: ProgramDetailViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('preview');

  // Filter workout log to only show entries from sessions tied to this program
  const programSessionIds = sessions
    .filter(s => s.programId === program.id)
    .map(s => s.id);

  const filteredWorkoutLog = Object.entries(workoutLog)
    .filter(([_, entry]) => programSessionIds.includes(entry.sessionId))
    .reduce((acc, [key, entry]) => {
      acc[key] = entry;
      return acc;
    }, {} as Record<string, WorkoutLogEntry>);

  const programSessions = sessions.filter(s => s.programId === program.id);
  const hasActiveSession = programSessions.some(s => s.isActive);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'preview':
        return (
          <ProgramPreview
            programName={program.name}
            programDescription={program.description}
            structure={program.structure as any}
          />
        );

      case 'workouts':
        return (
          <div className="workouts-tab">
            <div className="workouts-info">
              <h2>Workout Tracking</h2>
              <p className="info-text">
                {hasActiveSession
                  ? 'Continue your active session or start a new one.'
                  : 'Create a session to start tracking workouts for this program.'}
              </p>
            </div>

            <div className="sessions-list">
              <h3>Sessions for this program:</h3>
              {programSessions.length > 0 ? (
                <ul className="session-items">
                  {programSessions.map(session => (
                    <li key={session.id} className="session-item">
                      <span className="session-name">{session.name}</span>
                      {session.isActive && <span className="active-badge">Active</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-text">No sessions yet</p>
              )}
            </div>

            <div className="action-buttons">
              {hasActiveSession && (
                <button className="btn btn-primary" onClick={onStartWorkouts}>
                  Continue Active Session
                </button>
              )}
              <button className="btn btn-secondary" onClick={onCreateSession}>
                Create New Session
              </button>
            </div>
          </div>
        );

      case 'history':
        return (
          <HistoryView
            workoutLog={filteredWorkoutLog}
            onSelectEntry={(key) => {
              onSelectHistoryEntry(key);
              setActiveTab('history-detail');
            }}
            onBack={() => setActiveTab('preview')}
            isRefreshing={isRefreshingHistory}
          />
        );

      case 'history-detail':
        if (!selectedHistoryKey || !workoutLog[selectedHistoryKey]) {
          setActiveTab('history');
          return null;
        }
        return (
          <HistoryDetail
            data={workoutLog[selectedHistoryKey]}
            onDelete={onDeleteHistoryEntry}
            onBack={() => {
              onBackFromHistoryDetail();
              setActiveTab('history');
            }}
          />
        );

      case 'stats':
        return (
          <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading stats...</div>}>
            <StatsView
              workoutLog={filteredWorkoutLog}
              onBack={() => setActiveTab('preview')}
            />
          </Suspense>
        );

      case 'abs':
        return <AbsView onBack={() => setActiveTab('preview')} />;

      default:
        return null;
    }
  };

  return (
    <div className="program-detail-view">
      <div className="program-detail-header">
        <button className="back-btn" onClick={onBack}>
          ← Back to Programs
        </button>
      </div>

      {/* Tabs removed as per user request - strictly preview mode only */}

      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
}
