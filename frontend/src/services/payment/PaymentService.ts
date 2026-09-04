// ─────────────────────────────────────────────────────────────────
//  PaymentService.ts  —  All analysis computed from the central dataset.
//  Swap individual functions with real FastAPI calls when ready.
// ─────────────────────────────────────────────────────────────────

import type { Transaction, Channel, ClusterLabel, RiskLevel } from '../../data/payment/mockData';

// ─── Filter state ─────────────────────────────────────────────────
export interface FilterState {
  volumeRanges: string[];       // '< 100', '100–1K', '1K–10K', '10K–1L', '> 1L'
  amountMin: string;
  amountMax: string;
  transactionTypes: string[];   // empty = all
  channels: string[];           // empty = all
  authentication: string;       // 'all' | 'OTP Based' | 'Non-OTP' | '3DS'
  riskLevel: string;            // 'all' | 'Low' | 'Medium' | 'High'
  cluster: string;              // 'all' or ClusterLabel
  search: string;
  datePreset?: string;          // 'all' | '01sep' | 'last7' | 'last30'
}

export const DEFAULT_FILTER: FilterState = {
  volumeRanges: [],
  amountMin: '',
  amountMax: '',
  transactionTypes: [],
  channels: [],
  authentication: 'all',
  riskLevel: 'all',
  cluster: 'all',
  search: '',
  datePreset: 'all',
};

// Volume range buckets (entity daily transaction count proxy = txnCount / amount)
const VOLUME_RANGE: Record<string, [number, number]> = {
  '< 100':    [0, 99],
  '100–1K':   [100, 1000],
  '1K–10K':   [1000, 10000],
  '10K–1L':   [10000, 100000],
  '> 1L':     [100000, Infinity],
};

// ─── Core filter ─────────────────────────────────────────────────
export function filterTransactions(txns: Transaction[], f: FilterState): Transaction[] {
  const amtMin = f.amountMin ? parseFloat(f.amountMin) : 0;
  const amtMax = f.amountMax ? parseFloat(f.amountMax) : Infinity;

  return txns.filter(t => {
    // Amount
    if (t.amount < amtMin || t.amount > amtMax) return false;

    // Volume range
    if (f.volumeRanges && f.volumeRanges.length > 0) {
      const inRange = f.volumeRanges.some(r => {
        const [lo, hi] = VOLUME_RANGE[r] ?? [0, Infinity];
        return t.amount >= lo && t.amount <= hi;
      });
      if (!inRange) return false;
    }

    // Transaction type
    if (f.transactionTypes && f.transactionTypes.length > 0 && !f.transactionTypes.includes(t.type)) return false;

    // Channel
    if (f.channels && f.channels.length > 0 && !f.channels.includes(t.channel)) return false;

    // Authentication
    if (f.authentication && f.authentication !== 'all') {
      if (f.authentication === 'OTP Based' && t.authentication !== 'OTP') return false;
      if (f.authentication === 'Non-OTP'   && t.authentication !== 'Non-OTP') return false;
      if (f.authentication === '3DS'        && t.authentication !== '3DS') return false;
    }

    // Risk level
    if (f.riskLevel && f.riskLevel !== 'all' && t.riskLevel !== f.riskLevel) return false;

    // Cluster
    if (f.cluster && f.cluster !== 'all' && t.cluster !== f.cluster) return false;

    // Search (id, entityId, location, type, channel)
    if (f.search) {
      const q = f.search.toLowerCase().trim();
      if (
        !t.id.toLowerCase().includes(q) &&
        !t.entityId.toLowerCase().includes(q) &&
        !t.location.toLowerCase().includes(q) &&
        !t.type.toLowerCase().includes(q) &&
        !t.channel.toLowerCase().includes(q)
      ) return false;
    }

    return true;
  });
}

// ─── Overview Metrics ────────────────────────────────────────────
export interface OverviewMetrics {
  totalTransactions: number;
  totalAmount: number;
  highRiskCount: number;
  highRiskPct: number;
  blockedCount: number;
  spikeAlertCount: number;
}

export function getOverviewMetrics(txns: Transaction[]): OverviewMetrics {
  const total = txns.length;
  const totalAmount = txns.reduce((s, t) => s + t.amount, 0);
  const highRisk = txns.filter(t => t.riskLevel === 'High');
  const blocked = txns.filter(t => t.status === 'Blocked');
  const spikes = detectSpikes(buildHourlyData(txns));

  return {
    totalTransactions: total,
    totalAmount,
    highRiskCount: highRisk.length,
    highRiskPct: total > 0 ? (highRisk.length / total) * 100 : 0,
    blockedCount: blocked.length,
    spikeAlertCount: spikes.filter(s => s.isSpikeHour).length,
  };
}

