import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { Session, Program } from '../types/database';
import * as api from '../services/api';
import { useAuth } from './AuthContext';
import { WorkoutDataType } from '../types';

interface SessionContextType {
  currentSession: Session | null;
  currentProgram: WorkoutDataType | null;
  sessions: Session[];
  programs: Program[];
  isLoading: boolean;
  error: string | null;
  createSession: (programId: string, name: string, description?: string, makeActive?: boolean) => Promise<Session>;
  switchSession: (sessionId: string) => Promise<void>;
  renameSession: (sessionId: string, newName: string) => Promise<void>;
  refreshSessions: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [currentProgram, setCurrentProgram] = useState<WorkoutDataType | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);
  const loadedUserIdRef = useRef<string | null>(null);

  // Load sessions when user is authenticated
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    if (user) {
      // Only load if we haven't loaded for this user yet
      if (loadedUserIdRef.current !== user.id && !loadingRef.current) {
        loadSessions();
      }
    } else {
      // Clear session state when user logs out
      setCurrentSession(null);
      setCurrentProgram(null);
      setSessions([]);
      setPrograms([]);
      setIsLoading(false);
      loadedUserIdRef.current = null;
      // Clear localStorage
      if (user === null) {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('achilles_active_session_') || key.startsWith('achilles_workout_log_')) {
            localStorage.removeItem(key);
          }
        });
      }
    }
  }, [user, authLoading]);

  const loadSessions = async () => {
    if (!user || loadingRef.current) return;

    loadingRef.current = true;
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all programs first
      const allPrograms = await api.getPrograms();
      setPrograms(allPrograms);

      // Fetch all sessions
      let allSessions: Session[] = [];
      try {
        allSessions = await api.getSessions();
      } catch (fetchError: any) {
        console.error('Error fetching sessions:', fetchError);
        // If fetch fails, treat as empty and try to create default
        allSessions = [];
      }

      if (allSessions.length === 0) {
        setSessions([]);
        setCurrentSession(null);
      } else {
        setSessions(allSessions);

        // Try to load active session from localStorage first
        const storedSessionId = getActiveSessionFromLocalStorage();
        let activeSession = allSessions.find(s => s.id === storedSessionId);

        // If stored session not found, use the active session from DB
        if (!activeSession) {
          activeSession = allSessions.find(s => s.isActive);
        }

        // If still no active session (but sessions exist), don't force one.
        // The user can select one from the list or create a new one.
        // However, if we want to default to the first one available:
        if (!activeSession && allSessions.length > 0) {
          // For now, let's just picking the first one effectively as active for the UI state, 
          // but maybe not enforcing it in DB until they act? 
          // Actually, let's keep the logic to auto-select if multiple exist but none active, 
          // to avoid "no session" state for returning users with data.
          activeSession = allSessions[0];
        }

        if (activeSession) {
          setCurrentSession(activeSession);
          saveActiveSessionToLocalStorage(activeSession.id);
          // Load the program for the active session
          await loadProgramForSession(activeSession);
        } else {
          setCurrentSession(null);
        }
      }
    } catch (err) {
      console.error('Error loading sessions:', err);
      setError('Failed to load sessions');
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
      if (user) {
        loadedUserIdRef.current = user.id;
      }
    }
  };

  const loadProgramForSession = async (session: Session) => {
    try {
      const program = await api.getProgram(session.programId);
      if (program) {
        setCurrentProgram(program.structure as WorkoutDataType);
      }
    } catch (err) {
      console.error('Error loading program:', err);
      setError('Failed to load program');
    }
  };

  const createSession = async (
    programId: string,
    name: string,
    description?: string,
    makeActive: boolean = false
  ): Promise<Session> => {
    try {
      setError(null);
      const newSession = await api.createSession(programId, name, description, makeActive);

      // Add to sessions list
      setSessions(prev => [...prev, newSession]);

      // If makeActive, set as current session
      if (makeActive) {
        // Update other sessions to not be active
        setSessions(prev => prev.map(s => ({ ...s, isActive: s.id === newSession.id })));
        setCurrentSession(newSession);
        saveActiveSessionToLocalStorage(newSession.id);

        // Load the program for the new session
        await loadProgramForSession(newSession);
      }

      return newSession;
    } catch (err) {
      console.error('Error creating session:', err);
      setError('Failed to create session');
      throw err;
    }
  };

  const switchSession = async (sessionId: string): Promise<void> => {
    try {
      setError(null);
      await api.setActiveSession(sessionId);

      // Update sessions list
      setSessions(prev => prev.map(s => ({ ...s, isActive: s.id === sessionId })));

      // Update current session
      const newSession = sessions.find(s => s.id === sessionId);
      if (newSession) {
        setCurrentSession({ ...newSession, isActive: true });
        saveActiveSessionToLocalStorage(sessionId);

        // Load the program for the new session
        await loadProgramForSession(newSession);
      }
    } catch (err) {
      console.error('Error switching session:', err);
      setError('Failed to switch session');
      throw err;
    }
  };

  const renameSession = async (sessionId: string, newName: string): Promise<void> => {
    try {
      setError(null);
      const updatedSession = await api.updateSession(sessionId, { name: newName });

      // Update sessions list
      setSessions(prev => prev.map(s => s.id === sessionId ? updatedSession : s));

      // Update current session if it's the one being renamed
      if (currentSession?.id === sessionId) {
        setCurrentSession(updatedSession);
      }
    } catch (err) {
      console.error('Error renaming session:', err);
      setError('Failed to rename session');
      throw err;
    }
  };

  const refreshSessions = async (): Promise<void> => {
    await loadSessions();
  };

  // localStorage helpers
  const getActiveSessionFromLocalStorage = (): string | null => {
    if (!user) return null;
    return localStorage.getItem(`achilles_active_session_${user.id}`);
  };

  const saveActiveSessionToLocalStorage = (sessionId: string): void => {
    if (!user) return;
    localStorage.setItem(`achilles_active_session_${user.id}`, sessionId);
  };

  const value = {
    currentSession,
    currentProgram,
    sessions,
    programs,
    isLoading,
    error,
    createSession,
    switchSession,
    renameSession,
    refreshSessions,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
