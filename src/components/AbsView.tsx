import { ChevronLeft } from 'lucide-react';

interface AbsViewProps {
  onBack: () => void;
}

export default function AbsView({ onBack }: AbsViewProps) {
  return (
    <section className="view">
      <button className="btn btn-ghost btn-sm back-btn" onClick={onBack}>
        <ChevronLeft size={20} /> Back
      </button>
      <h2>Abdominal Exercises</h2>

      <div className="abs-content">
        <div className="abs-section">
          <h3 className="abs-section-title">Upper Abdominal Exercises</h3>
          <ul className="abs-exercise-list">
            <li>Stability ball crunches</li>
            <li>Bosu crunches</li>
            <li>Incline Sit-ups</li>
            <li>Pulldown crunches</li>
            <li>Ab wheel</li>
          </ul>
        </div>

        <div className="abs-section">
          <h3 className="abs-section-title">Lower Abdominal Exercises</h3>
          <ul className="abs-exercise-list">
            <li>Lying leg raises</li>
            <li>Hanging leg raises</li>
            <li>Flutter kicks</li>
            <li>Reverse crunches</li>
            <li>Stability ball or suspension trainer Pikes</li>
          </ul>
        </div>

        <div className="abs-section">
          <h3 className="abs-section-title">Oblique Exercises</h3>
          <ul className="abs-exercise-list">
            <li>Machine Crunches</li>
            <li>Bicycle Crunch</li>
            <li>Oblique Cable twists</li>
            <li>Pallof Presses</li>
            <li>Landmine rotations</li>
            <li>Side crunches</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
