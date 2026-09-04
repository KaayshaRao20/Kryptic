import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Zap,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Globe,
  CheckCircle2,
  Cpu,
  ChevronRight,
  CreditCard
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-600 selection:text-white antialiased">
      {/* ─── Navigation Header ─── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/95 border-b border-slate-200 px-6 lg:px-12 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="leading-tight">
              <span className="text-base font-bold tracking-tight text-slate-900 block">
                Kryptic
              </span>
              <span className="text-[11px] text-slate-500 block">
                Risk Management
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#chargebacks" className="hover:text-blue-600 transition-colors">Disputes</a>
            <a href="#returns" className="hover:text-blue-600 transition-colors">Returns & RTO</a>
            <a href="#stats" className="hover:text-blue-600 transition-colors">Performance</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Open Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ─── Hero Section ─── */}
      <section className="pt-16 pb-20 px-6 lg:px-12 bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>AI Risk Defense • Integrated with Razorpay</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Stop Losing Money to <br />
            <span className="text-blue-600">Fraud, Chargebacks & Returns.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Real-time payment risk protection for modern merchants. Automatically defend chargebacks with delivery proof, prevent fake COD returns, and screen payments in real time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Open Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/chargebacks')}
              className="w-full sm:w-auto px-5 py-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Dispute Resolver</span>
            </button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-8 max-w-3xl mx-auto">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-medium text-slate-500 uppercase block">Response Time</span>
              <div className="text-xl font-bold text-slate-900 mt-1 font-mono">0.48 ms</div>
              <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Instant Check</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-medium text-slate-500 uppercase block">Accuracy</span>
              <div className="text-xl font-bold text-slate-900 mt-1 font-mono">99.9%</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Test Verified</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-medium text-slate-500 uppercase block">Dispute Win Rate</span>
              <div className="text-xl font-bold text-emerald-600 mt-1 font-mono">88.5%</div>
              <p className="text-[11px] text-emerald-600 font-medium mt-0.5">With Delivery Proof</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-medium text-slate-500 uppercase block">Return Reduction</span>
              <div className="text-xl font-bold text-blue-600 mt-1 font-mono">42.8%</div>
              <p className="text-[11px] text-slate-500 mt-0.5">COD Conversion</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Supported Payment Methods ─── */}
      <section className="py-5 bg-slate-50 border-b border-slate-200 px-6 text-center">
        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide block mb-2">
          Works with Major Payment Methods and Couriers
        </span>
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-slate-600 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-blue-700"><Globe className="w-3.5 h-3.5" /> Razorpay</span>
          <span>UPI</span>
          <span>Visa</span>
          <span>Mastercard</span>
          <span>RuPay</span>
          <span>Blue Dart</span>
          <span>Delhivery</span>
        </div>
      </section>

      {/* ─── 4 Main Defense Tools ─── */}
      <section id="features" className="py-16 px-6 lg:px-12 max-w-7xl mx-auto space-y-10">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            How Kryptic Protects Your Store
          </h2>
          <p className="text-xs text-slate-500">
            Four defensive engines to prevent revenue loss across every step of commerce.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Dispute Resolver */}
          <div
            id="chargebacks"
            onClick={() => navigate('/chargebacks')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-xs transition-all group cursor-pointer space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Dispute & Chargebacks
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Gathers courier delivery proof, receipts, and OTP verification logs into automated evidence letters for Razorpay.
                </p>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>One-click rebuttal generation</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Delivery proof compilation</span>
                </li>
              </ul>
            </div>
            <div className="pt-2 flex items-center gap-1 text-xs font-semibold text-blue-600">
              <span>Open Tool</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: Return Risk Scorer */}
          <div
            id="returns"
            onClick={() => navigate('/returns')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-xs transition-all group cursor-pointer space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Order & Return Risk
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Flags high-risk Cash-on-Delivery orders before dispatch. Screens PIN code delivery failure rates and return frequency.
                </p>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Instant PIN code risk checks</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Prepaid conversion suggestions</span>
                </li>
              </ul>
            </div>
            <div className="pt-2 flex items-center gap-1 text-xs font-semibold text-blue-600">
              <span>Open Tool</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3: Fraud Detection */}
          <div
            onClick={() => navigate('/intelligence/detection')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-xs transition-all group cursor-pointer space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Fraud Detection
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Real-time transaction evaluation. Flags abnormal card usage, high velocity surges, and suspicious payment behavior.
                </p>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Sub-millisecond latency</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Clear decision factors</span>
                </li>
              </ul>
            </div>
            <div className="pt-2 flex items-center gap-1 text-xs font-semibold text-blue-600">
              <span>Open Tool</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 4: Simulation Lab */}
          <div
            onClick={() => navigate('/twin')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-xs transition-all group cursor-pointer space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Risk Simulation Lab
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Stress-test gateway rules against simulated fraud spikes, high velocity runs, and coordinated abuse patterns.
                </p>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Synthetic attack injection</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Topology stress telemetry</span>
                </li>
              </ul>
            </div>
            <div className="pt-2 flex items-center gap-1 text-xs font-semibold text-blue-600">
              <span>Open Tool</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Simple Footer ─── */}
      <footer className="border-t border-slate-200 py-6 px-6 text-center text-xs text-slate-500 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium text-slate-700">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>Kryptic • Enterprise Risk Platform for Razorpay Merchants</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Defense-grade fraud, dispute, and return protection
          </div>
        </div>
      </footer>
    </div>
  );
};
