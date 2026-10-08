import React, { useState } from 'react';
import JuriDAO from '../lib/juridao-engine';
import { runFlowTests } from '../lib/flowtests';
import { CheckCircle2, XCircle, Play, Download, Copy, RefreshCw } from 'lucide-react';

export function FlowTestRunner() {
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRunTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      try {
        const res = runFlowTests(JuriDAO);
        setResults(res);
      } catch (err) {
        console.error("Flow test execution error:", err);
      } finally {
        setIsRunning(false);
      }
    }, 50);
  };

  const passCount = results ? results.filter(r => r.ok).length : 0;
  const totalCount = results ? results.length : 0;

  const generateReportText = () => {
    if (!results) return "";
    const dateStr = new Date().toISOString();
    let text = `JuriDAO Flow Test Report - ${dateStr}\n`;
    text += `Summary: ${passCount} of ${totalCount} passed\n\n`;
    results.forEach((r, idx) => {
      text += `${idx + 1}. [${r.ok ? 'PASS' : 'FAIL'}] ${r.name}\n   Detail: ${r.detail}\n`;
    });
    return text;
  };

  const handleCopy = () => {
    const report = generateReportText();
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const report = generateReportText();
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `juridao-flow-test-report-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#1c1530] border border-purple-900/50 rounded-xl p-6 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Automated Flow Tests (21 Tests)
          </h3>
          <p className="text-xs text-purple-300">
            Runs 21 end-to-end scenarios against throwaway engine states.
          </p>
        </div>
        <button
          onClick={handleRunTests}
          disabled={isRunning}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 min-h-[44px]"
        >
          {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          Run all flow tests
        </button>
      </div>

      {results && (
        <div className="space-y-4 pt-2">
          {/* Summary Badge */}
          <div className={`p-4 rounded-lg border flex items-center justify-between ${
            passCount === totalCount ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-200' : 'bg-rose-950/60 border-rose-700/60 text-rose-200'
          }`}>
            <div className="flex items-center gap-3">
              {passCount === totalCount ? <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" /> : <XCircle className="w-6 h-6 text-rose-400 shrink-0" />}
              <div>
                <div className="font-bold text-base">{passCount} of {totalCount} passed</div>
                <div className="text-xs opacity-80">
                  {passCount === totalCount ? "All browser flow test assertions clean." : "Some flow assertions failed."}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-700/50 px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1 min-h-[36px]"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Copied!' : 'Copy report'}
              </button>
              <button
                onClick={handleDownload}
                className="bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-700/50 px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1 min-h-[36px]"
              >
                <Download className="w-3.5 h-3.5" />
                Download (.txt)
              </button>
            </div>
          </div>

          {/* Test list */}
          <div className="max-h-96 overflow-y-auto space-y-2 border border-purple-900/40 rounded-lg p-2 bg-[#0f0b1a]">
            {results.map((r, i) => (
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
  );
}
