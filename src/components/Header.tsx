import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="header">
      <h1>Achilles</h1>
      <div className="user-section">
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
