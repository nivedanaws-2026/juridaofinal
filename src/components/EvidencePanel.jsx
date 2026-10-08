import React, { useState } from 'react';
import { useJuri } from '../lib/store';
import JuriDAO from '../lib/juridao-engine';
import { FileText, Plus, Upload, Lock } from 'lucide-react';

export function EvidencePanel({ dispute, isExecuted }) {
  const { account, act, showToast } = useJuri();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileText, setFileText] = useState('');

  const evidenceList = dispute?.evidence || [];

  // Role-based access
  const isClient = account === dispute?.partyA;
  const isFreelancer = account === dispute?.partyB;
  const isParty = isClient || isFreelancer;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      setFileText(evt.target.result);
    };
    reader.readAsText(file);
  };

  const handleSubmitEvidence = (e) => {
    e.preventDefault();
    try {
      act((s) => {
        JuriDAO.submitEvidence(s, account, dispute.id, {
          title,
          description,
          fileName,
          fileText,
        });
      });
      showToast('Evidence submitted successfully', 'success');
      setTitle('');
      setDescription('');
      setFileName('');
      setFileText('');
    } catch (err) {
      // Error handled by act() toast
    }
  };

  // Group evidence by role
  const clientEvidence = evidenceList.filter(e => e.role === 'client');
  const freelancerEvidence = evidenceList.filter(e => e.role === 'freelancer');

  return (
    <div className="bg-[#1c1530] border border-purple-900/50 rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Dispute Evidence ({evidenceList.length})</h3>
        {!isParty && !isExecuted && (
          <span className="text-[11px] bg-purple-950/80 border border-purple-800/40 text-purple-400 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
            <Lock className="w-3 h-3" />
            View-only — only parties can submit evidence
          </span>
        )}
        {isClient && !isExecuted && (
          <span className="text-[11px] bg-sky-950/80 border border-sky-700/40 text-sky-300 px-2.5 py-1 rounded-lg">
            Viewing as Client (Sam)
          </span>
        )}
        {isFreelancer && !isExecuted && (
          <span className="text-[11px] bg-emerald-950/80 border border-emerald-700/40 text-emerald-300 px-2.5 py-1 rounded-lg">
            Viewing as Freelancer (Deepa)
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Client Evidence */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider">Client Evidence (Sam)</h4>
          {clientEvidence.length === 0 ? (
            <p className="text-xs text-purple-400 italic">No client evidence submitted.</p>
          ) : (
            clientEvidence.map((e) => (
              <div key={e.id} className="bg-[#0f0b1a] p-4 rounded-xl border border-purple-900/40 space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-white text-sm">{e.title}</span>
                  <span className="bg-purple-950 px-2 py-0.5 rounded text-[10px] text-purple-300 font-mono border border-purple-800/40">
                    fp: {e.fingerprint}
                  </span>
                </div>
                <p className="text-purple-300">{e.description}</p>
                {e.fileName && (
                  <div className="flex items-center gap-1.5 text-sky-400 font-mono text-[11px] pt-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{e.fileName}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Freelancer Evidence */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider">Freelancer Evidence (Deepa)</h4>
          {freelancerEvidence.length === 0 ? (
            <p className="text-xs text-purple-400 italic">No freelancer evidence submitted.</p>
          ) : (
            freelancerEvidence.map((e) => (
              <div key={e.id} className="bg-[#0f0b1a] p-4 rounded-xl border border-purple-900/40 space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-white text-sm">{e.title}</span>
                  <span className="bg-purple-950 px-2 py-0.5 rounded text-[10px] text-purple-300 font-mono border border-purple-800/40">
                    fp: {e.fingerprint}
                  </span>
                </div>
                <p className="text-purple-300">{e.description}</p>
                {e.fileName && (
                  <div className="flex items-center gap-1.5 text-sky-400 font-mono text-[11px] pt-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{e.fileName}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Submit Evidence Form — only for parties */}
      {!isExecuted && isParty && (
        <form onSubmit={handleSubmitEvidence} className="bg-[#0f0b1a] p-6 rounded-xl border border-purple-900/40 space-y-4 pt-4">
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <Plus className="w-4 h-4 text-purple-400" />
            Submit Evidence as {isClient ? 'Client (Sam)' : 'Freelancer (Deepa)'}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-[#1c1530] border border-purple-800/50 rounded-lg px-3 py-2 text-white text-xs focus:outline-none min-h-[44px]"
              placeholder="Evidence title..."
            />
            <label className="cursor-pointer bg-purple-950 hover:bg-purple-900 border border-purple-700/50 text-purple-200 text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 font-medium min-h-[44px]">
              <Upload className="w-3.5 h-3.5 text-purple-400" />
              {fileName ? fileName : 'Attach optional file (.txt)'}
              <input type="file" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <textarea
            rows="2"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[#1c1530] border border-purple-800/50 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
            placeholder="Evidence description & supporting arguments..."
          ></textarea>

          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors min-h-[44px]"
          >
            Submit Evidence
          </button>
        </form>
      )}

      {/* Non-party locked message */}
      {!isExecuted && !isParty && (
        <div className="bg-[#0f0b1a] border border-purple-900/30 rounded-xl p-4 text-center text-xs text-purple-500 flex items-center justify-center gap-2">
          <Lock className="w-4 h-4" />
          Switch to Sam (Client) or Deepa (Freelancer) to submit evidence.
        </div>
      )}
    </div>
  );
}
