import type { Prediction, Transaction } from '../types';

export interface PredictionService {
  analyzeTransaction(transaction: Transaction): Promise<Prediction>;
}

export class MockPredictionService implements PredictionService {
  async analyzeTransaction(transaction: Transaction): Promise<Prediction> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simulated heuristics for demo sensitivity testing
    const amount = transaction.amount;
    const velocity = transaction.velocity || 1; // Assuming we add this to Transaction type
    
    let probability = 0.05; // Base probability
    
    // Simple rules
    if (amount > 10000) probability += 0.4;
    else if (amount > 5000) probability += 0.2;
    
    if (velocity > 10) probability += 0.3;
    else if (velocity > 5) probability += 0.15;

    if (transaction.type === 'crypto') probability += 0.2;
    
    // Cap probability
    probability = Math.min(Math.max(probability, 0.01), 0.99);

    let classification: Prediction['classification'] = 'LOW_RISK';
    if (probability > 0.85) classification = 'CRITICAL';
    else if (probability > 0.6) classification = 'HIGH_RISK';
    else if (probability > 0.3) classification = 'MEDIUM_RISK';
    
    return {
      id: `pred-${Math.random().toString(36).substring(7)}`,
      transactionId: transaction.id,
      probability,
      classification,
      timestamp: new Date().toISOString()
    };
  }
}
