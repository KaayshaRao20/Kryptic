// ─── Types ────────────────────────────────────────────────────────────────────
export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type AlertStatus   = 'ACTIVE' | 'INVESTIGATING' | 'RESOLVED';
export type PaymentLayer  = 'PAYMENT_LAYER' | 'RISK_ENGINE' | 'AUTH_SERVICE' | 'ROUTER' | 'PAYMENT_GATEWAY' | 'USER_SERVICE';

export interface KrypticAlert {
  id          : string;
  incidentId  : string;
  title       : string;
  severity    : AlertSeverity;
  source      : string;
  paymentLayer: PaymentLayer;
  description : string;
  riskScore   : number;
  affectedTx  : number;
  timestamp   : Date;
  status      : AlertStatus;
  metric      : string;
}

export interface IncidentTimeline {
  time  : Date;
  event : string;
  type  : 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
}

export interface Incident {
  alertId        : string;
  incidentId     : string;
  affectedUsers  : number;
  potentialLoss  : number; // INR
  affectedRegions: string[];
  timeline       : IncidentTimeline[];
}

export interface EmergencyAction {
  id           : string;
  label        : string;
  description  : string;
  impact       : 'HIGH' | 'MEDIUM' | 'LOW';
  category     : 'BLOCK' | 'FREEZE' | 'AUTH' | 'REVIEW' | 'THROTTLE' | 'ALERT';
  estimatedTime: string;
  risk         : string;
  resultMessage: string;
}

export interface ActivityLogEntry {
  id        : string;
  timestamp : Date;
  action    : string;
  result    : string;
  severity  : 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  actor     : string;
  incidentId: string;
}

