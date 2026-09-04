import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type EnvironmentMode = 'TEST' | 'LIVE';

interface EnvironmentContextType {
  mode: EnvironmentMode;
  setMode: (mode: EnvironmentMode) => void;
  toggleMode: () => void;
  isLive: boolean;
  merchantId: string;
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(undefined);

export const EnvironmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<EnvironmentMode>(() => {
    return (localStorage.getItem('kryptic_env_mode') as EnvironmentMode) || 'TEST';
  });

  const setMode = (newMode: EnvironmentMode) => {
    setModeState(newMode);
    localStorage.setItem('kryptic_env_mode', newMode);
  };

  const toggleMode = () => {
    setMode(mode === 'TEST' ? 'LIVE' : 'TEST');
  };

  const isLive = mode === 'LIVE';
  const merchantId = isLive ? 'mer_rzp_live_98421' : 'mer_rzp_test_TWpQ';

  return (
    <EnvironmentContext.Provider
      value={{
        mode,
        setMode,
        toggleMode,
        isLive,
        merchantId
      }}
    >
      {children}
    </EnvironmentContext.Provider>
  );
};

export const useEnvironment = () => {
  const context = useContext(EnvironmentContext);
  if (!context) {
    throw new Error('useEnvironment must be used within an EnvironmentProvider');
  }
  return context;
};