// ─── Hourly time-series ──────────────────────────────────────────
export interface HourlyBucket {
  hour: string;      // "00:00"
  actual: number;
  baseline: number;
  spikeHigh: number; // actual if spike, else baseline (for area fill trick)
  spikeLow: number;  // baseline (for area from baseline up to actual)
  isSpikeHour: boolean;
  deviation: number; // %
}

function buildHourlyData(txns: Transaction[]): HourlyBucket[] {
  const counts: number[] = Array(24).fill(0);
  for (const t of txns) counts[t.hour]++;

  // Compute rolling baseline (3-hour average excluding the hour itself)
  const baseline: number[] = Array(24).fill(0);
  for (let h = 0; h < 24; h++) {
    const window = [
      counts[(h - 2 + 24) % 24],
      counts[(h - 1 + 24) % 24],
      counts[(h + 1) % 24],
      counts[(h + 2) % 24],
    ];
    baseline[h] = Math.round(window.reduce((s, v) => s + v, 0) / window.length);
  }

  const SPIKE_THRESHOLD = 1.4; // 40% above baseline = spike
  return counts.map((actual, h) => {
    const base = Math.max(1, baseline[h]);
    const isSpike = actual >= base * SPIKE_THRESHOLD;
    const deviation = base > 0 ? Math.round(((actual - base) / base) * 100) : 0;
    return {
      hour: `${String(h).padStart(2,'0')}:00`,
      actual,
      baseline: base,
      spikeHigh: isSpike ? actual : base,
      spikeLow: base,
      isSpikeHour: isSpike,
      deviation,
    };
  });
}

export { buildHourlyData as getHourlyData };

// ─── Spike detection ─────────────────────────────────────────────
export interface SpikeAlert {
  label: string;
  timeRange: string;
  deviation: string;
  detail: string;
  severity: 'high' | 'medium' | 'low';
  spikeHour: number;
  isSpikeHour: boolean;
}

