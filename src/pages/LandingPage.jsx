import React from 'react';
import { useJuri } from '../lib/store';
import { Link } from 'react-router-dom';
import { Scale, ShieldCheck, Lock, Gavel, ArrowRight, HelpCircle, Users, Coins, CheckCircle, Zap } from 'lucide-react';

export function LandingPage() {
  const { state } = useJuri();

  // Compute live stats (labelled "demo data")
  const executedDisputes = state?.disputes?.filter(d => d.period === 'Executed')?.length || 0;
  
  const totalStakedJuri = state?.courts?.reduce((sum, c) => sum + (c.totalStaked || 0), 0) || 0;
  
  const lockedEthMicro = state?.deals?.reduce((sum, deal) => {
    if (['Created', 'Delivered', 'Disputed'].includes(deal.status)) {
      return sum + (deal.amount || 0);
    }
    return sum;
  }, 0) || 0;
  const lockedEth = (lockedEthMicro / 1000000).toFixed(4);

  return (
    <div className="space-y-12 py-2">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#1c1530] to-[#140e24] border border-purple-900/50 rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/50 border border-purple-700/40 text-purple-300 text-xs font-semibold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5 text-purple-400" />
            Decentralized Arbitration Engine
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Disputes resolved by a decentralized jury
          </h1>
          
          <p className="text-purple-300 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed">
            When a smart contract can't decide who is right, JuriDAO can.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link
              to="/deals/new"
              className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-purple-900/40 flex items-center gap-2 min-h-[44px]"
            >
              Create a deal
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/courts"
              className="bg-purple-950/80 hover:bg-purple-900 border border-purple-700/50 text-purple-200 font-semibold px-6 py-3 rounded-xl transition-colors min-h-[44px] flex items-center"
            >
              Become a juror
            </Link>
          </div>
        </div>
      </section>

      {/* Live Stats (demo data) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1c1530] border border-purple-900/40 rounded-xl p-6 text-center space-y-1 relative">
          <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400/80 absolute top-3 right-3 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
            demo data
          </span>
          <div className="text-3xl sm:text-4xl font-black text-white">{executedDisputes}</div>
          <div className="text-sm font-medium text-purple-300">Disputes Executed</div>
        </div>
        <div className="bg-[#1c1530] border border-purple-900/40 rounded-xl p-6 text-center space-y-1 relative">
          <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400/80 absolute top-3 right-3 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
            demo data
          </span>
          <div className="text-3xl sm:text-4xl font-black text-sky-400">{totalStakedJuri.toLocaleString()}</div>
          <div className="text-sm font-medium text-purple-300">Total JURI Staked</div>
        </div>
        <div className="bg-[#1c1530] border border-purple-900/40 rounded-xl p-6 text-center space-y-1 relative">
          <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400/80 absolute top-3 right-3 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
            demo data
          </span>
          <div className="text-3xl sm:text-4xl font-black text-emerald-400">{lockedEth} ETH</div>
          <div className="text-sm font-medium text-purple-300">ETH Locked in Active Deals</div>
        </div>
      </section>

      {/* Sam & Deepa Story Line */}
      <section className="bg-[#171126] border border-purple-900/30 rounded-xl p-6 sm:p-8 space-y-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          The Escrow Problem Story
        </h2>
        <div className="space-y-2 text-sm text-purple-300 leading-relaxed">
          <p>1. Sam (client) hires Deepa (freelancer) for a web design task, locking 1 ETH into a smart escrow contract.</p>
          <p>2. Deepa finishes the project and delivers the code, but Sam claims it fails to meet the mobile responsiveness criteria.</p>
          <p>3. Because code alone cannot objectively evaluate design quality, JuriDAO draws a stake-weighted random jury to review evidence and settle the payment automatically.</p>
        </div>
      </section>

      {/* Six Lifecycle Steps */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">How JuriDAO Works</h2>
          <p className="text-sm text-purple-300">Six steps from escrow creation to final automated ruling payout</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { num: 1, title: 'Create the deal', desc: 'Client locks ETH escrow, specifies delivery criteria, deadline, court, and initial jury size.' },
            { num: 2, title: 'Evidence submission', desc: 'If disputed, client and freelancer submit text descriptions, specs, and cryptographic file fingerprints.' },
            { num: 3, title: 'Jurors drawn', desc: 'Jurors are randomly drawn based on their staked JURI tokens. Case parties are strictly excluded.' },
            { num: 4, title: 'Vote (sealed commit)', desc: 'Jurors review criteria and submit secret salted votes during the Commit period to prevent bandwagoning.' },
            { num: 5, title: 'Reveal & Tally', desc: 'Jurors reveal choices with salts and justifications. Public vote tallies determine the round ruling.' },
            { num: 6, title: 'Appeal & Payout', desc: 'Parties can fund an appeal to escalate to a larger jury, or the ruling executes payout automatically.' },
          ].map((step) => (
            <div key={step.num} className="bg-[#1c1530] border border-purple-900/40 rounded-xl p-6 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-purple-900/60 border border-purple-700/50 text-purple-200 font-bold flex items-center justify-center text-sm">
                {step.num}
              </div>
              <h3 className="font-semibold text-white text-base">{step.title}</h3>
              <p className="text-xs text-purple-300 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why JuriDAO Cards */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white text-center">Why JuriDAO</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#1c1530] border border-purple-900/40 rounded-xl p-6 space-y-3">
            <Users className="w-8 h-8 text-sky-400" />
            <h3 className="font-semibold text-white">Random Jurors</h3>
            <p className="text-xs text-purple-300">Stake-weighted draw selects independent jurors across specialized court categories.</p>
          </div>
          <div className="bg-[#1c1530] border border-purple-900/40 rounded-xl p-6 space-y-3">
            <Coins className="w-8 h-8 text-emerald-400" />
            <h3 className="font-semibold text-white">Fair Incentives</h3>
            <p className="text-xs text-purple-300">Coherent majority jurors earn ETH fees and JURI rewards; dishonest or late jurors lose stake.</p>
          </div>
          <div className="bg-[#1c1530] border border-purple-900/40 rounded-xl p-6 space-y-3">
            <ShieldCheck className="w-8 h-8 text-purple-400" />
            <h3 className="font-semibold text-white">Transparent</h3>
            <p className="text-xs text-purple-300">All evidence fingerprints, vote commits, reveals, and appeal tallies are verifiable on-chain.</p>
          </div>
          <div className="bg-[#1c1530] border border-purple-900/40 rounded-xl p-6 space-y-3">
            <Zap className="w-8 h-8 text-amber-400" />
            <h3 className="font-semibold text-white">Automatic Enforcement</h3>
            <p className="text-xs text-purple-300">Keeper execution releases funds directly to the winning party upon resolution.</p>
          </div>
        </div>
      </section>

      {/* Audience Blocks */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1c1530] border border-purple-900/40 rounded-xl p-6 space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            For Clients & Freelancers
          </h3>
          <ul className="space-y-2 text-xs text-purple-300">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <span>Lock escrow safely with clear delivery criteria prior to work commencement.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <span>Raise low-cost disputes when subjective delivery disputes occur.</span>
            </li>
          </ul>
          <Link to="/deals/new" className="inline-block bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
            Create Deal →
          </Link>
        </div>

        <div className="bg-[#1c1530] border border-purple-900/40 rounded-xl p-6 space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            For Staked Jurors
          </h3>
          <ul className="space-y-2 text-xs text-purple-300">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <span>Stake JURI in specialized courts (General, Freelance, Code) to receive draw selection.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <span>Review evidence impartially and earn ETH fee rewards for coherent voting.</span>
            </li>
          </ul>
          <Link to="/courts" className="inline-block bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
            Join Courts →
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-[#1c1530] border border-purple-900/40 rounded-xl p-6 sm:p-8 space-y-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-purple-400" />
          Frequently Asked Questions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-2">
            <h4 className="font-semibold text-white">How does commit & reveal voting work?</h4>
            <p className="text-xs text-purple-300 leading-relaxed">
              To prevent jurors from copying others, votes are hashed with a random salt during the Commit period. Once Commit closes, jurors reveal their choice and salt so the contract can verify matches.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-white">What happens if a juror misses a vote?</h4>
            <p className="text-xs text-purple-300 leading-relaxed">
              Jurors who fail to commit or reveal lose their locked JURI stake for that case. Penalties are redistributed to coherent jurors or sent to the DAO treasury.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-white">How do appeals work?</h4>
            <p className="text-xs text-purple-300 leading-relaxed">
              Either party can appeal a ruling by funding court fees within the Appeal window. If funded, a new round opens with more than double the jury size (3 → 7 → 15).
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-white">Is real money used in this demo?</h4>
            <p className="text-xs text-purple-300 leading-relaxed">
              No. This app runs entirely in simulation mode with dummy ETH and dummy JURI tokens stored in your browser's local state.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
