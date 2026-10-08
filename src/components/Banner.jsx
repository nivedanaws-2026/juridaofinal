import React from 'react';
import { AlertTriangle } from 'lucide-react';

export function Banner() {
  return (
    <div className="bg-purple-950/80 border-b border-purple-800/50 text-purple-300 px-4 py-2 text-xs md:text-sm text-center flex items-center justify-center gap-2">
      <AlertTriangle className="w-4 h-4 text-purple-400 shrink-0" />
      <span>Simulation mode: dummy ETH and dummy JURI, no real money.</span>
    </div>
  );
}
