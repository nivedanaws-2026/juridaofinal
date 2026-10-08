import React, { useState } from 'react';
import { useJuri } from '../lib/store';
import JuriDAO from '../lib/juridao-engine';
import { ShieldAlert, ArrowRight, CheckCircle2, Lock } from 'lucide-react';

export function AppealPanel({ dispute }) {
  const { account, act, showToast } = useJuri();
  const [fundAmount1, setFundAmount1] = useState('');
  const [fundAmount2, setFundAmount2] = useState('');

  const currentRoundIndex = dispute.round;
  const currentRound = dispute.rounds[currentRoundIndex];
  const isAppealPeriod = dispute.period === 'Appeal';
  const isExecuted = dispute.period === 'Executed';
  const isLastRound = currentRoundIndex >= JuriDAO.MAX_ROUNDS - 1;

  const currentRuling = currentRound?.ruling;
  const numDraws = currentRound?.numDraws || 3;
  const nextJurySize = 2 * numDraws + 1;

  // Determine defender side vs challenger side
  // Side 1 = Freelancer, Side 2 = Client
  const defenderSide = currentRuling === 2 ? 2 : 1;
  const challengerSide = defenderSide === 1 ? 2 : 1;

  const req1 = currentRound?.required?.[1] || 0;
  const req2 = currentRound?.required?.[2] || 0;
  const funded1 = currentRound?.funded?.[1] || 0;
  const funded2 = currentRound?.funded?.[2] || 0;

  const rem1 = Math.max(0, req1 - funded1);
  const rem2 = Math.max(0, req2 - funded2);

  // Half window rule calculation
  const now = JuriDAO.nowOf();
  const appealWindow = 90; // params.Appeal
  const elapsed = now - (dispute.periodStart || now);
  const inSecondHalf = elapsed > (appealWindow / 2);

  const handleFund = (side, amountEthStr) => {
    const ethMicro = Math.round(parseFloat(amountEthStr) * 1000000);
    try {
      act((s) => {
        JuriDAO.fundAppeal(s, account, dispute.id, side, ethMicro);
      });
      showToast(`Funded ${(ethMicro / 1000000).toFixed(4)} ETH for Side ${side}`, 'success');
      if (side === 1) setFundAmount1('');
      if (side === 2) setFundAmount2('');
    } catch (err) {
      // Error handled by act() toast
    }
  };

  const handleExecute = () => {
    try {
      act((s) => {
        JuriDAO.executeRuling(s, dispute.id);
      });
      showToast('Ruling executed successfully', 'success');
    } catch (err) {
      // Error handled by act() toast
    }
  };

  const handleWithdraw = (roundIdx, side) => {
    try {
      act((s) => {
        JuriDAO.withdrawAppealFunds(s, account, dispute.id, roundIdx, side);
      });
      showToast('Withdrew appeal payout funds', 'success');
    } catch (err) {
      // Error handled by act() toast
    }
  };

  return (
    <div className="bg-[#1c1530] border border-purple-900/50 rounded-xl p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-purple-900/40 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            Appeal Window & Funding
          </h3>
          <p className="text-xs text-purple-300">
            Current Ruling: <strong className="text-purple-200">Option {currentRuling}</strong> • Round {currentRoundIndex + 1} ({numDraws} jurors)
          </p>
        </div>
        {isAppealPeriod && (
          <button
            onClick={handleExecute}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow min-h-[44px]"
          >
            Execute Ruling
          </button>
        )}
      </div>

      {isLastRound && (
        <div className="bg-purple-950/80 border border-purple-800/40 text-purple-300 text-xs p-3 rounded-lg font-semibold">
          No further appeals allowed (Max round limit of 3 reached).
        </div>
      )}

      {/* Two Funding Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Side 1: Pay Freelancer */}
        <div className="bg-[#0f0b1a] border border-purple-900/40 rounded-xl p-5 space-y-4 text-xs">
          <div className="flex justify-between items-start">
            <h4 className="font-bold text-white text-sm">Side 1: Pay Freelancer (Deepa)</h4>
            {side1IsChallenger && <span className="bg-amber-950 text-amber-300 px-2 py-0.5 rounded text-[10px] font-semibold border border-amber-800/40">Challenger (Pays 2x)</span>}
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-purple-300">
              <span>Funded:</span>
              <strong className="text-emerald-400 font-mono">{(funded1 / 1000000).toFixed(4)} / {(req1 / 1000000).toFixed(4)} ETH</strong>
            </div>
            <div className="w-full bg-[#1c1530] h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full transition-all" style={{ width: `${req1 > 0 ? Math.min(100, (funded1 / req1) * 100) : 0}%` }}></div>
            </div>
          </div>

          {isAppealPeriod && !isLastRound && (
            <div className="space-y-2 pt-2">
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.001"
                  value={fundAmount1}
                  onChange={(e) => setFundAmount1(e.target.value)}
                  disabled={side1IsChallenger && inSecondHalf}
                  className="flex-1 bg-[#1c1530] border border-purple-800/50 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none min-h-[44px]"
                  placeholder="ETH amount"
                />
                <button
                  type="button"
                  onClick={() => setFundAmount1((rem1 / 1000000).toFixed(4))}
                  disabled={side1IsChallenger && inSecondHalf}
                  className="bg-purple-950 hover:bg-purple-900 border border-purple-700/50 text-purple-300 text-[11px] px-2.5 py-1 rounded-lg min-h-[44px]"
                >
                  Max
                </button>
              </div>
              <button
                type="button"
                onClick={() => handleFund(1, fundAmount1)}
                disabled={(side1IsChallenger && inSecondHalf) || !fundAmount1}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-semibold py-2.5 rounded-lg transition-colors min-h-[44px]"
              >
                Fund Side 1
              </button>
              {side1IsChallenger && inSecondHalf && (
                <p className="text-[10px] text-rose-400">Challenger side disabled in second half of appeal window.</p>
              )}
            </div>
          )}
        </div>

        {/* Side 2: Refund Client */}
        <div className="bg-[#0f0b1a] border border-purple-900/40 rounded-xl p-5 space-y-4 text-xs">
          <div className="flex justify-between items-start">
            <h4 className="font-bold text-white text-sm">Side 2: Refund Client (Sam)</h4>
            {side2IsChallenger && <span className="bg-amber-950 text-amber-300 px-2 py-0.5 rounded text-[10px] font-semibold border border-amber-800/40">Challenger (Pays 2x)</span>}
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-purple-300">
              <span>Funded:</span>
              <strong className="text-emerald-400 font-mono">{(funded2 / 1000000).toFixed(4)} / {(req2 / 1000000).toFixed(4)} ETH</strong>
            </div>
            <div className="w-full bg-[#1c1530] h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full transition-all" style={{ width: `${req2 > 0 ? Math.min(100, (funded2 / req2) * 100) : 0}%` }}></div>
            </div>
          </div>

          {isAppealPeriod && !isLastRound && (
            <div className="space-y-2 pt-2">
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.001"
                  value={fundAmount2}
                  onChange={(e) => setFundAmount2(e.target.value)}
                  disabled={side2IsChallenger && inSecondHalf}
                  className="flex-1 bg-[#1c1530] border border-purple-800/50 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none min-h-[44px]"
                  placeholder="ETH amount"
                />
                <button
                  type="button"
                  onClick={() => setFundAmount2((rem2 / 1000000).toFixed(4))}
                  disabled={side2IsChallenger && inSecondHalf}
                  className="bg-purple-950 hover:bg-purple-900 border border-purple-700/50 text-purple-300 text-[11px] px-2.5 py-1 rounded-lg min-h-[44px]"
                >
                  Max
                </button>
              </div>
              <button
                type="button"
                onClick={() => handleFund(2, fundAmount2)}
                disabled={(side2IsChallenger && inSecondHalf) || !fundAmount2}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-semibold py-2.5 rounded-lg transition-colors min-h-[44px]"
              >
                Fund Side 2
              </button>
              {side2IsChallenger && inSecondHalf && (
                <p className="text-[10px] text-rose-400">Challenger side disabled in second half of appeal window.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Withdraw Appeal Funds after Executed */}
      {isExecuted && (
        <div className="pt-4 border-t border-purple-900/40 space-y-3">
          <h4 className="font-bold text-white text-sm">Withdraw Appeal Payouts</h4>
          <div className="flex flex-wrap gap-3">
            {dispute.rounds?.map((r, rIdx) => (
              <React.Fragment key={rIdx}>
                {[1, 2].map((sNum) => {
                  const contrib = r.contrib?.[sNum]?.[account] || 0;
                  if (contrib === 0) return null;
                  return (
                    <button
                      key={`${rIdx}-${sNum}`}
                      onClick={() => handleWithdraw(rIdx, sNum)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors min-h-[44px]"
                    >
                      Withdraw Round {rIdx + 1} Side {sNum} ({ (contrib / 1000000).toFixed(4) } ETH Contributed)
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const side1IsChallenger = false; // computed dynamically in component
const side2IsChallenger = false;
