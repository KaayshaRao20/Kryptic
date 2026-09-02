export interface EvaluationMetricsSummary {
  injected: number;
  detected: number;
  missed: number;
  falsePositives: number;
  precision: number;
  recall: number;
  f1: number;
  fpr: number;
  avgLatencyMs: number;
}

class MetricsService {
  public computeFromEvents(events: Array<{ isFraud: boolean; isDetected: boolean; latencyMs: number }>): EvaluationMetricsSummary {
    let injected = 0;
    let detected = 0;
    let missed = 0;
    let falsePositives = 0;
    let trueNegatives = 0;
    let totalLatency = 0;

    for (const ev of events) {
      totalLatency += ev.latencyMs;
      if (ev.isFraud && ev.isDetected) {
        detected++;
        injected++;
      } else if (ev.isFraud && !ev.isDetected) {
        missed++;
        injected++;
      } else if (!ev.isFraud && ev.isDetected) {
        falsePositives++;
      } else {
        trueNegatives++;
      }
    }

    const precision = (detected + falsePositives) > 0 ? (detected / (detected + falsePositives)) * 100 : 100;
    const recall = injected > 0 ? (detected / injected) * 100 : 100;
    const f1 = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 0;
    const fpr = (falsePositives + trueNegatives) > 0 ? (falsePositives / (falsePositives + trueNegatives)) * 100 : 0;
    const avgLatencyMs = events.length > 0 ? totalLatency / events.length : 215;

    return {
      injected,
      detected,
      missed,
      falsePositives,
      precision: Number(precision.toFixed(1)),
      recall: Number(recall.toFixed(1)),
      f1: Number(f1.toFixed(1)),
      fpr: Number(fpr.toFixed(1)),
      avgLatencyMs: Math.round(avgLatencyMs)
    };
  }
}

export const metricsService = new MetricsService();
