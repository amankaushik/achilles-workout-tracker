import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onHistoryClick: () => void;
}

export default function Header({ onHistoryClick }: HeaderProps) {
  const { user, signOut } = useAuth();

  return (
    <header className="header">
      <h1>Achilles</h1>
      <div className="user-section">
        <button className="header-btn" onClick={onHistoryClick}>
          History
        </button>
        {user && (
          <>
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
