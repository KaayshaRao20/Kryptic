// Transaction Models
export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  timestamp: string;
  type: string;
  accountId: string;
  merchantId?: string;
  deviceInfo?: string;
  location?: string;
  velocity?: number;
}

// Prediction and Risk Models
export interface Prediction {
  id: string;
  transactionId: string;
  probability: number; // 0.0 to 1.0
  classification: 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK' | 'CRITICAL';
  timestamp: string;
}

export interface RiskEvent {
  id: string;
  predictionId: string;
  nodeId: string; // The component in the Twin where risk emerged
  description: string;
  severity: 'WARNING' | 'ANOMALOUS' | 'CRITICAL';
  timestamp: string;
}

export interface Explanation {
  predictionId: string;
  topFeatures: { feature: string; contribution: number }[];
  baseValue: number;
}

// Digital Twin Models
export type NodeStatus = 'HEALTHY' | 'PROCESSING' | 'ANOMALOUS' | 'CRITICAL';

export interface TwinNode {
  id: string;
  name: string;
  type: 'ENTRY' | 'AUTH' | 'RISK' | 'ROUTER' | 'PROCESSOR' | 'SETTLEMENT' | 'CUSTOM';
  status: NodeStatus;
  metrics: {
    tps?: number;
    latencyMs?: number;
    riskScore?: number;
  };
}

export interface TwinEdge {
  id: string;
  source: string;
  target: string;
  status: 'ACTIVE' | 'INACTIVE' | 'WARNING';
}

export interface TwinTopology {
  id: string;
  version: string;
  nodes: TwinNode[];
  edges: TwinEdge[];
}

// Simulation Models
export interface Simulation {
  id: string;
  name: string;
  description: string;
  parameters: {
    durationMinutes: number;
    eventCount: number;
    fraudRatio: number; // 0.0 to 1.0
  };
  status: 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED';
}

export interface SimulationResult {
  simulationId: string;
  injectedEvents: number;
  detectedEvents: number;
  precision: number;
  recall: number;
  f1Score: number;
  falsePositiveRate: number;
  latencyMs: number;
}

// Evaluation Models
export interface EvaluationResult {
  modelId: string;
  modelName: string;
  metrics: {
    precision: number;
    recall: number;
    f1Score: number;
    prAuc: number;
    rocAuc: number;
    falsePositiveRate: number;
  };
  timestamp: string;
}
