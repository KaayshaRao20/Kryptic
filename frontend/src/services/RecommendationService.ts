// ============================================================
//  RecommendationService.ts
//  AI recommendation generation — contextual to prediction
// ============================================================

import type { FraudPrediction, TransactionParams } from './FraudDetectionService';

export interface AIRecommendation {
  assessment: string;
  whyRisky: string[];
  recommendedAction: string;
  actionLabel: string;
  actions: string[];
  confidence: number;
}

export interface InjectionAIRecommendation {
  summary: string;
  whatHappened: string;
  whyDetected: string;
  whereDetected: string;
  whatAffected: string;
  actions: string[];
  confidence: number;
}

export function getRecommendation(
  prediction: FraudPrediction,
  params: TransactionParams
): AIRecommendation {
  const { fraudProbability, riskLevel, riskFactors } = prediction;
  const topHigh = riskFactors.filter((f) => f.level === 'HIGH' || f.level === 'MEDIUM').slice(0, 3);

  if (riskLevel === 'CRITICAL') {
    return {
      assessment: `This transaction presents an extreme fraud risk of ${fraudProbability.toFixed(1)}%. Immediate intervention is required.`,
      whyRisky: [
        `Velocity of ${params.velocity} txns/24h far exceeds safe thresholds for account age ${params.accountAge}d`,
        `Transaction of ₹${params.amount.toLocaleString()} via ${params.paymentChannel} at ${params.timeOfDay} is highly anomalous`,
        topHigh[2]
          ? `${topHigh[2].displayName} factor classified as "${topHigh[2].value}" — a strong fraud signal`
          : 'Combination of multiple critical signals creates a high-confidence fraud indicator',
      ],
      recommendedAction: 'BLOCK',
      actionLabel: 'Block & Review',
      confidence: 94.5,
      actions: [
        'Immediately block this transaction',
        `Freeze account ${params.accountId} pending manual review`,
        'Trigger step-up KYC re-verification for this account holder',
        'Escalate to fraud operations team within 15 minutes',
      ],
    };
  }

  if (riskLevel === 'HIGH') {
    return {
      assessment: `This transaction shows significant fraud indicators with ${fraudProbability.toFixed(1)}% fraud probability. Manual review is recommended before processing.`,
      whyRisky: [
        topHigh[0]
          ? `${topHigh[0].displayName} is elevated — classified as "${topHigh[0].value}"`
          : 'Multiple overlapping risk signals detected',
        topHigh[1]
          ? `${topHigh[1].displayName} raises additional concern: "${topHigh[1].value}"`
          : 'Transaction pattern deviates significantly from account baseline',
        `Amount ₹${params.amount.toLocaleString()} through ${params.paymentChannel} at this velocity is atypical`,
      ],
      recommendedAction: 'CHALLENGE',
      actionLabel: 'Challenge & Review',
      confidence: 87.2,
      actions: [
        'Trigger 2FA / OTP challenge before processing',
        `Send a real-time alert to account holder of ${params.accountId}`,
        'Place a 24-hour monitoring flag on this account',
        'Review historical transaction patterns for anomaly drift',
      ],
    };
  }

  if (riskLevel === 'MEDIUM') {
    return {
      assessment: `This transaction shows moderate risk signals at ${fraudProbability.toFixed(1)}%. Enhanced monitoring and a soft challenge are advised.`,
      whyRisky: [
        topHigh[0]
          ? `${topHigh[0].displayName} shows slight deviation — classified as "${topHigh[0].value}"`
          : 'Minor anomalies present in transaction pattern',
        `Transaction amount ₹${params.amount.toLocaleString()} is within typical range but combination of parameters warrants attention`,
      ],
      recommendedAction: 'MONITOR',
      actionLabel: 'Monitor',
      confidence: 78.4,
      actions: [
        'Allow transaction with enhanced real-time monitoring',
        'Log event for downstream pattern analysis',
        `Set velocity alert if additional high-value transactions occur for ${params.accountId}`,
      ],
    };
  }

  // LOW risk
  return {
    assessment: `This transaction appears legitimate with only ${fraudProbability.toFixed(1)}% fraud probability. Standard processing is recommended.`,
    whyRisky: [
      `Account ${params.accountId} has a well-established history (${params.accountAge} days)`,
      `Transaction amount ₹${params.amount.toLocaleString()} aligns with historical spending patterns`,
      `Low velocity (${params.velocity} txns/24h) indicates normal, expected account usage`,
    ],
    recommendedAction: 'APPROVE',
    actionLabel: 'Approve',
    confidence: 96.8,
    actions: [
      'Approve transaction immediately',
      'No additional verification required at this risk level',
      'Continue standard real-time monitoring per policy',
    ],
  };
}

export function getInjectionRecommendation(
  scenarioKey: string,
  affectedComponent: string,
  propagatedTo: string[],
  detectionRate: number,
  riskScore: number,
  targetEntity: string,
  velocity: number
): InjectionAIRecommendation {
  const scenarioName =
    scenarioKey === 'fraud_spike' ? 'Fraud Spike'
    : scenarioKey === 'high_velocity' ? 'High Velocity'
    : scenarioKey === 'coordinated' ? 'Coordinated Activity'
    : scenarioKey === 'behavioral' ? 'Behavioral Anomaly'
    : 'Custom Scenario';

  const summaryMap: Record<string, string> = {
    fraud_spike:
      'The Risk Engine detected an abnormal transaction pattern caused by a sudden spike in high-value transactions within a short time window.',
    high_velocity:
      'High transaction velocity triggered Auth Service threshold alerts, exposing a window for credential-stuffing attack vectors.',
    coordinated:
      'Coordinated bot activity bypassed standard entry-layer rate limiting and escalated into the core risk evaluation pipeline.',
    behavioral:
      'Behavioral pattern anomalies in transaction sequencing were detected and escalated through the real-time risk evaluation pipeline.',
    custom:
      'Custom injection pattern triggered multiple fraud signals across the payment infrastructure topology.',
  };

  return {
    summary: summaryMap[scenarioKey] || summaryMap.custom,
    whatHappened: `${scenarioName} simulation generated synthetic fraud transactions. The KRYPTIC model detected ${detectionRate.toFixed(1)}% of injected events with a peak risk score of ${riskScore.toFixed(1)}/100.`,
    whyDetected: `Real-time feature computation identified ${
      scenarioKey === 'fraud_spike' ? 'sudden velocity burst anomalies'
      : scenarioKey === 'high_velocity' ? 'extreme transaction rate deviations'
      : 'coordinated behavioral patterns across entity clusters'
    } that deviated significantly from baseline statistical distributions.`,
    whereDetected: `Primary detection occurred at the ${affectedComponent}.${propagatedTo.length > 0 ? ` Risk propagated downstream to: ${propagatedTo.join(', ')}.` : ''}`,
    whatAffected: `${affectedComponent} reached ${riskScore.toFixed(1)}% risk score (ANOMALOUS). ${propagatedTo.length > 0 ? `Downstream components (${propagatedTo.join(', ')}) entered WARNING state.` : 'No downstream propagation detected.'}`,
    actions: [
      `Enable step-up verification for all transactions targeting entity ${targetEntity}`,
      `Introduce velocity limits: max ${Math.round(velocity * 0.4)} txns/min for this entity profile`,
      `Monitor entity ${targetEntity} closely for the next 24 hours post-simulation`,
      `Review and tighten risk thresholds for the ${affectedComponent} to reduce missed detections`,
    ],
    confidence: Math.round(detectionRate * 0.96),
  };
}
