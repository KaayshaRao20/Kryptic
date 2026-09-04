import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  accountType: string;
  riskScore: number;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  activeCards: number;
  totalTransactions: number;
  totalVolume: number;
  joinedDate: string;
  status: 'ACTIVE' | 'FLAGGED' | 'FROZEN';
  location?: string;
  defaultScenario?: 'fraud_spike' | 'coordinated' | 'velocity' | 'behavioral';
}

// Registry of realistic enterprise customers mapped to alert scenarios
export const CUSTOMER_REGISTRY: Record<string, CustomerProfile> = {
  'CUST-001': {
    id: 'CUST-001',
    name: 'Apex Merchant Solutions',
    email: 'treasury@apexmerchant.com',
    accountType: 'High-Volume Corporate',
    riskScore: 94,
    riskLevel: 'CRITICAL',
    activeCards: 4,
    totalTransactions: 1247,
    totalVolume: 842000,
    joinedDate: '15 Jan 2025',
    status: 'FLAGGED',
    location: 'Mumbai, India',
    defaultScenario: 'fraud_spike'
  },
  'CUST-002': {
    id: 'CUST-002',
    name: 'Siddharth V. Verma',
    email: 's.verma@fintechmail.com',
    accountType: 'Retail Premium Account',
    riskScore: 89,
    riskLevel: 'CRITICAL',
    activeCards: 2,
    totalTransactions: 834,
    totalVolume: 328000,
    joinedDate: '02 Mar 2025',
    status: 'FLAGGED',
    location: 'Bengaluru, India',
    defaultScenario: 'coordinated'
  },
  'CUST-2048': {
    id: 'CUST-2048',
    name: 'Global Nexus Logistics',
    email: 'billing@nexuslogistics.io',
    accountType: 'Commercial Enterprise',
    riskScore: 78,
    riskLevel: 'HIGH',
    activeCards: 6,
    totalTransactions: 412,
    totalVolume: 512000,
    joinedDate: '10 Nov 2024',
    status: 'ACTIVE',
    location: 'Singapore',
    defaultScenario: 'velocity'
  },
  'CUST-004': {
    id: 'CUST-004',
    name: 'Priya Narayanan',
    email: 'priya.n@domainmail.org',
    accountType: 'Personal Banking',
    riskScore: 58,
    riskLevel: 'MEDIUM',
    activeCards: 1,
    totalTransactions: 289,
    totalVolume: 49500,
    joinedDate: '24 Aug 2025',
    status: 'ACTIVE',
    location: 'Chennai, India',
    defaultScenario: 'behavioral'
  },
  'CUST-005': {
    id: 'CUST-005',
    name: 'Vanguard Retail Traders',
    email: 'ops@vanguardretail.in',
    accountType: 'Merchant Terminal',
    riskScore: 62,
    riskLevel: 'MEDIUM',
    activeCards: 3,
    totalTransactions: 67,
    totalVolume: 185000,
    joinedDate: '19 Feb 2026',
    status: 'ACTIVE',
    location: 'Delhi, India',
    defaultScenario: 'fraud_spike'
  },
  'CUST-006': {
    id: 'CUST-006',
    name: 'Horizon Trade Partners',
    email: 'compliance@horizontrade.eu',
    accountType: 'Cross-Border B2B',
    riskScore: 81,
    riskLevel: 'HIGH',
    activeCards: 5,
    totalTransactions: 523,
    totalVolume: 670000,
    joinedDate: '05 May 2025',
    status: 'FLAGGED',
    location: 'Frankfurt, Germany',
    defaultScenario: 'coordinated'
  }
};

interface CustomerContextType {
  selectedCustomer: CustomerProfile | null;
  selectedCustomerId: string | null;
  activeTransactionId: string | null;
  activeAlertId: string | null;
  isCustomerView: boolean;
  selectCustomer: (
    customerId: string,
    options?: { transactionId?: string; alertId?: string; targetPath?: string }
  ) => void;
  returnToAdmin: () => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract customerId from URL if present: /customer/:customerId/*
  const match = location.pathname.match(/\/customer\/([^/]+)/);
  const urlCustomerId = match ? match[1] : null;

  const [customerId, setCustomerId] = useState<string | null>(urlCustomerId);
  const [activeTransactionId, setActiveTransactionId] = useState<string | null>('TXN-12345');
  const [activeAlertId, setActiveAlertId] = useState<string | null>(null);

  // Sync state with URL parameter changes
  useEffect(() => {
    if (urlCustomerId) {
      setCustomerId(urlCustomerId);
    }
  }, [urlCustomerId]);

  const isCustomerView = Boolean(urlCustomerId || customerId && location.pathname.startsWith('/customer/'));

  // Get or dynamically fabricate fallback profile for any unknown customer ID
  const selectedCustomer: CustomerProfile | null = customerId
    ? CUSTOMER_REGISTRY[customerId] || {
        id: customerId,
        name: `Customer Account ${customerId}`,
        email: `client.${customerId.toLowerCase()}@kryptic-network.com`,
        accountType: 'Enterprise Account',
        riskScore: 85,
        riskLevel: 'HIGH',
        activeCards: 2,
        totalTransactions: 142,
        totalVolume: 94000,
        joinedDate: '12 Jan 2026',
        status: 'FLAGGED'
      }
    : null;

  const selectCustomer = (
    targetCustomerId: string,
    options?: { transactionId?: string; alertId?: string; targetPath?: string }
  ) => {
    setCustomerId(targetCustomerId);
    if (options?.transactionId) setActiveTransactionId(options.transactionId);
    if (options?.alertId) setActiveAlertId(options.alertId);

    const path = options?.targetPath || `/customer/${targetCustomerId}/dashboard`;
    navigate(path);
  };

  const returnToAdmin = () => {
    setCustomerId(null);
    setActiveAlertId(null);
    navigate('/admin/alerts');
  };

  return (
    <CustomerContext.Provider
      value={{
        selectedCustomer,
        selectedCustomerId: customerId,
        activeTransactionId,
        activeAlertId,
        isCustomerView,
        selectCustomer,
        returnToAdmin
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = (): CustomerContextType => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};
