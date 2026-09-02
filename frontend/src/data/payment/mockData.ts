// ─────────────────────────────────────────────────────────────────
//  Single source-of-truth for Payment Intelligence feature.
//  Replace this file's exports with real FastAPI calls later.
// ─────────────────────────────────────────────────────────────────

export type TransactionType =
  | 'Food Order' | 'Shopping' | 'Bill Payment' | 'Money Transfer'
  | 'Fuel' | 'Electronics' | 'Subscription' | 'Travel' | 'Other';

export type Channel = 'UPI' | 'Card' | 'Net Banking' | 'Wallet' | 'Others';
export type AuthType = 'OTP' | 'Non-OTP' | '3DS';
export type OTPStatus = 'success' | 'failed' | 'expired';
export type RiskLevel = 'Low' | 'Medium' | 'High';
export type TxnStatus = 'Completed' | 'Pending' | 'Failed' | 'Blocked';
export type ClusterLabel =
  | 'OTP High Velocity' | 'Large Volume Entities' | 'New Device + New Location'
  | 'Low Volume Stable' | 'Card Not Present' | 'Normal';

export interface Transaction {
  id: string;
  entityId: string;
  timestamp: number;   // Unix ms within 2026-09-01
  hour: number;        // 0-23
  minute: number;
  type: TransactionType;
  channel: Channel;
  amount: number;
  authentication: AuthType;
  otpStatus: OTPStatus | null;
  otpRetryCount: number;
  location: string;    // "City, STATE"
  city: string;
  state: string;
  device: string;
  isNewDevice: boolean;
  isNewLocation: boolean;
  riskScore: number;   // 0-100
  riskLevel: RiskLevel;
  status: TxnStatus;
  cluster: ClusterLabel;
  velocity: number;    // entity velocity at this hour (txns/hr)
}

// ─── Static reference data ─────────────────────────────────────────
const TYPES: TransactionType[] = [
  'Food Order','Shopping','Bill Payment','Money Transfer',
  'Fuel','Electronics','Subscription','Travel','Other',
];
const TYPE_WEIGHTS = [18, 16, 14, 12, 10, 8, 7, 8, 7];

const CHANNELS: Channel[] = ['UPI','Card','Net Banking','Wallet','Others'];
const CHANNEL_WEIGHTS = [41, 25, 22, 8, 4];

const AUTHS: AuthType[] = ['OTP','Non-OTP','3DS'];
const AUTH_WEIGHTS = [50, 30, 20];

const LOCATIONS = [
  { city: 'Mumbai',    state: 'MH' },
  { city: 'Delhi',     state: 'DL' },
  { city: 'Bangalore', state: 'KA' },
  { city: 'Chennai',   state: 'TN' },
  { city: 'Hyderabad', state: 'TG' },
  { city: 'Pune',      state: 'MH' },
  { city: 'Kolkata',   state: 'WB' },
  { city: 'Ahmedabad', state: 'GJ' },
  { city: 'Jaipur',    state: 'RJ' },
  { city: 'Surat',     state: 'GJ' },
];

const DEVICES = [
  'iPhone 14','Samsung S23','Pixel 7','Web Browser',
  'Xiaomi 12','OnePlus 11','iPad Pro','MacBook',
];

// Amount ranges [min, max] per type
const AMOUNT_RANGE: Record<TransactionType, [number, number]> = {
  'Food Order':     [50,   800],
  'Shopping':       [200,  15000],
  'Bill Payment':   [100,  5000],
  'Money Transfer': [500,  100000],
  'Fuel':           [200,  2500],
  'Electronics':    [3000, 80000],
  'Subscription':   [99,   2999],
  'Travel':         [500,  25000],
  'Other':          [50,   5000],
};

// Hour-by-hour transaction counts (index = hour 0-23), total ≈ 503
const TXNS_PER_HOUR = [
  5, 2, 2, 1, 1, 1, 3, 5,        // 0-7:   20
  20, 25, 28, 24, 22, 18,         // 8-13: 137
  88, 98,                          // 14-15: 186  ← SPIKE
  58, 38, 22, 14, 10,              // 16-20: 142
  8, 5, 5,                         // 21-23:  18
];

// Entity profiles (40 entities total)
const ENTITY_COUNT = 40;
const HIGH_VEL_ENTITIES  = new Set([1, 2, 3]);              // OTP High Velocity
const LARGE_VOL_ENTITIES = new Set([4, 5, 6]);              // Large Volume
const NEW_DEV_LOC_ENTITIES = new Set([7, 8, 9]);            // New Device + Location
const STABLE_ENTITIES    = new Set([10,11,12,13,14,15]);    // Low Volume Stable
const CNP_ENTITIES       = new Set([16,17,18,19,20,21]);    // Card Not Present

function entityId(n: number): string {
  return `acc_${String(n).padStart(4, '0')}`;
}

