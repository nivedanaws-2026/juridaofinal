import React from 'react';
import { PackageOpen } from 'lucide-react';

export function EmptyState({ title = "Nothing here yet", description = "No items found for this view.", action }) {
  return (
    <div className="bg-[#1c1530] border border-purple-900/40 rounded-xl p-8 text-center flex flex-col items-center justify-center my-6">
      <div className="w-14 h-14 rounded-full bg-purple-950/80 border border-purple-800/50 flex items-center justify-center text-purple-400 mb-4">
        <PackageOpen className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-purple-200 mb-1">{title}</h3>
      <p className="text-sm text-purple-400 max-w-sm mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
