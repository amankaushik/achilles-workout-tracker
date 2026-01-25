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
  programName?: string;
  sessionName?: string;
}

export default function PhaseSelection({ onSelectPhase, programName, sessionName }: PhaseSelectionProps) {
  return (
    <section className="view">
      <div className="view-header-context">
        {sessionName && <div className="context-session">{sessionName}</div>}
        {programName && <h2 className="context-program">{programName}</h2>}
        {!programName && <h2>Select Phase</h2>}
      </div>
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
