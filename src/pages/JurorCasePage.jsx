import React, { useState } from 'react';
import { useJuri } from '../lib/store';
import JuriDAO from '../lib/juridao-engine';
import { useParams, Link } from 'react-router-dom';
import { Lock, CheckCircle2, Download, AlertTriangle, ArrowLeft } from 'lucide-react';

export function JurorCasePage() {
  const { id } = useParams();
  const disputeId = Number(id);
  const { state, account, act, showToast } = useJuri();

  const [selectedChoice, setSelectedChoice] = useState('1');
  const [reasoning, setReasoning] = useState('');
  const [manualSalt, setManualSalt] = useState('');
  const [manualChoice, setManualChoice] = useState('1');
  const [manualReasoning, setManualReasoning] = useState('');

  const dispute = state?.disputes?.find(d => d.id === disputeId);
  const currentRoundIndex = dispute ? dispute.round : 0;
  const currentRound = dispute?.rounds?.[currentRoundIndex];
  const court = state?.courts?.find(c => c.id === dispute?.courtId);
  const deal = state?.deals?.find(d => d.id === dispute?.dealId);

  const jurorEntry = currentRound?.jurors?.[account];

  if (!dispute) {
    return (
      <div className="bg-[#1c1530] border border-purple-900/40 rounded-xl p-8 text-center text-purple-300">
        Dispute #{disputeId} not found.
      </div>
    );
  }

  if (!jurorEntry) {
    return (
      <div className="bg-[#1c1530] border border-purple-900/40 rounded-xl p-8 text-center space-y-4 max-w-2xl mx-auto my-8">
        <h2 className="text-xl font-bold text-white">Dispute #{disputeId} Juror Portal</h2>
        <div className="p-6 rounded-xl bg-[#0f0b1a] border border-purple-900/50 text-amber-400 text-sm font-semibold">
          You were not drawn for this case in Round {currentRoundIndex + 1}.
        </div>
        <Link to="/disputes" className="inline-block text-xs text-purple-400 hover:text-purple-200">
          ← Back to Disputes
        </Link>
      </div>
    );
  }

  const storageKey = `juri_vote_${disputeId}_${currentRoundIndex}_${account}`;
  const localSavedVote = localStorage.getItem(storageKey);
  const parsedSavedVote = localSavedVote ? JSON.parse(localSavedVote) : null;

  const handleSealVote = (e) => {
    e.preventDefault();
    const choiceNum = Number(selectedChoice);
    const salt = JuriDAO.randomSalt();
    const commitStr = JuriDAO.makeCommit(choiceNum, salt, account);

    try {
      act((s) => {
        JuriDAO.commitVote(s, account, disputeId, commitStr);
      });
      // Store secret locally
      localStorage.setItem(storageKey, JSON.stringify({
        choice: choiceNum,
        salt,
        reasoning,
      }));
      showToast('Your vote is sealed!', 'success');
    } catch (err) {
      // Error handled by act() toast
    }
  };

  const handleRevealVote = (e) => {
    e.preventDefault();
    let choiceToUse = parsedSavedVote?.choice;
    let saltToUse = parsedSavedVote?.salt;
    let reasonToUse = parsedSavedVote?.reasoning;

    if (!parsedSavedVote) {
      choiceToUse = Number(manualChoice);
      saltToUse = manualSalt;
      reasonToUse = manualReasoning;
    }

    try {
      act((s) => {
        JuriDAO.revealVote(s, account, disputeId, choiceToUse, saltToUse, reasonToUse || 'Impartial juror decision');
      });
      showToast('Vote revealed successfully!', 'success');
    } catch (err) {
      // Error handled by act() toast
    }
  };

  const handleDownloadBackup = () => {
    if (!parsedSavedVote) return;
    const blob = new Blob([JSON.stringify(parsedSavedVote, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `juri-vote-backup-dispute-${disputeId}-round-${currentRoundIndex}.json`;
    a.click();
    URL.revokeObjectURL(a);
  };

  return (
    <div className="space-y-8 py-2 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-purple-900/40 pb-4">
        <Link
          to="/cases"
          className="p-2 rounded-lg text-purple-400 hover:text-white hover:bg-purple-900/40 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Case Juror Action: Dispute #{disputeId}</h1>
          <p className="text-xs text-purple-300">
            Round {currentRoundIndex + 1} ({jurorEntry.draws} draw{jurorEntry.draws > 1 ? 's' : ''}) • Court: {court?.name}
          </p>
        </div>
      </div>

      {/* Warning Banner Always Visible during Voting */}
      {['Commit', 'Reveal'].includes(dispute.period) && (
        <div className="bg-amber-950/80 border border-amber-800/60 rounded-xl p-4 flex items-start gap-3 text-amber-200 text-xs leading-relaxed">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong>Important Juror Rule:</strong> If you do not commit and reveal, or you vote against the majority, you lose the JURI locked for this case.
          </div>
        </div>
      )}

      {/* Question & Overview Card */}
      <div className="bg-[#1c1530] border border-purple-900/50 rounded-2xl p-6 space-y-4">
        <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider">Dispute Question</h3>
        <p className="text-base font-semibold text-white bg-[#0f0b1a] p-4 rounded-xl border border-purple-900/40">
          {dispute.question}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-purple-300">
          <div className="bg-[#0f0b1a] p-3 rounded-lg border border-purple-900/30">
            <span className="font-semibold text-purple-200 block mb-1">Answer 1:</span>
            Pay the freelancer (Deepa)
          </div>
          <div className="bg-[#0f0b1a] p-3 rounded-lg border border-purple-900/30">
            <span className="font-semibold text-purple-200 block mb-1">Answer 2:</span>
            Refund the client (Sam)
          </div>
        </div>
      </div>

      {/* Commit Phase */}
      {dispute.period === 'Commit' && (
        <div className="bg-[#1c1530] border border-purple-900/50 rounded-2xl p-6 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-purple-400" />
            1. Commit Your Vote (Sealed)
          </h3>

          {jurorEntry.commit ? (
            <div className="bg-purple-950/80 border border-purple-700/60 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                Your vote is sealed. Nobody can see it. Come back to reveal.
              </div>
              <p className="text-xs text-purple-300 font-mono break-all bg-[#0f0b1a] p-3 rounded-lg border border-purple-900/40">
                Commit Hash: {jurorEntry.commit}
              </p>
              {parsedSavedVote && (
                <button
                  onClick={handleDownloadBackup}
                  className="bg-purple-900 hover:bg-purple-800 text-purple-200 border border-purple-700/50 text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors min-h-[44px]"
                >
                  <Download className="w-4 h-4" />
                  Download backup
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handleSealVote} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-purple-300 uppercase">Select Your Ruling Choice</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`p-4 rounded-xl border cursor-pointer flex items-center gap-3 transition-colors ${
                    selectedChoice === '1' ? 'bg-purple-900/60 border-purple-500 text-white' : 'bg-[#0f0b1a] border-purple-900/40 text-purple-300'
                  }`}>
                    <input
                      type="radio"
                      name="choiceRadio"
                      value="1"
                      checked={selectedChoice === '1'}
                      onChange={(e) => setSelectedChoice(e.target.value)}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <span className="font-semibold text-xs sm:text-sm">Option 1: Pay Freelancer</span>
                  </label>

                  <label className={`p-4 rounded-xl border cursor-pointer flex items-center gap-3 transition-colors ${
                    selectedChoice === '2' ? 'bg-purple-900/60 border-purple-500 text-white' : 'bg-[#0f0b1a] border-purple-900/40 text-purple-300'
                  }`}>
                    <input
                      type="radio"
                      name="choiceRadio"
                      value="2"
                      checked={selectedChoice === '2'}
                      onChange={(e) => setSelectedChoice(e.target.value)}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <span className="font-semibold text-xs sm:text-sm">Option 2: Refund Client</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="voteReasoning" className="block text-xs font-semibold text-purple-300 uppercase">Reasoning / Justification</label>
                <textarea
                  id="voteReasoning"
                  rows="3"
                  required
                  value={reasoning}
                  onChange={(e) => setReasoning(e.target.value)}
                  className="w-full bg-[#0f0b1a] border border-purple-800/50 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Explain why you are voting for this choice based on criteria and evidence..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg text-xs sm:text-sm min-h-[44px]"
              >
                Seal my vote
              </button>
            </form>
          )}
        </div>
      )}

      {/* Reveal Phase */}
      {dispute.period === 'Reveal' && (
        <div className="bg-[#1c1530] border border-purple-900/50 rounded-2xl p-6 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-sky-400" />
            2. Reveal Your Vote
          </h3>

          {jurorEntry.revealed ? (
            <div className="bg-emerald-950/80 border border-emerald-700/60 rounded-xl p-6 text-emerald-200 text-xs space-y-1">
              <div className="font-bold flex items-center gap-2 text-sm text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                Your vote has been revealed!
              </div>
              <p>Choice: Option {jurorEntry.choice} | Justification: "{jurorEntry.justification}"</p>
            </div>
          ) : (
            <div className="space-y-4">
              {parsedSavedVote ? (
                <div className="space-y-3 bg-[#0f0b1a] p-4 rounded-xl border border-purple-900/40 text-xs text-purple-300">
                  <div>Stored Choice: <strong className="text-purple-200">Option {parsedSavedVote.choice}</strong></div>
                  <div>Stored Salt: <code className="text-purple-200">{parsedSavedVote.salt}</code></div>
                  <button
                    onClick={handleRevealVote}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg text-xs sm:text-sm min-h-[44px] w-full"
                  >
                    Reveal my vote
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRevealVote} className="space-y-4 bg-[#0f0b1a] p-4 rounded-xl border border-purple-900/40">
                  <div className="text-xs text-amber-300 font-semibold">
                    Local secret vote storage missing. Enter salt manually:
                  </div>
                  <input
                    type="text"
                    required
                    value={manualSalt}
                    onChange={(e) => setManualSalt(e.target.value)}
                    className="w-full bg-[#1c1530] border border-purple-800/50 rounded-xl px-4 py-3 text-white text-xs font-mono"
                    placeholder="Enter salt string..."
                  />
                  <select
                    value={manualChoice}
                    onChange={(e) => setManualChoice(e.target.value)}
                    className="w-full bg-[#1c1530] border border-purple-800/50 rounded-xl px-4 py-3 text-purple-200 text-xs"
                  >
                    <option value="1">Option 1: Pay Freelancer</option>
                    <option value="2">Option 2: Refund Client</option>
                  </select>
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg text-xs sm:text-sm min-h-[44px] w-full"
                  >
                    Reveal my vote
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
