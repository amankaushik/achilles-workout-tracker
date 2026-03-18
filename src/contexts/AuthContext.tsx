import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

const DEMO_MODE_KEY = 'achilles_demo_mode';
const DEMO_USER = { id: 'demo', email: 'demo@achilles.app' };

interface AuthContextType {
  user: User | typeof DEMO_USER | null;
  session: Session | null;
  loading: boolean;
  isDemo: boolean;
  signOut: () => Promise<void>;
  enterDemo: () => void;
  exitDemo: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | typeof DEMO_USER | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    // Check for demo mode from URL param or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const demoFromUrl = urlParams.get('demo') === 'true';
    const demoFromStorage = localStorage.getItem(DEMO_MODE_KEY) === 'true';

    if (demoFromUrl || demoFromStorage) {
      localStorage.setItem(DEMO_MODE_KEY, 'true');
      if (demoFromUrl) {
        urlParams.delete('demo');
        const newUrl = urlParams.toString()
          ? `${window.location.pathname}?${urlParams.toString()}`
          : window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
      setIsDemo(true);
      setUser(DEMO_USER);
      setLoading(false);
      return; // Skip Supabase auth entirely — no cleanup needed
    }

    // Normal Supabase auth flow
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const enterDemo = () => {
    localStorage.setItem(DEMO_MODE_KEY, 'true');
    setIsDemo(true);
    setUser(DEMO_USER);
    setSession(null);
    setLoading(false);
  };

  const exitDemo = () => {
    localStorage.removeItem(DEMO_MODE_KEY);
    // Clear all demo-related localStorage keys
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('achilles_') && key.includes('demo')) {
        localStorage.removeItem(key);
      }
    });
    setIsDemo(false);
    setUser(null);
    setSession(null);
    setLoading(false);
  };

  const value = {
    user,
    session,
    loading,
    isDemo,
    signOut,
    enterDemo,
    exitDemo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
