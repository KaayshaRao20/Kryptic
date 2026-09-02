// ─── Centralized Cross-System Risk Intelligence Data Service ─────────────────
// Generic system names strictly adhere to requirement: System A, System B, System C, System D

export type SystemId = 'SYS-A' | 'SYS-B' | 'SYS-C' | 'SYS-D';
export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface PaymentSystemInfo {
  id: SystemId;
  name: string; // "System A", "System B", etc.
  category: string; // "Payment Gateway", "UPI Provider", "Banking Partner"
  status: 'Active' | 'Degraded' | 'Offline';
  transactionCount: number;
  lastSeen: string;
  riskScore: number;
  sparkline: number[];
  color: {
    stroke: string;
    bg: string;
    text: string;
    lightBg: string;
    border: string;
  };
}

export interface EntityAttribute {
  id: string;
  type: 'Device' | 'IP Address' | 'Email' | 'Account';
  label: string;
  value: string;
  systemsObserved: SystemId[];
  isAnomalous: boolean;
  notes: string;
}

export interface CrossSystemConnection {
  systemId: SystemId;
  systemName: string;
  transactionCount: number;
  riskScore: number;
  connectionType: 'TRANSACTION_FLOW' | 'WEAK_CONNECTION';
  anomalyWeight: number; // 0 - 100
  signals: string[];
  lastActivity: string;
}

export interface ExposedArea {
  id: string;
  title: string;
  systemName: string;
  reason: string;
  riskLevel: RiskLevel;
}

export interface RiskFactor {
  id: string;
  label: string;
  level: RiskLevel;
  iconType: 'triangle' | 'clock' | 'fingerprint' | 'network' | 'shield';
}

export interface EntityTimelineEvent {
  id: string;
  timestamp: string;
  timeAgo: string;
  systemId: SystemId;
  systemName: string;
  action: string;
  amount?: string;
  riskLevel: RiskLevel;
  signalDetail: string;
  channel: string;
  ip: string;
  device: string;
}

export interface RiskEntity {
  id: string; // e.g. "Entity E-2048"
  riskLevel: RiskLevel;
  riskScore: number; // e.g. 78
  riskCategory: string; // "Very High Risk"
  firstSeen: string; // "12 Aug 2026"
  lastSeen: string; // "01 Sep 2026, 10:31 AM"
  totalTransactions: number; // 48,816
  systemsInvolved: number; // 3
  attributes: EntityAttribute[];
  riskFactors: RiskFactor[];
  topExposedAreas: ExposedArea[];
  connections: Record<SystemId, CrossSystemConnection>;
  timeline: EntityTimelineEvent[];
}

export interface CrossSystemAlert {
  id: string;
  entityId: string;
  title: string;
  description: string;
  timestamp: string;
  timeAgo: string;
  severity: RiskLevel;
  systemsInvolved: SystemId[];
  isRead: boolean;
}

export interface CorrelatedTransaction {
  id: string;
  entityId: string;
  systemId: SystemId;
  systemName: string;
  type: string;
  amount: number;
  timestamp: string;
  status: 'Flagged' | 'Monitored' | 'Challenged' | 'Passed';
  riskScore: number;
  primarySignal: string;
  ipAddress: string;
  deviceId: string;
}

// ─── Centralized Seed Data ───────────────────────────────────────────────────

