import React, { useState } from 'react';
import { useJuri } from '../lib/store';
import JuriDAO from '../lib/juridao-engine';
import { Link } from 'react-router-dom';
import { Gavel, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

export function CasesPage() {
  const { state, account } = useJuri();
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'progress' | 'closed'

  const cases = JuriDAO.jurorCases(state, account) || [];

  const pendingCases = cases.filter(c => c.status === 'needs commit' || c.status === 'needs reveal');
  const inProgressCases = cases.filter(c => ['committed', 'revealed', 'waiting'].includes(c.status) && !c.closed);
  const closedCases = cases.filter(c => c.closed || c.status === 'settled' || c.status === 'missed');

  let currentList = pendingCases;
  if (activeTab === 'progress') currentList = inProgressCases;
  if (activeTab === 'closed') currentList = closedCases;

  return (
    <div className="space-y-8 py-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">My Cases</h1>
          <p className="text-sm text-purple-300">
            Disputes where your account has been drawn as a juror.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#1c1530] p-1.5 rounded-xl border border-purple-900/50 max-w-md">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all min-h-[44px] flex items-center justify-center gap-2 ${
            activeTab === 'pending' ? 'bg-purple-600 text-white shadow' : 'text-purple-400 hover:text-purple-200'
          }`}
        >
          Vote Pending ({pendingCases.length})
        </button>
        <button
          onClick={() => setActiveTab('progress')}
          className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all min-h-[44px] flex items-center justify-center gap-2 ${
            activeTab === 'progress' ? 'bg-purple-600 text-white shadow' : 'text-purple-400 hover:text-purple-200'
          }`}
        >
          In Progress ({inProgressCases.length})
        </button>
        <button
          onClick={() => setActiveTab('closed')}
          className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all min-h-[44px] flex items-center justify-center gap-2 ${
            activeTab === 'closed' ? 'bg-purple-600 text-white shadow' : 'text-purple-400 hover:text-purple-200'
          }`}
        >
          Closed ({closedCases.length})
        </button>
      </div>

      {/* Cases List */}
      <div className="space-y-4">
        {currentList.length === 0 ? (
          <div className="bg-[#1c1530] border border-purple-900/40 rounded-xl p-8 text-center text-sm text-purple-400">
            No cases found in this category.
          </div>
        ) : (
          currentList.map((item, idx) => {
            const dispute = state?.disputes?.find(d => d.id === item.disputeId);
            const court = state?.courts?.find(c => c.id === dispute?.courtId);

            return (
              <div
                key={idx}
                className="bg-[#1c1530] border border-purple-900/40 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-purple-700/60 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-base">Dispute #{item.disputeId}</span>
                    <span className="text-xs bg-purple-950/80 border border-purple-800/40 px-2.5 py-0.5 rounded text-purple-300">
                      {court?.name || 'Court'}
                    </span>
                    <span className="text-xs bg-sky-950/80 border border-sky-800/40 px-2 py-0.5 rounded text-sky-300 font-mono">
                      Round {item.round + 1} ({item.draws} draw{item.draws > 1 ? 's' : ''})
                    </span>
                  </div>
                  <p className="text-xs text-purple-300 font-medium">
                    Question: {dispute?.question || 'Dispute Case Question'}
                  </p>
                  <div className="text-xs text-purple-400 flex items-center gap-3 pt-1">
                    <span>Phase: <strong className="text-purple-200">{dispute?.period}</strong></span>
                    <span>Status: <strong className="text-amber-400 uppercase">{item.status}</strong></span>
                  </div>
                </div>

                <Link
                  to={`/cases/${item.disputeId}`}
                  className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow flex items-center justify-center gap-2 min-h-[44px] shrink-0"
                >
                  View Case
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
