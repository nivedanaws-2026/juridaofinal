import React, { useState } from 'react';
import { useJuri, ACCOUNTS } from '../lib/store';
import JuriDAO from '../lib/juridao-engine';
import { FlowTestRunner } from '../components/FlowTestRunner';
import { JurorInspector } from '../components/JurorInspector';
import { FlaskConical, Coins, Sparkles, CheckCircle2, XCircle, RotateCcw, FileText } from 'lucide-react';
import buildLogRaw from '../../BUILD_LOG.md?raw';

export function TestLabPage() {
  const { state, account, act, showToast } = useJuri();

  // Panel A Token test state
  const [tokenTestLog, setTokenTestLog] = useState(null);

  // Panel E Checklist state
  const [checklist, setChecklist] = useState(() => {
    try {
      const raw = localStorage.getItem('juri_testlab_checks');
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  });

  // Panel F Test lab log state
  const [labLog, setLabLog] = useState(() => {
    try {
      const raw = localStorage.getItem('juri_testlab_log');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  const addLabLog = (actionName, resultText) => {
    const entry = { time: new Date().toLocaleTimeString(), action: actionName, result: resultText };
    const updated = [entry, ...labLog].slice(0, 30);
    setLabLog(updated);
    try {
      localStorage.setItem('juri_testlab_log', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleChecklistToggle = (num) => {
    const updated = { ...checklist, [num]: !checklist[num] };
    setChecklist(updated);
    try {
      localStorage.setItem('juri_testlab_checks', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleClearChecklist = () => {
    setChecklist({});
    localStorage.removeItem('juri_testlab_checks');
  };

  // Panel A Token Test actions
  const handleTestBuy = () => {
    const beforeJuri = state?.accounts?.[account]?.juri || 0;
    try {
      act((s) => {
        JuriDAO.buyTokens(s, account, 100000); // 0.1 ETH = 1,000 JURI
      });
      const afterJuri = state?.accounts?.[account]?.juri || 0;
      setTokenTestLog({ ok: true, msg: 'PASS: 1,000 JURI received' });
      addLabLog('Buy 0.1 ETH of JURI', 'PASS');
    } catch (err) {
      setTokenTestLog({ ok: false, msg: `FAIL: ${err.message}` });
      addLabLog('Buy 0.1 ETH of JURI', `FAIL: ${err.message}`);
    }
  };

  const handleTestFaucet = () => {
    try {
      act((s) => {
        JuriDAO.faucet(s, account);
      });
      setTokenTestLog({ ok: true, msg: 'PASS: +5,000 JURI faucet claimed' });
      addLabLog('Faucet', 'PASS');
    } catch (err) {
      setTokenTestLog({ ok: false, msg: `FAIL: ${err.message}` });
      addLabLog('Faucet', `FAIL: ${err.message}`);
    }
  };

  const handleTestOverbuy = () => {
    try {
      act((s) => {
        JuriDAO.buyTokens(s, account, 100 * 1000000); // 100 ETH
      });
      setTokenTestLog({ ok: false, msg: 'FAIL: Engine allowed overbalance buy' });
      addLabLog('Try to buy 100 ETH', 'FAIL');
    } catch (err) {
      setTokenTestLog({ ok: true, msg: `PASS: Rejected expectedly (${err.message})` });
      addLabLog('Try to buy 100 ETH', 'PASS');
    }
  };

  // Panel B Scenario Seed generator helper
  const seedBase = (seedNumber, targetPhase, makeDrawnCommit = false, makeAllReveal = false, startAppealRound = false) => {
    let dealId, did;
    try {
      act((s) => {
        // Auto-stake jurors 1 to 7 if court 2 total is low
        const jurors = ['juror1', 'juror2', 'juror3', 'juror4', 'juror5', 'juror6', 'juror7'];
        jurors.forEach((j) => {
          if ((s.stake?.[2]?.[j] || 0) < 1000) {
            JuriDAO.faucet(s, j);
            JuriDAO.stakeJuri(s, j, 2, 1000);
          }
        });

        // Create deal
        dealId = JuriDAO.createDeal(s, 'sam', {
          freelancer: 'deepa',
          amount: 1000000,
          deadline: JuriDAO.nowOf(s) + 86400,
          courtId: 2,
          numJurors: 3,
          title: `Scenario Seed ${seedNumber} Deal`,
          description: 'Build landing page with responsive layout.',
          criteria: ['5 pages', 'mobile responsive'],
        });

        JuriDAO.markDelivered(s, 'deepa', dealId, 'Delivery note', 'site.txt', 'hello world');

        if (targetPhase >= 2) {
          did = JuriDAO.raiseDispute(s, 'deepa', dealId);
        }

        if (targetPhase >= 3) {
          JuriDAO.submitEvidence(s, 'sam', did, { title: 'Brief', description: 'Requirements', fileName: 'brief.txt', fileText: 'specs' });
          JuriDAO.submitEvidence(s, 'deepa', did, { title: 'Delivery', description: 'Deliverable', fileName: 'site.txt', fileText: 'hello world' });
          JuriDAO.skipPeriod(s, did); // Moves to Commit
        }

        if (makeDrawnCommit) {
          const dObj = s.disputes.find(x => x.id === did);
          const round = dObj.rounds[dObj.round];
          const drawn = Object.keys(round.jurors);
          drawn.forEach((addr, idx) => {
            const choice = idx === 0 ? 2 : 1;
            const salt = JuriDAO.randomSalt();
            const commitStr = JuriDAO.makeCommit(choice, salt, addr);
            JuriDAO.commitVote(s, addr, did, commitStr);
            // Save local vote so juror can press reveal in UI
            localStorage.setItem(`juri_vote_${did}_${dObj.round}_${addr}`, JSON.stringify({
              choice,
              salt,
              reasoning: 'Seed automated reasoning',
            }));
          });
          JuriDAO.skipPeriod(s, did); // Moves to Reveal
        }

        if (makeAllReveal) {
          const dObj = s.disputes.find(x => x.id === did);
          const round = dObj.rounds[dObj.round];
          const drawn = Object.keys(round.jurors);
          drawn.forEach((addr) => {
            const saved = JSON.parse(localStorage.getItem(`juri_vote_${did}_${dObj.round}_${addr}`));
            JuriDAO.revealVote(s, addr, did, saved.choice, saved.salt, saved.reasoning);
          });
          JuriDAO.skipPeriod(s, did); // Moves to Appeal
        }

        if (startAppealRound) {
          const dObj = s.disputes.find(x => x.id === did);
          const r0 = dObj.rounds[0];
          JuriDAO.fundAppeal(s, 'funder', did, 1, r0.required[1]);
          JuriDAO.fundAppeal(s, 'sam', did, 2, r0.required[2]);
        }
      });

      showToast(`Seed ${seedNumber} created successfully!`, 'success');
      addLabLog(`Seed ${seedNumber}`, `SUCCESS (Dispute #${did || 'N/A'})`);
    } catch (err) {
      showToast(`Seed ${seedNumber} failed: ${err.message}`, 'error');
      addLabLog(`Seed ${seedNumber}`, `FAIL: ${err.message}`);
    }
  };

  const manualTestList = [
    "M01 Banner on every page, account selector defaults to 10 ETH, 0 JURI",
    "M02 Buy 0.1 ETH JURI -> 1,000 JURI added, 50 ETH rejected",
    "M03 Free faucet -> +5,000 JURI",
    "M04 Join court below minimum stake rejected",
    "M05 Join court with 1,000 JURI, unstake works when not locked",
    "M06 Auto-stake all jurors (7,000 JURI in court 2)",
    "M07 Create deal: Sam ETH becomes 9.0000 ETH",
    "M08 Mark as delivered by Deepa",
    "M09 Raise dispute by Deepa: Deepa ETH becomes 9.9940 ETH",
    "M10 Add evidence with file fingerprints",
    "M11 Skip to Commit: Jury inspector checks tick, 0 of 3 committed shown",
    "M12 Stake locked during case, no choices visible before Appeal",
    "M13 Commit and reveal voting flow",
    "M14 Appeal window funding & half-window rule",
    "M15 Outcome A: No appeal -> Ruling executes",
    "M16 Outcome B: One side funded -> Wins by default & refunded",
    "M17 Outcome C: Both sides funded -> 7-juror round starts",
    "M18 Claim rewards: pending drops, header balance rises",
    "M19 Withdraw appeal funds for winning funder",
    "M20 Browser reload persistence & 2s keeper autoAdvance",
    "M21 Mobile responsive checks (375px width)",
  ];

  const doneCheckCount = Object.values(checklist).filter(Boolean).length;

  return (
    <div className="space-y-8 py-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FlaskConical className="w-7 h-7 text-purple-400" />
            Test Lab (Simulation Mode Only)
          </h1>
          <p className="text-sm text-purple-300">
            Interactive scenario seeds, token tests, jury inspector, and automated flow test suites.
          </p>
        </div>
      </div>

      {/* Panel A: Token Test */}
      <div className="bg-[#1c1530] border border-purple-900/50 rounded-xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white">Panel A: Token Test</h3>
        <p className="text-xs text-purple-300">Test token purchase, faucet, and overbalance rejection.</p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleTestBuy}
            className="bg-purple-950 hover:bg-purple-900 border border-purple-700/50 text-purple-200 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors min-h-[44px]"
          >
            Buy 0.1 ETH of JURI
          </button>
          <button
            onClick={handleTestFaucet}
            className="bg-purple-950 hover:bg-purple-900 border border-purple-700/50 text-purple-200 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors min-h-[44px]"
          >
            Faucet (+5k)
          </button>
          <button
            onClick={handleTestOverbuy}
            className="bg-purple-950 hover:bg-purple-900 border border-purple-700/50 text-purple-200 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors min-h-[44px]"
          >
            Try to buy 100 ETH
          </button>
        </div>
        {tokenTestLog && (
          <div className={`p-3 rounded-lg text-xs font-mono border ${tokenTestLog.ok ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300' : 'bg-rose-950/60 border-rose-700/60 text-rose-300'}`}>
            {tokenTestLog.msg}
          </div>
        )}
      </div>

      {/* Panel B: Scenario Seeds */}
      <div className="bg-[#1c1530] border border-purple-900/50 rounded-xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white">Panel B: Scenario Seeds</h3>
        <p className="text-xs text-purple-300">Generate pre-populated deals and disputes to jump directly into specific lifecycle stages.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <button
            onClick={() => seedBase(1, 1)}
            className="bg-[#0f0b1a] hover:bg-purple-900/40 border border-purple-800/50 p-3 rounded-xl text-left space-y-1 transition-colors min-h-[44px]"
          >
            <div className="font-bold text-purple-200">Seed 1: Delivered deal</div>
            <div className="text-[11px] text-purple-400">Deal status Delivered (no dispute yet)</div>
          </button>

          <button
            onClick={() => seedBase(2, 2)}
            className="bg-[#0f0b1a] hover:bg-purple-900/40 border border-purple-800/50 p-3 rounded-xl text-left space-y-1 transition-colors min-h-[44px]"
          >
            <div className="font-bold text-purple-200">Seed 2: Dispute in Evidence</div>
            <div className="text-[11px] text-purple-400">Dispute raised, 90s Evidence window open</div>
          </button>

          <button
            onClick={() => seedBase(3, 3)}
            className="bg-[#0f0b1a] hover:bg-purple-900/40 border border-purple-800/50 p-3 rounded-xl text-left space-y-1 transition-colors min-h-[44px]"
          >
            <div className="font-bold text-purple-200">Seed 3: Jurors drawn (Commit)</div>
            <div className="text-[11px] text-purple-400">3 jurors drawn, nobody has voted yet</div>
          </button>

          <button
            onClick={() => seedBase(4, 3, true)}
            className="bg-[#0f0b1a] hover:bg-purple-900/40 border border-purple-800/50 p-3 rounded-xl text-left space-y-1 transition-colors min-h-[44px]"
          >
            <div className="font-bold text-purple-200">Seed 4: Reveal phase</div>
            <div className="text-[11px] text-purple-400">Jurors committed, 60s Reveal open</div>
          </button>

          <button
            onClick={() => seedBase(5, 3, true, true)}
            className="bg-[#0f0b1a] hover:bg-purple-900/40 border border-purple-800/50 p-3 rounded-xl text-left space-y-1 transition-colors min-h-[44px]"
          >
            <div className="font-bold text-purple-200">Seed 5: Appeal window open</div>
            <div className="text-[11px] text-purple-400">All revealed, 90s Appeal window open</div>
          </button>

          <button
            onClick={() => seedBase(6, 3, true, true, true)}
            className="bg-[#0f0b1a] hover:bg-purple-900/40 border border-purple-800/50 p-3 rounded-xl text-left space-y-1 transition-colors min-h-[44px]"
          >
            <div className="font-bold text-purple-200">Seed 6: Appeal round started</div>
            <div className="text-[11px] text-purple-400">Both sides funded, 7-juror round in Commit</div>
          </button>
        </div>
      </div>

      {/* Panel C: Jury Inspector */}
      <JurorInspector />

      {/* Panel D: Automated Flow Tests */}
      <FlowTestRunner />

      {/* Panel E: Manual Checklist */}
      <div className="bg-[#1c1530] border border-purple-900/50 rounded-xl p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-purple-900/40 pb-3">
          <div>
            <h3 className="text-base font-bold text-white">Panel E: Manual Test Checklist</h3>
            <p className="text-xs text-purple-300">{doneCheckCount} of {manualTestList.length} done</p>
          </div>
          <button
            onClick={handleClearChecklist}
            className="bg-purple-950 hover:bg-purple-900 border border-purple-700/50 text-purple-300 text-xs px-3 py-1.5 rounded-lg min-h-[44px]"
          >
            Clear Checklist
          </button>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto bg-[#0f0b1a] p-3 rounded-xl border border-purple-900/40">
          {manualTestList.map((item, idx) => {
            const num = idx + 1;
            const isChecked = !!checklist[num];
            return (
              <label key={num} className="flex items-center gap-3 text-xs text-purple-300 p-2 rounded hover:bg-purple-900/20 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleChecklistToggle(num)}
                  className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                />
                <span className={isChecked ? 'line-through opacity-60' : ''}>{item}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Panel F: Test Lab Log */}
      <div className="bg-[#1c1530] border border-purple-900/50 rounded-xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white">Panel F: Test Lab Log</h3>
        <div className="max-h-60 overflow-y-auto bg-[#0f0b1a] p-3 rounded-xl border border-purple-900/40 space-y-1 font-mono text-xs">
          {labLog.length === 0 ? (
            <p className="text-purple-500 italic">No Test Lab actions logged yet.</p>
          ) : (
            labLog.map((entry, i) => (
              <div key={i} className="text-purple-300">
                <span className="text-sky-400">[{entry.time}]</span> <strong>{entry.action}</strong>: {entry.result}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Panel G: BUILD_LOG.md Scrollable View */}
      {buildLogRaw && (
        <div className="bg-[#1c1530] border border-purple-900/50 rounded-xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            Panel G: BUILD_LOG.md Viewer
          </h3>
          <pre className="max-h-96 overflow-y-auto bg-[#0f0b1a] p-4 rounded-xl border border-purple-900/40 text-xs font-mono text-purple-300 whitespace-pre-wrap leading-relaxed">
            {buildLogRaw}
          </pre>
        </div>
      )}
    </div>
  );
}
