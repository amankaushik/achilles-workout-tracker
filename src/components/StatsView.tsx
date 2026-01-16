interface StatsViewProps {
  onBack: () => void;
}

export default function StatsView({ onBack }: StatsViewProps) {
  return (
    <div className="view-container">
      <div className="view-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2>Stats</h2>
      </div>
      <div className="stats-placeholder">
        <h3>Stats Coming Soon</h3>
        <p>Track your progress, PRs, and workout trends.</p>
      </div>
    </div>
  );
}
