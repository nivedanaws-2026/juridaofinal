import React from 'react';
import { useJuri } from '../lib/store';
import JuriDAO from '../lib/juridao-engine';
import { Link } from 'react-router-dom';
import { Award, Coins, Scale, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export function JurorDashboardPage() {
  const { state, account } = useJuri();

  const pending = state?.pending?.[account] || { eth: 0, juri: 0 };
  const pendingEth = (pending.eth / 1000000).toFixed(4);
  const pendingJuri = (pending.juri || 0).toLocaleString();

  const stats = JuriDAO.jurorStats(state, account) || { settled: 0, coherent: 0, performancePct: 100 };
  const notifications = JuriDAO.notificationsFor(state, account)?.slice(0, 5) || [];
  const jurorCases = JuriDAO.jurorCases(state, account) || [];

  const pendingVoteCount = jurorCases.filter(c => c.status === 'needs commit' || c.status === 'needs reveal').length;
  const inProgressCount = jurorCases.filter(c => ['committed', 'revealed', 'waiting'].includes(c.status) && !c.closed).length;
  const closedCount = jurorCases.filter(c => c.closed || c.status === 'settled' || c.status === 'missed').length;

  return (
    <div className="space-y-8 py-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Juror Dashboard</h1>
          <p className="text-sm text-purple-300">
            Overview of your active stakes, drawing probabilities, case queue, and performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/courts"
            className="bg-purple-600 hover:bg-purple-500 text-white font-medium px-4 py-2 rounded-xl text-xs sm:text-sm transition-all shadow min-h-[44px] flex items-center"
          >
            Join a Court
          </Link>
          <Link
            to="/courts"
            className="bg-purple-950/80 hover:bg-purple-900 border border-purple-700/50 text-purple-200 font-medium px-4 py-2 rounded-xl text-xs sm:text-sm transition-colors min-h-[44px] flex items-center"
          >
            Get JURI
          </Link>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#1c1530] border border-purple-900/40 rounded-xl p-6 space-y-2">
          <div className="text-xs uppercase font-bold text-purple-400">Unclaimed Rewards</div>
          <div className="text-2xl font-mono font-bold text-emerald-400">{pendingEth} ETH</div>
          <div className="text-xs text-sky-400 font-mono">{pendingJuri} JURI</div>
          <Link to="/rewards" className="inline-flex items-center gap-1 text-xs text-purple-300 hover:text-white pt-2 font-medium">
            View Rewards →
          </Link>
        </div>

        <div className="bg-[#1c1530] border border-purple-900/40 rounded-xl p-6 space-y-2">
          <div className="text-xs uppercase font-bold text-purple-400">Coherence Performance</div>
          <div className="text-3xl font-black text-purple-200">{stats.performancePct}%</div>
          <div className="text-xs text-purple-300">{stats.coherent} of {stats.settled} votes coherent</div>
        </div>

        <div className="bg-[#1c1530] border border-purple-900/40 rounded-xl p-6 space-y-2">
          <div className="text-xs uppercase font-bold text-purple-400">Vote Pending</div>
          <div className="text-3xl font-black text-amber-400">{pendingVoteCount}</div>
          <div className="text-xs text-purple-300">Requires immediate action</div>
        </div>

        <div className="bg-[#1c1530] border border-purple-900/40 rounded-xl p-6 space-y-2">
          <div className="text-xs uppercase font-bold text-purple-400">Total Cases Served</div>
          <div className="text-3xl font-black text-sky-400">{jurorCases.length}</div>
          <div className="text-xs text-purple-300">{inProgressCount} active, {closedCount} closed</div>
        </div>
      </div>

      {/* Staked Courts Panel */}
      <div className="bg-[#1c1530] border border-purple-900/40 rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-white">Your Staked Courts</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {state?.courts?.map((court) => {
            const userStake = state?.stake?.[court.id]?.[account] || 0;
            const totalStaked = court.totalStaked || 0;
            const drawChance = totalStaked > 0 && userStake > 0 ? ((userStake / totalStaked) * 100).toFixed(1) + '%' : '0%';

            return (
              <div key={court.id} className="bg-[#0f0b1a] border border-purple-900/40 rounded-xl p-4 space-y-2 text-xs">
                <div className="font-bold text-white text-sm">{court.name}</div>
                <div className="flex justify-between text-purple-300">
                  <span>Your Stake:</span>
                  <strong className="text-sky-400 font-mono">{userStake.toLocaleString()} JURI</strong>
                </div>
                <div className="flex justify-between text-purple-300">
                  <span>Drawing Chance:</span>
                  <strong className="text-emerald-400 font-mono">{drawChance}</strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-[#1c1530] border border-purple-900/40 rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-white">Latest Notifications</h3>
        {notifications.length === 0 ? (
          <p className="text-xs text-purple-400">No notifications for {account}.</p>
        ) : (
          <div className="space-y-2">
            {notifications.map((n, i) => (
              <div key={i} className="p-3 rounded-lg bg-[#0f0b1a] border border-purple-900/30 flex items-center justify-between text-xs text-purple-300">
                <span>{n.text}</span>
                {n.link && (
                  <Link to={n.link} className="text-purple-400 hover:text-white font-medium">
                    Open →
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
