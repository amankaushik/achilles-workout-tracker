interface PhaseInfo {
  num: number;
  numeral: string;
  title: string;
  weeks: string;
}

const phases: PhaseInfo[] = [
  { num: 1, numeral: 'I', title: 'Foundation', weeks: 'Weeks 1-4' },
  { num: 2, numeral: 'II', title: 'Building', weeks: 'Weeks 5-8' },
  { num: 3, numeral: 'III', title: 'Strength', weeks: 'Weeks 9-12' },
  { num: 4, numeral: 'IV', title: 'Man of Bronze', weeks: 'Weeks 13-16' },
];

interface PhaseSelectionProps {
  onSelectPhase: (phase: number) => void;
}

export default function PhaseSelection({ onSelectPhase }: PhaseSelectionProps) {
  return (
    <section className="view">
      <h2>Select Phase</h2>
      <div className="phase-grid">
        {phases.map((phase) => (
          <button
            key={phase.num}
            className="phase-card"
            onClick={() => onSelectPhase(phase.num)}
          >
            <span className="phase-number">{phase.numeral}</span>
            <span className="phase-title">{phase.title}</span>
            <span className="phase-weeks">{phase.weeks}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
