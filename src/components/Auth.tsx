import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';
import { DISCLAIMER_TEXT } from '../constants/disclaimer';
import { useAuth } from '../contexts/AuthContext';

export default function Auth() {
  const { enterDemo } = useAuth();

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Achilles Workout Tracker</h1>
        <p className="auth-subtitle">Sign in to track your workouts</p>

        <SupabaseAuth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#2d3748',
                  brandAccent: '#4a5568',
                },
              },
            },
          }}
          providers={[]}
          redirectTo={window.location.origin}
        />

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button className="btn-demo" onClick={enterDemo}>
          Try Demo
        </button>

        <div className="auth-disclaimer">
          <p>
            <strong>Disclaimer:</strong> {DISCLAIMER_TEXT}
          </p>
        </div>
      </div>
    </div>
  );
}
