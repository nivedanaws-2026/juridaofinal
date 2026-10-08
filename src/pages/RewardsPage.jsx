import React from 'react';
import { useJuri } from '../lib/store';
import JuriDAO from '../lib/juridao-engine';
import { Award, Coins, ArrowRight, CheckCircle2 } from 'lucide-react';

export function RewardsPage() {
  const { state, account, act, showToast } = useJuri();

  const pending = state?.pending?.[account] || { eth: 0, juri: 0 };
  const pendingEth = (pending.eth / 1000000).toFixed(4);
  const pendingJuri = (pending.juri || 0).toLocaleString();

  // Filter settled & claimed events from state.log for current account
  const rewardLogs = state?.log?.filter(
    (entry) => (entry.type === 'settled' || entry.type === 'claimed') && entry.who === account
  ) || [];

  const handleClaim = () => {
    try {
      let claimed;
      act((s) => {
        claimed = JuriDAO.claimRewards(s, account);
      });
      const ethText = (claimed.eth / 1000000).toFixed(4);
      showToast(`Claimed ${ethText} ETH & ${claimed.juri.toLocaleString()} JURI`, 'success');
    } catch (err) {
      // Error handled by act() toast
    }
  };

  return (
    <div className="space-y-8 py-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Rewards & Claims</h1>
          <p className="text-sm text-purple-300">
            Claim earned ETH fees and JURI token rewards from coherent votes.
          </p>
        </div>
      </div>

      {/* Pending Rewards Panel */}
      <div className="bg-[#1c1530] border border-purple-900/50 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="text-xs uppercase font-bold text-purple-400 tracking-wider">Unclaimed Pending Rewards</div>
          <div className="flex items-center gap-4 text-2xl sm:text-3xl font-mono font-black">
            <span className="text-emerald-400">{pendingEth} ETH</span>
            <span className="text-purple-600">|</span>
            <span className="text-sky-400">{pendingJuri} JURI</span>
          </div>
        </div>

        <button
          onClick={handleClaim}
          disabled={pending.eth === 0 && (pending.juri || 0) === 0}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-purple-900/40 flex items-center gap-2 min-h-[44px] shrink-0"
        >
          <Award className="w-5 h-5 text-emerald-400" />
          Claim Rewards
        </button>
      </div>

      {/* History Table */}
      <div className="bg-[#1c1530] border border-purple-900/50 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-purple-900/40">
          <h3 className="text-lg font-bold text-white">Reward & Penalty History</h3>
          <p className="text-xs text-purple-300">Detailed breakdown of case coherence, fees earned, and stake adjustments.</p>
        </div>

        {rewardLogs.length === 0 ? (
          <div className="p-8 text-center text-sm text-purple-400">
            No reward or penalty events logged for {account} yet.
          </div>
        ) : (
          <>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#140e24] text-purple-300 border-b border-purple-900/40 uppercase text-[11px] font-semibold tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Event Type</th>
                    <th className="py-3 px-4">Dispute ID</th>
                    <th className="py-3 px-4">Coherent</th>
                    <th className="py-3 px-4">ETH Reward</th>
                    <th className="py-3 px-4">JURI Reward</th>
                    <th className="py-3 px-4">JURI Penalty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-900/30 text-purple-200 font-mono">
                  {rewardLogs.map((entry, idx) => (
                    <tr key={idx} className="hover:bg-purple-900/20 transition-colors">
                      <td className="py-3 px-4 capitalize font-semibold font-sans text-white">
                        {entry.type}
                      </td>
                      <td className="py-3 px-4">
                        {entry.disputeId ? `#${entry.disputeId}` : '-'}
                      </td>
                      <td className="py-3 px-4">
                        {entry.type === 'settled' ? (
                          entry.coherent ? (
                            <span className="text-emerald-400 font-bold font-sans">Yes</span>
                          ) : (
                            <span className="text-rose-400 font-bold font-sans">No</span>
                          )
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-3 px-4 text-emerald-400">
                        {entry.ethReward ? `+${(entry.ethReward / 1000000).toFixed(4)} ETH` : (entry.eth ? `+${(entry.eth / 1000000).toFixed(4)} ETH` : '-')}
                      </td>
                      <td className="py-3 px-4 text-sky-400">
                        {entry.juriReward ? `+${entry.juriReward.toLocaleString()} JURI` : (entry.juri ? `+${entry.juri.toLocaleString()} JURI` : '-')}
                      </td>
                      <td className="py-3 px-4 text-rose-400">
                        {entry.penalty ? `-${entry.penalty.toLocaleString()} JURI` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="sm:hidden p-4 space-y-4">
              {rewardLogs.map((entry, idx) => (
                <div key={idx} className="bg-[#0f0b1a] border border-purple-900/40 rounded-xl p-4 space-y-3 text-xs">
                  <div className="flex justify-between items-start border-b border-purple-900/40 pb-2">
                    <span className="capitalize font-semibold text-white">{entry.type}</span>
                    <span className="text-purple-300">{entry.disputeId ? `Case #${entry.disputeId}` : '-'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-purple-300 font-mono">
                    <div>Coherent: {entry.type === 'settled' ? (entry.coherent ? <span className="text-emerald-400 font-bold font-sans">Yes</span> : <span className="text-rose-400 font-bold font-sans">No</span>) : '-'}</div>
                    <div>ETH: <span className="text-emerald-400">{entry.ethReward ? `+${(entry.ethReward / 1000000).toFixed(4)}` : (entry.eth ? `+${(entry.eth / 1000000).toFixed(4)}` : '-')}</span></div>
                    <div>JURI (+): <span className="text-sky-400">{entry.juriReward ? `+${entry.juriReward.toLocaleString()}` : (entry.juri ? `+${entry.juri.toLocaleString()}` : '-')}</span></div>
                    <div>JURI (-): <span className="text-rose-400">{entry.penalty ? `-${entry.penalty.toLocaleString()}` : '-'}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
