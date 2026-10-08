import React, { useState } from 'react';
import { useJuri, ACCOUNTS } from '../lib/store';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import JuriDAO from '../lib/juridao-engine';
import { BuyJuriModal } from '../components/BuyJuriModal';
import { Scale, Bell, Menu, X, Plus } from 'lucide-react';

export function Header() {
  const { state, account, setAccount, mode, setMode, showToast } = useJuri();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const currentAcc = state?.accounts?.[account] || { eth: 10000000, juri: 0 };
  const ethFormatted = (currentAcc.eth / 1000000).toFixed(4);
  const juriFormatted = currentAcc.juri.toLocaleString();

  // Notifications & Unread calculation
  const notifications = JuriDAO.notificationsFor(state, account) || [];
  let readState = {};
  try {
    const raw = localStorage.getItem(`juri_notifications_read_${account}`);
    if (raw) readState = JSON.parse(raw);
  } catch (e) {}
  const unreadCount = notifications.filter(n => !readState[n.at]).length;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Deals', path: '/deals' },
    { name: 'Courts', path: '/courts' },
    { name: 'My Cases', path: '/cases' },
    { name: 'Rewards', path: '/rewards' },
    { name: 'Guide', path: '/guide' },
    { name: 'Admin', path: '/admin' },
    { name: 'Test Lab', path: '/testlab' },
  ];

  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (newMode === 'deals') {
      navigate('/deals');
    } else {
      navigate('/juror');
    }
  };

  return (
    <header className="bg-[#1c1530] border-b border-purple-900/40 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-purple-400 font-bold text-xl tracking-wider">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-purple-700 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-900/50">
                <Scale className="w-5 h-5" />
              </div>
              <span>JuriDAO</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-purple-900/60 text-purple-200 border border-purple-700/50'
                      : 'text-purple-300 hover:text-purple-100 hover:bg-purple-900/30'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mode Toggle */}
            <div className="bg-[#0f0b1a] p-1 rounded-lg border border-purple-800/40 hidden sm:flex text-xs">
              <button
                onClick={() => handleModeChange('deals')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  mode === 'deals' ? 'bg-purple-600 text-white shadow' : 'text-purple-400 hover:text-purple-200'
                }`}
              >
                Deals
              </button>
              <button
                onClick={() => handleModeChange('juror')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  mode === 'juror' ? 'bg-purple-600 text-white shadow' : 'text-purple-400 hover:text-purple-200'
                }`}
              >
                Juror
              </button>
            </div>

            {/* Balances & Buy JURI */}
            <div className="flex items-center gap-2 bg-[#0f0b1a] px-2.5 py-1.5 rounded-lg border border-purple-900/50 text-xs sm:text-sm">
              <span className="text-emerald-400 font-mono font-medium">{ethFormatted} ETH</span>
              <span className="text-purple-700">|</span>
              <span className="text-sky-400 font-mono font-medium">{juriFormatted} JURI</span>
              <button
                onClick={() => setBuyModalOpen(true)}
                className="ml-1 bg-purple-700 hover:bg-purple-600 text-white px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1 transition-colors min-h-[32px] sm:min-h-0 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span className="hidden min-[400px]:inline">Buy JURI</span>
              </button>
            </div>

            {/* Notifications Bell with Unread Badge */}
            <Link
              to="/notifications"
              className="p-2 text-purple-300 hover:text-purple-100 hover:bg-purple-900/40 rounded-lg relative transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Account Selector */}
            <div className="relative">
              <select
                value={account}
                onChange={(e) => {
                  setAccount(e.target.value);
                  showToast(`Switched account to ${ACCOUNTS[e.target.value].name}`, 'info');
                }}
                className="bg-purple-950/80 border border-purple-700/60 text-purple-200 text-xs sm:text-sm rounded-lg px-2.5 py-1.5 pr-7 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer min-h-[44px] sm:min-h-0"
              >
                {Object.entries(ACCOUNTS).map(([id, info]) => (
                  <option key={id} value={id} className="bg-[#1c1530] text-purple-200">
                    {info.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-purple-300 hover:text-purple-100 hover:bg-purple-900/40 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#1c1530] border-b border-purple-800/50 px-4 pt-2 pb-4 space-y-2">
          <div className="flex bg-[#0f0b1a] p-1 rounded-lg border border-purple-800/40 mb-3">
            <button
              onClick={() => {
                handleModeChange('deals');
                setMobileMenuOpen(false);
              }}
              className={`flex-1 py-2 text-center rounded-md font-medium text-xs transition-all ${
                mode === 'deals' ? 'bg-purple-600 text-white' : 'text-purple-400'
              }`}
            >
              Deals Mode
            </button>
            <button
              onClick={() => {
                handleModeChange('juror');
                setMobileMenuOpen(false);
              }}
              className={`flex-1 py-2 text-center rounded-md font-medium text-xs transition-all ${
                mode === 'juror' ? 'bg-purple-600 text-white' : 'text-purple-400'
              }`}
            >
              Juror Mode
            </button>
          </div>

          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-md text-base font-medium min-h-[44px] flex items-center ${
                  isActive
                    ? 'bg-purple-900/60 text-purple-200 border border-purple-700/50'
                    : 'text-purple-300 hover:text-purple-100 hover:bg-purple-900/30'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      )}

      {/* Buy JURI Modal */}
      <BuyJuriModal isOpen={buyModalOpen} onClose={() => setBuyModalOpen(false)} />
    </header>
  );
}
