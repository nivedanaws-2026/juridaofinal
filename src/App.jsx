import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './lib/store';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { GuidePage } from './pages/GuidePage';
import { CourtsPage } from './pages/CourtsPage';
import { JurorDashboardPage } from './pages/JurorDashboardPage';
import { CasesPage } from './pages/CasesPage';
import { RewardsPage } from './pages/RewardsPage';
import { DealsPage } from './pages/DealsPage';
import { NewDealPage } from './pages/NewDealPage';
import { DealDetailPage } from './pages/DealDetailPage';
import { DisputeDetailPage } from './pages/DisputeDetailPage';
import { JurorCasePage } from './pages/JurorCasePage';
import { AdminPage } from './pages/AdminPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { TestLabPage } from './pages/TestLabPage';

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
            <Route path="/cases/:id" element={<JurorCasePage />} />
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
