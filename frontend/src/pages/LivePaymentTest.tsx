import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Lock,
  Layers,
  Send,
  Sliders,
  DollarSign,
  TrendingUp,
  XCircle
} from 'lucide-react';
import { razorpayPaymentService, type RazorpayPaymentItem } from '../services/RazorpayPaymentService';
import { settingsService } from '../services/SettingsService';
import { useEnvironment } from '../context/EnvironmentContext';
import { cn } from '../lib/utils';

// Load Razorpay Checkout Script dynamically
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).Razorpay) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const DEMO_PRODUCTS = [
  { id: 'prod_1', name: 'Titanium Gaming Laptop X', category: 'Electronics', price: 45900, icon: '💻' },
  { id: 'prod_2', name: 'Ultra HD Smartphone 5G', category: 'Mobiles', price: 24999, icon: '📱' },
  { id: 'prod_3', name: 'Sony Wireless ANC Headphones', category: 'Audio', price: 12500, icon: '🎧' },
  { id: 'prod_4', name: 'Noise ColorFit Smartwatch 3', category: 'Wearables', price: 3499, icon: '⌚' },
  { id: 'prod_5', name: 'E-Commerce Fast Fashion Bundle', category: 'Apparel', price: 1899, icon: '👕' },
];

export const LivePaymentTest: React.FC = () => {
  const navigate = useNavigate();
  const { isLive } = useEnvironment();
  const [activeTab, setActiveTab] = useState<'checkout' | 'inject'>('checkout');

  // Checkout state
  const [selectedProduct, setSelectedProduct] = useState(DEMO_PRODUCTS[0]);
  const [customAmount, setCustomAmount] = useState<number>(45900);
  const [customerName, setCustomerName] = useState('Kaaysha Rao');
  const [customerEmail, setCustomerEmail] = useState('kaaysha.rao@gmail.com');
  const [customerPhone, setCustomerPhone] = useState('+91 98968 17707');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastPaymentResult, setLastPaymentResult] = useState<RazorpayPaymentItem | null>(null);
  const [razorpayKeyId, setRazorpayKeyId] = useState('rzp_test_TWpQWcihNk3rD9');

  // Injector state
  const [injectAmount, setInjectAmount] = useState<number>(54000);
  const [injectMethod, setInjectMethod] = useState<'card' | 'upi' | 'netbanking' | 'wallet'>('card');
  const [injectStatus, setInjectStatus] = useState<'captured' | 'failed' | 'authorized'>('captured');
  const [injectCardType, setInjectCardType] = useState('Visa •••• 1007');
  const [injectDescription, setInjectDescription] = useState('Order for Enterprise Hardware');
  const [recentPayments, setRecentPayments] = useState<RazorpayPaymentItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    loadRazorpayScript();
    loadPayments();

    // Fetch key ID from settings if available
    settingsService.getKeyStatus().then(status => {
      if (status.razorpay_configured && !status.razorpay_key_id_masked.includes('demo')) {
        // use live configured key if present
      }
    }).catch(() => {});

    // Listen for cross-page payment events
    const handleNewPayment = () => {
      loadPayments();
    };
    window.addEventListener('kryptic_payment_created', handleNewPayment);
    return () => window.removeEventListener('kryptic_payment_created', handleNewPayment);
  }, []);

  const loadPayments = async () => {
    try {
      const list = await razorpayPaymentService.fetchLivePayments(15, isLive);
      setRecentPayments(list.slice(0, 8));
    } catch (e) {
      console.warn(e);
    }
  };

  // Launch Authentic Razorpay Standard Checkout
  const handleLaunchRazorpay = async () => {
    setIsProcessing(true);
    const loaded = await loadRazorpayScript();
    if (!loaded || !(window as any).Razorpay) {
      alert('Razorpay Checkout SDK failed to load. Please check internet connection.');
      setIsProcessing(false);
      return;
    }

    const amountInPaise = Math.round(Number(customAmount) * 100);

    const options = {
      key: razorpayKeyId || 'rzp_test_TWpQWcihNk3rD9',
      amount: amountInPaise,
      currency: 'INR',
      name: 'Kryptic Merchant Store',
      description: `${selectedProduct.name} - Test Payment`,
      image: '/logo.png',
      prefill: {
        name: customerName,
        email: customerEmail,
        contact: customerPhone
      },
      theme: {
        color: '#2563EB'
      },
      handler: function (response: any) {
        setIsProcessing(false);
        const paymentId = response.razorpay_payment_id || `pay_${Math.random().toString(36).substring(2, 11)}`;

        const recorded = razorpayPaymentService.recordPayment({
          id: paymentId,
          amount: Number(customAmount),
          currency: 'INR',
          status: 'captured',
          method: 'card',
          description: `${selectedProduct.name}`,
          email: customerEmail,
          contact: customerPhone,
          card_network: 'Visa',
          card_last4: '1007'
        });

        setLastPaymentResult(recorded);
        loadPayments();
        showToast(`Payment ${paymentId} captured & evaluated by AI risk pipeline!`);
      },
      modal: {
        ondismiss: function () {
          setIsProcessing(false);
          showToast('Payment modal dismissed');
        }
      }
    };

    try {
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        setIsProcessing(false);
        const err = resp.error || {};
        const recorded = razorpayPaymentService.recordPayment({
          id: err.metadata?.payment_id || `pay_fail_${Math.random().toString(36).substring(2, 9)}`,
          amount: Number(customAmount),
          currency: 'INR',
          status: 'failed',
          method: 'card',
          description: `${selectedProduct.name} (Failed Attempt)`,
          email: customerEmail,
          contact: customerPhone,
          error_code: err.code || 'PAYMENT_FAILED',
          error_description: err.description || 'Customer payment failed or card was declined.'
        });
        setLastPaymentResult(recorded);
        loadPayments();
        showToast(`Payment failed & logged into threat radar: ${err.description || 'Declined'}`);
      });
      rzp.open();
    } catch (e: any) {
      setIsProcessing(false);
      alert(`Razorpay launch error: ${e.message}`);
    }
  };

  // Direct Injection Handler
  const handleInjectPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const pid = `pay_inj_${Math.random().toString(36).substring(2, 10)}`;
    const recorded = razorpayPaymentService.recordPayment({
      id: pid,
      amount: Number(injectAmount),
      currency: 'INR',
      status: injectStatus,
      method: injectMethod,
      description: injectDescription,
      email: customerEmail,
      contact: customerPhone,
      card_network: injectMethod === 'upi' ? 'UPI' : 'Visa',
      card_last4: injectMethod === 'upi' ? 'upi' : '1007',
      error_code: injectStatus === 'failed' ? 'BAD_REQUEST_ERROR' : undefined,
      error_description: injectStatus === 'failed' ? 'High risk velocity restriction triggered' : undefined
    });

    setLastPaymentResult(recorded);
    loadPayments();
    showToast(`Injected ₹${Number(injectAmount).toLocaleString('en-IN')} payment (${pid}) into live pipeline!`);
  };

  return (
    <div className="w-full max-w-none space-y-6 pb-12 font-sans px-0 text-slate-800">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-8 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-3">
          <Zap className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── Top Command Header ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
                <span>Live Payment Terminal &amp; Razorpay Test Store</span>
              </h1>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Execute live Razorpay test payments or inject synthetic telemetry. All transactions reflect instantly in Payment Intelligence and AI threat radar.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/payments')}
            className="px-3.5 py-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 text-xs font-bold rounded-xl shadow-2xs flex items-center gap-2 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <span>View in Payment Intelligence</span>
            <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* ─── Navigation Subtabs ─── */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('checkout')}
          className={cn(
            "px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2",
            activeTab === 'checkout'
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "text-slate-600 hover:bg-slate-100"
          )}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Razorpay Standard Checkout Modal</span>
        </button>

        <button
          onClick={() => setActiveTab('inject')}
          className={cn(
            "px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2",
            activeTab === 'inject'
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "text-slate-600 hover:bg-slate-100"
          )}
        >
          <Zap className="w-4 h-4" />
          <span>Direct Payment Injector &amp; Simulator</span>
        </button>
      </div>

      {/* ─── Main Content Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {activeTab === 'checkout' ? (
            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-gray-900">Select Test Item or Custom Amount</h3>
                <p className="text-xs text-gray-500 mt-0.5">Choose a catalog item to test 3DS authorization, card liabilities, and dispute telemetry.</p>
              </div>

              {/* Product Catalog Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DEMO_PRODUCTS.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => {
                      setSelectedProduct(prod);
                      setCustomAmount(prod.price);
                    }}
                    className={cn(
                      "p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between",
                      selectedProduct.id === prod.id
                        ? "border-blue-600 bg-blue-50/40 ring-1 ring-blue-500/30"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{prod.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-gray-900 leading-snug">{prod.name}</div>
                        <div className="text-[11px] text-gray-500">{prod.category}</div>
                      </div>
                    </div>
                    <div className="text-xs font-black text-gray-900 font-mono">
                      ₹{prod.price.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Amount & Customer details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Checkout Amount (INR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₹</span>
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Customer Email
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Customer Phone
                  </label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Pay Button */}
              <button
                onClick={handleLaunchRazorpay}
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Launching Razorpay Modal…</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pay ₹{Number(customAmount).toLocaleString('en-IN')} via Razorpay Checkout</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <form onSubmit={handleInjectPayment} className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-6 space-y-5">
              <div>
                <h3 className="text-base font-bold text-gray-900">Direct Payment Injector</h3>
                <p className="text-xs text-gray-500 mt-0.5">Simulate instant captured or failed payment streams directly into the AI pipeline without modal.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Amount (INR)
                  </label>
                  <input
                    type="number"
                    value={injectAmount}
                    onChange={(e) => setInjectAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Payment Method
                  </label>
                  <select
                    value={injectMethod}
                    onChange={(e) => setInjectMethod(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="card">Credit / Debit Card (Visa)</option>
                    <option value="upi">UPI / Instant QR</option>
                    <option value="netbanking">Net Banking Portal</option>
                    <option value="wallet">Digital Wallet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Simulated Status
                  </label>
                  <select
                    value={injectStatus}
                    onChange={(e) => setInjectStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="captured">Captured (Success / 3DS Verified)</option>
                    <option value="failed">Failed (Declined / Blocked by Policy)</option>
                    <option value="authorized">Authorized (Pre-auth Hold)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Order Description
                  </label>
                  <input
                    type="text"
                    value={injectDescription}
                    onChange={(e) => setInjectDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4 text-blue-400" />
                <span>Inject Payment into Threat Engine</span>
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Live Receipt & Recent Transactions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Latest Payment Receipt */}
          {lastPaymentResult ? (
            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Payment Processed</h4>
                    <span className="text-[10px] font-mono text-gray-400">{lastPaymentResult.id}</span>
                  </div>
                </div>
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-[11px] font-bold",
                  lastPaymentResult.status === 'captured' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                )}>
                  {lastPaymentResult.status.toUpperCase()}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Amount</span>
                  <span className="font-bold text-gray-900 font-mono">₹{lastPaymentResult.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Customer</span>
                  <span className="font-medium text-gray-800">{lastPaymentResult.email}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>AI Risk Score</span>
                  <span className={cn(
                    "font-bold font-mono",
                    lastPaymentResult.risk_score > 60 ? 'text-rose-600' : lastPaymentResult.risk_score > 30 ? 'text-amber-600' : 'text-emerald-600'
                  )}>
                    {lastPaymentResult.risk_score}/100 ({lastPaymentResult.risk_level})
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Method</span>
                  <span className="font-medium text-gray-800">{lastPaymentResult.card_network} (•••• {lastPaymentResult.card_last4 || '1007'})</span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] text-gray-500">Visible across all dashboard tabs</span>
                <button
                  onClick={() => navigate('/payments')}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Intelligence</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-2xs border border-slate-200 text-blue-600 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-bold text-slate-800">Ready for Live Testing</h4>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Launch the Razorpay checkout or submit a direct test injection to inspect live transaction flow.
              </p>
            </div>
          )}

          {/* Recent Live Transactions */}
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Recent Transactions</h4>
              <button onClick={loadPayments} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {recentPayments.map((p) => {
                const dateObj = new Date(p.created_at);
                const timeStr = isNaN(dateObj.getTime()) ? 'Just now' : dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
                return (
                  <div key={p.id} className="p-2.5 rounded-xl bg-gray-50/70 border border-gray-100 flex items-center justify-between text-xs hover:bg-gray-50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-600">{p.id}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{timeStr}</span>
                      </div>
                      <div className="text-[11px] text-gray-500 truncate max-w-[180px]">{p.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-gray-900">₹{p.amount.toLocaleString('en-IN')}</div>
                      <span className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded",
                        p.status === 'captured' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      )}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
