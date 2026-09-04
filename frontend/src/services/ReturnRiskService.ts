// ============================================================
//  ReturnRiskService.ts
//  E-Commerce Return & RTO Risk Scoring API client
// ============================================================

const API_BASE = 'http://localhost:8000/api/v1';

export interface OrderScorePayload {
  order_id: string;
  customer_name: string;
  phone: string;
  email: string;
  pin_code: string;
  city: string;
  state: string;
  product_category: string;
  order_value: number;
  payment_method: string;
  historical_return_rate: number;
  account_age_days: number;
}

export interface RiskSignal {
  signal: string;
  impact: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
}

export interface OrderScoreResult {
  order_id: string;
  customer_name: string;
  phone: string;
  email: string;
  pin_code: string;
  city: string;
  state: string;
  product_category: string;
  order_value: number;
  payment_method: string;
  historical_return_rate: number;
  account_age_days: number;
  risk_score: number;
  risk_tier: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  rto_probability_pct: number;
  expected_rto_cost_inr: number;
  recommended_action: string;
  action_description: string;
  signals: RiskSignal[];
  evaluated_at: string;
}

export interface RTOMetrics {
  total_orders_evaluated: number;
  high_risk_rto_count: number;
  cod_share_pct: number;
  estimated_rto_losses_prevented_inr: number;
  rto_reduction_rate_pct: number;
}

class ReturnRiskService {
  async scoreOrder(payload: OrderScorePayload): Promise<OrderScoreResult> {
    try {
      const res = await fetch(`${API_BASE}/returns/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend offline, using fallback scorer:', e);
    }

    // Fallback heuristic if backend is offline
    const isCod = payload.payment_method.toUpperCase() === 'COD';
    let score = isCod ? 65 : 18;
    if (payload.historical_return_rate > 0.4) score += 25;
    if (payload.order_value > 5000 && isCod) score += 10;
    score = Math.min(96, Math.max(8, score));
    const tier = score >= 75 ? 'CRITICAL' : score >= 55 ? 'HIGH' : score >= 30 ? 'MEDIUM' : 'LOW';

    return {
      ...payload,
      risk_score: score,
      risk_tier: tier,
      rto_probability_pct: round(score * 0.92, 1),
      expected_rto_cost_inr: isCod ? Math.round(payload.order_value * 0.22) : 0,
      recommended_action: isCod && score > 60 ? 'CONVERT_TO_UPI_DISCOUNT' : 'APPROVE_NORMAL',
      action_description: isCod && score > 60 ? 'Send WhatsApp automated INR 150 discount to convert to Prepaid UPI.' : 'Proceed with regular dispatch.',
      signals: [
        { signal: isCod ? 'COD_RISK_FACTOR' : 'PREPAID_SAFE', impact: isCod ? '+35' : '-10', severity: isCod ? 'HIGH' : 'LOW', description: isCod ? 'COD carries high delivery refusal probability' : 'Verified prepaid transaction' }
      ],
      evaluated_at: new Date().toISOString()
    };
  }

  async fetchRecentOrders(): Promise<OrderScoreResult[]> {
    try {
      const res = await fetch(`${API_BASE}/returns/recent`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend offline, using fallback recent orders');
    }
    return [
      {
        order_id: "ORD_IN_48192",
        customer_name: "Rohan Deshmukh",
        phone: "+91 98201 44821",
        email: "rohan.deshmukh@gmail.com",
        pin_code: "400050",
        city: "Mumbai",
        state: "Maharashtra",
        product_category: "Apparel & Fast Fashion",
        order_value: 3499,
        payment_method: "COD",
        historical_return_rate: 0.65,
        account_age_days: 14,
        risk_score: 82,
        risk_tier: "CRITICAL",
        rto_probability_pct: 75.4,
        expected_rto_cost_inr: 770,
        recommended_action: "CONVERT_TO_UPI_DISCOUNT",
        action_description: "Send WhatsApp automated INR 150 discount to convert to Prepaid UPI.",
        signals: [
          { signal: "SERIAL_RETURNER", impact: "+45", severity: "CRITICAL", description: "Customer account has 65% lifetime return rate" },
          { signal: "HIGH_COD_PINCODE", impact: "+25", severity: "HIGH", description: "Pin code 400050 has 28% delivery refusal rate" }
        ],
        evaluated_at: "2026-09-04T06:12:00Z"
      },
      {
        order_id: "ORD_IN_59102",
        customer_name: "Ananya Iyer",
        phone: "+91 98840 12345",
        email: "ananya.iyer@gmail.com",
        pin_code: "600028",
        city: "Chennai",
        state: "Tamil Nadu",
        product_category: "Consumer Electronics",
        order_value: 8499,
        payment_method: "UPI",
        historical_return_rate: 0.05,
        account_age_days: 280,
        risk_score: 12,
        risk_tier: "LOW",
        rto_probability_pct: 11.0,
        expected_rto_cost_inr: 0,
        recommended_action: "APPROVE_NORMAL",
        action_description: "Proceed with regular dispatch. Verified prepaid order with low return history.",
        signals: [
          { signal: "PREPAID_SAFE", impact: "-15", severity: "LOW", description: "Prepaid UPI payment confirmed" },
          { signal: "LOYAL_CUSTOMER", impact: "-20", severity: "LOW", description: "Account active for 280 days with 95% delivery success" }
        ],
        evaluated_at: "2026-09-04T06:40:00Z"
      },
      {
        order_id: "ORD_IN_91823",
        customer_name: "Vikram Malhotra",
        phone: "+91 99112 44910",
        email: "vikram.m92@gmail.com",
        pin_code: "110092",
        city: "Delhi",
        state: "Delhi",
        product_category: "Footwear & Shoes",
        order_value: 6999,
        payment_method: "COD",
        historical_return_rate: 0.75,
        account_age_days: 4,
        risk_score: 91,
        risk_tier: "CRITICAL",
        rto_probability_pct: 83.7,
        expected_rto_cost_inr: 1540,
        recommended_action: "CONVERT_TO_UPI_DISCOUNT",
        action_description: "High ticket COD from brand new account with severe delivery risk.",
        signals: [
          { signal: "NEW_ACCOUNT_COD", impact: "+35", severity: "CRITICAL", description: "Account age is only 4 days" },
          { signal: "HIGH_ORDER_VALUE_COD", impact: "+30", severity: "HIGH", description: "Order value ₹6,999 exceeds typical COD safety limit" }
        ],
        evaluated_at: "2026-09-04T07:15:00Z"
      }
    ];
  }

  async fetchMetrics(): Promise<RTOMetrics> {
    try {
      const res = await fetch(`${API_BASE}/returns/metrics`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend offline, using fallback metrics');
    }
    return {
      total_orders_evaluated: 1240,
      high_risk_rto_count: 86,
      cod_share_pct: 64.2,
      estimated_rto_losses_prevented_inr: 48920.00,
      rto_reduction_rate_pct: 42.8
    };
  }
}

function round(val: number, dec: number): number {
  return Number(val.toFixed(dec));
}

export const returnRiskService = new ReturnRiskService();
