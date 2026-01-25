interface SideNavProps {
  onBackToPrograms: () => void;
  onHistoryClick: () => void;
  onStatsClick: () => void;
  onAbsClick: () => void;
  isOpen: boolean;
  showSessionNav?: boolean;
}

export default function SideNav({
  onBackToPrograms,
  onHistoryClick,
  onStatsClick,
  onAbsClick,
  isOpen,
  showSessionNav = false
}: SideNavProps) {
  return (
    <nav className={`sidenav ${!isOpen ? 'closed' : ''}`}>
      <button className="sidenav-btn" onClick={onBackToPrograms} title="All Programs">
        <span className="sidenav-icon">🏠</span>
        <span className="sidenav-label">Programs</span>
      </button>

      {showSessionNav && (
        <>
          <div className="sidenav-divider" style={{ height: '1px', background: 'var(--surface-light)', margin: '8px 0' }} />

          <button className="sidenav-btn" onClick={onHistoryClick} title="History">
            <span className="sidenav-icon">📅</span>
            <span className="sidenav-label">History</span>
          </button>

          <button className="sidenav-btn" onClick={onStatsClick} title="Statistics">
            <span className="sidenav-icon">📈</span>
            <span className="sidenav-label">Stats</span>
          </button>

          <button className="sidenav-btn" onClick={onAbsClick} title="Abs Workout">
            <span className="sidenav-icon">🧘</span>
            <span className="sidenav-label">Abs</span>
          </button>
        </>
      )}
    </nav>
  );
}
