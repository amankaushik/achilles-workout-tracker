import { Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import SessionSwitcher from './SessionSwitcher';

interface HeaderProps {
  onCreateSession: () => void;
  onSessionSwitchBlocked: () => void;
  hasInProgressWorkout: boolean;
  onMenuClick: () => void;
}

export default function Header({ onCreateSession, onSessionSwitchBlocked, hasInProgressWorkout, onMenuClick }: HeaderProps) {
  const { user, signOut } = useAuth();

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-btn" onClick={onMenuClick} aria-label="Toggle navigation menu">
          <Menu size={24} strokeWidth={2} />
        </button>
        <h1>Achilles</h1>
      </div>
      <div className="user-section">
        {user && (
          <>
            <SessionSwitcher
              onCreateNew={onCreateSession}
              onSwitchBlocked={onSessionSwitchBlocked}
              hasInProgressWorkout={hasInProgressWorkout}
            />
            <span className="user-email">{user.email}</span>
            <button className="btn btn-ghost btn-sm logout-btn" onClick={signOut}>
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}
