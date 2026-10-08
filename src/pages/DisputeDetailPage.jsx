import React, { useState } from 'react';
import { useJuri, ACCOUNTS } from '../lib/store';
import JuriDAO from '../lib/juridao-engine';
import { useParams, Link } from 'react-router-dom';
import { PhaseTracker } from '../components/PhaseTracker';
import { EvidencePanel } from '../components/EvidencePanel';
import { AppealPanel } from '../components/AppealPanel';
import { Scale, Users, CheckCircle2, ChevronDown, ChevronUp, AlertCircle, Award } from 'lucide-react';

export function DisputeDetailPage() {
  const { id } = useParams();
  const disputeId = Number(id);
  const { state } = useJuri();

  const [historyOpen, setHistoryOpen] = useState(false);

  const dispute = state?.disputes?.find(d => d.id === disputeId);

  if (!dispute) {
    return (
      <div className="bg-[#1c1530] border border-purple-900/40 rounded-xl p-8 text-center text-purple-300">
        Dispute #{disputeId} not found.
      </div>
    );
  }

  const deal = state?.deals?.find(d => d.id === dispute.dealId);
  const court = state?.courts?.find(c => c.id === dispute.courtId);
  const currentRoundIndex = dispute.round;
  const currentRound = dispute.rounds[currentRoundIndex];
  const warningText = JuriDAO.disputeWarning(state, dispute);

  const periodEnd = JuriDAO.periodEnd(state, dispute);

  // Jurors drawn in current round
  const roundJurors = currentRound?.jurors || {};
  const drawnAddrs = Object.keys(roundJurors);
  const totalDraws = drawnAddrs.reduce((sum, addr) => sum + roundJurors[addr].draws, 0);

  const isExecuted = dispute.period === 'Executed';
  const showChoices = ['Appeal', 'Executed'].includes(dispute.period);

  // Check C3 parties excluded
  const partiesExcluded = !drawnAddrs.includes(dispute.partyA) && !drawnAddrs.includes(dispute.partyB);

  // Compute total committed / revealed counts
  const committedCount = drawnAddrs.filter(a => roundJurors[a].commit).length;
  const revealedCount = drawnAddrs.filter(a => roundJurors[a].revealed).length;

  return (
    <div className="space-y-8 py-2 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-purple-900/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">Dispute #{dispute.id}</h1>
            <span className="text-xs bg-purple-950/80 border border-purple-800/40 px-2.5 py-0.5 rounded text-purple-300">
              {court?.name || `Court ${dispute.courtId}`}
            </span>
          </div>
          <p className="text-xs text-purple-300">
            Deal #{dispute.dealId}: {deal?.title || 'Escrow Agreement'}
          </p>
        </div>
        <Link
          to={`/deals/${dispute.dealId}`}
          className="bg-purple-950/80 hover:bg-purple-900 border border-purple-700/50 text-purple-200 text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors min-h-[44px] flex items-center"
        >
          View Associated Deal →
        </Link>
      </div>

      {/* Phase Tracker */}
      <PhaseTracker
        period={dispute.period}
        periodEnd={periodEnd}
        periodStart={dispute.periodStart}
        params={state.params}
      />

      {/* Warning Box */}
      {warningText && (
        <div className="bg-amber-950/80 border border-amber-800/60 rounded-xl p-4 flex items-center gap-3 text-amber-200 text-xs">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{warningText}</span>
        </div>
      )}

      {/* Dispute Question & Answers Card */}
      <div className="bg-[#1c1530] border border-purple-900/50 rounded-2xl p-6 space-y-4">
        <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider">Dispute Question</h3>
        <p className="text-lg font-bold text-white bg-[#0f0b1a] p-4 rounded-xl border border-purple-900/40">
          {dispute.question}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-[#0f0b1a] p-4 rounded-xl border border-purple-900/30">
            <span className="font-bold text-white block text-sm mb-1">Answer 1: Pay Freelancer</span>
            <span className="text-purple-300">Releases locked deal escrow ({ (deal?.amount / 1000000).toFixed(4) } ETH) to Deepa.</span>
          </div>
          <div className="bg-[#0f0b1a] p-4 rounded-xl border border-purple-900/30">
            <span className="font-bold text-white block text-sm mb-1">Answer 2: Refund Client</span>
            <span className="text-purple-300">Refunds locked deal escrow ({ (deal?.amount / 1000000).toFixed(4) } ETH) to Sam.</span>
          </div>
        </div>
      </div>

      {/* Evidence Panel */}
      <EvidencePanel dispute={dispute} isExecuted={isExecuted} />

      {/* C3 Jury Assignment & Jurors Section */}
      {dispute.period !== 'Evidence' && (
        <div className="bg-[#1c1530] border border-purple-900/50 rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-purple-900/40 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-400" />
              Jury Panel (Round {currentRoundIndex + 1})
            </h3>
            <div className="text-xs font-mono text-purple-300">
              {showChoices ? `${revealedCount} of ${drawnAddrs.length} revealed` : `${committedCount} of ${drawnAddrs.length} committed`}
            </div>
          </div>

          {/* C3 "How the jury was drawn" Box */}
          <div className="bg-[#0f0b1a] border border-purple-900/40 rounded-xl p-5 space-y-3 text-xs">
            <h4 className="font-bold text-white text-sm">How the jury was drawn</h4>
            <div className="space-y-1.5 text-purple-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Jury size: <strong>{totalDraws} draws</strong> (Round {currentRoundIndex + 1})</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 shrink-0 ${partiesExcluded ? 'text-emerald-400' : 'text-rose-400'}`} />
                <span>Parties excluded: <strong>Sam (client) and Deepa (freelancer) cannot be jurors in this case</strong></span>
              </div>
            </div>

            <div className="pt-2 border-t border-purple-900/30">
              <table className="w-full text-left text-xs">
                <thead className="text-purple-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-2">Juror</th>
                    <th className="py-2">Draws</th>
                    <th className="py-2">Court Stake Weight</th>
                    <th className="py-2">Status</th>
                    {showChoices && <th className="py-2">Choice & Reasoning</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-900/30 font-mono text-purple-200">
                  {drawnAddrs.map((addr) => {
                    const j = roundJurors[addr];
                    const jurorStake = state?.stake?.[dispute.courtId]?.[addr] || 0;
                    const totalCourtStaked = court?.totalStaked || 1;
                    const weightPct = ((jurorStake / totalCourtStaked) * 100).toFixed(1);
                    const jurorName = ACCOUNTS[addr]?.name || addr;

                    return (
                      <tr key={addr}>
                        <td className="py-2 font-sans font-semibold text-white">{jurorName}</td>
                        <td className="py-2">{j.draws}</td>
                        <td className="py-2 text-sky-400">{weightPct}%</td>
                        <td className="py-2 font-sans uppercase text-[11px]">
                          {j.revealed ? (
                            <span className="text-emerald-400">Revealed</span>
                          ) : j.commit ? (
                            <span className="text-amber-400">Committed</span>
                          ) : (
                            <span className="text-purple-400">Waiting</span>
                          )}
                        </td>
                        {showChoices && (
                          <td className="py-2 font-sans text-xs">
                            {j.revealed ? (
                              <span>
                                <strong className="text-purple-200">Option {j.choice}</strong> - "{j.justification}"
                              </span>
                            ) : (
                              <span className="text-rose-400">Not Revealed</span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Appeal Panel */}
      <AppealPanel dispute={dispute} />

      {/* Final Ruling Section */}
      {isExecuted && (
        <div className="bg-gradient-to-r from-purple-900/80 to-indigo-900/80 border border-purple-600/60 rounded-2xl p-6 sm:p-8 space-y-4 shadow-2xl">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-emerald-400" />
            Final Ruling & Payout Outcome
          </h3>

          <div className="p-4 rounded-xl bg-[#0f0b1a] border border-purple-700/50 text-base font-bold text-purple-200">
            {dispute.finalRuling === 1 && <span className="text-emerald-400">Ruling 1: Pay Freelancer (Deepa received escrow)</span>}
            {dispute.finalRuling === 2 && <span className="text-sky-400">Ruling 2: Refund Client (Sam received escrow refund)</span>}
            {dispute.finalRuling === 0 && <span className="text-amber-400">Ruling 0: No Majority (Split 50/50 between parties)</span>}
          </div>
        </div>
      )}

      {/* Collapsible Rounds History */}
      {dispute.rounds?.length > 1 && (
        <div className="bg-[#1c1530] border border-purple-900/50 rounded-xl overflow-hidden">
          <button
            onClick={() => setHistoryOpen(!historyOpen)}
            className="w-full p-4 text-left font-bold text-white text-sm flex justify-between items-center hover:bg-purple-900/30 transition-colors"
          >
            <span>Rounds History ({dispute.rounds.length} rounds)</span>
            {historyOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {historyOpen && (
            <div className="p-4 border-t border-purple-900/40 space-y-4 text-xs text-purple-300">
              {dispute.rounds.map((r, rIdx) => (
                <div key={rIdx} className="bg-[#0f0b1a] p-3 rounded-lg border border-purple-900/30 space-y-1">
                  <div className="font-bold text-white">Round {rIdx + 1} ({r.numDraws} jurors)</div>
                  <div>Ruling: Option {r.ruling}</div>
                  <div>Tally: Side 1 ({r.tally?.[1] || 0}), Side 2 ({r.tally?.[2] || 0})</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
