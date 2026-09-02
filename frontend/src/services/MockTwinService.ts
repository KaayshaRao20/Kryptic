import type { TwinTopology } from '../types';

export interface TwinService {
  getTopology(): Promise<TwinTopology>;
  // updateNodeStatus, etc. will go here eventually
}

export class MockTwinService implements TwinService {
  async getTopology(): Promise<TwinTopology> {
    // Return a realistic looking default payment topology
    return {
      id: 'default-topology',
      version: '1.0.0',
      nodes: [
        { id: 'entry', name: 'ENTRY GATEWAY', type: 'ENTRY', status: 'HEALTHY', metrics: { tps: 12400, riskScore: 1.8 } },
        { id: 'auth', name: 'AUTH SERVICE', type: 'AUTH', status: 'HEALTHY', metrics: { tps: 11700, riskScore: 2.1 } },
        { id: 'risk', name: 'RISK ENGINE', type: 'RISK', status: 'ANOMALOUS', metrics: { tps: 11200, riskScore: 87.6 } },
        { id: 'router', name: 'PAYMENT ROUTER', type: 'ROUTER', status: 'PROCESSING', metrics: { tps: 10800, riskScore: 6.3 } },
        { id: 'processor', name: 'PROCESSING SVC', type: 'PROCESSOR', status: 'HEALTHY', metrics: { tps: 10100, riskScore: 3.2 } },
        { id: 'settlement', name: 'SETTLEMENT SVC', type: 'SETTLEMENT', status: 'HEALTHY', metrics: { tps: 9700, riskScore: 1.6 } }
      ],
      edges: [
        { id: 'e1', source: 'entry', target: 'auth', status: 'ACTIVE' },
        { id: 'e2', source: 'auth', target: 'risk', status: 'ACTIVE' },
        { id: 'e3', source: 'risk', target: 'router', status: 'WARNING' },
        { id: 'e4', source: 'router', target: 'processor', status: 'ACTIVE' },
        { id: 'e5', source: 'processor', target: 'settlement', status: 'ACTIVE' }
      ]
    };
  }
}
