import React from 'react';
import { useJuri } from '../lib/store';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

export function Toast() {
  const { toast } = useJuri();

  if (!toast) return null;

  const bgColors = {
    info: 'bg-blue-950/90 border-blue-500 text-blue-200',
    success: 'bg-emerald-950/90 border-emerald-500 text-emerald-200',
    error: 'bg-rose-950/90 border-rose-500 text-rose-200',
  };

  const icons = {
    info: <Info className="w-5 h-5 text-blue-400" />,
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400" />,
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full p-4 rounded-lg border shadow-xl flex items-start gap-3 backdrop-blur-md transition-all duration-300 animate-slide-up bg-opacity-95 dark font-sans">
      <div className={`p-4 rounded-lg border shadow-xl flex items-center gap-3 w-full ${bgColors[toast.type] || bgColors.info}`}>
        {icons[toast.type] || icons.info}
        <div className="text-sm font-medium flex-1">{toast.message}</div>
      </div>
    </div>
  );
}
