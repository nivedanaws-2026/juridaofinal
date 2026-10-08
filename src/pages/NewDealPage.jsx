import React, { useState } from 'react';
import { useJuri, ACCOUNTS } from '../lib/store';
import JuriDAO from '../lib/juridao-engine';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Scale, Lock, Info } from 'lucide-react';

export function NewDealPage() {
  const { state, account, act, showToast } = useJuri();
  const navigate = useNavigate();

  const [freelancer, setFreelancer] = useState('deepa');
  const [amountEth, setAmountEth] = useState('1.0');
  const [days, setDays] = useState('7');
  const [title, setTitle] = useState('Web Design Task');
  const [description, setDescription] = useState('Build a responsive landing page and mobile layout.');
  const [criteria, setCriteria] = useState(['5 pages', 'mobile responsive']);
  const [courtId, setCourtId] = useState(2);
  const [numJurors, setNumJurors] = useState(3);

  const selectedCourt = state?.courts?.find(c => c.id === courtId) || state?.courts?.[0];
  const feePerJurorMicro = selectedCourt ? selectedCourt.feePerJuror : 2000;
  const disputeFeeEth = ((feePerJurorMicro * numJurors) / 1000000).toFixed(4);

  const handleAddCriteria = () => {
    setCriteria([...criteria, '']);
  };

  const handleRemoveCriteria = (index) => {
    if (criteria.length <= 1) return;
    setCriteria(criteria.filter((_, i) => i !== index));
  };

  const handleCriteriaChange = (index, value) => {
    const updated = [...criteria];
    updated[index] = value;
    setCriteria(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const amountMicro = Math.round(parseFloat(amountEth) * 1000000);
    const deadlineSec = JuriDAO.nowOf(state) + Math.round(parseFloat(days) * 86400);

    const validCriteria = criteria.filter(c => c.trim().length > 0);
    if (validCriteria.length === 0) {
      showToast('At least one delivery criteria line is required', 'error');
      return;
    }

    try {
      let dealId;
      act((s) => {
        dealId = JuriDAO.createDeal(s, account, {
          freelancer,
          amount: amountMicro,
          deadline: deadlineSec,
          courtId: Number(courtId),
          numJurors: Number(numJurors),
          title,
          description,
          criteria: validCriteria,
        });
      });
      showToast(`Deal #${dealId} created successfully`, 'success');
      navigate(`/deals/${dealId}`);
    } catch (err) {
      // Error handled by act() toast
    }
  };

  const availableFreelancers = Object.entries(ACCOUNTS).filter(([id]) => id !== account);

  return (
    <div className="space-y-8 py-2 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 border-b border-purple-900/40 pb-4">
        <button
          onClick={() => navigate('/deals')}
          className="p-2 rounded-lg text-purple-400 hover:text-white hover:bg-purple-900/40 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Create New Escrow Deal</h1>
          <p className="text-xs text-purple-300">Lock ETH in escrow with binding dispute parameters.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#1c1530] border border-purple-900/50 rounded-2xl p-6 sm:p-8 space-y-6">
        {/* Freelancer */}
        <div className="space-y-2">
          <label htmlFor="freelancerSelect" className="block text-xs font-semibold text-purple-300 uppercase">
            Select Freelancer
          </label>
          <select
            id="freelancerSelect"
            value={freelancer}
            onChange={(e) => setFreelancer(e.target.value)}
            className="w-full bg-[#0f0b1a] border border-purple-800/50 rounded-xl px-4 py-3 text-purple-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[44px]"
          >
            {availableFreelancers.map(([id, info]) => (
              <option key={id} value={id}>
                {info.name} ({id})
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <label htmlFor="dealTitle" className="block text-xs font-semibold text-purple-300 uppercase">
            Deal Title
          </label>
          <input
            id="dealTitle"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#0f0b1a] border border-purple-800/50 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[44px]"
            placeholder="e.g. Website Development"
          />
        </div>

        {/* Amount & Deadline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="dealAmount" className="block text-xs font-semibold text-purple-300 uppercase">
              Amount (ETH)
            </label>
            <input
              id="dealAmount"
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amountEth}
              onChange={(e) => setAmountEth(e.target.value)}
              className="w-full bg-[#0f0b1a] border border-purple-800/50 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[44px]"
              placeholder="1.0"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="dealDays" className="block text-xs font-semibold text-purple-300 uppercase">
              Deadline (Days from now)
            </label>
            <input
              id="dealDays"
              type="number"
              min="1"
              required
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="w-full bg-[#0f0b1a] border border-purple-800/50 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[44px]"
              placeholder="7"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="dealDesc" className="block text-xs font-semibold text-purple-300 uppercase">
            Description
          </label>
          <textarea
            id="dealDesc"
            rows="3"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[#0f0b1a] border border-purple-800/50 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Detailed description of work required..."
          ></textarea>
        </div>

        {/* Delivery Criteria */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold text-purple-300 uppercase">
              Delivery Criteria (At least one)
            </label>
            <button
              type="button"
              onClick={handleAddCriteria}
              className="text-xs text-purple-400 hover:text-purple-200 flex items-center gap-1 font-medium min-h-[44px]"
            >
              <Plus className="w-3.5 h-3.5" />
              Add line
            </button>
          </div>
          {criteria.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                required
                value={item}
                onChange={(e) => handleCriteriaChange(i, e.target.value)}
                className="flex-1 bg-[#0f0b1a] border border-purple-800/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[44px]"
                placeholder={`Criteria #${i + 1}`}
              />
              {criteria.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveCriteria(i)}
                  className="p-2 text-rose-400 hover:bg-rose-950/40 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Court & Jurors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="courtSelect" className="block text-xs font-semibold text-purple-300 uppercase">
              Dispute Court
            </label>
            <select
              id="courtSelect"
              value={courtId}
              onChange={(e) => setCourtId(Number(e.target.value))}
              className="w-full bg-[#0f0b1a] border border-purple-800/50 rounded-xl px-4 py-3 text-purple-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[44px]"
            >
              {state?.courts?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({(c.feePerJuror / 1000000).toFixed(4)} ETH/juror)
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="jurorCountSelect" className="block text-xs font-semibold text-purple-300 uppercase">
              Initial Jury Size
            </label>
            <select
              id="jurorCountSelect"
              value={numJurors}
              onChange={(e) => setNumJurors(Number(e.target.value))}
              className="w-full bg-[#0f0b1a] border border-purple-800/50 rounded-xl px-4 py-3 text-purple-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[44px]"
            >
              <option value={3}>3 Jurors</option>
              <option value={5}>5 Jurors</option>
              <option value={7}>7 Jurors</option>
            </select>
          </div>
        </div>

        {/* Cost Preview Box */}
        <div className="bg-[#0f0b1a] border border-purple-900/50 rounded-xl p-4 flex items-start gap-3 text-xs text-purple-300">
          <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-purple-200">Dispute Fee Preview</div>
            <p>
              If disputed, the person who raises the dispute pays <strong className="text-emerald-400 font-mono">{disputeFeeEth} ETH</strong> ({numJurors} jurors x {(feePerJurorMicro / 1000000).toFixed(4)} ETH).
            </p>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-purple-900/40 text-sm flex items-center justify-center gap-2 min-h-[44px]"
        >
          <Lock className="w-4 h-4" />
          Lock Escrow & Create Deal
        </button>
      </form>
    </div>
  );
}