export function detectSpikes(hourlyData: HourlyBucket[]): SpikeAlert[] {
  return hourlyData.map((b, h): SpikeAlert => ({
    label: b.isSpikeHour
      ? b.deviation >= 80 ? 'High volume spike'
      : b.deviation >= 40 ? 'High velocity spike'
      : 'Unusual amount spike'
      : '',
    timeRange: `${b.hour} - ${String(h + 1).padStart(2,'0')}:00`,
    deviation: `+${b.deviation}%`,
    detail: `Payments: ${b.actual} vs ${b.baseline} (expected)`,
    severity: (b.deviation >= 80 ? 'high' : b.deviation >= 40 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
    spikeHour: h,
    isSpikeHour: b.isSpikeHour,
  })).filter(s => s.isSpikeHour);
}

// ─── Channel distribution ────────────────────────────────────────
export interface ChannelDatum {
  channel: Channel;
  count: number;
  pct: number;
  color: string;
}

const CHANNEL_COLORS: Record<Channel, string> = {
  'UPI':         '#557CFF',
  'Card':        '#10B981',
  'Net Banking': '#8B5CF6',
  'Wallet':      '#F59E0B',
  'Others':      '#94a3b8',
};

export function getChannelDistribution(txns: Transaction[]): ChannelDatum[] {
  const counts: Partial<Record<Channel, number>> = {};
  for (const t of txns) counts[t.channel] = (counts[t.channel] || 0) + 1;
  const total = txns.length || 1;
  return (['UPI','Card','Net Banking','Wallet','Others'] as Channel[]).map(ch => ({
    channel: ch,
    count: counts[ch] || 0,
    pct: Math.round(((counts[ch] || 0) / total) * 1000) / 10,
    color: CHANNEL_COLORS[ch],
  }));
}

// ─── Cluster stats ────────────────────────────────────────────────
export interface ClusterStat {
  label: ClusterLabel;
  count: number;
  entityCount: number;
  totalAmount: number;
  avgAmount: number;
  highRiskCount: number;
  otpFailRate: number;
  riskClassification: RiskLevel;
}

export function getClusterStats(txns: Transaction[]): ClusterStat[] {
  const CLUSTER_LABELS: ClusterLabel[] = [
    'OTP High Velocity','Large Volume Entities','New Device + New Location',
    'Low Volume Stable','Card Not Present','Normal',
  ];
  const groups: Record<string, Transaction[]> = {};
  for (const label of CLUSTER_LABELS) groups[label] = [];
  for (const t of txns) groups[t.cluster].push(t);

  return CLUSTER_LABELS.map(label => {
    const g = groups[label];
    const total = g.length || 1;
    const entities = new Set(g.map(t => t.entityId)).size;
    const totalAmt = g.reduce((s, t) => s + t.amount, 0);
    const highRisk = g.filter(t => t.riskLevel === 'High').length;
    const otpFail = g.filter(t => t.otpStatus === 'failed').length;
    const otpTotal = g.filter(t => t.authentication === 'OTP' || t.authentication === '3DS').length || 1;
    const otpFailRate = Math.round((otpFail / otpTotal) * 100);

    let riskClass: RiskLevel;
    if (label === 'OTP High Velocity' || label === 'New Device + New Location') riskClass = 'High';
    else if (label === 'Large Volume Entities' || label === 'Card Not Present') riskClass = 'Medium';
    else riskClass = 'Low';

    return {
      label,
      count: g.length,
      entityCount: entities,
      totalAmount: totalAmt,
      avgAmount: Math.round(totalAmt / total),
      highRiskCount: highRisk,
      otpFailRate,
      riskClassification: riskClass,
    };
  });
}

// ─── OTP Stats ───────────────────────────────────────────────────
export interface OTPStats {
  total: number;
  success: number;
  failed: number;
  expired: number;
  failRate: number;
  avgRetry: number;
  byHour: { hour: string; failed: number; total: number }[];
}

export function getOTPStats(txns: Transaction[]): OTPStats {
  const otpTxns = txns.filter(t => t.otpStatus !== null);
  const success  = otpTxns.filter(t => t.otpStatus === 'success').length;
  const failed   = otpTxns.filter(t => t.otpStatus === 'failed').length;
  const expired  = otpTxns.filter(t => t.otpStatus === 'expired').length;
  const total    = otpTxns.length || 1;
  const totalRetry = otpTxns.reduce((s, t) => s + t.otpRetryCount, 0);

  const byHour = Array.from({ length: 24 }, (_, h) => {
    const hTxns = otpTxns.filter(t => t.hour === h);
    return {
      hour: `${String(h).padStart(2,'0')}:00`,
      failed: hTxns.filter(t => t.otpStatus === 'failed').length,
      total: hTxns.length,
    };
  });

  return {
    total,
    success,
    failed,
    expired,
    failRate: Math.round((failed / total) * 1000) / 10,
    avgRetry: total > 0 ? Math.round((totalRetry / total) * 10) / 10 : 0,
    byHour,
  };
}

// ─── Risk distribution ───────────────────────────────────────────
export interface RiskDistribution {
  low: number;
  medium: number;
  high: number;
  lowPct: number;
  mediumPct: number;
  highPct: number;
  avgScore: number;
  byType: { type: string; avgScore: number; count: number }[];
  byChannel: { channel: string; avgScore: number; count: number }[];
}

export function getRiskDistribution(txns: Transaction[]): RiskDistribution {
  const total = txns.length || 1;
  const low    = txns.filter(t => t.riskLevel === 'Low').length;
  const medium = txns.filter(t => t.riskLevel === 'Medium').length;
  const high   = txns.filter(t => t.riskLevel === 'High').length;
  const avgScore = txns.length > 0
    ? Math.round(txns.reduce((s, t) => s + t.riskScore, 0) / txns.length)
    : 0;

  const typeGroups: Record<string, number[]> = {};
  for (const t of txns) {
    if (!typeGroups[t.type]) typeGroups[t.type] = [];
    typeGroups[t.type].push(t.riskScore);
  }
  const byType = Object.entries(typeGroups).map(([type, scores]) => ({
    type,
    avgScore: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length),
    count: scores.length,
  })).sort((a, b) => b.avgScore - a.avgScore);

  const chGroups: Record<string, number[]> = {};
  for (const t of txns) {
    if (!chGroups[t.channel]) chGroups[t.channel] = [];
    chGroups[t.channel].push(t.riskScore);
  }
  const byChannel = Object.entries(chGroups).map(([channel, scores]) => ({
    channel,
    avgScore: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length),
    count: scores.length,
  }));

  return {
    low, medium, high,
    lowPct: Math.round((low / total) * 100),
    mediumPct: Math.round((medium / total) * 100),
    highPct: Math.round((high / total) * 100),
    avgScore,
    byType,
    byChannel,
  };
}