export const CONFIGURED_SYSTEMS: PaymentSystemInfo[] = [
  {
    id: 'SYS-A',
    name: 'System A',
    category: 'Payment Gateway',
    status: 'Active',
    transactionCount: 125430,
    lastSeen: '10:31 AM',
    riskScore: 72,
    sparkline: [22, 28, 24, 38, 30, 48, 42, 54, 46, 62],
    color: {
      stroke: '#7C3AED', // Purple
      bg: 'bg-purple-500',
      text: 'text-purple-600',
      lightBg: 'bg-purple-50',
      border: 'border-purple-200'
    }
  },
  {
    id: 'SYS-B',
    name: 'System B',
    category: 'Payment Gateway',
    status: 'Active',
    transactionCount: 98621,
    lastSeen: '10:31 AM',
    riskScore: 68,
    sparkline: [18, 24, 30, 26, 35, 30, 42, 38, 50, 48],
    color: {
      stroke: '#3B82F6', // Blue
      bg: 'bg-blue-500',
      text: 'text-blue-600',
      lightBg: 'bg-blue-50',
      border: 'border-blue-200'
    }
  },
  {
    id: 'SYS-C',
    name: 'System C',
    category: 'UPI Provider',
    status: 'Active',
    transactionCount: 210842,
    lastSeen: '10:30 AM',
    riskScore: 81,
    sparkline: [28, 32, 40, 36, 45, 52, 48, 60, 58, 70],
    color: {
      stroke: '#10B981', // Green
      bg: 'bg-emerald-500',
      text: 'text-emerald-600',
      lightBg: 'bg-emerald-50',
      border: 'border-emerald-200'
    }
  },
  {
    id: 'SYS-D',
    name: 'System D',
    category: 'Banking Partner',
    status: 'Active',
    transactionCount: 67213,
    lastSeen: '10:32 AM',
    riskScore: 63,
    sparkline: [15, 20, 18, 25, 22, 30, 28, 38, 34, 42],
    color: {
      stroke: '#F97316', // Orange
      bg: 'bg-orange-500',
      text: 'text-orange-600',
      lightBg: 'bg-orange-50',
      border: 'border-orange-200'
    }
  }
];

