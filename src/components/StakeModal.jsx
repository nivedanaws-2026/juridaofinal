import React, { useState } from 'react';
import { useJuri } from '../lib/store';
import JuriDAO from '../lib/juridao-engine';
import { X, ShieldCheck, Lock } from 'lucide-react';

export function StakeModal({ court, isOpen, onClose }) {
  const { state, account, act, showToast } = useJuri();
  const [amountInput, setAmountInput] = useState('1000');

  if (!isOpen || !court) return null;

  const currentAcc = state?.accounts?.[account] || { juri: 0 };
  const userJuri = currentAcc.juri;
  const currentStaked = state?.stake?.[court.id]?.[account] || 0;

  const handleStake = (e) => {
    e.preventDefault();
    const amount = parseInt(amountInput, 10) || 0;
    try {
      act((s) => {
        JuriDAO.stakeJuri(s, account, court.id, amount);
      });
      showToast(`Staked ${amount.toLocaleString()} JURI in ${court.name}`, 'success');
      onClose();
    } catch (err) {
      // Error handled by act() toast
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1c1530] border border-purple-800/60 w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 space-y-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-purple-900/40 pb-4">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            Stake in {court.name}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-purple-400 hover:text-white hover:bg-purple-900/40 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleStake} className="space-y-4">
          <div className="bg-[#0f0b1a] p-4 rounded-xl border border-purple-900/40 space-y-1 text-xs text-purple-300">
            <div className="flex justify-between">
              <span>Court Minimum Stake:</span>
              <strong className="text-purple-200 font-mono">{court.minStake.toLocaleString()} JURI</strong>
            </div>
            <div className="flex justify-between">
              <span>Your Current Stake:</span>
              <strong className="text-sky-400 font-mono">{currentStaked.toLocaleString()} JURI</strong>
            </div>
            <div className="flex justify-between">
              <span>Available JURI Balance:</span>
              <strong className="text-emerald-400 font-mono">{userJuri.toLocaleString()} JURI</strong>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="stakeAmount" className="block text-xs font-medium text-purple-300">
              JURI Amount to Add
            </label>
            <input
              id="stakeAmount"
              type="number"
              min="1"
              max={userJuri}
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              className="w-full bg-[#0f0b1a] border border-purple-800/50 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[44px]"
              placeholder="1000"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-purple-950/80 hover:bg-purple-900 border border-purple-700/50 text-purple-200 font-medium py-2.5 px-4 rounded-xl text-xs sm:text-sm min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2.5 px-6 rounded-xl text-xs sm:text-sm shadow-lg shadow-purple-900/40 min-h-[44px]"
            >
              Add Stake
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
