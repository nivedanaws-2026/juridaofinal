import React, { useState, useEffect } from 'react';
import { useJuri } from '../lib/store';
import JuriDAO from '../lib/juridao-engine';
import { Link } from 'react-router-dom';
import { Bell, CheckCircle2, ExternalLink } from 'lucide-react';

export function NotificationsPage() {
  const { state, account } = useJuri();
  const [readState, setReadState] = useState(() => {
    try {
      const raw = localStorage.getItem(`juri_notifications_read_${account}`);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  });

  const notifications = JuriDAO.notificationsFor(state, account) || [];

  const handleMarkRead = (timestamp) => {
    const updated = { ...readState, [timestamp]: true };
    setReadState(updated);
    try {
      localStorage.setItem(`juri_notifications_read_${account}`, JSON.stringify(updated));
    } catch (e) {}
  };

  return (
    <div className="space-y-8 py-2 max-w-3xl mx-auto">
      <div className="flex justify-between items-center border-b border-purple-900/40 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-purple-400" />
            Notifications
          </h1>
          <p className="text-xs text-purple-300">Case draw alerts and period advancement updates for {account}.</p>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-[#1c1530] border border-purple-900/40 rounded-xl p-8 text-center text-sm text-purple-400">
            No notifications for {account}.
          </div>
        ) : (
          notifications.map((n, idx) => {
            const isRead = !!readState[n.at];
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isRead ? 'bg-[#140e24] border-purple-900/30 text-purple-400' : 'bg-[#1c1530] border-purple-700/60 text-purple-100 shadow-md'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-sky-400">[{new Date(n.at * 1000).toLocaleTimeString()}]</span>
                    {!isRead && <span className="bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded font-sans font-bold">NEW</span>}
                  </div>
                  <p className="text-sm font-medium">{n.text}</p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {n.link && (
                    <Link
                      to={n.link}
                      onClick={() => handleMarkRead(n.at)}
                      className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors flex items-center gap-1 min-h-[44px]"
                    >
                      Open Case
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                  {!isRead && (
                    <button
                      onClick={() => handleMarkRead(n.at)}
                      className="bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-800/40 text-xs px-3 py-2 rounded-lg transition-colors min-h-[44px]"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