export const PRIMARY_ENTITY: RiskEntity = {
  id: 'Entity E-2048',
  riskLevel: 'HIGH',
  riskScore: 78,
  riskCategory: 'Very High Risk',
  firstSeen: '12 Aug 2026',
  lastSeen: '01 Sep 2026, 10:31 AM',
  totalTransactions: 48816,
  systemsInvolved: 3,
  attributes: [
    {
      id: 'attr-1',
      type: 'Device',
      label: 'Device',
      value: 'D-3387',
      systemsObserved: ['SYS-A', 'SYS-B', 'SYS-C'],
      isAnomalous: true,
      notes: 'Repeatedly used across multiple distinct accounts within seconds'
    },
    {
      id: 'attr-2',
      type: 'IP Address',
      label: 'IP Address',
      value: '192.168.1.45',
      systemsObserved: ['SYS-A', 'SYS-C'],
      isAnomalous: true,
      notes: 'High velocity IP routing requests through data center proxy'
    },
    {
      id: 'attr-3',
      type: 'Email',
      label: 'Email',
      value: 's****@gmail.com',
      systemsObserved: ['SYS-B', 'SYS-C', 'SYS-D'],
      isAnomalous: false,
      notes: 'Email address tied to 5 registered virtual merchant profiles'
    },
    {
      id: 'attr-4',
      type: 'Account',
      label: 'Account',
      value: 'A-7792',
      systemsObserved: ['SYS-A', 'SYS-D'],
      isAnomalous: true,
      notes: 'Rapid micro-withdrawals following large single-deposit pattern'
    }
  ],
  riskFactors: [
    { id: 'rf-1', label: 'High velocity activity', level: 'HIGH', iconType: 'triangle' },
    { id: 'rf-2', label: 'Used across 3 systems', level: 'HIGH', iconType: 'triangle' },
    { id: 'rf-3', label: 'Multiple small transactions', level: 'MEDIUM', iconType: 'triangle' },
    { id: 'rf-4', label: 'Irregular transaction timing', level: 'MEDIUM', iconType: 'clock' },
    { id: 'rf-5', label: 'Shared device fingerprint', level: 'MEDIUM', iconType: 'fingerprint' }
  ],
  topExposedAreas: [
    {
      id: 'exp-1',
      title: 'Payment Gateway (System C)',
      systemName: 'System C',
      reason: 'Unusual transaction velocity',
      riskLevel: 'HIGH'
    },
    {
      id: 'exp-2',
      title: 'UPI Transactions (System B)',
      systemName: 'System B',
      reason: 'Multiple small value payments',
      riskLevel: 'MEDIUM'
    },
    {
      id: 'exp-3',
      title: 'Refund / Payout (System A)',
      systemName: 'System A',
      reason: 'Unusual refund pattern',
      riskLevel: 'MEDIUM'
    }
  ],
  connections: {
    'SYS-A': {
      systemId: 'SYS-A',
      systemName: 'System A',
      transactionCount: 18,
      riskScore: 72,
      connectionType: 'TRANSACTION_FLOW',
      anomalyWeight: 75,
      signals: [
        '18 Rapid successive authorizations in < 4 minutes',
        'Abnormal refund request spike (3x baseline)',
        'Device fingerprint matches blacklisted syndicate profile'
      ],
      lastActivity: '10:31 AM'
    },
    'SYS-B': {
      systemId: 'SYS-B',
      systemName: 'System B',
      transactionCount: 11,
      riskScore: 68,
      connectionType: 'TRANSACTION_FLOW',
      anomalyWeight: 68,
      signals: [
        '11 Micro transactions executed simultaneously',
        'Mismatched cardholder name vs UPI VPA holder',
        'Rapid 2FA retry cycle before approval'
      ],
      lastActivity: '10:28 AM'
    },
    'SYS-C': {
      systemId: 'SYS-C',
      systemName: 'System C',
      transactionCount: 24,
      riskScore: 81,
      connectionType: 'TRANSACTION_FLOW',
      anomalyWeight: 86,
      signals: [
        '24 High-frequency UPI pull transactions',
        'Exceeded threshold for cross-institution requests',
        'Geo-velocity anomaly: 2 states in 15 seconds'
      ],
      lastActivity: '10:30 AM'
    },
    'SYS-D': {
      systemId: 'SYS-D',
      systemName: 'System D',
      transactionCount: 7,
      riskScore: 63,
      connectionType: 'WEAK_CONNECTION',
      anomalyWeight: 54,
      signals: [
        '7 Inbound settlement credit attempts',
        'Shared virtual account identifier (A-7792)',
        'Low correlation transaction metadata flag'
      ],
      lastActivity: '10:18 AM'
    }
  },
  timeline: [
    {
      id: 'evt-1',
      timestamp: '01 Sep 2026, 10:31:12 AM',
      timeAgo: 'Just now',
      systemId: 'SYS-A',
      systemName: 'System A',
      action: 'Rapid-fire checkout transaction',
      amount: '₹4,890.00',
      riskLevel: 'HIGH',
      signalDetail: 'Authorizing card velocity anomaly. 4th txn in 90 seconds.',
      channel: 'Web Checkout',
      ip: '192.168.1.45',
      device: 'D-3387'
    },
    {
      id: 'evt-2',
      timestamp: '01 Sep 2026, 10:30:45 AM',
      timeAgo: '1 min ago',
      systemId: 'SYS-C',
      systemName: 'System C',
      action: 'High-velocity UPI collect request',
      amount: '₹950.00',
      riskLevel: 'HIGH',
      signalDetail: 'Multiple micro-transactions triggered in synchronized pattern.',
      channel: 'UPI Gateway',
      ip: '192.168.1.45',
      device: 'D-3387'
    },
    {
      id: 'evt-3',
      timestamp: '01 Sep 2026, 10:28:22 AM',
      timeAgo: '3 min ago',
      systemId: 'SYS-B',
      systemName: 'System B',
      action: 'Card token verification & retry',
      amount: '₹12,400.00',
      riskLevel: 'MEDIUM',
      signalDetail: 'Token auth succeeded on 2nd attempt with mismatched billing ZIP.',
      channel: 'Direct API',
      ip: '10.14.2.88',
      device: 'D-3387'
    },
    {
      id: 'evt-4',
      timestamp: '01 Sep 2026, 10:22:10 AM',
      timeAgo: '9 min ago',
      systemId: 'SYS-C',
      systemName: 'System C',
      action: 'VPA link to merchant account',
      amount: '₹1.00',
      riskLevel: 'MEDIUM',
      signalDetail: 'Penny-drop verification initiated from newly associated email.',
      channel: 'VPA Verification',
      ip: '192.168.1.45',
      device: 'D-3387'
    },
    {
      id: 'evt-5',
      timestamp: '01 Sep 2026, 10:18:04 AM',
      timeAgo: '13 min ago',
      systemId: 'SYS-D',
      systemName: 'System D',
      action: 'Core banking settlement inquiry',
      amount: '₹45,000.00',
      riskLevel: 'LOW',
      signalDetail: 'Balance query prior to payout scheduling.',
      channel: 'Host-to-Host',
      ip: '172.16.8.21',
      device: 'Internal Service'
    }
  ]
};

