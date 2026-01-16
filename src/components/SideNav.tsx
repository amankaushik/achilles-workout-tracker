interface SideNavProps {
  onHistoryClick: () => void;
  onStatsClick: () => void;
}

export default function SideNav({ onHistoryClick, onStatsClick }: SideNavProps) {
  return (
    <nav className="sidenav">
      <button className="sidenav-btn" onClick={onHistoryClick}>
        <span className="sidenav-icon">📊</span>
        <span className="sidenav-label">History</span>
      </button>
      <button className="sidenav-btn" onClick={onStatsClick}>
        <span className="sidenav-icon">📈</span>
        <span className="sidenav-label">Stats</span>
      </button>
    </nav>
  );
}
