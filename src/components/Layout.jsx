import React from 'react';
import { Header } from '../components/Header';
import { Banner } from '../components/Banner';
import { Toast } from '../components/Toast';

export function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#0f0b1a] text-purple-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      <Banner />
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      <footer className="border-t border-purple-900/30 py-6 bg-[#171126] text-purple-400 text-xs sm:text-sm text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>Inspired by Kleros. Simulation for hackathon demo.</p>
          <div className="flex gap-4">
            <a href="/guide" className="hover:text-purple-200 transition-colors">Guide</a>
            <a href="/admin" className="hover:text-purple-200 transition-colors">Admin</a>
            <a href="/testlab" className="hover:text-purple-200 transition-colors">Test Lab</a>
          </div>
        </div>
      </footer>
      <Toast />
    </div>
  );
}
