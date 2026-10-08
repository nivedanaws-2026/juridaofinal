import React, { createContext, useContext, useState } from 'react';

const MockStoreContext = createContext();

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

export function MockStoreProvider({ children }) {
  const [account, setAccount] = useState('admin');
  const [mode, setMode] = useState('deals'); // 'deals' | 'juror'
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <MockStoreContext.Provider value={{ account, setAccount, mode, setMode, showToast, toast }}>
      {children}
    </MockStoreContext.Provider>
  );
}

export function useMockStore() {
  return useContext(MockStoreContext);
}
