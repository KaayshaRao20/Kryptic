import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  ShieldCheck,
  Zap,
  MapPin,
  IndianRupee,
  ShoppingBag,
  ArrowRight,
  RefreshCw,
  Sliders,
  Send,
  Sparkles
} from 'lucide-react';
import { returnRiskService, type OrderScoreResult, type RTOMetrics } from '../services/ReturnRiskService';
import { cn } from '../lib/utils';

export const ReturnRiskScorer: React.FC = () => {
  const [metrics, setMetrics] = useState<RTOMetrics>({
    total_orders_evaluated: 1240,
    high_risk_rto_count: 86,
    cod_share_pct: 64.2,
    estimated_rto_losses_prevented_inr: 48920.00,
    rto_reduction_rate_pct: 42.8
  });
  const [recentOrders, setRecentOrders] = useState<OrderScoreResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [activeResult, setActiveResult] = useState<OrderScoreResult | null>(null);

  // Form state
  const [orderId, setOrderId] = useState(`ORD_IN_${Math.floor(10000 + Math.random() * 90000)}`);
  const [customerName, setCustomerName] = useState('Rohan Deshmukh');
  const [phone, setPhone] = useState('+91 98201 44821');
  const [email, setEmail] = useState('rohan.deshmukh@gmail.com');
  const [pinCode, setPinCode] = useState('400050');
  const [city, setCity] = useState('Mumbai');
  const [state, setState] = useState('Maharashtra');
  const [productCategory, setProductCategory] = useState('Apparel & Fast Fashion');
  const [orderValue, setOrderValue] = useState<number>(3499);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI' | 'Card' | 'EMI'>('COD');
  const [historicalReturnRate, setHistoricalReturnRate] = useState<number>(0.65);
  const [accountAgeDays, setAccountAgeDays] = useState<number>(14);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, orders] = await Promise.all([
        returnRiskService.fetchMetrics(),
        returnRiskService.fetchRecentOrders()
      ]);
      setMetrics(m);
      setRecentOrders(orders);
      if (orders.length > 0 && !activeResult) {
        setActiveResult(orders[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setEvaluating(true);
    try {
      const res = await returnRiskService.scoreOrder({
        order_id: orderId,
        customer_name: customerName,
        phone,
        email,
        pin_code: pinCode,
        city,
        state,
        product_category: productCategory,
        order_value: Number(orderValue),
        payment_method: paymentMethod,
        historical_return_rate: Number(historicalReturnRate),
        account_age_days: Number(accountAgeDays)
      });
      setActiveResult(res);
      setRecentOrders(prev => [res, ...prev]);
      // Update metrics
      setMetrics(prev => ({
        ...prev,
        total_orders_evaluated: prev.total_orders_evaluated + 1,
        estimated_rto_losses_prevented_inr: prev.estimated_rto_losses_prevented_inr + (res.expected_rto_cost_inr || 0)
      }));
    } catch (err: any) {
      alert(`Scoring failed: ${err.message}`);
    } finally {
      setEvaluating(false);
    }
  };

  const loadPreset = (type: 'high_cod' | 'safe_upi' | 'serial_returner') => {
    setOrderId(`ORD_IN_${Math.floor(10000 + Math.random() * 90000)}`);
    if (type === 'high_cod') {
      setCustomerName('Vikram Malhotra');
      setPhone('+91 99112 44910');
      setEmail('vikram.m92@gmail.com');
      setPinCode('110092');
      setCity('Delhi');
      setOrderValue(6999);
      setPaymentMethod('COD');
      setHistoricalReturnRate(0.75);
      setAccountAgeDays(4);
    } else if (type === 'safe_upi') {
      setCustomerName('Sneha Reddy');
      setPhone('+91 97401 22910');
      setEmail('sneha.reddy@outlook.com');
      setPinCode('560100');
      setCity('Bengaluru');
      setOrderValue(2499);
      setPaymentMethod('UPI');
      setHistoricalReturnRate(0.04);
      setAccountAgeDays(380);
    } else {
      setCustomerName('Kunal Singhania');
      setPhone('+91 98888 12345');
      setEmail('temp_user_kunal@yahoo.com');
      setPinCode('800001');
      setCity('Patna');
      setOrderValue(12900);
      setPaymentMethod('COD');
      setHistoricalReturnRate(0.90);
      setAccountAgeDays(1);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ─── Header ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest">
            <RotateCcw className="w-4 h-4" />
            RETURN REDUCTION ENGINE • REAL-TIME RTO INTERCEPTION
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Return & RTO Risk Scorer
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Predicts and mitigates delivery refusals, wardrobing fraud, and Cash-on-Delivery (COD) loss before shipping.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 mr-1">Quick Presets:</span>
          <button
            onClick={() => loadPreset('high_cod')}
            className="px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-[11px] font-bold text-rose-700 hover:bg-rose-100 cursor-pointer"
          >
            High COD Risk
          </button>
          <button
            onClick={() => loadPreset('safe_upi')}
            className="px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 cursor-pointer"
          >
            Prepaid Safe
          </button>
          <button
            onClick={() => loadPreset('serial_returner')}
            className="px-2.5 py-1.5 rounded-lg border border-purple-200 bg-purple-50 text-[11px] font-bold text-purple-700 hover:bg-purple-100 cursor-pointer"
          >
            Serial Abuse
          </button>
        </div>
      </div>

      {/* ─── Metric Cards ─── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Estimated RTO Loss Saved</span>
          <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">
            ₹{(metrics?.estimated_rto_losses_prevented_inr ?? 48920).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-500 mt-1">Courier forward & reverse freight saved</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">RTO Reduction Rate</span>
          <div className="text-2xl font-black text-blue-600 mt-1 flex items-center justify-between">
            <span>{metrics?.rto_reduction_rate_pct ?? 42.8}%</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">AI Shield</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Via automated COD-to-UPI incentives</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">COD Share in Orders</span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {metrics?.cod_share_pct ?? 64.2}%
          </div>
          <p className="text-xs text-slate-500 mt-1">Baseline high-friction payment rail</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">High Risk RTO Flags</span>
          <div className="text-2xl font-black text-rose-600 mt-1">
            {metrics?.high_risk_rto_count ?? 86} Orders
          </div>
          <p className="text-xs text-slate-500 mt-1">Intercepted before warehouse dispatch</p>
        </div>
      </div>

      {/* ─── Two-Column Interactive Workspace ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Incoming Order Parameters */}
        <div className="lg:col-span-6 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-blue-600" />
              Order & Customer Telemetry
            </h2>
            <span className="text-xs font-mono font-bold text-slate-400">{orderId}</span>
          </div>

          <form onSubmit={handleScoreOrder} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Delivery PIN Code</label>
                <input
                  type="text"
                  value={pinCode}
                  onChange={e => setPinCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Order Value (INR)</label>
                <input
                  type="number"
                  value={orderValue}
                  onChange={e => setOrderValue(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono font-bold"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Payment Rail</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                >
                  <option value="COD">Cash on Delivery (COD)</option>
                  <option value="UPI">Prepaid UPI (Razorpay)</option>
                  <option value="Card">Debit / Credit Card</option>
                  <option value="EMI">Cardless EMI / PayLater</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Product Category</label>
                <select
                  value={productCategory}
                  onChange={e => setProductCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Apparel & Fast Fashion">Apparel & Fast Fashion</option>
                  <option value="Consumer Electronics">Consumer Electronics</option>
                  <option value="Jewellery & Watches">Jewellery & Luxury Watches</option>
                  <option value="Footwear & Sneakers">Footwear & Sneakers</option>
                  <option value="Beauty & Skincare">Beauty & Skincare</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-bold text-slate-700">Past Customer Return Rate:</span>
                  <span className="font-bold text-blue-600">{(historicalReturnRate * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={historicalReturnRate}
                  onChange={e => setHistoricalReturnRate(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-bold text-slate-700">Account Age:</span>
                  <span className="font-bold text-blue-600">{accountAgeDays} Days</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="365"
                  value={accountAgeDays}
                  onChange={e => setAccountAgeDays(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={evaluating}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Zap className={cn("w-4 h-4", evaluating && "animate-spin")} />
                {evaluating ? 'Evaluating Order Risk...' : 'Score Order for Return & RTO Risk'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Card: Live Risk Score Output & Recommended Action */}
        <div className="lg:col-span-6 space-y-4">
          {activeResult ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Risk Assessment Result</span>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">{activeResult.order_id}</h3>
                </div>
                <span className={cn(
                  "text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider border",
                  activeResult.risk_tier === 'CRITICAL' && "bg-rose-50 text-rose-700 border-rose-200",
                  activeResult.risk_tier === 'HIGH' && "bg-amber-50 text-amber-700 border-amber-200",
                  activeResult.risk_tier === 'MEDIUM' && "bg-sky-50 text-sky-700 border-sky-200",
                  activeResult.risk_tier === 'LOW' && "bg-emerald-50 text-emerald-700 border-emerald-200"
                )}>
                  {activeResult.risk_tier} RISK
                </span>
              </div>

              {/* Meter Card */}
              <div className="bg-slate-50 text-slate-900 rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">RTO Probability Score</span>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Loss Exposure: ₹{(activeResult?.expected_rto_cost_inr ?? 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-900 font-mono">{activeResult.risk_score}</span>
                  <span className="text-sm text-slate-400">/ 100</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-2.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      activeResult.risk_score > 75 ? "bg-rose-500" : activeResult.risk_score > 50 ? "bg-amber-500" : "bg-emerald-500"
                    )}
                    style={{ width: `${activeResult.risk_score}%` }}
                  />
                </div>
              </div>

              {/* Recommended Action Box */}
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/60 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  Prescribed Mitigation Action: <span className="font-mono underline">{activeResult.recommended_action}</span>
                </div>
                <p className="text-xs text-blue-800">
                  {activeResult.action_description}
                </p>
              </div>

              {/* Contributing Risk Factors */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Identified Risk Signals</span>
                {(activeResult?.signals || []).map((sig, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-slate-800">{sig?.signal ? sig.signal.replace(/_/g, ' ') : 'Risk Signal'}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{sig?.description || 'Signal verified'}</div>
                    </div>
                    <span className={cn(
                      "font-mono font-bold text-xs shrink-0 px-2 py-0.5 rounded",
                      (sig?.impact || '').startsWith('+') ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                    )}>
                      {sig?.impact || '+0'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-2xs">
              <RotateCcw className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">Submit an order form to generate the RTO risk analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
