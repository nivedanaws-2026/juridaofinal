import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export function PhaseTracker({ period, periodEnd, periodStart, params }) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const diff = Math.max(0, (periodEnd || 0) - now);
      setTimeLeft(diff);
    }, 1000);
    return () => clearInterval(timer);
  }, [periodEnd]);

  const phases = ['Evidence', 'Commit', 'Reveal', 'Appeal', 'Executed'];

  const getStepStatus = (stepName) => {
    const currentIndex = phases.indexOf(period);
    const stepIndex = phases.indexOf(stepName);
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'upcoming';
  };

  const formatMmSs = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-[#1c1530] border border-purple-900/50 rounded-xl p-6 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-purple-900/40 pb-4">
        <h3 className="text-base font-bold text-white">Dispute Phase Timeline</h3>
        {period !== 'Executed' && (
          <div className="flex items-center gap-2 bg-[#0f0b1a] px-3 py-1.5 rounded-lg border border-purple-800/40 font-mono text-xs text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Phase Ends In: {formatMmSs(timeLeft)}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {phases.map((p, idx) => {
          const status = getStepStatus(p);
          let bg = 'bg-[#0f0b1a] border-purple-900/30 text-purple-400';
          if (status === 'completed') bg = 'bg-purple-950/80 border-purple-700/60 text-purple-300';
          if (status === 'active') bg = 'bg-purple-600 border-purple-400 text-white font-bold shadow-lg shadow-purple-900/50';

          return (
            <div key={p} className={`p-3 rounded-lg border text-xs text-center flex flex-col items-center justify-center space-y-1 ${bg}`}>
              <span className="text-[10px] opacity-75">Step {idx + 1}</span>
              <span className="truncate w-full">{p === 'Commit' ? 'Voting (Commit)' : p === 'Appeal' ? 'Appeal Window' : p}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
