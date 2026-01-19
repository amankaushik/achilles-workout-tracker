import { useState, useEffect, useRef } from 'react';

export default function Stopwatch() {
  const [displayedTime, setDisplayedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Refs to maintain state without re-rendering
  const startTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);
  const requestRef = useRef<number>();

  const updateTime = () => {
    if (startTimeRef.current) {
      const now = Date.now();
      const currentElapsed = (now - startTimeRef.current) + accumulatedTimeRef.current;
      setDisplayedTime(currentElapsed);
      requestRef.current = requestAnimationFrame(updateTime);
    }
  };

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now();
      requestRef.current = requestAnimationFrame(updateTime);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      accumulatedTimeRef.current = displayedTime;
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isRunning]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setDisplayedTime(0);
    accumulatedTimeRef.current = 0;
    startTimeRef.current = 0;
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10);

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="stopwatch">
      <div className="stopwatch-display">{formatTime(displayedTime)}</div>
      <div className="stopwatch-controls">
        <button
          className={`stopwatch-btn ${isRunning ? 'pause' : 'start'}`}
          onClick={handleStartPause}
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          className="stopwatch-btn reset"
          onClick={handleReset}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
