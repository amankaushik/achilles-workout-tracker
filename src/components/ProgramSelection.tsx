import { useState } from 'react';
import { useSession } from '../contexts/SessionContext';

interface ProgramSelectionProps {
    onProgramSelected: () => void;
    onViewProgram: (programId: string) => void;
}

export default function ProgramSelection({ onProgramSelected, onViewProgram }: ProgramSelectionProps) {
    const { programs, createSession, currentSession } = useSession();
    const [isCreating, setIsCreating] = useState(false);

    const handleStartProgram = async (programId: string, programName: string) => {
        setIsCreating(true);
        try {
            // Create a session for this program and make it active
            await createSession(programId, `${programName} Session`, undefined, true);
            onProgramSelected();
        } catch (error) {
            console.error('Failed to start program:', error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <section className="view">
            <div className="program-selection-header">
                <h2>Select a Program</h2>
                <p className="program-selection-subtitle">Choose a workout program to start your journey.</p>

                {currentSession && (
                    <div className="active-session-banner">
                        <p>You have an active session: <strong>{currentSession.name}</strong></p>
                        <button className="return-session-btn" onClick={onProgramSelected}>
                            Return to Session
                        </button>
                    </div>
                )}
            </div>

            {isCreating ? (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Setting up your program...</p>
                </div>
            ) : (
                <div className="programs-grid">
                    {programs.map((program) => (
                        <div key={program.id} className="program-card">
                            <div className="program-card-content">
                                <h3 className="program-title">{program.name}</h3>
                                <p className="program-description">{program.description}</p>
                            </div>
                            <div className="program-actions">
                                <button
                                    className="program-view-btn"
                                    onClick={() => onViewProgram(program.id)}
                                >
                                    View Details
                                </button>
                                <button
                                    className="program-start-btn"
                                    onClick={() => handleStartProgram(program.id, program.name)}
                                >
                                    Start Program
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
