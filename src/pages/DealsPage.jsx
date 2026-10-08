import React from 'react';
import { useJuri, ACCOUNTS } from '../lib/store';
import { Link } from 'react-router-dom';
import { Plus, ArrowRight, Lock, AlertCircle, FileText, CheckCircle2, Clock } from 'lucide-react';

export function DealsPage() {
  const { state, account } = useJuri();

  const allDeals = state?.deals || [];

  // Filter deals where current account is client or freelancer
  const myDeals = allDeals.filter(d => d.client === account || d.freelancer === account);

  // Compute stat card metrics
  const activeCount = allDeals.filter(d => ['Created', 'Delivered'].includes(d.status)).length;
  const disputeCount = allDeals.filter(d => d.status === 'Disputed').length;
  const completedCount = allDeals.filter(d => ['Approved', 'Resolved'].includes(d.status)).length;

  const totalLockedEthMicro = allDeals.reduce((sum, d) => {
    if (['Created', 'Delivered', 'Disputed'].includes(d.status)) {
      return sum + (d.amount || 0);
    }
    return sum;
  }, 0);
  const totalLockedEth = (totalLockedEthMicro / 1000000).toFixed(4);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Created':
        return <span className="bg-blue-950/80 text-blue-300 border border-blue-800/50 px-2.5 py-0.5 rounded text-xs font-semibold">Created</span>;
      case 'Delivered':
        return <span className="bg-amber-950/80 text-amber-300 border border-amber-800/50 px-2.5 py-0.5 rounded text-xs font-semibold">Delivered</span>;
      case 'Approved':
        return <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-800/50 px-2.5 py-0.5 rounded text-xs font-semibold">Approved</span>;
      case 'Disputed':
        return <span className="bg-rose-950/80 text-rose-300 border border-rose-800/50 px-2.5 py-0.5 rounded text-xs font-semibold">Disputed</span>;
      case 'Resolved':
        return <span className="bg-purple-950/80 text-purple-300 border border-purple-800/50 px-2.5 py-0.5 rounded text-xs font-semibold">Resolved</span>;
      default:
        return <span className="bg-purple-950/80 text-purple-300 border border-purple-800/50 px-2.5 py-0.5 rounded text-xs font-semibold">{status}</span>;
    }
  };

  const needsAction = (deal) => {
    if (deal.status === 'Created' && account === deal.freelancer) return true;
    if (deal.status === 'Delivered' && account === deal.client) return true;
    return false;
  };

  return (
    <div className="space-y-8 py-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Escrow Deals</h1>
          <p className="text-sm text-purple-300">
            Create, track, deliver, and settle smart contract escrow agreements.
          </p>
        </div>
        <Link
          to="/deals/new"
          className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-purple-900/40 flex items-center gap-2 min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          Create New Deal
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#1c1530] border border-purple-900/40 rounded-xl p-6 space-y-1">
          <div className="text-xs uppercase font-bold text-purple-400">Active Escrows</div>
          <div className="text-3xl font-black text-white">{activeCount}</div>
          <div className="text-xs text-purple-300">Created or Delivered</div>
        </div>

        <div className="bg-[#1c1530] border border-purple-900/40 rounded-xl p-6 space-y-1">
          <div className="text-xs uppercase font-bold text-purple-400">In Dispute</div>
          <div className="text-3xl font-black text-rose-400">{disputeCount}</div>
          <div className="text-xs text-purple-300">Under jury arbitration</div>
        </div>

        <div className="bg-[#1c1530] border border-purple-900/40 rounded-xl p-6 space-y-1">
          <div className="text-xs uppercase font-bold text-purple-400">Completed</div>
          <div className="text-3xl font-black text-emerald-400">{completedCount}</div>
          <div className="text-xs text-purple-300">Approved or Resolved</div>
        </div>

        <div className="bg-[#1c1530] border border-purple-900/40 rounded-xl p-6 space-y-1">
          <div className="text-xs uppercase font-bold text-purple-400">Total ETH Locked</div>
          <div className="text-3xl font-black text-sky-400">{totalLockedEth} ETH</div>
          <div className="text-xs text-purple-300">Locked in active escrows</div>
        </div>
      </div>

      {/* Deals List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Your Deals ({myDeals.length})</h3>

        {myDeals.length === 0 ? (
          <div className="bg-[#1c1530] border border-purple-900/40 rounded-xl p-8 text-center text-sm text-purple-400">
            No deals found where {account} is client or freelancer. Create a new deal to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myDeals.map((deal) => {
              const amountEth = (deal.amount / 1000000).toFixed(4);
              const isClient = account === deal.client;
              const counterparty = isClient ? deal.freelancer : deal.client;
              const counterpartyName = ACCOUNTS[counterparty]?.name || counterparty;

              return (
                <div
                  key={deal.id}
                  className="bg-[#1c1530] border border-purple-900/40 rounded-xl p-6 space-y-4 hover:border-purple-700/60 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs font-mono text-purple-400">Deal #{deal.id}</span>
                        <h4 className="font-bold text-white text-base leading-snug">{deal.title}</h4>
                      </div>
                      {getStatusBadge(deal.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-purple-300">
                      <div>Role: <strong className="text-purple-200">{isClient ? 'Client' : 'Freelancer'}</strong></div>
                      <div>Counterparty: <strong className="text-purple-200">{counterpartyName}</strong></div>
                      <div>Amount: <strong className="text-emerald-400 font-mono">{amountEth} ETH</strong></div>
                      <div>Court ID: <strong className="text-purple-200">Court {deal.courtId}</strong></div>
                    </div>

                    {needsAction(deal) && (
                      <div className="bg-amber-950/60 border border-amber-800/40 text-amber-300 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        Action needed on this deal
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-purple-900/30 flex items-center justify-between">
                    <span className="text-xs text-purple-400">
                      Jurors: {deal.numJurors}
                    </span>
                    <Link
                      to={`/deals/${deal.id}`}
                      className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1 min-h-[44px]"
                    >
                      View Details
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
