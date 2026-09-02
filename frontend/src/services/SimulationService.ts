export interface SimulationConfig {
  scenarioKey: string;
  totalEvents: number;
  fraudRatio: number;
  duration: string;
  startTime: string;
  injectionPattern: string;
  targetNodeKey?: string;
  customParameters?: Record<string, any>;
}

export interface SimulationResultMetrics {
  detectionRate: number;
  injected: number;
  detected: number;
  missed: number;
  falsePositives: number;
  precision: number;
  recall: number;
  f1: number;
  fpr: number;
  latency: number;
  fpCost: number;
}

export interface SimulationTimelineEvent {
  key: string;
  label: string;
  trps: string;
  risk: string;
  status: "healthy" | "processing" | "warning" | "anomalous" | "idle";
}

class SimulationService {
  public calculateDeterministicMetrics(config: SimulationConfig): SimulationResultMetrics {
    const { totalEvents, fraudRatio, scenarioKey } = config;
    const injected = totalEvents;

    // Deterministic realistic factors based on scenario
    let baseDetection = 92.0;
    let basePrecision = 89.5;
    let baseLatency = 180;

    switch (scenarioKey) {
      case "fraud_spike":
        baseDetection = 86.4 - (fraudRatio * 0.25);
        basePrecision = 91.2 - (fraudRatio * 0.15);
        baseLatency = 215;
        break;
      case "coordinated":
        baseDetection = 81.8 - (fraudRatio * 0.30);
        basePrecision = 85.0 - (fraudRatio * 0.20);
        baseLatency = 265;
        break;
      case "velocity":
        baseDetection = 94.5 - (fraudRatio * 0.18);
        basePrecision = 88.0 - (fraudRatio * 0.10);
        baseLatency = 145;
        break;
      case "behavioral":
        baseDetection = 79.2 - (fraudRatio * 0.35);
        basePrecision = 83.4 - (fraudRatio * 0.22);
        baseLatency = 290;
        break;
      default:
        baseDetection = 85.0 - (fraudRatio * 0.20);
        basePrecision = 88.0 - (fraudRatio * 0.15);
        baseLatency = 200;
    }

    const detectionRate = Math.max(50, Math.min(99.4, Number(baseDetection.toFixed(1))));
    const detected = Math.round((injected * (detectionRate / 100)));
    const missed = injected - detected;
    const precision = Math.max(55, Math.min(98.8, Number(basePrecision.toFixed(1))));
    const recall = detectionRate;
    const f1 = Number(((2 * precision * recall) / (precision + recall)).toFixed(1));
    const falsePositives = Math.max(12, Math.round((injected * (100 - precision)) / 100 / 3.2));
    const fpr = Math.max(0.8, Number(((falsePositives / (injected - detected + falsePositives + 1000)) * 100).toFixed(1)));
    const latency = Math.round(baseLatency + (fraudRatio * 1.5));
    const fpCost = Number((falsePositives * 0.204).toFixed(1));

    return {
      detectionRate,
      injected,
      detected,
      missed,
      falsePositives,
      precision,
      recall,
      f1,
      fpr,
      latency,
      fpCost,
    };
  }

