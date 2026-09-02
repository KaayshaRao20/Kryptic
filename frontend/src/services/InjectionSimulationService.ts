// ============================================================
//  InjectionSimulationService.ts
//  Fraud injection lab simulation service
// ============================================================

export interface InjectionConfig {
  scenario: string;
  transactionVolume: number;
  fraudRatio: number;
  velocity: number;
  amountPattern: string;
  targetEntity: string;
  duration: number;
  fraudIntensity: string;
  transactionType: string;
}

export type ComponentStatus = 'healthy' | 'warning' | 'anomalous';

export interface PaymentComponent {
  id: string;
  shortName: string;
  fullName: string;
  type: string;
  status: ComponentStatus;
  riskScore: number;
  detectedAt?: string;
}

export type TimelineSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';

export interface TimelineEvent {
  time: string;
  description: string;
  detail?: string;
  severity: TimelineSeverity;
}

export interface InjectionResults {
  injectedEvents: number;
  detectedEvents: number;
  missedEvents: number;
  detectionRate: number;
  falsePositiveRate: number;
  detectionLatencyMs: number;
  riskScorePeak: number;
  affectedComponent: string;
  simulationTime: string;
}

export interface SimulationOutput {
  results: InjectionResults;
  components: PaymentComponent[];
  timeline: TimelineEvent[];
  affectedComponentId: string;
  propagatedToNames: string[];
}

// ─── Per-scenario configurations ──────────────────────────────
interface ScenarioCfg {
  baseDetectionRate: number;
  affectedId: string;
  affectedName: string;
  propagateTo: { id: string; name: string }[];
  riskScore: number;
  falsePositiveRate: number;
  baseLatencyMs: number;
}

const SCENARIO_CFG: Record<string, ScenarioCfg> = {
  fraud_spike: {
    baseDetectionRate: 85.2,
    affectedId: 'risk',
    affectedName: 'Risk Engine',
    propagateTo: [{ id: 'router', name: 'Payment Router' }, { id: 'processor', name: 'Processor' }],
    riskScore: 87.6,
    falsePositiveRate: 3.6,
    baseLatencyMs: 142,
  },
  high_velocity: {
    baseDetectionRate: 91.4,
    affectedId: 'auth',
    affectedName: 'Auth Service',
    propagateTo: [{ id: 'risk', name: 'Risk Engine' }, { id: 'router', name: 'Payment Router' }],
    riskScore: 76.2,
    falsePositiveRate: 2.8,
    baseLatencyMs: 98,
  },
  coordinated: {
    baseDetectionRate: 78.8,
    affectedId: 'entry',
    affectedName: 'Entry Gateway',
    propagateTo: [{ id: 'auth', name: 'Auth Service' }, { id: 'risk', name: 'Risk Engine' }],
    riskScore: 92.4,
    falsePositiveRate: 5.2,
    baseLatencyMs: 185,
  },
  behavioral: {
    baseDetectionRate: 72.5,
    affectedId: 'risk',
    affectedName: 'Risk Engine',
    propagateTo: [{ id: 'processor', name: 'Processor' }],
    riskScore: 81.3,
    falsePositiveRate: 4.1,
    baseLatencyMs: 220,
  },
  custom: {
    baseDetectionRate: 80.0,
    affectedId: 'risk',
    affectedName: 'Risk Engine',
    propagateTo: [{ id: 'router', name: 'Payment Router' }],
    riskScore: 84.0,
    falsePositiveRate: 3.8,
    baseLatencyMs: 160,
  },
};

const INTENSITY_MULT: Record<string, number> = {
  Low: 0.82,
  Medium: 1.0,
  High: 1.18,
  Extreme: 1.38,
};

