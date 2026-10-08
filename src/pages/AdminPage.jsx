import React, { useState } from 'react';
import { useJuri } from '../lib/store';
import JuriDAO from '../lib/juridao-engine';
import { runSelfTest } from '../lib/selftest';
import { FlowTestRunner } from '../components/FlowTestRunner';
import { CheckCircle2, XCircle, Play, RefreshCw, AlertCircle } from 'lucide-react';

export function AdminPage() {
  const { state, act, showToast } = useJuri();
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

  const passCount = selfTestResults ? selfTestResults.filter(r => r.ok).length : 0;
  const totalCount = selfTestResults ? selfTestResults.length : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Demo Admin Controls</h1>
          <p className="text-sm text-purple-300">
            Simulated environment utilities, time manipulation, self-tests, and live logs.
          </p>
        </div>
        <a
          href="/testlab"
          className="bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-700/50 px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] flex items-center"
        >
          Open Test Lab →
        </a>
      </div>

      {/* Engine Self-Test Section */}
      <div className="bg-[#1c1530] border border-purple-900/50 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Engine Self-Test (7 Tests)
            </h3>
            <p className="text-xs text-purple-300">
              Verifies original engine functions using selftest.js.
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
    </div>
  );
}