export interface SystemState {
  emergencyMode    : boolean;
  blockedIPRanges  : number;
  frozenAccounts   : number;
  stepUpAuthEnabled: boolean;
  tpsThrottled     : boolean;
  manualReviewQueue: number;
  systemAlertSent  : boolean;
  activeDefenses   : number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ago = (min: number): Date => new Date(Date.now() - min * 60_000);

// ─── Seed Alerts ──────────────────────────────────────────────────────────────
export const INITIAL_ALERTS: KrypticAlert[] = [
  {
    id: 'ALT-001', incidentId: 'INC-2053',
    title: 'Unusual Payment Spike Detected',
    severity: 'CRITICAL', source: 'Risk Engine Layer', paymentLayer: 'RISK_ENGINE',
    description: 'Synchronized high-frequency transaction burst detected across multiple merchant accounts. Pattern consistent with coordinated fraud-ring activity.',
    riskScore: 94, affectedTx: 1247, timestamp: ago(2), status: 'ACTIVE', metric: 'Payment Volume +55%',
  },
  {
    id: 'ALT-002', incidentId: 'INC-2052',
    title: 'High OTP Failure Rate',
    severity: 'CRITICAL', source: 'Auth Service', paymentLayer: 'AUTH_SERVICE',
    description: 'OTP failure rate has exceeded 367% of normal baseline. Multiple accounts targeted from the same IP subnet. Possible credential-stuffing attack in progress.',
    riskScore: 89, affectedTx: 834, timestamp: ago(8), status: 'ACTIVE', metric: 'OTP Failures +367%',
  },
  {
    id: 'ALT-003', incidentId: 'INC-2051',
    title: 'Velocity Anomaly Detected',
    severity: 'HIGH', source: 'Transaction Router', paymentLayer: 'ROUTER',
    description: 'Abnormal transaction velocity in the routing layer. Multiple accounts showing synchronized patterns across 3 payment gateways simultaneously.',
    riskScore: 76, affectedTx: 412, timestamp: ago(18), status: 'INVESTIGATING', metric: 'Velocity +68%',
  },
  {
    id: 'ALT-004', incidentId: 'INC-2050',
    title: 'New Device Login Spike',
    severity: 'MEDIUM', source: 'User Service', paymentLayer: 'USER_SERVICE',
    description: 'Unusual spike in logins from new and unrecognized devices detected across 289 user accounts over the last 35 minutes.',
    riskScore: 58, affectedTx: 289, timestamp: ago(35), status: 'ACTIVE', metric: 'Unusual logins from new devices',
  },
  {
    id: 'ALT-005', incidentId: 'INC-2049',
    title: 'Large Amount Transactions',
    severity: 'MEDIUM', source: 'Payment Gateway', paymentLayer: 'PAYMENT_GATEWAY',
    description: 'Multiple high-value transactions above ₹1,00,000 threshold detected from accounts that were flagged in prior risk assessments.',
    riskScore: 62, affectedTx: 67, timestamp: ago(48), status: 'ACTIVE', metric: 'Multiple txns > ₹1,00,000',
  },
  {
    id: 'ALT-006', incidentId: 'INC-2048',
    title: 'Cross-Border Surge Detected',
    severity: 'HIGH', source: 'Payment Layer', paymentLayer: 'PAYMENT_LAYER',
    description: 'Significant surge in cross-border transactions detected from high-risk jurisdictions. Geo-risk analysis initiated.',
    riskScore: 81, affectedTx: 523, timestamp: ago(62), status: 'INVESTIGATING', metric: 'Cross-border +142%',
  },
  {
    id: 'ALT-007', incidentId: 'INC-2047',
    title: 'API Rate Limit Breach',
    severity: 'LOW', source: 'Risk Engine Layer', paymentLayer: 'RISK_ENGINE',
    description: 'API rate limit exceeded for multiple merchant IDs. Automated scraping pattern detected and merchant IDs subsequently blocked.',
    riskScore: 34, affectedTx: 156, timestamp: ago(95), status: 'RESOLVED', metric: 'API calls +890%',
  },
];

// ─── Incidents ────────────────────────────────────────────────────────────────
export const INCIDENTS: Record<string, Incident> = {
  'INC-2053': {
    alertId: 'ALT-001', incidentId: 'INC-2053',
    affectedUsers: 1247, potentialLoss: 2845000,
    affectedRegions: ['Mumbai', 'Delhi', 'Bangalore'],
    timeline: [
      { time: ago(3),   event: 'Anomaly detected by risk engine',   type: 'WARNING'  },
      { time: ago(2.5), event: 'Alert escalated to CRITICAL',        type: 'CRITICAL' },
      { time: ago(2),   event: 'Security team notified',             type: 'INFO'     },
      { time: ago(1.5), event: 'Investigation initiated',            type: 'INFO'     },
    ],
  },
  'INC-2052': {
    alertId: 'ALT-002', incidentId: 'INC-2052',
    affectedUsers: 834, potentialLoss: 1280000,
    affectedRegions: ['Chennai', 'Hyderabad'],
    timeline: [
      { time: ago(10),  event: 'OTP failure rate spike detected',    type: 'WARNING'  },
      { time: ago(8.5), event: 'Threshold breach — 300%+ failures',  type: 'CRITICAL' },
      { time: ago(8),   event: 'Alert triggered',                    type: 'CRITICAL' },
      { time: ago(7),   event: 'IP subnet flagged for review',       type: 'INFO'     },
    ],
  },
  'INC-2051': {
    alertId: 'ALT-003', incidentId: 'INC-2051',
    affectedUsers: 412, potentialLoss: 890000,
    affectedRegions: ['Pune', 'Kolkata'],
    timeline: [
      { time: ago(20), event: 'Velocity metric exceeded threshold',  type: 'WARNING' },
      { time: ago(18), event: 'Alert generated',                     type: 'WARNING' },
      { time: ago(15), event: 'Analyst assigned',                    type: 'INFO'    },
      { time: ago(10), event: 'Transaction pattern mapped',          type: 'INFO'    },
    ],
  },
  'INC-2050': {
    alertId: 'ALT-004', incidentId: 'INC-2050',
    affectedUsers: 289, potentialLoss: 445000,
    affectedRegions: ['Ahmedabad', 'Jaipur'],
    timeline: [
      { time: ago(36), event: 'Unusual device fingerprints detected', type: 'WARNING' },
      { time: ago(35), event: 'Alert generated',                      type: 'WARNING' },
      { time: ago(30), event: 'Device profiles logged',               type: 'INFO'    },
    ],
  },
  'INC-2049': {
    alertId: 'ALT-005', incidentId: 'INC-2049',
    affectedUsers: 67, potentialLoss: 7800000,
    affectedRegions: ['Mumbai', 'Delhi'],
    timeline: [
      { time: ago(50), event: 'Large transaction threshold triggered', type: 'WARNING' },
      { time: ago(48), event: 'Alert generated',                       type: 'WARNING' },
      { time: ago(45), event: 'Accounts flagged for review',           type: 'INFO'    },
    ],
  },
  'INC-2048': {
    alertId: 'ALT-006', incidentId: 'INC-2048',
    affectedUsers: 523, potentialLoss: 3200000,
    affectedRegions: ['Pan-India'],
    timeline: [
      { time: ago(65), event: 'Cross-border volume spike detected',   type: 'WARNING'  },
      { time: ago(62), event: 'Alert generated',                      type: 'WARNING'  },
      { time: ago(55), event: 'Geo-risk analysis initiated',          type: 'INFO'     },
      { time: ago(45), event: 'High-risk jurisdictions identified',   type: 'CRITICAL' },
    ],
  },
  'INC-2047': {
    alertId: 'ALT-007', incidentId: 'INC-2047',
    affectedUsers: 156, potentialLoss: 0,
    affectedRegions: ['Pan-India'],
    timeline: [
      { time: ago(100), event: 'Rate limit breach detected',   type: 'WARNING' },
      { time: ago(95),  event: 'Alert generated',              type: 'WARNING' },
      { time: ago(85),  event: 'Merchant IDs blocked',         type: 'SUCCESS' },
      { time: ago(75),  event: 'Incident resolved',            type: 'SUCCESS' },
    ],
  },
};

// ─── Emergency Actions ────────────────────────────────────────────────────────
export const EMERGENCY_ACTIONS: EmergencyAction[] = [
  {
    id: 'EA-001', label: 'Block IP Range', impact: 'HIGH', category: 'BLOCK',
    description: 'Immediately block all traffic from suspicious IP ranges identified in active CRITICAL alerts.',
    estimatedTime: '< 30s', risk: 'May block legitimate users in flagged subnets',
    resultMessage: 'Blocked 3 IP ranges. 847 connections terminated.',
  },
  {
    id: 'EA-002', label: 'Freeze Flagged Accounts', impact: 'HIGH', category: 'FREEZE',
    description: 'Temporarily freeze all accounts flagged in active CRITICAL and HIGH severity alerts.',
    estimatedTime: '< 1 min', risk: 'Disrupts legitimate account holders',
    resultMessage: '47 accounts frozen. Owners notified via SMS.',
  },
  {
    id: 'EA-003', label: 'Enable Step-Up Auth', impact: 'MEDIUM', category: 'AUTH',
    description: 'Force step-up authentication (OTP + biometric) for all transactions above ₹10,000.',
    estimatedTime: '< 2 min', risk: 'Increases friction for all users',
    resultMessage: 'Step-up auth enabled for ₹10,000+ transactions.',
  },
  {
    id: 'EA-004', label: 'Route to Manual Review', impact: 'MEDIUM', category: 'REVIEW',
    description: 'Send all flagged transactions to manual review queue for analyst approval before processing.',
    estimatedTime: '< 1 min', risk: 'Increases review queue backlog',
    resultMessage: '23 transactions queued for manual review.',
  },
  {
    id: 'EA-005', label: 'Throttle TPS', impact: 'HIGH', category: 'THROTTLE',
    description: 'Reduce maximum transaction processing rate to 20% of normal capacity system-wide.',
    estimatedTime: '< 15s', risk: 'Significant latency increase system-wide',
    resultMessage: 'TPS capped at 20%. System latency +340ms avg.',
  },
  {
    id: 'EA-006', label: 'Broadcast System Alert', impact: 'LOW', category: 'ALERT',
    description: 'Issue a system-wide security alert to all connected services and monitoring dashboards.',
    estimatedTime: '< 5s', risk: 'None — informational only',
    resultMessage: 'Alert broadcast to 14 connected services.',
  },
];

// ─── Initial System State ─────────────────────────────────────────────────────
export const INITIAL_SYSTEM_STATE: SystemState = {
  emergencyMode: false, blockedIPRanges: 0, frozenAccounts: 0,
  stepUpAuthEnabled: false, tpsThrottled: false, manualReviewQueue: 0,
  systemAlertSent: false, activeDefenses: 0,
};

// ─── Initial Activity Log ─────────────────────────────────────────────────────
export const INITIAL_ACTIVITY_LOG: ActivityLogEntry[] = [
  {
    id: 'LOG-SEED-01', timestamp: ago(22), incidentId: 'INC-2048',
    action: 'Alert Resolved', result: 'Incident #INC-2048 resolved in 12m',
    severity: 'HIGH', actor: 'System Auto-Resolver',
  },
  {
    id: 'LOG-SEED-02', timestamp: ago(28), incidentId: 'INC-2047',
    action: 'Alert Resolved', result: 'Incident #INC-2047 resolved in 8m',
    severity: 'MEDIUM', actor: 'Analyst: J. Sharma',
  },
];

// ─── Trend Data (24h, 7 sample points) ───────────────────────────────────────
export const TREND_LABELS = ['12 AM', '4 AM', '8 AM', '12 PM', '4 PM', '8 PM', '12 AM'];
export const TREND_SERIES = {
  critical: [2,  1,  4, 12,  8,  5,  4],
  high:     [5,  3,  7, 18, 14,  9,  7],
  medium:   [8,  5, 11, 22, 19, 13, 10],
  low:      [3,  2,  4,  8,  6,  4,  4],
};

// ─── Alert Generator ──────────────────────────────────────────────────────────
const POOL: Array<Pick<KrypticAlert, 'title' | 'severity' | 'source' | 'paymentLayer' | 'metric'>> = [
  { title: 'Suspicious Refund Pattern',    severity: 'CRITICAL', source: 'Risk Engine',    paymentLayer: 'RISK_ENGINE',     metric: 'Refund Rate +312%'    },
  { title: 'Account Takeover Attempt',     severity: 'CRITICAL', source: 'Auth Service',   paymentLayer: 'AUTH_SERVICE',    metric: 'Failed Logins +445%'  },
  { title: 'Merchant Collusion Detected',  severity: 'HIGH',     source: 'Payment Layer',  paymentLayer: 'PAYMENT_LAYER',   metric: 'Split Txns +189%'     },
  { title: 'Token Reuse Detected',         severity: 'HIGH',     source: 'Auth Service',   paymentLayer: 'AUTH_SERVICE',    metric: 'Token replay x47'     },
  { title: 'Micro-Transaction Flooding',   severity: 'MEDIUM',   source: 'Payment Gateway',paymentLayer: 'PAYMENT_GATEWAY', metric: '₹1 txns +823%'        },
  { title: 'Geo-Anomaly: New Location',    severity: 'MEDIUM',   source: 'Risk Engine',    paymentLayer: 'RISK_ENGINE',     metric: '15 new geographies'   },
  { title: 'Session Hijack Attempt',       severity: 'CRITICAL', source: 'Auth Service',   paymentLayer: 'AUTH_SERVICE',    metric: 'Session tokens +289%' },
];

let _alertCtr = INITIAL_ALERTS.length + 1;
let _incCtr   = 2054;

export function generateNewAlert(): KrypticAlert {
  const tmpl = POOL[Math.floor(Math.random() * POOL.length)];
  const id   = `ALT-${String(_alertCtr++).padStart(3, '0')}`;
  const base = tmpl.severity === 'CRITICAL' ? 88 : tmpl.severity === 'HIGH' ? 70 : tmpl.severity === 'MEDIUM' ? 45 : 20;
  return {
    id, incidentId: `INC-${_incCtr++}`,
    title: tmpl.title, severity: tmpl.severity, source: tmpl.source, paymentLayer: tmpl.paymentLayer,
    description: `Auto-detected: ${tmpl.metric} anomaly in ${tmpl.source}. Immediate review required.`,
    riskScore: base + Math.floor(Math.random() * 10),
    affectedTx: Math.floor(Math.random() * 600) + 50,
    timestamp: new Date(), status: 'ACTIVE', metric: tmpl.metric,
  };
}
