import React from 'react';
import { BookOpen, Scale, ShieldAlert, Award, RefreshCw, FileText, CheckCircle } from 'lucide-react';

export function GuidePage() {
  return (
    <div className="space-y-10 py-2 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-purple-900/40 pb-6 space-y-2">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-purple-400" />
          JuriDAO Protocol Guide
        </h1>
        <p className="text-purple-300 text-sm sm:text-base">
          Complete lifecycle documentation, worked incentive calculations, and juror guidelines.
        </p>
      </div>

      {/* Section 1: Lifecycle & Sam/Deepa Example */}
      <section className="bg-[#1c1530] border border-purple-900/40 rounded-xl p-6 sm:p-8 space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-400" />
          1. Six-Step Dispute Lifecycle (Sam & Deepa Example)
        </h2>

        <div className="space-y-4 text-xs sm:text-sm text-purple-300 leading-relaxed">
          <div className="p-4 rounded-lg bg-[#0f0b1a] border border-purple-900/40 space-y-2">
            <h4 className="font-semibold text-purple-200">Step 1: Deal Creation</h4>
            <p>Sam (client) creates a deal with Deepa (freelancer) for 1 ETH in Court 2 (Freelance & Services) with 3 jurors requested. 1 ETH is locked from Sam's balance.</p>
          </div>
          <div className="p-4 rounded-lg bg-[#0f0b1a] border border-purple-900/40 space-y-2">
            <h4 className="font-semibold text-purple-200">Step 2: Delivery & Dispute</h4>
            <p>Deepa marks the deal as delivered. Sam disagrees with the work quality and refuses approval. Deepa raises a dispute by paying the 0.006 ETH jury fee (0.002 ETH x 3 jurors).</p>
          </div>
          <div className="p-4 rounded-lg bg-[#0f0b1a] border border-purple-900/40 space-y-2">
            <h4 className="font-semibold text-purple-200">Step 3: Evidence Submission</h4>
            <p>During the 90-second Evidence window, both Sam and Deepa submit written briefs and delivery files. Each file receives a cryptographic fingerprint badge.</p>
          </div>
          <div className="p-4 rounded-lg bg-[#0f0b1a] border border-purple-900/40 space-y-2">
            <h4 className="font-semibold text-purple-200">Step 4: Stake-Weighted Draw & Commit</h4>
            <p>Jurors are randomly drawn from Court 2 stakers (excluding Sam and Deepa). Drawn jurors commit a salted hash of their vote during the 60-second Commit period.</p>
          </div>
          <div className="p-4 rounded-lg bg-[#0f0b1a] border border-purple-900/40 space-y-2">
            <h4 className="font-semibold text-purple-200">Step 5: Reveal & Tally</h4>
            <p>Jurors reveal their secret choice and salt during the 60-second Reveal period. The engine tallies votes and records justifications.</p>
          </div>
          <div className="p-4 rounded-lg bg-[#0f0b1a] border border-purple-900/40 space-y-2">
            <h4 className="font-semibold text-purple-200">Step 6: Appeal Window & Payout</h4>
            <p>Parties have 90 seconds to fund an appeal. If unfunded, the ruling executes: Ruling 1 pays Deepa; Ruling 2 refunds Sam; Ruling 0 splits 50/50.</p>
          </div>
        </div>
      </section>

      {/* Section 2: What is a Juror & Selection */}
      <section className="bg-[#1c1530] border border-purple-900/40 rounded-xl p-6 sm:p-8 space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Scale className="w-5 h-5 text-sky-400" />
          2. What is a Juror & Selection Mechanics
        </h2>
        <p className="text-xs sm:text-sm text-purple-300 leading-relaxed">
          A juror is an account that stakes JURI tokens into one or more specialized courts. Selection uses a <strong>stake-weighted random draw</strong>: the higher your staked JURI relative to the court total, the higher your probability of receiving one or more draws.
        </p>
        <ul className="list-disc list-inside space-y-1 text-xs text-purple-300">
          <li><strong>Repeats allowed:</strong> A single juror can be drawn multiple times in a round (each draw counts as a vote).</li>
          <li><strong>Parties excluded:</strong> The client and freelancer of a case can never be drawn as jurors for that case.</li>
          <li><strong>Stake Lock:</strong> When drawn, <code className="text-purple-200">minStake * alpha / 10000</code> JURI is locked per draw (e.g. 250 JURI in Court 2).</li>
        </ul>
      </section>

      {/* Section 3: Commit & Reveal */}
      <section className="bg-[#1c1530] border border-purple-900/40 rounded-xl p-6 sm:p-8 space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-amber-400" />
          3. Commit & Reveal Scheme
        </h2>
        <p className="text-xs sm:text-sm text-purple-300 leading-relaxed">
          To prevent jurors from copying majority votes during active voting, JuriDAO enforces a two-phase scheme:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-[#0f0b1a] border border-purple-900/30 space-y-2">
            <h4 className="font-semibold text-purple-200">1. Commit Phase</h4>
            <p className="text-purple-300">
              Juror computes <code className="text-purple-200">hash(choice, salt, account)</code> and submits the sealed string. No vote choices are public during this period.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-[#0f0b1a] border border-purple-900/30 space-y-2">
            <h4 className="font-semibold text-purple-200">2. Reveal Phase</h4>
            <p className="text-purple-300">
              Juror submits raw <code className="text-purple-200">choice</code> and <code className="text-purple-200">salt</code>. The contract verifies the hash matches. Only valid reveals count towards the tally.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Rewards & Penalties (Worked Example) */}
      <section className="bg-[#1c1530] border border-purple-900/40 rounded-xl p-6 sm:p-8 space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-400" />
          4. Rewards & Penalties (Worked Numbers)
        </h2>
        <div className="text-xs sm:text-sm text-purple-300 space-y-3 leading-relaxed">
          <p>Consider <strong>Court 2 (Freelance & Services)</strong>: fee 0.002 ETH/juror, minStake 500 JURI, alpha 5000 (250 JURI locked per vote).</p>
          <div className="p-4 rounded-lg bg-[#0f0b1a] border border-purple-900/40 space-y-2 font-mono text-xs">
            <div>• Round 0: 3 jurors. Total court fee paid = 0.006 ETH.</div>
            <div>• Vote outcome: 2 jurors vote Freelancer (1), 1 juror votes Client (2). Ruling = 1.</div>
            <div>• Coherent jurors (voted 1): Share 0.006 ETH fee (0.003 ETH each) + share incoherent juror's 250 JURI penalty (125 JURI each).</div>
            <div>• Incoherent juror (voted 2): Receives 0 ETH and loses 250 JURI locked stake.</div>
          </div>
        </div>
      </section>

      {/* Section 5: Appeals & Costs */}
      <section className="bg-[#1c1530] border border-purple-900/40 rounded-xl p-6 sm:p-8 space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          5. Appeals & Funding Rules
        </h2>
        <div className="text-xs sm:text-sm text-purple-300 space-y-2 leading-relaxed">
          <p>• <strong>Next Jury Size:</strong> <code className="text-purple-200">2 * currentDraws + 1</code> (3 → 7 → 15). Max 3 rounds.</p>
          <p>• <strong>Defending Side Fee:</strong> Base fee for new jury (<code className="text-purple-200">feePerJuror * nextDraws</code>).</p>
          <p>• <strong>Challenging Side Fee:</strong> Double the base fee (<code className="text-purple-200">2 * feePerJuror * nextDraws</code>).</p>
          <p>• <strong>Half-Window Rule:</strong> The challenging side can only fund during the first half of the Appeal window.</p>
          <p>• <strong>Outcome:</strong> If both sides fully fund, a new round starts. If only one side funds, it wins by default and contributors are refunded. If neither funds, the ruling stands.</p>
        </div>
      </section>

      {/* Footer */}
      <div className="text-center text-xs text-purple-400 pt-4 border-t border-purple-900/30">
        Inspired by Kleros. Simulation for hackathon demo.
      </div>
    </div>
  );
}