export const OTHER_ENTITIES: Record<string, RiskEntity> = {
  'Entity E-1176': {
    id: 'Entity E-1176',
    riskLevel: 'MEDIUM',
    riskScore: 62,
    riskCategory: 'Elevated Risk',
    firstSeen: '24 Aug 2026',
    lastSeen: '01 Sep 2026, 10:22 AM',
    totalTransactions: 19420,
    systemsInvolved: 2,
    attributes: [
      { id: 'a-1', type: 'Device', label: 'Device', value: 'D-9921', systemsObserved: ['SYS-A', 'SYS-D'], isAnomalous: false, notes: 'Samsung S24, clean profile' },
      { id: 'a-2', type: 'IP Address', label: 'IP Address', value: '10.14.2.88', systemsObserved: ['SYS-A'], isAnomalous: true, notes: 'Known dynamic mobile gateway' },
      { id: 'a-3', type: 'Email', label: 'Email', value: 'k****@corp.io', systemsObserved: ['SYS-D'], isAnomalous: false, notes: 'Corporate domain address' },
      { id: 'a-4', type: 'Account', label: 'Account', value: 'A-4412', systemsObserved: ['SYS-A', 'SYS-D'], isAnomalous: true, notes: 'Multiple refund requests' }
    ],
    riskFactors: [
      { id: 'rf-1', label: 'Unusual velocity detected', level: 'MEDIUM', iconType: 'triangle' },
      { id: 'rf-2', label: 'Active across 2 systems', level: 'MEDIUM', iconType: 'network' },
      { id: 'rf-3', label: 'Sudden burst in off-hours', level: 'MEDIUM', iconType: 'clock' }
    ],
    topExposedAreas: [
      { id: 'exp-1', title: 'Payment Gateway (System A)', systemName: 'System A', reason: 'Repeated velocity threshold breach', riskLevel: 'MEDIUM' },
      { id: 'exp-2', title: 'Banking Partner (System D)', systemName: 'System D', reason: 'High count of debit reversals', riskLevel: 'MEDIUM' }
    ],
    connections: {
      'SYS-A': { systemId: 'SYS-A', systemName: 'System A', transactionCount: 14, riskScore: 65, connectionType: 'TRANSACTION_FLOW', anomalyWeight: 60, signals: ['14 Velocity anomalies detected'], lastActivity: '10:22 AM' },
      'SYS-B': { systemId: 'SYS-B', systemName: 'System B', transactionCount: 0, riskScore: 10, connectionType: 'WEAK_CONNECTION', anomalyWeight: 10, signals: [], lastActivity: 'None' },
      'SYS-C': { systemId: 'SYS-C', systemName: 'System C', transactionCount: 0, riskScore: 12, connectionType: 'WEAK_CONNECTION', anomalyWeight: 15, signals: [], lastActivity: 'None' },
      'SYS-D': { systemId: 'SYS-D', systemName: 'System D', transactionCount: 8, riskScore: 58, connectionType: 'TRANSACTION_FLOW', anomalyWeight: 55, signals: ['8 Debit reversals observed'], lastActivity: '10:19 AM' }
    },
    timeline: [
      { id: 'e-1', timestamp: '01 Sep 2026, 10:22:14 AM', timeAgo: '9 min ago', systemId: 'SYS-A', systemName: 'System A', action: 'Checkout authorization', amount: '₹3,200.00', riskLevel: 'MEDIUM', signalDetail: 'Card retry cycle completed', channel: 'Web', ip: '10.14.2.88', device: 'D-9921' }
    ]
  },
  'Entity E-8931': {
    id: 'Entity E-8931',
    riskLevel: 'MEDIUM',
    riskScore: 58,
    riskCategory: 'Moderate Risk',
    firstSeen: '05 Aug 2026',
    lastSeen: '01 Sep 2026, 10:15 AM',
    totalTransactions: 31105,
    systemsInvolved: 4,
    attributes: [
      { id: 'a-1', type: 'Device', label: 'Device', value: 'D-1102', systemsObserved: ['SYS-A', 'SYS-B', 'SYS-C', 'SYS-D'], isAnomalous: true, notes: 'Emulated browser user agent' },
      { id: 'a-2', type: 'IP Address', label: 'IP Address', value: '172.16.8.21', systemsObserved: ['SYS-B', 'SYS-C'], isAnomalous: false, notes: 'Residential ISP subnet' },
      { id: 'a-3', type: 'Email', label: 'Email', value: 'm****@domain.net', systemsObserved: ['SYS-A', 'SYS-C'], isAnomalous: false, notes: 'Single account linkage' },
      { id: 'a-4', type: 'Account', label: 'Account', value: 'A-9023', systemsObserved: ['SYS-C', 'SYS-D'], isAnomalous: true, notes: 'Multi-system payout receiver' }
    ],
    riskFactors: [
      { id: 'rf-1', label: 'Multiple small transactions', level: 'MEDIUM', iconType: 'triangle' },
      { id: 'rf-2', label: 'Active across 4 systems', level: 'MEDIUM', iconType: 'network' },
      { id: 'rf-3', label: 'Irregular transaction timing', level: 'LOW', iconType: 'clock' }
    ],
    topExposedAreas: [
      { id: 'exp-1', title: 'UPI Provider (System C)', systemName: 'System C', reason: 'High frequency micropayments', riskLevel: 'MEDIUM' },
      { id: 'exp-2', title: 'Payment Gateway (System B)', systemName: 'System B', reason: 'Low ticket size anomaly', riskLevel: 'MEDIUM' }
    ],
    connections: {
      'SYS-A': { systemId: 'SYS-A', systemName: 'System A', transactionCount: 6, riskScore: 48, connectionType: 'TRANSACTION_FLOW', anomalyWeight: 45, signals: ['6 Micro payments logged'], lastActivity: '10:15 AM' },
      'SYS-B': { systemId: 'SYS-B', systemName: 'System B', transactionCount: 12, riskScore: 56, connectionType: 'TRANSACTION_FLOW', anomalyWeight: 52, signals: ['12 Low ticket cluster txns'], lastActivity: '10:14 AM' },
      'SYS-C': { systemId: 'SYS-C', systemName: 'System C', transactionCount: 19, riskScore: 61, connectionType: 'TRANSACTION_FLOW', anomalyWeight: 58, signals: ['19 Micropayment flurry'], lastActivity: '10:12 AM' },
      'SYS-D': { systemId: 'SYS-D', systemName: 'System D', transactionCount: 5, riskScore: 42, connectionType: 'WEAK_CONNECTION', anomalyWeight: 38, signals: ['5 Settlement checks'], lastActivity: '10:05 AM' }
    },
    timeline: [
      { id: 'e-1', timestamp: '01 Sep 2026, 10:15:30 AM', timeAgo: '16 min ago', systemId: 'SYS-A', systemName: 'System A', action: 'Micro authorization', amount: '₹12.50', riskLevel: 'MEDIUM', signalDetail: 'Testing card validity', channel: 'API', ip: '172.16.8.21', device: 'D-1102' }
    ]
  },
  'Entity E-4452': {
    id: 'Entity E-4452',
    riskLevel: 'LOW',
    riskScore: 24,
    riskCategory: 'Low Risk',
    firstSeen: '30 Aug 2026',
    lastSeen: '01 Sep 2026, 09:58 AM',
    totalTransactions: 8240,
    systemsInvolved: 2,
    attributes: [
      { id: 'a-1', type: 'Device', label: 'Device', value: 'D-4401', systemsObserved: ['SYS-B', 'SYS-C'], isAnomalous: false, notes: 'Verified Mac Safari client' },
      { id: 'a-2', type: 'IP Address', label: 'IP Address', value: '192.168.3.12', systemsObserved: ['SYS-B'], isAnomalous: false, notes: 'Stable corporate IP' },
      { id: 'a-3', type: 'Email', label: 'Email', value: 'r****@live.com', systemsObserved: ['SYS-C'], isAnomalous: false, notes: 'Verified consumer email' },
      { id: 'a-4', type: 'Account', label: 'Account', value: 'A-1145', systemsObserved: ['SYS-B', 'SYS-C'], isAnomalous: false, notes: 'Consistent salary account' }
    ],
    riskFactors: [
      { id: 'rf-1', label: 'Normal transaction cadence', level: 'LOW', iconType: 'shield' },
      { id: 'rf-2', label: 'Device fingerprint validated', level: 'LOW', iconType: 'fingerprint' }
    ],
    topExposedAreas: [
      { id: 'exp-1', title: 'Payment Gateway (System B)', systemName: 'System B', reason: 'Routine subscription billing', riskLevel: 'LOW' }
    ],
    connections: {
      'SYS-A': { systemId: 'SYS-A', systemName: 'System A', transactionCount: 0, riskScore: 5, connectionType: 'WEAK_CONNECTION', anomalyWeight: 5, signals: [], lastActivity: 'None' },
      'SYS-B': { systemId: 'SYS-B', systemName: 'System B', transactionCount: 4, riskScore: 22, connectionType: 'TRANSACTION_FLOW', anomalyWeight: 20, signals: ['Regular recurring payment'], lastActivity: '09:58 AM' },
      'SYS-C': { systemId: 'SYS-C', systemName: 'System C', transactionCount: 3, riskScore: 18, connectionType: 'TRANSACTION_FLOW', anomalyWeight: 15, signals: ['Verified VPA payment'], lastActivity: '09:55 AM' },
      'SYS-D': { systemId: 'SYS-D', systemName: 'System D', transactionCount: 0, riskScore: 8, connectionType: 'WEAK_CONNECTION', anomalyWeight: 8, signals: [], lastActivity: 'None' }
    },
    timeline: [
      { id: 'e-1', timestamp: '01 Sep 2026, 09:58:02 AM', timeAgo: '33 min ago', systemId: 'SYS-B', systemName: 'System B', action: 'Subscription renewal', amount: '₹1,499.00', riskLevel: 'LOW', signalDetail: 'Standard monthly transaction', channel: 'Auto-debit', ip: '192.168.3.12', device: 'D-4401' }
    ]
  }
};

