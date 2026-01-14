export default function Header({ onHistoryClick }) {
  return (
    <header className="header">
      <h1>Achilles</h1>
      <button className="header-btn" onClick={onHistoryClick}>
        History
      </button>
    </header>
  );
}