// ─── Helpers ──────────────────────────────────────────────────
function fmtSimTime(durationMin: number): string {
  const s = durationMin * 60;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

function clockAt(offsetSecs: number): string {
  const now = new Date();
  now.setSeconds(now.getSeconds() + offsetSecs);
  return now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function scenarioDisplayName(key: string): string {
  const m: Record<string, string> = {
    fraud_spike: 'Fraud Spike',
    high_velocity: 'High Velocity',
    coordinated: 'Coordinated Activity',
    behavioral: 'Behavioral Anomaly',
    custom: 'Custom Scenario',
  };
  return m[key] ?? 'Unknown Scenario';
}

// ─── Main simulation entry ─────────────────────────────────────
export function runInjectionSimulation(config: InjectionConfig): SimulationOutput {
  const cfg = SCENARIO_CFG[config.scenario] ?? SCENARIO_CFG.fraud_spike;
  const mult = INTENSITY_MULT[config.fraudIntensity] ?? 1.0;

  // Adjust detection based on fraud ratio difficulty
  const detectionRate = Math.min(98, Math.max(50,
    cfg.baseDetectionRate - (config.fraudRatio - 20) * 0.28 * mult
  ));
  const injected = config.transactionVolume;
  const detected = Math.round(injected * detectionRate / 100);
  const missed = injected - detected;
  const fpRate = Math.min(15, cfg.falsePositiveRate * mult);
  const latency = Math.round(cfg.baseLatencyMs * (mult * 0.85 + 0.15));
  const riskScore = Math.min(99.9, cfg.riskScore * mult);

  const results: InjectionResults = {
    injectedEvents: injected,
    detectedEvents: detected,
    missedEvents: missed,
    detectionRate: Math.round(detectionRate * 10) / 10,
    falsePositiveRate: Math.round(fpRate * 10) / 10,
    detectionLatencyMs: latency,
    riskScorePeak: Math.round(riskScore * 10) / 10,
    affectedComponent: cfg.affectedName,
    simulationTime: fmtSimTime(config.duration),
  };

  // Build components list
  const allComponents: PaymentComponent[] = [
    { id: 'entry',      shortName: 'ENTRY',       fullName: 'Entry Gateway',   type: 'Gateway', status: 'healthy', riskScore: 2 },
    { id: 'auth',       shortName: 'AUTH',         fullName: 'Auth Service',    type: 'Service', status: 'healthy', riskScore: 3 },
    { id: 'risk',       shortName: 'RISK ENGINE',  fullName: 'Risk Engine',     type: 'Service', status: 'healthy', riskScore: 4 },
    { id: 'router',     shortName: 'ROUTER',       fullName: 'Payment Router',  type: 'Service', status: 'healthy', riskScore: 5 },
    { id: 'processor',  shortName: 'PROCESSOR',    fullName: 'Processor',       type: 'Service', status: 'healthy', riskScore: 3 },
    { id: 'authz',      shortName: 'AUTHZ',        fullName: 'Authz Service',   type: 'Service', status: 'healthy', riskScore: 2 },
    { id: 'settlement', shortName: 'SETTLEMENT',   fullName: 'Settlement',      type: 'Service', status: 'healthy', riskScore: 1 },
  ];

  const propagateIds = cfg.propagateTo.map((p) => p.id);
  const components = allComponents.map((c) => {
    if (c.id === cfg.affectedId) {
      return {
        ...c,
        status: 'anomalous' as ComponentStatus,
        riskScore: Math.round(riskScore),
        detectedAt: clockAt(4),
      };
    }
    if (propagateIds.includes(c.id)) {
      return { ...c, status: 'warning' as ComponentStatus, riskScore: Math.round(riskScore * 0.42) };
    }
    return c;
  });

  // Build progressive event timeline
  const sn = scenarioDisplayName(config.scenario);
  const timeline: TimelineEvent[] = [
    { time: clockAt(0),  description: 'Fraud injection started', detail: `Scenario: ${sn}`, severity: 'INFO' },
    { time: clockAt(1),  description: `${injected.toLocaleString()} synthetic transactions initiated`, detail: `Fraud ratio: ${config.fraudRatio}%`, severity: 'INFO' },
    { time: clockAt(2),  description: 'Suspicious pattern detected at Entry Gateway', severity: 'WARNING' },
    { time: clockAt(3),  description: `Anomaly escalated to ${cfg.affectedName}`, severity: 'WARNING' },
    { time: clockAt(4),  description: `Fraud detected at ${cfg.affectedName}`, detail: `Risk Score: ${Math.round(riskScore)}%`, severity: 'CRITICAL' },
    ...cfg.propagateTo.slice(0, 2).map((p, i) => ({
      time: clockAt(5 + i),
      description: `Risk propagated to ${p.name}`,
      severity: 'WARNING' as TimelineSeverity,
    })),
    {
      time: clockAt(config.duration * 60 - 2),
      description: 'Simulation completed',
      detail: `${detected.toLocaleString()} events detected (${detectionRate.toFixed(1)}%)`,
      severity: 'SUCCESS',
    },
  ];

  return {
    results,
    components,
    timeline,
    affectedComponentId: cfg.affectedId,
    propagatedToNames: cfg.propagateTo.map((p) => p.name),
  };
}
