import { useAuth } from '../contexts/AuthContext';
import SessionSwitcher from './SessionSwitcher';

interface HeaderProps {
  onCreateSession: () => void;
  onSessionSwitchBlocked: () => void;
  hasInProgressWorkout: boolean;
}

export default function Header({ onCreateSession, onSessionSwitchBlocked, hasInProgressWorkout }: HeaderProps) {
  const { user, signOut } = useAuth();

  return (
    <header className="header">
      <h1>Achilles</h1>
      <div className="user-section">
        {user && (
          <>
            <SessionSwitcher
              onCreateNew={onCreateSession}
              onSwitchBlocked={onSessionSwitchBlocked}
              hasInProgressWorkout={hasInProgressWorkout}
            />
            <span className="user-email">{user.email}</span>
            <button className="logout-btn" onClick={signOut}>
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}
