// ============================================================
//  FraudDetectionService.ts
//  Deterministic fraud scoring service — swap for real ML later
// ============================================================

export interface TransactionParams {
  transactionId: string;
  accountId: string;
  transactionType: string;
  amount: number;
  velocity: number;
  paymentChannel: string;
  timeOfDay: string;
  customerAge: number;
  accountAge: number;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type FactorLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'NORMAL';

export interface RiskFactor {
  name: string;
  displayName: string;
  shapScore: number;   // 0-1 SHAP-like contribution
  value: string;       // human-readable classification
  level: FactorLevel;
}

export interface ModelEvidence {
  name: string;
  value: string;
}

export interface FraudPrediction {
  predictionId: string;
  fraudProbability: number; // 0-100
  riskLevel: RiskLevel;
  riskFactors: RiskFactor[];
  modelEvidence: ModelEvidence[];
}

// ─── Static options ────────────────────────────────────────────
export const TRANSACTION_TYPE_OPTIONS = [
  'Standard Purchase',
  'International Transfer',
  'Cash Withdrawal',
  'Peer-to-Peer Transfer',
  'Subscription Payment',
  'Refund',
];

export const PAYMENT_CHANNEL_OPTIONS = ['Card', 'UPI', 'Net Banking', 'Crypto', 'Wallet'];

export const TIME_OF_DAY_OPTIONS = [
  '09:00 (Morning)',
  '14:35 (Afternoon)',
  '19:00 (Evening)',
  '23:00 (Night)',
  '02:00 (Late Night)',
];

export const DEFAULT_PARAMS: TransactionParams = {
  transactionId: 'txn_123456',
  accountId: 'acc_0987',
  transactionType: 'Standard Purchase',
  amount: 1500,
  velocity: 2,
  paymentChannel: 'Card',
  timeOfDay: '14:35 (Afternoon)',
  customerAge: 28,
  accountAge: 120,
};

// ─── Auto-fill profiles ────────────────────────────────────────
export const AUTO_FILL_PROFILES: TransactionParams[] = [
  // High-risk profile
  {
    transactionId: 'txn_928461',
    accountId: 'acc_3821',
    transactionType: 'International Transfer',
    amount: 8500,
    velocity: 42,
    paymentChannel: 'Crypto',
    timeOfDay: '02:00 (Late Night)',
    customerAge: 22,
    accountAge: 8,
  },
  // Low-risk profile
  {
    transactionId: 'txn_550192',
    accountId: 'acc_7734',
    transactionType: 'Standard Purchase',
    amount: 250,
    velocity: 1,
    paymentChannel: 'Card',
    timeOfDay: '14:35 (Afternoon)',
    customerAge: 45,
    accountAge: 720,
  },
  // Medium-risk profile
  {
    transactionId: 'txn_712384',
    accountId: 'acc_5521',
    transactionType: 'Peer-to-Peer Transfer',
    amount: 3200,
    velocity: 18,
    paymentChannel: 'UPI',
    timeOfDay: '23:00 (Night)',
    customerAge: 31,
    accountAge: 45,
  },
  // Critical profile
  {
    transactionId: 'txn_449917',
    accountId: 'acc_0012',
    transactionType: 'Cash Withdrawal',
    amount: 9800,
    velocity: 58,
    paymentChannel: 'Crypto',
    timeOfDay: '02:00 (Late Night)',
    customerAge: 19,
    accountAge: 3,
  },
];

let autoFillIndex = 0;
export function getNextAutoFillProfile(): TransactionParams {
  const profile = AUTO_FILL_PROFILES[autoFillIndex % AUTO_FILL_PROFILES.length];
  autoFillIndex++;
  return profile;
}

// ─── Internal helpers ──────────────────────────────────────────
function getFactorLevel(score: number): FactorLevel {
  if (score >= 0.22) return 'HIGH';
  if (score >= 0.10) return 'MEDIUM';
  if (score >= 0.04) return 'LOW';
  return 'NORMAL';
}

function generatePredictionId(params: TransactionParams): string {
  const n = Math.abs(
    (params.amount * 17 + params.velocity * 31 + params.accountAge * 7 + params.customerAge * 13) % 100000
  );
  return `pred-p${n.toString(16).padStart(5, '0')}`;
}

// ─── Main scorer ───────────────────────────────────────────────
export function analyzeFraud(params: TransactionParams): FraudPrediction {
  const { amount, velocity, accountAge, customerAge, transactionType, paymentChannel, timeOfDay } = params;

  // Amount + Velocity (combined "Amount Velocity" factor)
  const velPart =
    velocity > 40 ? 0.36 : velocity > 20 ? 0.22 : velocity > 10 ? 0.12 : velocity > 5 ? 0.06 : 0.03;
  const amtPart =
    amount > 7000 ? 0.18 : amount > 3000 ? 0.11 : amount > 1000 ? 0.05 : 0.02;
  const amountVelScore = Math.min(0.55, velPart + amtPart);
  const amountVelLabel =
    velocity > 40 ? 'Extreme' : velocity > 20 ? 'High' : velocity > 10 ? 'Elevated' : velocity > 5 ? 'Moderate' : 'Normal';

  // Transaction type
  const typeScore =
    transactionType.includes('International') ? 0.15
    : transactionType.includes('Cash') ? 0.13
    : transactionType.includes('Peer') ? 0.08
    : transactionType.includes('Refund') ? 0.05
    : 0.03;
  const typeLabel =
    transactionType.includes('International') ? 'international'
    : transactionType.includes('Cash') ? 'cash_withdrawal'
    : transactionType.includes('Peer') ? 'p2p_transfer'
    : transactionType.includes('Refund') ? 'refund'
    : 'purchase';

  // Account age
  const acctAgeScore =
    accountAge < 7 ? 0.30 : accountAge < 30 ? 0.22 : accountAge < 90 ? 0.14 : accountAge < 365 ? 0.06 : 0.02;
  const acctAgeLabel =
    accountAge < 7 ? 'New (< 7d)' : accountAge < 30 ? 'Very New' : accountAge < 90 ? 'Recent' : accountAge < 365 ? 'Established' : 'Mature';

  // Historical behavior (proxy: new account + large amount)
  const histScore =
    accountAge < 30 && amount > 1000 ? 0.14
    : accountAge < 90 && velocity > 10 ? 0.09
    : accountAge < 180 ? 0.04
    : 0.02;
  const histLabel =
    histScore > 0.10 ? 'Anomalous' : histScore > 0.06 ? 'Inconsistent' : histScore > 0.03 ? 'Mild deviation' : 'Normal';

  // Geo consistency (proxy: channel + time)
  const geoScore =
    paymentChannel === 'Crypto' ? 0.10
    : paymentChannel === 'UPI' && timeOfDay.includes('Night') ? 0.07
    : paymentChannel === 'UPI' ? 0.04
    : 0.02;
  const geoLabel =
    geoScore > 0.08 ? 'Inconsistent' : geoScore > 0.05 ? 'Suspicious' : geoScore > 0.03 ? 'Mild mismatch' : 'Consistent';

  // Channel risk (separate from geo — also affects model evidence)
  const channelScore =
    paymentChannel === 'Crypto' ? 0.20
    : paymentChannel === 'UPI' ? 0.07
    : paymentChannel === 'Wallet' ? 0.05
    : 0.02;

  // Time of day
  const timeScore =
    timeOfDay.includes('Late Night') ? 0.13
    : timeOfDay.includes('Night') ? 0.09
    : timeOfDay.includes('Evening') ? 0.04
    : 0.01;

  // Customer age
  const custAgeScore = customerAge < 20 ? 0.09 : customerAge < 23 ? 0.05 : customerAge > 78 ? 0.05 : 0.01;

  const totalRaw =
    amountVelScore + typeScore + acctAgeScore + histScore + geoScore + channelScore + timeScore + custAgeScore;
  const fraudProbability = Math.round(Math.min(98.5, totalRaw * 100) * 10) / 10;

  const riskLevel: RiskLevel =
    fraudProbability >= 75 ? 'CRITICAL'
    : fraudProbability >= 45 ? 'HIGH'
    : fraudProbability >= 20 ? 'MEDIUM'
    : 'LOW';

  const riskFactors: RiskFactor[] = [
    { name: 'amountVelocity',    displayName: 'Amount Velocity',    shapScore: amountVelScore, value: amountVelLabel, level: getFactorLevel(amountVelScore) },
    { name: 'transactionType',   displayName: 'Transaction Type',   shapScore: typeScore,      value: typeLabel,      level: getFactorLevel(typeScore) },
    { name: 'accountAge',        displayName: 'Account Age',        shapScore: acctAgeScore,   value: acctAgeLabel,   level: getFactorLevel(acctAgeScore) },
    { name: 'historicalBehavior',displayName: 'Historical Behavior',shapScore: histScore,      value: histLabel,      level: getFactorLevel(histScore) },
    { name: 'geoConsistency',    displayName: 'Geo Consistency',    shapScore: geoScore,       value: geoLabel,       level: getFactorLevel(geoScore) },
  ].sort((a, b) => b.shapScore - a.shapScore);

  const modelEvidence: ModelEvidence[] = [
    { name: 'Amount Velocity',  value: amountVelLabel },
    { name: 'Transaction Type', value: typeLabel },
    { name: 'Account Age',      value: acctAgeLabel },
  ];

  return { predictionId: generatePredictionId(params), fraudProbability, riskLevel, riskFactors, modelEvidence };
}