// ─── Seeded deterministic RNG ──────────────────────────────────────
class SR {
  private s: number;
  constructor(seed: number) { this.s = seed >>> 0; }
  next(): number {
    this.s = ((this.s * 1664525 + 1013904223) >>> 0);
    return this.s / 4294967296;
  }
  int(lo: number, hi: number): number { return Math.floor(this.next() * (hi - lo + 1)) + lo; }
  pick<T>(a: readonly T[]): T { return a[this.int(0, a.length - 1)]; }
  weighted<T>(a: readonly T[], w: readonly number[]): T {
    let r = this.next() * w.reduce((s, x) => s + x, 0);
    for (let i = 0; i < a.length - 1; i++) { r -= w[i]; if (r <= 0) return a[i]; }
    return a[a.length - 1];
  }
  bool(p: number): boolean { return this.next() < p; }
}

// ─── Generator ────────────────────────────────────────────────────
function buildTransactions(): Transaction[] {
  const rng = new SR(42);
  const txns: Transaction[] = [];
  const today = new Date('2026-09-01T00:00:00.000Z').getTime();
  let counter = 1;

  // Per-entity home location (stable entities always return here)
  const entityHomeLocation: Record<string, typeof LOCATIONS[0]> = {};
  const entityHomeDevice: Record<string, string> = {};
  for (let n = 1; n <= ENTITY_COUNT; n++) {
    entityHomeLocation[entityId(n)] = LOCATIONS[n % LOCATIONS.length];
    entityHomeDevice[entityId(n)] = DEVICES[n % DEVICES.length];
  }

  // Decide which entity IDs go in which pool (for hour distribution)
  // High-velocity entities produce more transactions in spike hours
  for (let hour = 0; hour < 24; hour++) {
    const count = TXNS_PER_HOUR[hour];

    for (let i = 0; i < count; i++) {
      const minute = rng.int(0, 59);
      const second = rng.int(0, 59);
      const ts = today + hour * 3600000 + minute * 60000 + second * 1000;
      const txnId = `txn_${String(889000 + counter).padStart(6,'0')}`;

      // Pick entity — bias high-velocity entities toward spike hours
      let entityNum: number;
      if (hour >= 14 && hour <= 15) {
        // 40% chance of high-vel entity during spike
        entityNum = rng.bool(0.4) ? rng.int(1, 3) : rng.int(1, ENTITY_COUNT);
      } else {
        entityNum = rng.int(1, ENTITY_COUNT);
      }
      const eid = entityId(entityNum);

      // Velocity for entity at this hour (high-vel = lots this hour)
      const velocity = HIGH_VEL_ENTITIES.has(entityNum)
        ? rng.int(20, 55)
        : STABLE_ENTITIES.has(entityNum)
        ? rng.int(1, 4)
        : rng.int(3, 12);

      // Channel — CNP entities mostly Card; large-vol entities mostly NetBanking+UPI
      let channel: Channel;
      if (CNP_ENTITIES.has(entityNum)) {
        channel = rng.bool(0.75) ? 'Card' : rng.weighted(CHANNELS, CHANNEL_WEIGHTS);
      } else if (LARGE_VOL_ENTITIES.has(entityNum)) {
        channel = rng.bool(0.5) ? 'UPI' : rng.bool(0.4) ? 'Net Banking' : rng.weighted(CHANNELS, CHANNEL_WEIGHTS);
      } else {
        channel = rng.weighted(CHANNELS, CHANNEL_WEIGHTS);
      }

      // Authentication
      let auth: AuthType;
      if (channel === 'Net Banking') auth = rng.bool(0.4) ? '3DS' : rng.bool(0.5) ? 'OTP' : 'Non-OTP';
      else if (channel === 'Card')   auth = rng.bool(0.35) ? '3DS' : rng.bool(0.45) ? 'OTP' : 'Non-OTP';
      else                           auth = rng.weighted(AUTHS, AUTH_WEIGHTS);

      // OTP outcome
      let otpStatus: OTPStatus | null = null;
      let otpRetry = 0;
      if (auth === 'OTP' || auth === '3DS') {
        const isHighVelSpike = HIGH_VEL_ENTITIES.has(entityNum) && hour >= 14 && hour <= 15;
        const failProb = isHighVelSpike ? 0.30 : 0.12;
        const expProb  = isHighVelSpike ? 0.12 : 0.06;
        if (rng.bool(failProb)) {
          otpStatus = 'failed';
          otpRetry  = rng.int(1, 3);
        } else if (rng.bool(expProb)) {
          otpStatus = 'expired';
          otpRetry  = 1;
        } else {
          otpStatus = 'success';
        }
      }

      // Transaction type + amount
      const type = rng.weighted(TYPES, TYPE_WEIGHTS);
      const [amin, amax] = AMOUNT_RANGE[type];
      let amount: number;
      if (LARGE_VOL_ENTITIES.has(entityNum)) {
        amount = rng.int(Math.max(amin, amax * 0.6 | 0), amax);
      } else {
        amount = rng.int(amin, amax);
      }

      // Location — stable entities always home; new-device entities sometimes foreign
      let loc = entityHomeLocation[eid];
      let isNewLocation = false;
      if (NEW_DEV_LOC_ENTITIES.has(entityNum) || rng.bool(0.08)) {
        const newLoc = rng.pick(LOCATIONS.filter(l => l.city !== entityHomeLocation[eid].city));
        loc = newLoc;
        isNewLocation = true;
      }

      // Device — new-device entities use random devices; stable always home device
      let device = entityHomeDevice[eid];
      let isNewDevice = false;
      if (NEW_DEV_LOC_ENTITIES.has(entityNum) || CNP_ENTITIES.has(entityNum) || rng.bool(0.10)) {
        device = rng.pick(DEVICES.filter(d => d !== entityHomeDevice[eid]));
        isNewDevice = true;
      }

      // Risk scoring (deterministic)
      let rs = 10;
      if (isNewDevice)   rs += 18;
      if (isNewLocation) rs += 18;
      if (isNewDevice && isNewLocation) rs += 12; // combined bonus
      if (hour < 5)      rs += 12;
      if (velocity > 30) rs += 22;
      else if (velocity > 15) rs += 14;
      else if (velocity > 8)  rs += 7;
      if (otpStatus === 'failed')  rs += 22;
      if (otpStatus === 'expired') rs += 13;
      if (amount > 50000) rs += 14;
      else if (amount > 10000) rs += 8;
      if (type === 'Money Transfer' && amount > 20000) rs += 10;
      if (channel === 'Others' && isNewDevice) rs += 8;
      rs = Math.min(100, rs);

      const riskLevel: RiskLevel = rs >= 60 ? 'High' : rs >= 30 ? 'Medium' : 'Low';

      // Status
      let status: TxnStatus;
      if (rs >= 80 && rng.bool(0.6))       status = 'Blocked';
      else if (otpStatus === 'failed' && rng.bool(0.4)) status = 'Failed';
      else if (rng.bool(0.04))             status = 'Pending';
      else                                 status = 'Completed';

      // Cluster assignment
      let cluster: ClusterLabel;
      if (HIGH_VEL_ENTITIES.has(entityNum) && auth !== 'Non-OTP') cluster = 'OTP High Velocity';
      else if (LARGE_VOL_ENTITIES.has(entityNum) || amount > 50000) cluster = 'Large Volume Entities';
      else if (isNewDevice && isNewLocation) cluster = 'New Device + New Location';
      else if (STABLE_ENTITIES.has(entityNum)) cluster = 'Low Volume Stable';
      else if (CNP_ENTITIES.has(entityNum) && channel === 'Card') cluster = 'Card Not Present';
      else cluster = 'Normal';

      txns.push({
        id: txnId,
        entityId: eid,
        timestamp: ts,
        hour,
        minute,
        type,
        channel,
        amount,
        authentication: auth,
        otpStatus,
        otpRetryCount: otpRetry,
        location: `${loc.city}, ${loc.state}`,
        city: loc.city,
        state: loc.state,
        device,
        isNewDevice,
        isNewLocation,
        riskScore: rs,
        riskLevel,
        status,
        cluster,
        velocity,
      });

      counter++;
    }
  }

  // Sort chronologically
  return txns.sort((a, b) => a.timestamp - b.timestamp);
}

