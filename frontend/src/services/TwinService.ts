export interface TwinNodeData {
  key: string;
  name: string;
  layer: string;
  x: number;
  y: number;
  w: number;
  h: number;
  tps: number;
  risk: number;
  status: "healthy" | "processing" | "warning" | "anomalous" | "idle";
  latencyMs: number;
  errorRate: number;
  details?: {
    uptime: string;
    throughputPeak: string;
    activeRuleCount: number;
    lastAnomalyDetected?: string;
  };
}

export interface TwinEdgeData {
  source: string;
  target: string;
  status: "healthy" | "anomalous" | "warning";
  latencyMs: number;
}

class TwinService {
  public getDefaultNodes(scenarioKey: string = "fraud_spike", isAnomalous: boolean = true): TwinNodeData[] {
    if (!isAnomalous) {
      return [
        { key: "entry", name: "ENTRY GATEWAY", layer: "ENTRY", x: 90, y: 190, w: 130, h: 90, tps: 12.4, risk: 1.2, status: "healthy", latencyMs: 5, errorRate: 0.001, details: { uptime: "99.99%", throughputPeak: "18.2K", activeRuleCount: 14 } },
        { key: "auth", name: "AUTH SERVICE", layer: "AUTHENTICATION", x: 300, y: 110, w: 130, h: 90, tps: 11.9, risk: 1.4, status: "healthy", latencyMs: 12, errorRate: 0.002, details: { uptime: "99.98%", throughputPeak: "16.5K", activeRuleCount: 32 } },
        { key: "risk", name: "RISK ENGINE", layer: "RISK_ENGINE", x: 520, y: 175, w: 150, h: 100, tps: 11.6, risk: 2.5, status: "healthy", latencyMs: 18, errorRate: 0.003, details: { uptime: "99.99%", throughputPeak: "15.0K", activeRuleCount: 88 } },
        { key: "router", name: "PAYMENT ROUTER", layer: "ROUTER", x: 745, y: 110, w: 140, h: 90, tps: 11.2, risk: 1.8, status: "healthy", latencyMs: 8, errorRate: 0.001, details: { uptime: "99.99%", throughputPeak: "14.2K", activeRuleCount: 20 } },
        { key: "processing", name: "PROCESSING SVC", layer: "PROCESSOR", x: 770, y: 290, w: 140, h: 90, tps: 10.8, risk: 1.5, status: "healthy", latencyMs: 45, errorRate: 0.004, details: { uptime: "99.95%", throughputPeak: "12.8K", activeRuleCount: 16 } },
        { key: "authz", name: "AUTHZ SVC", layer: "AUTHORIZATION", x: 640, y: 390, w: 130, h: 88, tps: 10.4, risk: 1.1, status: "healthy", latencyMs: 60, errorRate: 0.002, details: { uptime: "99.92%", throughputPeak: "11.5K", activeRuleCount: 12 } },
        { key: "settlement", name: "SETTLEMENT SVC", layer: "SETTLEMENT", x: 460, y: 445, w: 140, h: 88, tps: 10.2, risk: 0.9, status: "healthy", latencyMs: 25, errorRate: 0.001, details: { uptime: "99.99%", throughputPeak: "11.0K", activeRuleCount: 8 } },
      ];
    }

    switch (scenarioKey) {
      case "velocity":
        return [
          { key: "entry", name: "ENTRY GATEWAY", layer: "ENTRY", x: 90, y: 190, w: 130, h: 90, tps: 38.2, risk: 14.2, status: "warning", latencyMs: 14, errorRate: 0.015, details: { uptime: "99.91%", throughputPeak: "42.0K", activeRuleCount: 14 } },
          { key: "auth", name: "AUTH SERVICE", layer: "AUTHENTICATION", x: 300, y: 110, w: 130, h: 90, tps: 36.8, risk: 78.4, status: "anomalous", latencyMs: 48, errorRate: 0.125, details: { uptime: "98.40%", throughputPeak: "39.5K", activeRuleCount: 32, lastAnomalyDetected: "High Velocity Token Probe" } },
          { key: "risk", name: "RISK ENGINE", layer: "RISK_ENGINE", x: 520, y: 175, w: 150, h: 100, tps: 34.5, risk: 62.1, status: "processing", latencyMs: 35, errorRate: 0.082, details: { uptime: "99.20%", throughputPeak: "36.0K", activeRuleCount: 88 } },
          { key: "router", name: "PAYMENT ROUTER", layer: "ROUTER", x: 745, y: 110, w: 140, h: 90, tps: 18.2, risk: 12.5, status: "warning", latencyMs: 18, errorRate: 0.022, details: { uptime: "99.85%", throughputPeak: "22.0K", activeRuleCount: 20 } },
          { key: "processing", name: "PROCESSING SVC", layer: "PROCESSOR", x: 770, y: 290, w: 140, h: 90, tps: 12.4, risk: 4.1, status: "healthy", latencyMs: 46, errorRate: 0.005, details: { uptime: "99.95%", throughputPeak: "14.0K", activeRuleCount: 16 } },
          { key: "authz", name: "AUTHZ SVC", layer: "AUTHORIZATION", x: 640, y: 390, w: 130, h: 88, tps: 11.1, risk: 2.8, status: "healthy", latencyMs: 62, errorRate: 0.003, details: { uptime: "99.92%", throughputPeak: "12.0K", activeRuleCount: 12 } },
          { key: "settlement", name: "SETTLEMENT SVC", layer: "SETTLEMENT", x: 460, y: 445, w: 140, h: 88, tps: 10.8, risk: 1.9, status: "healthy", latencyMs: 25, errorRate: 0.001, details: { uptime: "99.99%", throughputPeak: "11.2K", activeRuleCount: 8 } },
        ];
      case "coordinated":
        return [
          { key: "entry", name: "ENTRY GATEWAY", layer: "ENTRY", x: 90, y: 190, w: 130, h: 90, tps: 24.6, risk: 68.5, status: "anomalous", latencyMs: 28, errorRate: 0.095, details: { uptime: "98.80%", throughputPeak: "28.0K", activeRuleCount: 14, lastAnomalyDetected: "Distributed Bot Syndicate" } },
          { key: "auth", name: "AUTH SERVICE", layer: "AUTHENTICATION", x: 300, y: 110, w: 130, h: 90, tps: 22.1, risk: 54.2, status: "warning", latencyMs: 32, errorRate: 0.065, details: { uptime: "99.10%", throughputPeak: "24.5K", activeRuleCount: 32 } },
          { key: "risk", name: "RISK ENGINE", layer: "RISK_ENGINE", x: 520, y: 175, w: 150, h: 100, tps: 21.8, risk: 91.4, status: "anomalous", latencyMs: 68, errorRate: 0.220, details: { uptime: "97.50%", throughputPeak: "23.0K", activeRuleCount: 88, lastAnomalyDetected: "Multi-Vector Synchronized Burst" } },
          { key: "router", name: "PAYMENT ROUTER", layer: "ROUTER", x: 745, y: 110, w: 140, h: 90, tps: 14.2, risk: 45.0, status: "warning", latencyMs: 22, errorRate: 0.045, details: { uptime: "99.40%", throughputPeak: "16.5K", activeRuleCount: 20 } },
          { key: "processing", name: "PROCESSING SVC", layer: "PROCESSOR", x: 770, y: 290, w: 140, h: 90, tps: 11.0, risk: 22.5, status: "processing", latencyMs: 58, errorRate: 0.025, details: { uptime: "99.70%", throughputPeak: "13.0K", activeRuleCount: 16 } },
          { key: "authz", name: "AUTHZ SVC", layer: "AUTHORIZATION", x: 640, y: 390, w: 130, h: 88, tps: 9.5, risk: 8.4, status: "healthy", latencyMs: 64, errorRate: 0.008, details: { uptime: "99.90%", throughputPeak: "10.8K", activeRuleCount: 12 } },
          { key: "settlement", name: "SETTLEMENT SVC", layer: "SETTLEMENT", x: 460, y: 445, w: 140, h: 88, tps: 9.2, risk: 2.1, status: "healthy", latencyMs: 26, errorRate: 0.002, details: { uptime: "99.99%", throughputPeak: "10.0K", activeRuleCount: 8 } },
        ];
      case "fraud_spike":
      default:
        return [
          { key: "entry", name: "ENTRY GATEWAY", layer: "ENTRY", x: 90, y: 190, w: 130, h: 90, tps: 12.4, risk: 1.8, status: "healthy", latencyMs: 5, errorRate: 0.002, details: { uptime: "99.99%", throughputPeak: "18.2K", activeRuleCount: 14 } },
          { key: "auth", name: "AUTH SERVICE", layer: "AUTHENTICATION", x: 300, y: 110, w: 130, h: 90, tps: 11.7, risk: 2.1, status: "healthy", latencyMs: 12, errorRate: 0.003, details: { uptime: "99.98%", throughputPeak: "16.5K", activeRuleCount: 32 } },
          { key: "risk", name: "RISK ENGINE", layer: "RISK_ENGINE", x: 520, y: 175, w: 150, h: 100, tps: 11.2, risk: 87.6, status: "anomalous", latencyMs: 52, errorRate: 0.185, details: { uptime: "98.20%", throughputPeak: "15.0K", activeRuleCount: 88, lastAnomalyDetected: "Stolen Credential Burst Spike" } },
          { key: "router", name: "PAYMENT ROUTER", layer: "ROUTER", x: 745, y: 110, w: 140, h: 90, tps: 10.8, risk: 6.3, status: "processing", latencyMs: 16, errorRate: 0.012, details: { uptime: "99.95%", throughputPeak: "14.2K", activeRuleCount: 20 } },
          { key: "processing", name: "PROCESSING SVC", layer: "PROCESSOR", x: 770, y: 290, w: 140, h: 90, tps: 10.1, risk: 3.2, status: "healthy", latencyMs: 45, errorRate: 0.004, details: { uptime: "99.95%", throughputPeak: "12.8K", activeRuleCount: 16 } },
          { key: "authz", name: "AUTHZ SVC", layer: "AUTHORIZATION", x: 640, y: 390, w: 130, h: 88, tps: 9.9, risk: 2.4, status: "healthy", latencyMs: 60, errorRate: 0.002, details: { uptime: "99.92%", throughputPeak: "11.5K", activeRuleCount: 12 } },
          { key: "settlement", name: "SETTLEMENT SVC", layer: "SETTLEMENT", x: 460, y: 445, w: 140, h: 88, tps: 9.7, risk: 1.6, status: "healthy", latencyMs: 25, errorRate: 0.001, details: { uptime: "99.99%", throughputPeak: "11.0K", activeRuleCount: 8 } },
        ];
    }
  }

  public getEdges(isAnomalous: boolean = true): TwinEdgeData[] {
    return [
      { source: "entry", target: "auth", status: "healthy", latencyMs: 4 },
      { source: "auth", target: "risk", status: "healthy", latencyMs: 6 },
      { source: "risk", target: "router", status: isAnomalous ? "anomalous" : "healthy", latencyMs: 18 },
      { source: "router", target: "risk", status: isAnomalous ? "anomalous" : "healthy", latencyMs: 12 },
      { source: "router", target: "processing", status: "healthy", latencyMs: 8 },
      { source: "risk", target: "processing", status: isAnomalous ? "anomalous" : "healthy", latencyMs: 22 },
      { source: "processing", target: "authz", status: "healthy", latencyMs: 15 },
      { source: "authz", target: "settlement", status: "healthy", latencyMs: 10 },
    ];
  }
}

export const twinService = new TwinService();
