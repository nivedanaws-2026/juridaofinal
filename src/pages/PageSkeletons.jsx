import React from 'react';
import { EmptyState } from '../components/EmptyState';

export function LandingPage() {
  return (
    <div className="space-y-8">
      <div className="bg-[#1c1530] border border-purple-900/50 rounded-2xl p-8 text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Disputes resolved by a decentralized jury
        </h1>
        <p className="text-purple-300 max-w-2xl mx-auto text-base sm:text-lg">
          When a smart contract can't decide who is right, JuriDAO can.
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-4">
          <a href="/deals/new" className="bg-purple-600 hover:bg-purple-500 text-white font-medium px-5 py-2.5 rounded-lg transition-colors min-h-[44px] flex items-center">
            Create a deal
          </a>
          <a href="/courts" className="bg-purple-950/80 hover:bg-purple-900 border border-purple-700/50 text-purple-200 font-medium px-5 py-2.5 rounded-lg transition-colors min-h-[44px] flex items-center">
            Become a juror
          </a>
        </div>
      </div>
      <EmptyState title="Landing Page Skeleton" description="Phase 1 shell active. Full landing features will be built in Phase 3." />
    </div>
  );
}

export function DealsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Deals</h1>
        <a href="/deals/new" className="bg-purple-600 hover:bg-purple-500 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors min-h-[44px] flex items-center">
          + New Deal
        </a>
      </div>
      <EmptyState title="No Deals Found" description="Deals created by Sam or Deepa will appear here." />
    </div>
  );
}

export function NewDealPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white">Create New Deal</h1>
      <EmptyState title="Create Deal Form Skeleton" description="Form controls will be interactive in Phase 6." />
    </div>
  );
}

export function DealDetailPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Deal Details</h1>
      <EmptyState title="Deal Details Skeleton" description="Individual deal specifications will render here." />
    </div>
  );
}

export function DisputeDetailPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Dispute #1</h1>
      <EmptyState title="Dispute Resolution Center" description="Voting timeline, evidence, and juror panel will render here in Phase 7." />
    </div>
  );
}

export function JurorDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Juror Dashboard</h1>
      <EmptyState title="Juror Dashboard Skeleton" description="Staked courts, performance metrics, and pending actions in Phase 5." />
    </div>
  );
}

export function CourtsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Courts & Token Staking</h1>
      <EmptyState title="Courts Table Skeleton" description="Token buy panel and court staking interface will render in Phase 4." />
    </div>
  );
}

export function CasesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">My Cases</h1>
      <EmptyState title="No Assigned Cases" description="Cases where your account has been drawn as a juror will appear here." />
    </div>
  );
}

export function RewardsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Rewards & Penalties</h1>
      <EmptyState title="No Unclaimed Rewards" description="ETH fee earnings and JURI rewards will be claimable here." />
    </div>
  );
}

export function GuidePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">JuriDAO Protocol Guide</h1>
      <EmptyState title="Guide & Documentation Skeleton" description="Interactive protocol documentation will render in Phase 3." />
    </div>
  );
}

export function NotificationsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Notifications</h1>
      <EmptyState title="No Notifications" description="System alerts and case draw notifications will appear here." />
    </div>
  );
}

export function AdminPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Demo Admin Controls</h1>
      <EmptyState title="Admin Panel Skeleton" description="Time-skipping, state resets, and self-test runners will be available here." />
    </div>
  );
}

export function TestLabPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Test Lab</h1>
      <EmptyState title="Test Lab Skeleton" description="Automated flow tests, scenario seeds, and inspection tools in Phase 9." />
    </div>
  );
}