  public getTimelineForScenario(scenarioKey: string, isAnomalous: boolean): SimulationTimelineEvent[] {
    if (!isAnomalous) {
      return [
        { key: "entry", label: "ENTRY GATEWAY", trps: "12.4K trps", risk: "1.2% risk", status: "healthy" },
        { key: "auth", label: "AUTH SERVICE", trps: "11.9K trps", risk: "1.4% risk", status: "healthy" },
        { key: "risk", label: "RISK ENGINE", trps: "11.6K trps", risk: "2.5% risk", status: "healthy" },
        { key: "router", label: "PAYMENT ROUTER", trps: "11.2K trps", risk: "1.8% risk", status: "healthy" },
        { key: "processing", label: "PROCESSING SVC", trps: "10.8K trps", risk: "1.5% risk", status: "healthy" },
        { key: "authz", label: "AUTHZ SERVICE", trps: "10.4K trps", risk: "1.1% risk", status: "healthy" },
        { key: "settlement", label: "SETTLEMENT SVC", trps: "10.2K trps", risk: "0.9% risk", status: "healthy" },
      ];
    }

    switch (scenarioKey) {
      case "velocity":
        return [
          { key: "entry", label: "ENTRY GATEWAY", trps: "38.2K trps", risk: "14.2% risk", status: "warning" },
          { key: "auth", label: "AUTH SERVICE", trps: "36.8K trps", risk: "78.4% risk", status: "anomalous" },
          { key: "risk", label: "RISK ENGINE", trps: "34.5K trps", risk: "62.1% risk", status: "processing" },
          { key: "router", label: "PAYMENT ROUTER", trps: "18.2K trps", risk: "12.5% risk", status: "warning" },
          { key: "processing", label: "PROCESSING SVC", trps: "12.4K trps", risk: "4.1% risk", status: "healthy" },
          { key: "authz", label: "AUTHZ SERVICE", trps: "11.1K trps", risk: "2.8% risk", status: "healthy" },
          { key: "settlement", label: "SETTLEMENT SVC", trps: "10.8K trps", risk: "1.9% risk", status: "healthy" },
        ];
      case "coordinated":
        return [
          { key: "entry", label: "ENTRY GATEWAY", trps: "24.6K trps", risk: "68.5% risk", status: "anomalous" },
          { key: "auth", label: "AUTH SERVICE", trps: "22.1K trps", risk: "54.2% risk", status: "warning" },
          { key: "risk", label: "RISK ENGINE", trps: "21.8K trps", risk: "91.4% risk", status: "anomalous" },
          { key: "router", label: "PAYMENT ROUTER", trps: "14.2K trps", risk: "45.0% risk", status: "warning" },
          { key: "processing", label: "PROCESSING SVC", trps: "11.0K trps", risk: "22.5% risk", status: "processing" },
          { key: "authz", label: "AUTHZ SERVICE", trps: "9.5K trps", risk: "8.4% risk", status: "healthy" },
          { key: "settlement", label: "SETTLEMENT SVC", trps: "9.2K trps", risk: "2.1% risk", status: "healthy" },
        ];
      case "behavioral":
        return [
          { key: "entry", label: "ENTRY GATEWAY", trps: "13.1K trps", risk: "3.2% risk", status: "healthy" },
          { key: "auth", label: "AUTH SERVICE", trps: "12.8K trps", risk: "6.4% risk", status: "healthy" },
          { key: "risk", label: "RISK ENGINE", trps: "12.5K trps", risk: "84.2% risk", status: "anomalous" },
          { key: "router", label: "PAYMENT ROUTER", trps: "11.9K trps", risk: "28.5% risk", status: "warning" },
          { key: "processing", label: "PROCESSING SVC", trps: "10.4K trps", risk: "18.2% risk", status: "processing" },
          { key: "authz", label: "AUTHZ SERVICE", trps: "9.8K trps", risk: "4.5% risk", status: "healthy" },
          { key: "settlement", label: "SETTLEMENT SVC", trps: "9.5K trps", risk: "1.8% risk", status: "healthy" },
        ];
      case "fraud_spike":
      default:
        return [
          { key: "entry", label: "ENTRY GATEWAY", trps: "12.4K trps", risk: "1.8% risk", status: "healthy" },
          { key: "auth", label: "AUTH SERVICE", trps: "11.7K trps", risk: "2.1% risk", status: "healthy" },
          { key: "risk", label: "RISK ENGINE", trps: "11.2K trps", risk: "87.6% risk", status: "anomalous" },
          { key: "router", label: "PAYMENT ROUTER", trps: "10.8K trps", risk: "6.3% risk", status: "processing" },
          { key: "processing", label: "PROCESSING SVC", trps: "10.1K trps", risk: "3.2% risk", status: "healthy" },
          { key: "authz", label: "AUTHZ SERVICE", trps: "9.9K trps", risk: "2.4% risk", status: "healthy" },
          { key: "settlement", label: "SETTLEMENT SVC", trps: "9.7K trps", risk: "1.6% risk", status: "healthy" },
        ];
    }
  }
}

export const simulationService = new SimulationService();
