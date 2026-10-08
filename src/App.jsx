import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MockStoreProvider } from './context/MockStoreContext';
import { Layout } from './components/Layout';
import {
  LandingPage,
  DealsPage,
  NewDealPage,
  DealDetailPage,
  DisputeDetailPage,
  JurorDashboardPage,
  CourtsPage,
  CasesPage,
  RewardsPage,
  GuidePage,
  NotificationsPage,
  AdminPage,
  TestLabPage,
} from './pages/PageSkeletons';

export default function App() {
  return (
    <MockStoreProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/deals" element={<DealsPage />} />
            <Route path="/deals/new" element={<NewDealPage />} />
            <Route path="/deals/:id" element={<DealDetailPage />} />
            <Route path="/disputes/:id" element={<DisputeDetailPage />} />
            <Route path="/juror" element={<JurorDashboardPage />} />
            <Route path="/courts" element={<CourtsPage />} />
            <Route path="/cases" element={<CasesPage />} />
            <Route path="/cases/:id" element={<DisputeDetailPage />} />
            <Route path="/rewards" element={<RewardsPage />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/testlab" element={<TestLabPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </MockStoreProvider>
  );
}
