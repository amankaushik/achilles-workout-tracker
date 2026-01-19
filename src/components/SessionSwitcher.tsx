import { useState, useRef, useEffect } from 'react';
import { useSession } from '../contexts/SessionContext';

interface SessionSwitcherProps {
  onCreateNew: () => void;
  onSwitchBlocked?: () => void;
  hasInProgressWorkout?: boolean;
}

export default function SessionSwitcher({
  onCreateNew,
  onSwitchBlocked,
  hasInProgressWorkout = false,
}: SessionSwitcherProps) {
  const { currentSession, sessions, isLoading, switchSession, renameSession } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setEditingSessionId(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitchSession = async (sessionId: string) => {
    if (hasInProgressWorkout) {
      onSwitchBlocked?.();
      setIsOpen(false);
      return;
    }

    if (sessionId === currentSession?.id) {
      setIsOpen(false);
      return;
    }

    try {
      await switchSession(sessionId);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to switch session:', error);
    }
  };

  const handleStartEdit = (sessionId: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(sessionId);
    setEditName(currentName);
  };

  const handleSaveEdit = async (sessionId: string, e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (editName.trim() === '') return;

    try {
      await renameSession(sessionId, editName.trim());
      setEditingSessionId(null);
    } catch (error) {
      console.error('Failed to rename session:', error);
    }
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(null);
  };

  if (isLoading || !currentSession) {
    return (
      <div className="session-switcher">
        <button className="session-button" disabled>
          Loading...
        </button>
      </div>
    );
  }

  return (
    <div className="session-switcher" ref={dropdownRef}>
      <button
        className="session-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Switch session"
      >
        <span className="session-icon">📂</span>
        <span className="session-name">{currentSession.name}</span>
        <span className="session-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="session-dropdown">
          <div className="session-dropdown-header">Sessions</div>
          <div className="session-list">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`session-item ${session.id === currentSession.id ? 'active' : ''}`}
              >
                {editingSessionId === session.id ? (
                  <form onSubmit={(e) => handleSaveEdit(session.id, e)} className="session-edit-form">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="session-edit-input"
                      autoFocus
                      maxLength={50}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button type="submit" className="session-edit-save" title="Save">
                      ✓
                    </button>
                    <button
                      type="button"
                      className="session-edit-cancel"
                      onClick={handleCancelEdit}
                      title="Cancel"
                    >
                      ✕
                    </button>
                  </form>
                ) : (
                  <>
                    <button
                      className="session-item-button"
                      onClick={() => handleSwitchSession(session.id)}
                    >
                      <span className="session-item-name">{session.name}</span>
                      {session.id === currentSession.id && (
                        <span className="session-active-badge">Current</span>
                      )}
                    </button>
                    <button
                      className="session-rename-btn"
                      onClick={(e) => handleStartEdit(session.id, session.name, e)}
                      title="Rename"
                    >
                      ✏️
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
          <button className="session-create-btn" onClick={() => { onCreateNew(); setIsOpen(false); }}>
            <span className="session-create-icon">+</span>
            Create New Session
          </button>
        </div>
      )}
    </div>
  );
}