export const RECENT_CROSS_SYSTEM_ALERTS: CrossSystemAlert[] = [
  {
    id: 'CSA-101',
    entityId: 'Entity E-2048',
    title: 'Entity E-2048',
    description: 'High risk entity active across 3 systems',
    timestamp: '10:31 AM',
    timeAgo: 'Just now',
    severity: 'HIGH',
    systemsInvolved: ['SYS-A', 'SYS-B', 'SYS-C'],
    isRead: false
  },
  {
    id: 'CSA-102',
    entityId: 'Entity E-1176',
    title: 'Entity E-1176',
    description: 'Unusual velocity detected across 2 systems',
    timestamp: '10:22 AM',
    timeAgo: '9 min ago',
    severity: 'MEDIUM',
    systemsInvolved: ['SYS-A', 'SYS-D'],
    isRead: false
  },
  {
    id: 'CSA-103',
    entityId: 'Entity E-8931',
    title: 'Entity E-8931',
    description: 'Multiple small transactions across 4 systems',
    timestamp: '10:15 AM',
    timeAgo: '16 min ago',
    severity: 'MEDIUM',
    systemsInvolved: ['SYS-A', 'SYS-B', 'SYS-C', 'SYS-D'],
    isRead: false
  },
  {
    id: 'CSA-104',
    entityId: 'Entity E-4452',
    title: 'Entity E-4452',
    description: 'New entity monitored successfully',
    timestamp: '09:58 AM',
    timeAgo: '33 min ago',
    severity: 'LOW',
    systemsInvolved: ['SYS-B', 'SYS-C'],
    isRead: true
  },
  {
    id: 'CSA-105',
    entityId: 'Entity E-2048',
    title: 'Entity E-2048',
    description: 'Device D-3387 detected on new UPI endpoint',
    timestamp: '09:42 AM',
    timeAgo: '49 min ago',
    severity: 'HIGH',
    systemsInvolved: ['SYS-C'],
    isRead: true
  }
];

