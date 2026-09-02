import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  CreditCard,
  Building2,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
  ArrowRight,
  Cpu,
  RefreshCw,
  Eye,
  Sliders
} from 'lucide-react';
import { useCustomer } from '../../context/CustomerContext';
import { LiveActivityStream } from '../../components/admin/LiveActivityStream';
import { InfrastructureGrid } from '../../components/admin/InfrastructureGrid';
import { AnalyticsCharts } from '../../components/admin/AnalyticsCharts';
import { OperationsSection } from '../../components/admin/OperationsSection';
import { CriticalAlertModal, type CriticalIncident } from '../../components/admin/CriticalAlertModal';
import { cn } from '../../lib/utils';

interface TopCriticalAlert {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  score: number;
  customerId: string;
  customerName: string;
  title: string;
  gateway: string;
  amount: number;
  timeAgo: string;
  transactionId: string;
}

const RECENT_CRITICAL_ALERTS: TopCriticalAlert[] = [
  {
    id: 'ALT-1001',
    severity: 'CRITICAL',
    score: 94,
    customerId: 'CUST-001',
    customerName: 'Apex Merchant Solutions',
    title: 'Unusual Payment Spike & Velocity Anomaly',
    gateway: 'System A (Card Gateway)',
    amount: 284500,
    timeAgo: '2 minutes ago',
    transactionId: 'TXN-12345'
  },
  {
    id: 'ALT-1002',
    severity: 'CRITICAL',
    score: 88,
    customerId: 'CUST-002',
    customerName: 'Quantum Digital Retail',
    title: 'Multi-Device OTP Brute Force Burst',
    gateway: 'System B (Instant UPI)',
    amount: 98200,
    timeAgo: '4 minutes ago',
    transactionId: 'TXN-88192'
  },
  {
    id: 'ALT-1003',
    severity: 'HIGH',
    score: 79,
    customerId: 'CUST-2048',
    customerName: 'Nexus Global Logistics',
    title: 'High-Value Cashout from Zero Balance',
    gateway: 'System A (Card Gateway)',
    amount: 450000,
    timeAgo: '8 minutes ago',
    transactionId: 'TXN-90412'
  },
  {
    id: 'ALT-1004',
    severity: 'HIGH',
    score: 76,
    customerId: 'CUST-006',
    customerName: 'Global Logistics Hub',
    title: 'Cross-Border Currency Mismatch',
    gateway: 'System D (Forex Switch)',
    amount: 560000,
    timeAgo: '12 minutes ago',
    transactionId: 'TXN-41908'
  },
];

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { selectCustomer } = useCustomer();

  // Dynamic KPI state
  const [totalVolume, setTotalVolume] = useState(48.3);
  const [transactionsCount, setTransactionsCount] = useState(1.84);
  const [lastUpdated, setLastUpdated] = useState('Just now');
  const [activeCriticalModal, setActiveCriticalModal] = useState<CriticalIncident | null>(null);

  // Periodic KPI tick
  useEffect(() => {
    const interval = setInterval(() => {
      setTransactionsCount(prev => +(prev + 0.001).toFixed(3));
      setTotalVolume(prev => +(prev + 0.01).toFixed(2));
      setLastUpdated('Just now');
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleInspectCustomer = (customerId: string, transactionId?: string) => {
    selectCustomer(customerId, transactionId);
    setActiveCriticalModal(null);
  };

  const triggerTestCriticalModal = () => {
    setActiveCriticalModal({
      id: 'INC-2099',
      customerId: 'CUST-001',
      customerName: 'Apex Merchant Solutions',
      transactionId: 'TXN-12345',
      amount: 284500,
      riskScore: 94,
      gateway: 'System A (Card Gateway)',
      ruleViolated: 'Unusual Payment Velocity & High-Risk Anomaly',
      timestamp: new Date().toLocaleTimeString()
    });
  };

  return (
    <div className="flex flex-col space-y-6 pb-12">
      {/* ─── 1. TOP HEADER (Enterprise Banking SOC Theme) ─── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-black text-gray-900 tracking-tight">
              System Risk Command Center
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              PROD-CLUSTER-01
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Global monitoring across registered merchants, customers and payment infrastructure.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <div>
              <span className="font-bold text-emerald-800 block leading-tight">Risk Engine: LIVE</span>
              <span className="text-[10px] text-emerald-600 font-mono">0.503ms Latency</span>
            </div>
          </div>

          <div className="text-right hidden sm:block text-xs text-gray-400">
            <span className="block font-medium">Updated: <strong className="text-gray-700 font-semibold">{lastUpdated}</strong></span>
          </div>

          <button
            onClick={() => navigate('/admin/alerts')}
            className="px-3.5 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <span>View All Alerts (37)</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        </div>
      </div>

      {/* ─── 2. MAIN KPI CARDS (5–6 Premium Cards) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Card 1: Total Customers */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Total Customers</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-mono text-2xl font-black text-gray-900">24,532</div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+4.2% today</span>
            </div>
          </div>
        </div>

        {/* Card 2: Connected Systems */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Connected Systems</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-mono text-2xl font-black text-gray-900">12</div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>12/12 operational</span>
            </div>
          </div>
        </div>

        {/* Card 3: Transactions Today */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Transactions Today</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-mono text-2xl font-black text-gray-900">{transactionsCount}M</div>
            <div className="text-[11px] text-gray-500 font-medium mt-1">
              ₹{totalVolume}M processed
            </div>
          </div>
        </div>

        {/* Card 4: Fraud Interceptions */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Fraud Blocked</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-mono text-2xl font-black text-emerald-600">4,291</div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1">
              98.7% detection rate
            </div>
          </div>
        </div>

        {/* Card 5: Active Risk Alerts */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Active Alerts</span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-mono text-2xl font-black text-gray-900">37</div>
            <div className="flex items-center gap-1 text-[11px] text-rose-600 font-bold mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span>12 Critical Attention</span>
            </div>
          </div>
        </div>

        {/* Card 6: Current System Risk */}
        <div className="bg-white p-4 rounded-xl border border-orange-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">System Risk</span>
            <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-black text-orange-600">72</span>
              <span className="text-xs text-gray-400 font-medium">/ 100</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-orange-500 h-full rounded-full" style={{ width: '72%' }} />
              </div>
              <span className="text-[10px] font-bold text-orange-700 uppercase">ELEVATED</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 3. REAL-TIME ACTIVITY & INFRASTRUCTURE MONITORING (Dual Section) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LiveActivityStream onSelectCustomer={handleInspectCustomer} />
        <InfrastructureGrid />
      </div>

      {/* ─── 4. REAL-TIME ANALYTICS / GRAPHS (Volume, Risk Trend, Fraud, Load) ─── */}
      <AnalyticsCharts />

      {/* ─── 5. ACTIVE RISK ALERTS & AUTOMATED RISK RESPONSE (Two Columns) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column (2 spans): Top Critical Alerts Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Critical Risk Alerts Queue</h2>
                  <p className="text-[11px] text-gray-400">High-priority events requiring executive review or customer inspection</p>
                </div>
              </div>

              <button
                onClick={triggerTestCriticalModal}
                className="px-2.5 py-1 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-[11px] font-bold text-rose-700 transition-colors"
              >
                🚨 Simulate Critical Pop-Up
              </button>
            </div>

            {/* Alert List Rows */}
            <div className="divide-y divide-gray-100 mt-2">
              {RECENT_CRITICAL_ALERTS.map(alt => (
                <div
                  key={alt.id}
                  className="py-3 flex items-center justify-between flex-wrap gap-3 hover:bg-gray-50/60 rounded-lg px-2 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={cn(
                      "px-2 py-0.5 rounded font-mono font-bold text-xs uppercase shrink-0 border",
                      alt.severity === 'CRITICAL' ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-orange-50 text-orange-700 border-orange-200"
                    )}>
                      {alt.severity} {alt.score}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-600 text-xs hover:underline cursor-pointer"
                          onClick={() => handleInspectCustomer(alt.customerId, alt.transactionId)}
                        >
                          {alt.customerId}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs font-semibold text-gray-900 truncate">
                          {alt.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {alt.gateway} · <strong className="font-mono text-gray-700">₹{alt.amount.toLocaleString()}</strong> · {alt.timeAgo}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleInspectCustomer(alt.customerId, alt.transactionId)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-xs flex items-center gap-1 transition-all shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>INSPECT CUSTOMER →</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Showing top 4 high-severity events</span>
            <button
              onClick={() => navigate('/admin/alerts')}
              className="font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
            >
              <span>View Full Alerts Center (37 Alerts)</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Right Column (1 span): Automated Response Console (Dark Treatment for Operational Focus) */}
        <div className="bg-[#0F172A] rounded-xl border border-slate-800 text-slate-200 p-5 flex flex-col justify-between shadow-md">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Automated Response Engine
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                ACTIVE
              </span>
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-slate-400 font-medium">Latest Trigger:</span>
                  <span className="font-mono text-rose-400 font-bold">SCORE: 94 — CRITICAL</span>
                </div>
                <p className="text-xs text-white font-semibold">
                  Zero-Balance Cashout Sweep Protocol
                </p>
              </div>

              <div className="space-y-2 pt-1 text-xs">
                <div className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Transaction <strong className="font-mono text-white">TXN-12345</strong> temporarily halted</span>
                </div>
                <div className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Customer session <strong className="font-mono text-white">CUST-001</strong> flagged for 2FA</span>
                </div>
                <div className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Payment Gateway <strong className="text-white">System A</strong> isolated</span>
                </div>
                <div className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Security investigation <strong className="font-mono text-blue-400">INC-2053</strong> opened</span>
                </div>
                <div className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Executive notification dispatched to Chief Risk Officer</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Action Taken: 23:31:42</span>
            <span className="text-emerald-400">Zero Breach</span>
          </div>
        </div>
      </div>

      {/* ─── 6. REPORTS + AUDIT TRAILS + CUSTOMER SERVICES (3-Tab Operational Hub) ─── */}
      <OperationsSection onInspectCustomer={handleInspectCustomer} />

      {/* ─── 7. REAL-TIME CRITICAL ALERT POP-UP MODAL ─── */}
      <CriticalAlertModal
        isOpen={!!activeCriticalModal}
        incident={activeCriticalModal}
        onClose={() => setActiveCriticalModal(null)}
        onBlock={inc => {
          alert(`Transaction ${inc.transactionId} has been BLOCKED across all payment rails.`);
          setActiveCriticalModal(null);
        }}
        onInvestigate={inc => {
          navigate('/admin/alerts');
          setActiveCriticalModal(null);
        }}
        onInspectCustomer={handleInspectCustomer}
      />
    </div>
  );
};
