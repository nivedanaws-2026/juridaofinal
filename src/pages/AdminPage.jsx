import React, { useState } from 'react';
import { useJuri } from '../lib/store';
import JuriDAO from '../lib/juridao-engine';
import { runSelfTest } from '../lib/selftest';
import { FlowTestRunner } from '../components/FlowTestRunner';
import { CheckCircle2, XCircle, Play, RefreshCw, FastForward, Droplet, ShieldCheck, RotateCcw, Clock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AdminPage() {
  const { state, setState, act, showToast } = useJuri();
  const [selfTestResults, setSelfTestResults] = useState(null);
  const [isRunningSelfTest, setIsRunningSelfTest] = useState(false);

  const handleRunSelfTest = () => {
    setIsRunningSelfTest(true);
    setTimeout(() => {
      try {
        const res = runSelfTest(JuriDAO);
        setSelfTestResults(res);
      } catch (err) {
        console.error("Self test error:", err);
      } finally {
        setIsRunningSelfTest(false);
      }
    }, 50);
  };

  const handleSkipPeriod = (disputeId) => {
    try {
      act((s) => {
        JuriDAO.skipPeriod(s, disputeId);
      });
      showToast(`Skipped phase for Dispute #${disputeId}`, 'success');
    } catch (err) {
      // Error handled by act() toast
    }
  };

  const handleSkipTime = (seconds) => {
    try {
      act((s) => {
        JuriDAO.skipTime(s, seconds);
      });
      showToast(`Fast forwarded time by ${seconds} seconds`, 'success');
    } catch (err) {
      // Error handled by act() toast
    }
  };

  const handleFaucetAll = () => {
    try {
      act((s) => {
        Object.keys(s.accounts).forEach((id) => {
          JuriDAO.faucet(s, id);
        });
      });
      showToast('Gave +5,000 JURI faucet to all accounts', 'success');
    } catch (err) {
      // Error handled by act() toast
    }
  };

  const handleAutoStakeAll = () => {
    try {
      act((s) => {
        const jurors = ['juror1', 'juror2', 'juror3', 'juror4', 'juror5', 'juror6', 'juror7'];
        jurors.forEach((id) => {
          const currentStake = s.stake?.[2]?.[id] || 0;
          if (currentStake < 1000) {
            JuriDAO.faucet(s, id);
            JuriDAO.stakeJuri(s, id, 2, 1000);
          }
        });
      });
      showToast('Auto-staked jurors 1-7 with 1,000 JURI in Court 2', 'success');
    } catch (err) {
      // Error handled by act() toast
    }
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset demo state to initial empty state? This wipes active disputes and deals.')) {
      try {
        const freshState = JuriDAO.createInitialState();
        setState(freshState);
        localStorage.removeItem('juridao_state_v2');
        showToast('Demo state reset to initial preflight state', 'info');
      } catch (err) {
        showToast('Failed to reset demo state', 'error');
      }
    }
  };

  const passCount = selfTestResults ? selfTestResults.filter(r => r.ok).length : 0;
  const totalCount = selfTestResults ? selfTestResults.length : 0;
  const disputes = state?.disputes || [];
  const recentLogs = state?.log ? [...state.log].reverse().slice(0, 50) : [];

  return (
    <div className="space-y-8 py-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Demo Admin Controls</h1>
          <p className="text-sm text-purple-300">
            Simulated environment utilities, time manipulation, self-tests, and live logs.
          </p>
        </div>
        <Link
          to="/testlab"
          className="bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-700/50 px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] flex items-center gap-1.5"
        >
          Open Test Lab →
        </Link>
      </div>

      {/* Global Utilities Card */}
      <div className="bg-[#1c1530] border border-purple-900/50 rounded-xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white">Global Demo Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleSkipTime(60)}
            className="bg-purple-950 hover:bg-purple-900 border border-purple-700/50 text-purple-200 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 min-h-[44px]"
          >
            <FastForward className="w-4 h-4 text-sky-400" />
            Fast Forward 60s
          </button>
          <button
            onClick={handleFaucetAll}
            className="bg-purple-950 hover:bg-purple-900 border border-purple-700/50 text-purple-200 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 min-h-[44px]"
          >
            <Droplet className="w-4 h-4 text-sky-400" />
            Faucet All Accounts (+5k)
          </button>
          <button
            onClick={handleAutoStakeAll}
            className="bg-purple-950 hover:bg-purple-900 border border-purple-700/50 text-purple-200 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 min-h-[44px]"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Auto-stake All Jurors (1-7 in Court 2)
          </button>
          <button
            onClick={handleResetDemo}
            className="bg-rose-950/80 hover:bg-rose-900 border border-rose-800/60 text-rose-300 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 min-h-[44px] ml-auto"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Demo State
          </button>
        </div>
      </div>

      {/* Per-Dispute Phase Controls */}
      <div className="bg-[#1c1530] border border-purple-900/50 rounded-xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white">Active Dispute Phase Controls</h3>
        {disputes.length === 0 ? (
          <p className="text-xs text-purple-400">No active disputes to control.</p>
        ) : (
          <div className="space-y-3">
            {disputes.map((d) => {
              const periodEnd = JuriDAO.periodEnd(state, d);
              return (
                <div key={d.id} className="p-4 rounded-xl bg-[#0f0b1a] border border-purple-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-white text-sm">Dispute #{d.id}</strong>
                      <span className="bg-purple-950 px-2 py-0.5 rounded text-purple-300 border border-purple-800/40">
                        {d.period}
                      </span>
                      <span className="text-purple-400">Round {d.round + 1}</span>
                    </div>
                    <p className="text-purple-300">{d.question}</p>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Link to={`/disputes/${d.id}`} className="text-purple-400 hover:text-white flex items-center gap-1">
                      <ExternalLink className="w-3.5 h-3.5" />
                      View
                    </Link>
                    <button
                      onClick={() => handleSkipPeriod(d.id)}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 min-h-[44px]"
                    >
                      <FastForward className="w-3.5 h-3.5" />
                      Skip Current Phase
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Engine Self-Test Section */}
      <div className="bg-[#1c1530] border border-purple-900/50 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Engine Self-Test (7 Tests)
            </h3>
            <p className="text-xs text-purple-300">
              Verifies core engine invariants using selftest.js.
            </p>
          </div>
          <button
            onClick={handleRunSelfTest}
            disabled={isRunningSelfTest}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 min-h-[44px]"
          >
            {isRunningSelfTest ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Run engine self-test
          </button>
        </div>

        {selfTestResults && (
          <div className="space-y-3 pt-2">
            <div className={`p-4 rounded-lg border flex items-center gap-3 ${
              passCount === totalCount ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-200' : 'bg-rose-950/60 border-rose-700/60 text-rose-200'
            }`}>
              {passCount === totalCount ? <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" /> : <XCircle className="w-6 h-6 text-rose-400 shrink-0" />}
              <div>
                <div className="font-bold text-base">{passCount} of {totalCount} passed</div>
                <div className="text-xs opacity-80">
                  {passCount === totalCount ? "Engine core functions intact." : "Engine test failures detected."}
                </div>
              </div>
            </div>

            <div className="space-y-2 border border-purple-900/40 rounded-lg p-2 bg-[#0f0b1a]">
              {selfTestResults.map((r, i) => (
                <div key={i} className="p-2.5 rounded bg-[#1c1530] border border-purple-900/30 flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2">
                    {r.ok ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-semibold text-purple-200">{r.name}</span>
                      <p className="text-purple-400 mt-0.5 font-mono text-[11px]">{r.detail}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold shrink-0 ${
                    r.ok ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}>
                    {r.ok ? 'PASS' : 'FAIL'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Flow Test Runner */}
      <FlowTestRunner />

      {/* Live Event Log */}
      <div className="bg-[#1c1530] border border-purple-900/50 rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-white">Live Event Log (Last 50 Entries)</h3>
        <div className="max-h-80 overflow-y-auto space-y-2 bg-[#0f0b1a] p-3 rounded-lg border border-purple-900/40 font-mono text-xs text-purple-300">
          {recentLogs.length === 0 ? (
            <p className="text-purple-500 italic">No events logged yet.</p>
          ) : (
            recentLogs.map((entry, idx) => (
              <div key={idx} className="p-2 rounded bg-[#1c1530] border border-purple-900/30">
                <span className="text-sky-400 font-bold">[{new Date(entry.t * 1000).toLocaleTimeString()}]</span>{' '}
                <span className="text-purple-200 uppercase font-bold">{entry.type}</span> - {JSON.stringify(entry)}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