export const CORRELATED_TRANSACTIONS_TABLE: CorrelatedTransaction[] = [
  {
    id: 'TXN-9081',
    entityId: 'Entity E-2048',
    systemId: 'SYS-A',
    systemName: 'System A',
    type: 'Card Purchase',
    amount: 4890.0,
    timestamp: '10:31:12 AM',
    status: 'Flagged',
    riskScore: 88,
    primarySignal: 'High velocity burst (4 txns / 90s)',
    ipAddress: '192.168.1.45',
    deviceId: 'D-3387'
  },
  {
    id: 'TXN-9080',
    entityId: 'Entity E-2048',
    systemId: 'SYS-C',
    systemName: 'System C',
    type: 'UPI Collect',
    amount: 950.0,
    timestamp: '10:30:45 AM',
    status: 'Flagged',
    riskScore: 84,
    primarySignal: 'Micro-transaction spike',
    ipAddress: '192.168.1.45',
    deviceId: 'D-3387'
  },
  {
    id: 'TXN-9076',
    entityId: 'Entity E-2048',
    systemId: 'SYS-B',
    systemName: 'System B',
    type: 'Token Auth',
    amount: 12400.0,
    timestamp: '10:28:22 AM',
    status: 'Challenged',
    riskScore: 71,
    primarySignal: 'Billing ZIP mismatch',
    ipAddress: '10.14.2.88',
    deviceId: 'D-3387'
  },
  {
    id: 'TXN-9072',
    entityId: 'Entity E-1176',
    systemId: 'SYS-A',
    systemName: 'System A',
    type: 'Refund Request',
    amount: 3200.0,
    timestamp: '10:22:14 AM',
    status: 'Flagged',
    riskScore: 66,
    primarySignal: 'Repeated velocity threshold breach',
    ipAddress: '10.14.2.88',
    deviceId: 'D-9921'
  },
  {
    id: 'TXN-9069',
    entityId: 'Entity E-8931',
    systemId: 'SYS-C',
    systemName: 'System C',
    type: 'UPI Intent',
    amount: 12.5,
    timestamp: '10:15:30 AM',
    status: 'Monitored',
    riskScore: 59,
    primarySignal: 'Automated script timing pattern',
    ipAddress: '172.16.8.21',
    deviceId: 'D-1102'
  },
  {
    id: 'TXN-9065',
    entityId: 'Entity E-8931',
    systemId: 'SYS-B',
    systemName: 'System B',
    type: 'Card Payment',
    amount: 25.0,
    timestamp: '10:14:18 AM',
    status: 'Monitored',
    riskScore: 55,
    primarySignal: 'Rapid test transaction',
    ipAddress: '172.16.8.21',
    deviceId: 'D-1102'
  },
  {
    id: 'TXN-9058',
    entityId: 'Entity E-4452',
    systemId: 'SYS-B',
    systemName: 'System B',
    type: 'Recurring Mandate',
    amount: 1499.0,
    timestamp: '09:58:02 AM',
    status: 'Passed',
    riskScore: 18,
    primarySignal: 'Verified monthly subscription',
    ipAddress: '192.168.3.12',
    deviceId: 'D-4401'
  }
];

