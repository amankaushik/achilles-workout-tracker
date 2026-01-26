import { DISCLAIMER_TEXT } from '../constants/disclaimer';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p className="footer-disclaimer">
          <strong>Disclaimer:</strong> {DISCLAIMER_TEXT}
        </p>
      </div>
    </footer>
  );
}