// ─── Explanation for a single transaction ────────────────────────
export interface ExplanationFactor {
  label: string;
  actual: string;
  baseline: string;
  deviation: string;
  direction: 'increases' | 'decreases';
  weight: number; // 0-1 contribution
}

export interface Explanation {
  summary: string;
  factors: ExplanationFactor[];
}

export function getExplanation(t: Transaction): Explanation {
  const factors: ExplanationFactor[] = [];

  if (t.velocity > 15) {
    factors.push({
      label: 'Transaction Velocity',
      actual: `${t.velocity} txns/hr`,
      baseline: '8 txns/hr',
      deviation: `+${Math.round(((t.velocity - 8) / 8) * 100)}%`,
      direction: 'increases',
      weight: Math.min(1, (t.velocity - 8) / 50),
    });
  }

  if (t.amount > 10000) {
    factors.push({
      label: 'Transaction Amount',
      actual: `₹${t.amount.toLocaleString('en-IN')}`,
      baseline: '₹8,000 avg',
      deviation: `+${Math.round(((t.amount - 8000) / 8000) * 100)}%`,
      direction: 'increases',
      weight: Math.min(1, (t.amount - 8000) / 100000),
    });
  }

  if (t.otpStatus === 'failed') {
    factors.push({
      label: 'OTP Failures',
      actual: `${t.otpRetryCount + 1} attempts`,
      baseline: '1 attempt',
      deviation: `+${t.otpRetryCount * 100}%`,
      direction: 'increases',
      weight: 0.7,
    });
  }

  if (t.isNewDevice) {
    factors.push({
      label: 'Device Consistency',
      actual: 'New device',
      baseline: 'Known device',
      deviation: 'First seen',
      direction: 'increases',
      weight: 0.55,
    });
  }

  if (t.isNewLocation) {
    factors.push({
      label: 'Location Consistency',
      actual: t.location,
      baseline: 'Home city',
      deviation: 'Foreign location',
      direction: 'increases',
      weight: 0.55,
    });
  }

  if (t.hour < 5) {
    factors.push({
      label: 'Time of Day',
      actual: `${String(t.hour).padStart(2,'0')}:${String(t.minute).padStart(2,'0')}`,
      baseline: 'Business hours',
      deviation: 'Off-hours',
      direction: 'increases',
      weight: 0.35,
    });
  }

  // Positive factor — long-standing entity (if low risk)
  if (t.riskLevel === 'Low' || t.riskScore < 30) {
    factors.push({
      label: 'Account History',
      actual: 'Established',
      baseline: '< 30 days',
      deviation: 'Stable',
      direction: 'decreases',
      weight: 0.4,
    });
  }

  const summary = t.riskLevel === 'High'
    ? `High fraud risk (${t.riskScore}/100) due to ${factors.filter(f => f.direction === 'increases').map(f => f.label.toLowerCase()).slice(0, 2).join(' and ')}.`
    : t.riskLevel === 'Medium'
    ? `Moderate risk (${t.riskScore}/100). Some anomalous signals detected.`
    : `Low risk (${t.riskScore}/100). Transaction appears consistent with normal behaviour.`;

  return { summary, factors: factors.sort((a, b) => b.weight - a.weight) };
}

// ─── Format helpers ───────────────────────────────────────────────
export function formatINR(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(2)} L`;
  if (n >= 1000)     return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString('en-IN')}`;
}

export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });
}

export function exportTransactionsToCSV(txns: Transaction[]): void {
  const headers = ['Transaction ID', 'Entity ID', 'Timestamp', 'Amount (INR)', 'Channel', 'Type', 'Authentication', 'Risk Score', 'Risk Level', 'Location', 'Device', 'Status', 'Cluster'];
  const rows = txns.map(t => [
    t.id,
    t.entityId,
    new Date(t.timestamp).toISOString(),
    t.amount,
    t.channel,
    `"${t.type}"`,
    t.authentication,
    t.riskScore,
    t.riskLevel,
    `"${t.location}"`,
    `"${t.device}"`,
    t.status,
    `"${t.cluster}"`
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Payment_Intelligence_Transactions_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

