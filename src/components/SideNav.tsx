interface SideNavProps {
  onHistoryClick: () => void;
  onStatsClick: () => void;
  onAbsClick: () => void;
  isOpen: boolean;
}

export default function SideNav({ onHistoryClick, onStatsClick, onAbsClick, isOpen }: SideNavProps) {
  return (
    <nav className={`sidenav ${!isOpen ? 'closed' : ''}`}>
      <button className="sidenav-btn" onClick={onHistoryClick}>
        <span className="sidenav-icon">📊</span>
        <span className="sidenav-label">History</span>
      </button>
      <button className="sidenav-btn" onClick={onStatsClick}>
        <span className="sidenav-icon">📈</span>
        <span className="sidenav-label">Stats</span>
      </button>
      <button className="sidenav-btn" onClick={onAbsClick}>
        <span className="sidenav-icon">💪</span>
        <span className="sidenav-label">Abs</span>
      </button>
    </nav>
  );
}
