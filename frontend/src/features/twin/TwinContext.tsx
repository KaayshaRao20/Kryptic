import React, { createContext, useContext, useEffect, useState } from 'react';
import type { TwinTopology } from '../../types';
import { MockTwinService } from '../../services/MockTwinService';

interface TwinContextState {
  topology: TwinTopology | null;
  isLoading: boolean;
  error: Error | null;
  refreshTopology: () => Promise<void>;
}

const TwinContext = createContext<TwinContextState | undefined>(undefined);

const twinService = new MockTwinService();

export const TwinProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [topology, setTopology] = useState<TwinTopology | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTopology = async () => {
    try {
      setIsLoading(true);
      const data = await twinService.getTopology();
      setTopology(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch topology'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTopology();
  }, []);

  return (
    <TwinContext.Provider value={{ topology, isLoading, error, refreshTopology: fetchTopology }}>
      {children}
    </TwinContext.Provider>
  );
};

export const useTwinEngine = () => {
  const context = useContext(TwinContext);
  if (context === undefined) {
    throw new Error('useTwinEngine must be used within a TwinProvider');
  }
  return context;
};
