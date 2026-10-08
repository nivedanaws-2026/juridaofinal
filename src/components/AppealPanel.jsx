import React, { useState } from 'react';
import { useJuri } from '../lib/store';
import JuriDAO from '../lib/juridao-engine';
import { ShieldAlert, Lock } from 'lucide-react';

export function AppealPanel({ dispute }) {
  const { account, act, showToast, state } = useJuri();
  const [fundAmount1, setFundAmount1] = useState('');
  const [fundAmount2, setFundAmount2] = useState('');

  const currentRoundIndex = dispute.round;
  const currentRound = dispute.rounds[currentRoundIndex];
  const isAppealPeriod = dispute.period === 'Appeal';
  const isExecuted = dispute.period === 'Executed';
  const isLastRound = currentRoundIndex >= JuriDAO.MAX_ROUNDS - 1;

  const currentRuling = currentRound?.ruling;
  const numDraws = currentRound?.numDraws || 3;

  // Determine challenger / defender per side
  const side1IsChallenger = currentRuling !== 0 && currentRuling !== 1;
  const side2IsChallenger = currentRuling !== 0 && currentRuling !== 2;

  const req1 = currentRound?.required?.[1] || 0;
  const req2 = currentRound?.required?.[2] || 0;
  const funded1 = currentRound?.funded?.[1] || 0;
  const funded2 = currentRound?.funded?.[2] || 0;

  const rem1 = Math.max(0, req1 - funded1);
  const rem2 = Math.max(0, req2 - funded2);

  // Half window rule
  const now = JuriDAO.nowOf(state);
  const appealWindow = state?.params?.Appeal || 90;
  const elapsed = now - (dispute.periodStart || now);
  const inSecondHalf = elapsed > (appealWindow / 2);

  // Role checks — parties + funder can interact
  const isClient = account === dispute.partyA;
  const isFreelancer = account === dispute.partyB;
  const isJuror = !isClient && !isFreelancer;
  // Anyone with ETH balance can fund an appeal (parties or third-party funders)
  const canFund = isAppealPeriod && !isLastRound;

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
            {isClient && <span className="ml-2 text-sky-400 font-semibold">[You: Client / Sam]</span>}
            {isFreelancer && <span className="ml-2 text-emerald-400 font-semibold">[You: Freelancer / Deepa]</span>}
            {isJuror && <span className="ml-2 text-purple-400 font-semibold">[You: Third-party / Funder]</span>}
          </p>
        </div>
        {/* Only parties can execute — jurors are impartial */}
        {isAppealPeriod && (isClient || isFreelancer) && (
          <button
            onClick={handleExecute}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow min-h-[44px]"
          >
            Execute Ruling
          </button>
        )}
        {isAppealPeriod && isJuror && (
          <span className="text-[11px] bg-purple-950/80 border border-purple-800/40 text-purple-400 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
            <Lock className="w-3 h-3" />
            Only parties can execute ruling
          </span>
        )}
      </div>

      {isLastRound && (
        <div className="bg-purple-950/80 border border-purple-800/40 text-purple-300 text-xs p-3 rounded-lg font-semibold">
          No further appeals allowed (Max round limit of 3 reached).
        </div>
      )}

      {/* Juror viewing notice */}
      {isJuror && isAppealPeriod && !isLastRound && (
        <div className="bg-[#0f0b1a] border border-purple-900/30 rounded-xl p-3 text-xs text-purple-400 flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 shrink-0" />
          You are viewing as a third-party. You can fund either side as an appeal investor. Switch to <strong className="text-sky-300 mx-1">Sam (Client)</strong> or <strong className="text-emerald-300 mx-1">Deepa (Freelancer)</strong> to act as a party, or fund below as <strong className="text-amber-300 ml-1">{account}</strong>.
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

          {canFund && (
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
                Fund Side 1 {isFreelancer ? '(Your Side)' : isClient && side1IsChallenger ? '(Challenge)' : ''}
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

          {canFund && (
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
                Fund Side 2 {isClient ? '(Your Side)' : isFreelancer && side2IsChallenger ? '(Challenge)' : ''}
              </button>
              {side2IsChallenger && inSecondHalf && (
                <p className="text-[10px] text-rose-400">Challenger side disabled in second half of appeal window.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Withdraw Appeal Funds after Executed — only show if you contributed */}
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
                      Withdraw Round {rIdx + 1} Side {sNum} ({(contrib / 1000000).toFixed(4)} ETH Contributed)
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          {dispute.rounds?.every((r) => [1, 2].every((sNum) => (r.contrib?.[sNum]?.[account] || 0) === 0)) && (
            <p className="text-xs text-purple-500 italic">No appeal contributions to withdraw for account <strong>{account}</strong>.</p>
          )}
        </div>
      )}
    </div>
  );
}
