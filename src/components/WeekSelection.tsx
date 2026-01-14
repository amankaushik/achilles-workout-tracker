import { toRoman } from '../utils/helpers';

interface WeekSelectionProps {
  phase: number;
  hasWeekData: (phase: number, week: number) => boolean;
  onSelectWeek: (week: number) => void;
  onBack: () => void;
}

export default function WeekSelection({ phase, hasWeekData, onSelectWeek, onBack }: WeekSelectionProps) {
  return (
    <section className="view">
      <button className="back-btn" onClick={onBack}>
        ← Back to Phases
      </button>
      <h2>Phase {toRoman(phase)} - Select Week</h2>
      <div className="week-grid">
        {[1, 2, 3, 4].map((week) => (
          <button
            key={week}
            className={`week-card ${hasWeekData(phase, week) ? 'has-data' : ''}`}
            onClick={() => onSelectWeek(week)}
          >
            <span className="week-num">{week}</span>
            <span className="week-label">Week {week}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
