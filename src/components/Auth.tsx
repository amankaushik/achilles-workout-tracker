import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';

export default function Auth() {
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
      </div>
    </div>
  );
}
