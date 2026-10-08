import React, { useState } from 'react';
import { useJuri } from '../lib/store';
import JuriDAO from '../lib/juridao-engine';
import { BuyJuriModal } from '../components/BuyJuriModal';
import { StakeModal } from '../components/StakeModal';
import { Scale, Coins, Droplet, ShieldCheck, ChevronDown, ChevronUp, Lock, Plus, Minus } from 'lucide-react';

export function CourtsPage() {
  const { state, account, act, showToast } = useJuri();
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [selectedCourtForStake, setSelectedCourtForStake] = useState(null);
  const [expandedPolicyCourtId, setExpandedPolicyCourtId] = useState(null);
  const [quickEth, setQuickEth] = useState('0.1');

  const currentAcc = state?.accounts?.[account] || { eth: 10000000, juri: 0 };
  const userEth = (currentAcc.eth / 1000000).toFixed(4);
  const userJuri = currentAcc.juri;

  const quickEthMicro = Math.round((parseFloat(quickEth) || 0) * 1000000);
  const quickJuriPreview = Math.floor((parseFloat(quickEth) || 0) * 10000);

  const handleQuickBuy = (e) => {
    e.preventDefault();
    try {
      let juriReceived;
      act((s) => {
        juriReceived = JuriDAO.buyTokens(s, account, quickEthMicro);
      });
      showToast(`Bought ${juriReceived.toLocaleString()} JURI for ${quickEth} ETH`, 'success');
    } catch (err) {
      // Error handled by act() toast
    }
  };

  const handleFaucet = () => {
    try {
      act((s) => {
        JuriDAO.faucet(s, account);
      });
      showToast('Faucet claimed +5,000 JURI', 'success');
    } catch (err) {
      // Error handled by act() toast
    }
  };

  const handleUnstake = (courtId, amount) => {
    try {
      act((s) => {
        JuriDAO.unstakeJuri(s, account, courtId, amount);
      });
      showToast(`Unstaked ${amount.toLocaleString()} JURI`, 'success');
    } catch (err) {
      // Error handled by act() toast
    }
  };

  return (
    <div className="space-y-8 py-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Courts & Token Staking</h1>
          <p className="text-sm text-purple-300">
            Stake JURI to serve as a juror across specialized court categories.
          </p>
        </div>
        <button
          onClick={() => setBuyModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-purple-900/40 flex items-center gap-2 min-h-[44px]"
        >
          <Coins className="w-4 h-4" />
          Buy JURI / Faucet Modal
        </button>
      </div>

      {/* C1 Token Card */}
      <div className="bg-[#1c1530] border border-purple-900/50 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-purple-900/40 pb-3">
          <Coins className="w-6 h-6 text-sky-400 shrink-0" />
          <h2 className="text-lg font-bold text-white">JURI, the jury token (dummy)</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-purple-300">
          <div className="flex items-start gap-2 bg-[#0f0b1a] p-3 rounded-lg border border-purple-900/40">
            <span className="text-sky-400 font-bold">•</span>
            <span>You need JURI to join a court as a juror</span>
          </div>
          <div className="flex items-start gap-2 bg-[#0f0b1a] p-3 rounded-lg border border-purple-900/40">
            <span className="text-purple-400 font-bold">•</span>
            <span>When you are drawn, part of your stake is locked for that case</span>
          </div>
          <div className="flex items-start gap-2 bg-[#0f0b1a] p-3 rounded-lg border border-purple-900/40">
            <span className="text-emerald-400 font-bold">•</span>
            <span>Vote with the majority: you earn ETH fees and JURI</span>
          </div>
          <div className="flex items-start gap-2 bg-[#0f0b1a] p-3 rounded-lg border border-purple-900/40">
            <span className="text-rose-400 font-bold">•</span>
            <span>Vote against the majority or skip: you lose the locked JURI</span>
          </div>
        </div>
      </div>

      {/* Token Panel */}
      <div className="bg-[#1c1530] border border-purple-900/50 rounded-xl p-6 space-y-6">
        <h3 className="text-base font-bold text-white">Quick Buy & Faucet Panel</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0f0b1a] p-4 rounded-xl border border-purple-900/40 space-y-2">
            <div className="text-xs text-purple-400">Your Balances</div>
            <div className="text-xl font-mono font-bold text-emerald-400">{userEth} ETH</div>
            <div className="text-xl font-mono font-bold text-sky-400">{userJuri.toLocaleString()} JURI</div>
          </div>

          <div className="bg-[#0f0b1a] p-4 rounded-xl border border-purple-900/40 space-y-3 md:col-span-2">
            <div className="text-xs text-purple-300 flex justify-between">
              <span>Exchange Rate: <strong className="text-purple-200">1 ETH = 10,000 JURI (dummy)</strong></span>
            </div>
            <form onSubmit={handleQuickBuy} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 w-full relative">
                <input
                  type="number"
                  step="0.0001"
                  value={quickEth}
                  onChange={(e) => setQuickEth(e.target.value)}
                  className="w-full bg-[#1c1530] border border-purple-800/50 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none min-h-[44px]"
                  placeholder="0.1"
                />
                <span className="absolute right-3 top-2.5 text-xs text-purple-400 font-bold">ETH</span>
              </div>
              <div className="text-xs font-mono text-sky-400 shrink-0">
                + {quickJuriPreview.toLocaleString()} JURI
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors min-h-[44px] shrink-0"
              >
                Buy JURI
              </button>
              <button
                type="button"
                onClick={handleFaucet}
                className="w-full sm:w-auto bg-purple-950/80 hover:bg-purple-900 border border-purple-700/50 text-purple-200 text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors min-h-[44px] flex items-center justify-center gap-1 shrink-0"
              >
                <Droplet className="w-3.5 h-3.5 text-sky-400" />
                Faucet (+5k)
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Court Table (Desktop Table / Mobile Stacked Cards per C6) */}
      <div className="bg-[#1c1530] border border-purple-900/50 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-purple-900/40">
          <h3 className="text-lg font-bold text-white">Available Courts</h3>
          <p className="text-xs text-purple-300">Select a court to stake JURI or manage your existing stake.</p>
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#140e24] text-purple-300 border-b border-purple-900/40 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4">Court Name</th>
                <th className="py-3 px-4">Min Stake</th>
                <th className="py-3 px-4">Fee / Juror</th>
                <th className="py-3 px-4">Total Staked</th>
                <th className="py-3 px-4">Your Stake</th>
                <th className="py-3 px-4">Draw Chance</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-900/30 text-purple-200">
              {state?.courts?.map((court) => {
                const totalStaked = court.totalStaked || 0;
                const userStake = state?.stake?.[court.id]?.[account] || 0;
                const drawChance = totalStaked > 0 && userStake > 0 ? ((userStake / totalStaked) * 100).toFixed(1) + '%' : '0%';
                const feeEth = (court.feePerJuror / 1000000).toFixed(4);

                return (
                  <React.Fragment key={court.id}>
                    <tr className="hover:bg-purple-900/20 transition-colors">
                      <td className="py-4 px-4 font-semibold text-white flex items-center gap-2">
                        <span>{court.name}</span>
                        <button
                          onClick={() => setExpandedPolicyCourtId(expandedPolicyCourtId === court.id ? null : court.id)}
                          className="text-purple-400 hover:text-purple-200 p-1"
                          title="Toggle court policy"
                        >
                          {expandedPolicyCourtId === court.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="py-4 px-4 font-mono">{court.minStake.toLocaleString()} JURI</td>
                      <td className="py-4 px-4 font-mono text-emerald-400">{feeEth} ETH</td>
                      <td className="py-4 px-4 font-mono">{totalStaked.toLocaleString()} JURI</td>
                      <td className="py-4 px-4 font-mono font-bold text-sky-400">{userStake.toLocaleString()} JURI</td>
                      <td className="py-4 px-4 font-mono text-purple-300">{drawChance}</td>
                      <td className="py-4 px-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedCourtForStake(court)}
                          className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors min-h-[44px]"
                        >
                          Join / Stake
                        </button>
                        {userStake > 0 && (
                          <button
                            onClick={() => handleUnstake(court.id, userStake)}
                            className="bg-purple-950/80 hover:bg-purple-900 border border-purple-700/50 text-purple-300 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors min-h-[44px]"
                          >
                            Unstake
                          </button>
                        )}
                      </td>
                    </tr>
                    {expandedPolicyCourtId === court.id && (
                      <tr className="bg-[#0f0b1a]/80">
                        <td colSpan="7" className="p-4 text-xs text-purple-300 border-b border-purple-900/40">
                          <strong className="text-purple-200 block mb-1">Court Policy:</strong>
                          <p className="leading-relaxed">{court.policy}</p>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Cards below 640px per C6 */}
        <div className="sm:hidden p-4 space-y-4">
          {state?.courts?.map((court) => {
            const totalStaked = court.totalStaked || 0;
            const userStake = state?.stake?.[court.id]?.[account] || 0;
            const drawChance = totalStaked > 0 && userStake > 0 ? ((userStake / totalStaked) * 100).toFixed(1) + '%' : '0%';
            const feeEth = (court.feePerJuror / 1000000).toFixed(4);

            return (
              <div key={court.id} className="bg-[#0f0b1a] border border-purple-900/40 rounded-xl p-4 space-y-3 text-xs">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-white text-sm">{court.name}</h4>
                  <span className="font-mono text-emerald-400 font-semibold">{feeEth} ETH</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-purple-300">
                  <div>Min Stake: <strong className="text-purple-200 font-mono">{court.minStake.toLocaleString()} JURI</strong></div>
                  <div>Total Staked: <strong className="text-purple-200 font-mono">{totalStaked.toLocaleString()} JURI</strong></div>
                  <div>Your Stake: <strong className="text-sky-400 font-mono">{userStake.toLocaleString()} JURI</strong></div>
                  <div>Draw Chance: <strong className="text-purple-200 font-mono">{drawChance}</strong></div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => setSelectedCourtForStake(court)}
                    className="flex-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium py-2.5 rounded-lg transition-colors min-h-[44px]"
                  >
                    Join / Stake
                  </button>
                  {userStake > 0 && (
                    <button
                      onClick={() => handleUnstake(court.id, userStake)}
                      className="flex-1 bg-purple-950/80 hover:bg-purple-900 border border-purple-700/50 text-purple-300 text-xs font-medium py-2.5 rounded-lg transition-colors min-h-[44px]"
                    >
                      Unstake
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <BuyJuriModal isOpen={buyModalOpen} onClose={() => setBuyModalOpen(false)} />
      <StakeModal court={selectedCourtForStake} isOpen={!!selectedCourtForStake} onClose={() => setSelectedCourtForStake(null)} />
    </div>
  );
}
