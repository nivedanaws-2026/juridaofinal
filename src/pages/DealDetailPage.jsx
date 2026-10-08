import React, { useState } from 'react';
import { useJuri, ACCOUNTS } from '../lib/store';
import JuriDAO from '../lib/juridao-engine';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle, FileText, Scale, Lock, Upload, ExternalLink, X } from 'lucide-react';

export function DealDetailPage() {
  const { id } = useParams();
  const dealId = Number(id);
  const { state, account, act, showToast } = useJuri();
  const navigate = useNavigate();

  const [deliveryNote, setDeliveryNote] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileText, setFileText] = useState('');
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);

  const deal = state?.deals?.find(d => d.id === dealId);

  if (!deal) {
    return (
      <div className="bg-[#1c1530] border border-purple-900/40 rounded-xl p-8 text-center text-purple-300">
        Deal #{dealId} not found.
      </div>
    );
  }

  const court = state?.courts?.find(c => c.id === deal.courtId);
  const feePerJurorMicro = court ? court.feePerJuror : 2000;
  const disputeFeeEth = ((feePerJurorMicro * deal.numJurors) / 1000000).toFixed(4);
  const amountEth = (deal.amount / 1000000).toFixed(4);

  const isClient = account === deal.client;
  const isFreelancer = account === deal.freelancer;

  const nowSec = JuriDAO.nowOf(state);
  const isPastDeadline = nowSec > deal.deadline;

  // Check if dispute is allowed
  const canRaiseDispute =
    (deal.status === 'Delivered' && (isClient || isFreelancer)) ||
    (deal.status === 'Created' && isPastDeadline && isClient);

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

  const handleMarkDelivered = (e) => {
    e.preventDefault();
    try {
      act((s) => {
        JuriDAO.markDelivered(s, account, dealId, deliveryNote || 'Delivered', fileName, fileText);
      });
      showToast('Marked deal as delivered', 'success');
    } catch (err) {
      // Error handled by act() toast
    }
  };

  const handleApprove = () => {
    try {
      act((s) => {
        JuriDAO.approveDeal(s, account, dealId);
      });
      showToast(`Deal #${dealId} approved! ${amountEth} ETH released to freelancer.`, 'success');
    } catch (err) {
      // Error handled by act() toast
    }
  };

  const handleConfirmRaiseDispute = () => {
    try {
      let disputeId;
      act((s) => {
        disputeId = JuriDAO.raiseDispute(s, account, dealId);
      });
      showToast(`Dispute #${disputeId} raised successfully`, 'success');
      setDisputeModalOpen(false);
      navigate(`/disputes/${disputeId}`);
    } catch (err) {
      // Error handled by act() toast
    }
  };

  return (
    <div className="space-y-8 py-2 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-purple-900/40 pb-4">
        <Link
          to="/deals"
          className="p-2 rounded-lg text-purple-400 hover:text-white hover:bg-purple-900/40 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">Deal #{deal.id}: {deal.title}</h1>
            <span className="text-xs bg-purple-950/80 border border-purple-800/40 px-2.5 py-0.5 rounded text-purple-300">
              {deal.status}
            </span>
          </div>
          <p className="text-xs text-purple-300">Escrow Contract Details & Action Panel</p>
        </div>
      </div>

      {/* Disputed / Resolved Banner */}
      {deal.disputeId && (
        <div className="bg-purple-950/80 border border-purple-700/60 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="font-bold text-purple-200 flex items-center gap-2 text-sm">
              <Scale className="w-4 h-4 text-purple-400" />
              This deal is associated with Dispute #{deal.disputeId}
            </div>
            {deal.status === 'Resolved' && (
              <p className="text-xs text-purple-300">
                Ruling: <strong className="text-emerald-400">{deal.ruling === 1 ? 'Paid Freelancer' : deal.ruling === 2 ? 'Refunded Client' : 'Split 50/50'}</strong>
              </p>
            )}
          </div>
          <Link
            to={`/disputes/${deal.disputeId}`}
            className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1 min-h-[44px]"
          >
            Open Dispute Page
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Main Details Card */}
      <div className="bg-[#1c1530] border border-purple-900/50 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-[#0f0b1a] p-4 rounded-xl border border-purple-900/40">
          <div>Client: <strong className="text-purple-200 block text-sm">{ACCOUNTS[deal.client]?.name || deal.client}</strong></div>
          <div>Freelancer: <strong className="text-purple-200 block text-sm">{ACCOUNTS[deal.freelancer]?.name || deal.freelancer}</strong></div>
          <div>Escrow Amount: <strong className="text-emerald-400 block text-sm font-mono">{amountEth} ETH</strong></div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider">Description</h3>
          <p className="text-sm text-purple-200 leading-relaxed bg-[#0f0b1a] p-4 rounded-xl border border-purple-900/40">
            {deal.description}
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider">Delivery Criteria</h3>
          <ul className="space-y-1 text-xs text-purple-300 bg-[#0f0b1a] p-4 rounded-xl border border-purple-900/40">
            {deal.criteria?.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Deliver Note / File if Delivered */}
        {deal.deliveryNote && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Delivery Details</h3>
            <div className="bg-[#0f0b1a] p-4 rounded-xl border border-amber-900/40 space-y-2 text-xs">
              <p className="text-purple-200">{deal.deliveryNote}</p>
              {deal.deliveryFileName && (
                <div className="flex items-center gap-2 text-purple-300 font-mono">
                  <FileText className="w-4 h-4 text-sky-400" />
                  <span>{deal.deliveryFileName}</span>
                  <span className="text-[10px] bg-purple-950 px-2 py-0.5 rounded text-purple-400 border border-purple-800/40">
                    fp: {deal.deliveryFingerprint}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-4 border-t border-purple-900/40 space-y-4">
          {/* Freelancer Deliver Form */}
          {deal.status === 'Created' && isFreelancer && (
            <form onSubmit={handleMarkDelivered} className="space-y-4 bg-[#0f0b1a] p-6 rounded-xl border border-purple-900/40">
              <h4 className="font-bold text-white text-sm">Mark Work as Delivered</h4>
              <textarea
                rows="2"
                required
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
                className="w-full bg-[#1c1530] border border-purple-800/50 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                placeholder="Delivery note describing completed work..."
              ></textarea>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer bg-purple-950 hover:bg-purple-900 border border-purple-700/50 text-purple-200 text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 font-medium min-h-[44px]">
                  <Upload className="w-3.5 h-3.5" />
                  {fileName ? fileName : 'Upload Deliverable File (.txt)'}
                  <input type="file" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors min-h-[44px]"
              >
                Mark as Delivered
              </button>
            </form>
          )}

          {/* Client Approve & Release Button */}
          {deal.status === 'Delivered' && isClient && (
            <div className="bg-[#0f0b1a] p-6 rounded-xl border border-purple-900/40 space-y-3">
              <h4 className="font-bold text-white text-sm">Client Approval</h4>
              <p className="text-xs text-purple-300">Approve the deliverable to release the locked {amountEth} ETH escrow to the freelancer.</p>
              <button
                onClick={handleApprove}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-lg min-h-[44px]"
              >
                Approve & Release Payment ({amountEth} ETH)
              </button>
            </div>
          )}

          {/* Raise Dispute Button */}
          {canRaiseDispute && (
            <div className="pt-2">
              <button
                onClick={() => setDisputeModalOpen(true)}
                className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-5 py-3 rounded-xl transition-all shadow-lg min-h-[44px] flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                Raise Dispute ({disputeFeeEth} ETH Fee)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Raise Dispute Confirm Modal */}
      {disputeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1c1530] border border-purple-800/60 w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-purple-900/40 pb-4">
              <div className="flex items-center gap-2 text-white font-bold text-lg">
                <AlertCircle className="w-5 h-5 text-rose-400" />
                Confirm Raising Dispute
              </div>
              <button
                onClick={() => setDisputeModalOpen(false)}
                className="p-1 rounded-lg text-purple-400 hover:text-white hover:bg-purple-900/40 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-purple-300">
              <div className="p-4 rounded-xl bg-[#0f0b1a] border border-purple-900/40 space-y-2">
                <div className="flex justify-between">
                  <span>Required Dispute Fee:</span>
                  <strong className="text-emerald-400 font-mono text-sm">{disputeFeeEth} ETH</strong>
                </div>
                <p className="text-[11px] text-purple-400">
                  Paid by the account raising the dispute ({deal.numJurors} jurors x {(feePerJurorMicro / 1000000).toFixed(4)} ETH). Fee is not refunded.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-800/40 text-amber-200">
                <strong>Frozen Funds Warning:</strong> The {amountEth} ETH deal escrow will be locked until the jury arbitration finishes.
              </div>

              <div className="p-4 rounded-xl bg-[#0f0b1a] border border-purple-900/40 space-y-1">
                <div className="font-semibold text-purple-200">Jury Question:</div>
                <p className="text-purple-300 italic">"Should the freelancer be paid for deal '{deal.title}'?"</p>
                <div className="pt-1 text-[11px] text-purple-400">
                  Answer 1: Pay freelancer | Answer 2: Refund client
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDisputeModalOpen(false)}
                className="bg-purple-950/80 hover:bg-purple-900 border border-purple-700/50 text-purple-200 font-medium py-2.5 px-4 rounded-xl text-xs min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRaiseDispute}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-lg min-h-[44px]"
              >
                Confirm & Pay {disputeFeeEth} ETH
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
