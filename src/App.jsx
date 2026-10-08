import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './lib/store';
import { Layout } from './components/Layout';
import {
  DealsPage,
  NewDealPage,
  DealDetailPage,
  DisputeDetailPage,
  NotificationsPage,
  TestLabPage,
} from './pages/PageSkeletons';
import { LandingPage } from './pages/LandingPage';
import { GuidePage } from './pages/GuidePage';
import { CourtsPage } from './pages/CourtsPage';
import { JurorDashboardPage } from './pages/JurorDashboardPage';
import { CasesPage } from './pages/CasesPage';
import { RewardsPage } from './pages/RewardsPage';
import { AdminPage } from './pages/AdminPage';

export default function App() {
  return (
    <StoreProvider>
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
    </StoreProvider>
  );
}
