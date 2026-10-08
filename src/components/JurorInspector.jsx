import React, { useState } from 'react';
import { useJuri, ACCOUNTS } from '../lib/store';
import JuriDAO from '../lib/juridao-engine';
import { CheckCircle2, XCircle, Search } from 'lucide-react';

export function JurorInspector() {
  const { state } = useJuri();
  const disputes = state?.disputes || [];
  const [selectedDisputeId, setSelectedDisputeId] = useState(disputes[0]?.id || 1);
  const [selectedRound, setSelectedRound] = useState(0);

  const dispute = disputes.find(d => d.id === Number(selectedDisputeId)) || disputes[0];
  const roundIndex = Math.min(selectedRound, (dispute?.rounds?.length || 1) - 1);
  const round = dispute?.rounds?.[roundIndex];
  const court = state?.courts?.find(c => c.id === dispute?.courtId);

  const jurorsMap = round?.jurors || {};
  const addrs = Object.keys(jurorsMap);
  const numDraws = round?.numDraws || 3;
  const totalDraws = addrs.reduce((sum, a) => sum + jurorsMap[a].draws, 0);

  const partyA = dispute?.partyA || 'sam';
  const partyB = dispute?.partyB || 'deepa';

  const check1 = !addrs.includes(partyA) && !addrs.includes(partyB);
  const check2 = totalDraws === numDraws;
  const check3 = addrs.every(a => JuriDAO.notificationsFor(state, a)?.length > 0);

  return (
    <div className="bg-[#1c1530] border border-purple-900/50 rounded-xl p-6 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-purple-900/40 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-sky-400" />
            Panel C: Jury Inspector
          </h3>
          <p className="text-xs text-purple-300">Inspect draw assignments, locked stake, and validation checks.</p>
        </div>

        {disputes.length > 0 && (
          <div className="flex items-center gap-2">
            <select
              value={selectedDisputeId}
              onChange={(e) => {
                setSelectedDisputeId(Number(e.target.value));
                setSelectedRound(0);
              }}
              className="bg-[#0f0b1a] border border-purple-800/50 rounded-lg px-3 py-1.5 text-xs text-purple-200"
            >
              {disputes.map(d => (
                <option key={d.id} value={d.id}>Dispute #{d.id}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!dispute ? (
        <p className="text-xs text-purple-400 italic">No disputes exist in state to inspect.</p>
      ) : (
        <div className="space-y-4 text-xs">
          <div className="hidden sm:block overflow-x-auto bg-[#0f0b1a] rounded-xl border border-purple-900/40 p-2">
            <table className="w-full text-left">
              <thead className="text-purple-400 uppercase text-[10px] border-b border-purple-900/40">
                <tr>
                  <th className="py-2 px-3">Juror</th>
                  <th className="py-2 px-3">Draws</th>
                  <th className="py-2 px-3">Locked JURI</th>
                  <th className="py-2 px-3">Court Stake</th>
                  <th className="py-2 px-3">Draw Weight %</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/30 text-purple-200 font-mono">
                {addrs.map((a) => {
                  const j = jurorsMap[a];
                  const courtStake = state?.stake?.[dispute.courtId]?.[a] || 0;
                  const totalStaked = court?.totalStaked || 1;
                  const weightPct = ((courtStake / totalStaked) * 100).toFixed(1);
                  const lockedAmount = (court?.minStake || 500) * ((court?.alphaBps || 5000) / 10000) * j.draws;
                  const jurorCases = JuriDAO.jurorCases(state, a) || [];
                  const caseStatus = jurorCases.find(c => c.disputeId === dispute.id)?.status || 'drawn';

                  return (
                    <tr key={a}>
                      <td className="py-2 px-3 font-sans font-semibold text-white">{ACCOUNTS[a]?.name || a}</td>
                      <td className="py-2 px-3">{j.draws}</td>
                      <td className="py-2 px-3 text-rose-400">{lockedAmount.toLocaleString()} JURI</td>
                      <td className="py-2 px-3">{courtStake.toLocaleString()} JURI</td>
                      <td className="py-2 px-3 text-sky-400">{weightPct}%</td>
                      <td className="py-2 px-3 font-sans uppercase text-[10px] text-amber-400">{caseStatus}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="sm:hidden space-y-3">
            {addrs.map((a) => {
              const j = jurorsMap[a];
              const courtStake = state?.stake?.[dispute.courtId]?.[a] || 0;
              const totalStaked = court?.totalStaked || 1;
              const weightPct = ((courtStake / totalStaked) * 100).toFixed(1);
              const lockedAmount = (court?.minStake || 500) * ((court?.alphaBps || 5000) / 10000) * j.draws;
              const jurorCases = JuriDAO.jurorCases(state, a) || [];
              const caseStatus = jurorCases.find(c => c.disputeId === dispute.id)?.status || 'drawn';

              return (
                <div key={a} className="bg-[#0f0b1a] border border-purple-900/40 rounded-xl p-4 space-y-2 text-xs">
                  <div className="flex justify-between items-center border-b border-purple-900/40 pb-2">
                    <span className="font-semibold text-white">{ACCOUNTS[a]?.name || a}</span>
                    <span className="uppercase text-[10px] text-amber-400 font-bold">{caseStatus}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-purple-300 font-mono pt-1">
                    <div>Draws: <span className="text-white">{j.draws}</span></div>
                    <div>Draw Wt: <span className="text-sky-400">{weightPct}%</span></div>
                    <div>Locked: <span className="text-rose-400">{lockedAmount.toLocaleString()}</span></div>
                    <div>Stake: <span className="text-white">{courtStake.toLocaleString()}</span></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Three Checks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#0f0b1a] p-4 rounded-xl border border-purple-900/40">
            <div className="flex items-center gap-2">
              {check1 ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              <span className="text-purple-200">Neither party is a juror</span>
            </div>
            <div className="flex items-center gap-2">
              {check2 ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              <span className="text-purple-200">Total draws = round size ({numDraws})</span>
            </div>
            <div className="flex items-center gap-2">
              {check3 ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              <span className="text-purple-200">Every drawn juror notified</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
