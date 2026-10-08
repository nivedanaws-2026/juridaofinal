import React, { createContext, useContext, useState, useEffect } from 'react';
import JuriDAO from '../lib/juridao-engine';

const StoreContext = createContext();
const STORAGE_KEY = 'juridao_state_v2';

export const ACCOUNTS = {
  admin: { name: 'Admin', role: 'Demo controls' },
  sam: { name: 'Sam (client)', role: 'Client' },
  deepa: { name: 'Deepa (freelancer)', role: 'Freelancer' },
  juror1: { name: 'Juror 1', role: 'Staked juror' },
  juror2: { name: 'Juror 2', role: 'Staked juror' },
  juror3: { name: 'Juror 3', role: 'Staked juror' },
  juror4: { name: 'Juror 4', role: 'Staked juror' },
  juror5: { name: 'Juror 5', role: 'Staked juror' },
  juror6: { name: 'Juror 6', role: 'Staked juror' },
  juror7: { name: 'Juror 7', role: 'Staked juror' },
  funder: { name: 'Appeal funder', role: 'Appeal funding' },
};

function loadInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load state from localStorage:', e);
  }
  return JuriDAO.createInitialState();
}

export function StoreProvider({ children }) {
  const [state, setState] = useState(() => {
    const s = loadInitialState();
    // Expose console helpers
    if (typeof window !== 'undefined') {
      window.JuriDAO = JuriDAO;
      window.juriState = () => s;
    }
    return s;
  });

  const [account, setAccount] = useState('admin');
  const [mode, setMode] = useState('deals'); // 'deals' | 'juror'
  const [toast, setToast] = useState(null);

  // Update window.juriState whenever state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.JuriDAO = JuriDAO;
      window.juriState = () => state;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }, [state]);

  // 2-second keeper autoAdvance loop
  useEffect(() => {
    const interval = setInterval(() => {
      setState((currentState) => {
        const nextState = { ...currentState };
        try {
          JuriDAO.autoAdvance(nextState);
          return nextState;
        } catch (e) {
          console.error('autoAdvance error:', e);
          return currentState;
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 3500);
  };

  const act = (fn) => {
    try {
      const nextState = { ...state };
      const result = fn(nextState);
      setState(nextState);
      return result;
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
      throw err;
    }
  };

  return (
    <StoreContext.Provider value={{ state, setState, account, setAccount, mode, setMode, act, showToast, toast }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useJuri() {
  return useContext(StoreContext);
}
