import React, { useState } from 'react';
import { useJuri } from '../lib/store';
import JuriDAO from '../lib/juridao-engine';
import { X, Coins, Droplet, Sparkles } from 'lucide-react';

export function BuyJuriModal({ isOpen, onClose }) {
  const { state, account, act, showToast } = useJuri();
  const [ethInput, setEthInput] = useState('0.1');

  if (!isOpen) return null;

  const currentAcc = state?.accounts?.[account] || { eth: 10000000, juri: 0 };
  const userEth = currentAcc.eth / 1000000;

  const parsedEth = parseFloat(ethInput) || 0;
  const ethMicro = Math.round(parsedEth * 1000000);
  const juriPreview = Math.floor(parsedEth * 10000);

  const handleBuy = (e) => {
    e.preventDefault();
    try {
      let juriReceived;
      act((s) => {
        juriReceived = JuriDAO.buyTokens(s, account, ethMicro);
      });
      showToast(`Bought ${juriReceived.toLocaleString()} JURI for ${parsedEth.toFixed(4)} ETH`, 'success');
      onClose();
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
            <Coins className="w-5 h-5 text-sky-400" />
            Buy JURI / Faucet
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-purple-400 hover:text-white hover:bg-purple-900/40 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleBuy} className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-purple-300">
              <label htmlFor="ethAmount" className="font-medium">ETH Amount to Spend</label>
              <span>Balance: <strong className="text-emerald-400 font-mono">{userEth.toFixed(4)} ETH</strong></span>
            </div>
            <div className="relative">
              <input
                id="ethAmount"
                type="number"
                step="0.0001"
                min="0.0001"
                max={userEth}
                value={ethInput}
                onChange={(e) => setEthInput(e.target.value)}
                className="w-full bg-[#0f0b1a] border border-purple-800/50 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[44px]"
                placeholder="0.1"
              />
              <span className="absolute right-4 top-3 text-xs font-bold text-purple-400 uppercase">ETH</span>
            </div>
          </div>

          <div className="bg-[#0f0b1a] border border-purple-900/50 rounded-xl p-4 flex items-center justify-between">
            <div className="text-xs text-purple-300">
              <div>Preview Receive</div>
              <div className="text-xs opacity-75">1 ETH = 10,000 JURI</div>
            </div>
            <div className="text-xl font-black text-sky-400 font-mono">
              + {juriPreview.toLocaleString()} JURI
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={handleFaucet}
              className="bg-purple-950/80 hover:bg-purple-900 border border-purple-700/50 text-purple-200 font-medium py-3 px-4 rounded-xl transition-colors text-xs sm:text-sm flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Droplet className="w-4 h-4 text-sky-400" />
              Free Faucet (+5k)
            </button>
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-purple-900/40 text-xs sm:text-sm flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Sparkles className="w-4 h-4" />
              Buy JURI
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