export const ALL_TRANSACTIONS: Transaction[] = buildTransactions();

// Pre-computed entity map: entityId → aggregated stats
export interface EntityStats {
  entityId: string;
  txnCount: number;
  totalAmount: number;
  avgAmount: number;
  avgVelocity: number;
  highRiskCount: number;
  otpFailCount: number;
  homeLocation: string;
  cluster: ClusterLabel;
}

function buildEntityMap(): Record<string, EntityStats> {
  const map: Record<string, EntityStats> = {};
  for (const t of ALL_TRANSACTIONS) {
    if (!map[t.entityId]) {
      map[t.entityId] = {
        entityId: t.entityId,
        txnCount: 0,
        totalAmount: 0,
        avgAmount: 0,
        avgVelocity: 0,
        highRiskCount: 0,
        otpFailCount: 0,
        homeLocation: t.location,
        cluster: t.cluster,
      };
    }
    const e = map[t.entityId];
    e.txnCount++;
    e.totalAmount += t.amount;
    e.avgVelocity = (e.avgVelocity * (e.txnCount - 1) + t.velocity) / e.txnCount;
    if (t.riskLevel === 'High') e.highRiskCount++;
    if (t.otpStatus === 'failed') e.otpFailCount++;
  }
  for (const e of Object.values(map)) {
    e.avgAmount = e.totalAmount / e.txnCount;
  }
  return map;
}

export const ENTITY_MAP: Record<string, EntityStats> = buildEntityMap();