// ─── Service Class with Extensible Methods ───────────────────────────────────

class CrossSystemRiskService {
  public getSystems(): PaymentSystemInfo[] {
    return CONFIGURED_SYSTEMS;
  }

  public getSystemById(id: SystemId): PaymentSystemInfo | undefined {
    return CONFIGURED_SYSTEMS.find((sys) => sys.id === id);
  }

  public getPrimaryEntity(): RiskEntity {
    return PRIMARY_ENTITY;
  }

  public getEntityById(id: string): RiskEntity {
    if (id === PRIMARY_ENTITY.id) {
      return PRIMARY_ENTITY;
    }
    return OTHER_ENTITIES[id] || PRIMARY_ENTITY;
  }

  public getAllEntities(): RiskEntity[] {
    return [PRIMARY_ENTITY, ...Object.values(OTHER_ENTITIES)];
  }

  public getRecentAlerts(): CrossSystemAlert[] {
    return RECENT_CROSS_SYSTEM_ALERTS;
  }

  public getCorrelatedTransactions(filterSystemId?: string): CorrelatedTransaction[] {
    if (!filterSystemId || filterSystemId === 'ALL') {
      return CORRELATED_TRANSACTIONS_TABLE;
    }
    return CORRELATED_TRANSACTIONS_TABLE.filter((txn) => txn.systemId === filterSystemId);
  }
}

export const crossSystemRiskService = new CrossSystemRiskService();
