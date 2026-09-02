export interface RiskSignalDTO {
  name: string;
  weight: number;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface RiskPredictionDTO {
  transactionId: string;
  fraudProbability: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  modelVersion: string;
  inferenceTimeMs: number;
  signals: RiskSignalDTO[];
  actionRecommended: "APPROVE" | "REVIEW" | "CHALLENGE_2FA" | "DECLINE";
}

class RiskService {
  public evaluate(transactionData: Record<string, any>): RiskPredictionDTO {
    const amount = Number(transactionData.amount || 100);
    const isFraud = Boolean(transactionData.isFraud || amount > 2500);

    const signals: RiskSignalDTO[] = [];
    let baseScore = 0.04;

    if (isFraud) {
      baseScore = 0.88;
      signals.push({
        name: "HIGH_VELOCITY_BURST",
        weight: 0.65,
        description: "Synchronized high-frequency transaction burst detected.",
        severity: "CRITICAL"
      });
      signals.push({
        name: "ANONYMOUS_PROXY_ASN",
        weight: 0.45,
        description: "Request originated from known VPN/Tor exit gateway.",
        severity: "HIGH"
      });
    }

    const prob = Math.min(0.99, Math.max(0.01, baseScore));
    const riskLevel = prob >= 0.75 ? "CRITICAL" : prob >= 0.50 ? "HIGH" : prob >= 0.25 ? "MEDIUM" : "LOW";
    const action = riskLevel === "CRITICAL" ? "DECLINE" : riskLevel === "HIGH" ? "CHALLENGE_2FA" : riskLevel === "MEDIUM" ? "REVIEW" : "APPROVE";

    return {
      transactionId: transactionData.transactionId || `TX_${Date.now()}`,
      fraudProbability: prob,
      riskLevel,
      modelVersion: "v1.0.0-dummy-predictor",
      inferenceTimeMs: 1.25,
      signals,
      actionRecommended: action
    };
  }
}

export const riskService = new RiskService();
