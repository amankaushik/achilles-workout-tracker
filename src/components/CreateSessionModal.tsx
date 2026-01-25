import { useState, useEffect, useRef } from 'react';
import { Program } from '../types/database';

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (programId: string, name: string, description: string, makeActive: boolean) => Promise<void>;
  programs: Program[];
  preselectedProgramId?: string | null;
}

export default function CreateSessionModal({ isOpen, onClose, onSubmit, programs, preselectedProgramId }: CreateSessionModalProps) {
  const [programId, setProgramId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [makeActive, setMakeActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      // Use preselected program if provided, otherwise default to Achilles Program
      if (preselectedProgramId) {
        setProgramId(preselectedProgramId);
      } else {
        const defaultProgram = programs.find(p => p.name === 'Achilles Program') || programs[0];
        setProgramId(defaultProgram?.id || '');
      }
      setName('');
      setDescription('');
      setMakeActive(true);
      setError(null);
    }
  }, [isOpen, programs, preselectedProgramId]);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Close when clicking outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (programId === '') {
      setError('Please select a program');
      return;
    }

    if (name.trim() === '') {
      setError('Session name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(programId, name.trim(), description.trim(), makeActive);
      onClose();
    } catch (err) {
      console.error('Error creating session:', err);
      setError('Failed to create session. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal" ref={modalRef}>
        <div className="modal-header">
          <h2>Create New Session</h2>
          <button className="modal-close" onClick={onClose} disabled={isSubmitting}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="program-select" className="form-label">
              Program *
            </label>
            <select
              id="program-select"
              className="form-input"
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="" disabled>Select a program</option>
              {programs.map(program => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
            {programId && (
              <p className="form-helper-text">
                {programs.find(p => p.id === programId)?.description || ''}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="session-name" className="form-label">
              Session Name *
            </label>
            <input
              id="session-name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              placeholder="e.g., Spring 2026, Competition Prep"
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="session-description" className="form-label">
              Description (optional)
            </label>
            <textarea
              id="session-description"
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              rows={3}
              placeholder="Add notes about this training session..."
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                checked={makeActive}
                onChange={(e) => setMakeActive(e.target.checked)}
                disabled={isSubmitting}
              />
              <span>Switch to this session immediately</span>
            </label>
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
