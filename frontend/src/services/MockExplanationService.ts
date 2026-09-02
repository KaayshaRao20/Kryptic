import type { Explanation } from '../types';

export interface ExplanationService {
  getExplanation(predictionId: string): Promise<Explanation>;
}

export class MockExplanationService implements ExplanationService {
  async getExplanation(predictionId: string): Promise<Explanation> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));

    // For demo purposes, we will return a somewhat randomized but realistic looking explanation
    // In a real scenario, this would correspond directly to the specific prediction ID
    
    // Determine if we should mock a high risk or low risk explanation based on ID for consistency if we wanted,
    // but random is fine for a standalone demo page. Let's make it look like a high risk one by default.
    
    return {
      predictionId,
      baseValue: 0.15, // Base risk score across all transactions
      topFeatures: [
        { feature: 'Velocity Deviation (24h)', contribution: 0.42 },
        { feature: 'Device Fingerprint Match', contribution: -0.12 },
        { feature: 'Amount Anomaly Score', contribution: 0.28 },
        { feature: 'Account Age (Days)', contribution: -0.05 },
        { feature: 'IP Distance from Billing', contribution: 0.18 },
      ].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
    };
  }
}
