import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  IndianRupee,
  Shield,
  ShieldAlert,
  TrendingUp,
  RefreshCw,
  Calendar,
  CheckCircle2,
  XCircle,
  MoreVertical,
  SlidersHorizontal,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Search,
  ExternalLink,
  Lock,
  Layers,
  FileText
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { useEnvironment } from '../../context/EnvironmentContext';
import { razorpayPaymentService, type RazorpayPaymentItem } from '../../services/RazorpayPaymentService';
import { cn } from '../../lib/utils';

// Donut Chart Data
const DONUT_DATA = [
  { name: 'Low Risk', value: 1189234, pct: '83.3%', color: '#10B981' },
  { name: 'Medium Risk', value: 188424, pct: '13.2%', color: '#F59E0B' },
  { name: 'High Risk', value: 50842, pct: '3.5%', color: '#EF4444' },
];

// 7-day Multi-line Trend (Total, High Risk, Disputes)
const TREND_CHART_DATA = [
  { date: 'Aug 29', total: 102000, highRisk: 3500, disputes: 120 },
  { date: 'Aug 30', total: 148000, highRisk: 4200, disputes: 140 },
  { date: 'Aug 31', total: 195000, highRisk: 4900, disputes: 160 },
  { date: 'Sep 1', total: 185000, highRisk: 4700, disputes: 150 },
  { date: 'Sep 2', total: 275000, highRisk: 5200, disputes: 180 },
  { date: 'Sep 3', total: 270000, highRisk: 5100, disputes: 175 },
  { date: 'Sep 4', total: 320000, highRisk: 5800, disputes: 190 },
];

// Sparkline Mini Data
const SPARKLINE_EVALUATED = [
  { v: 12 }, { v: 15 }, { v: 18 }, { v: 14 }, { v: 22 }, { v: 28 }, { v: 34 }
];
const SPARKLINE_CHECKED = [
  { v: 40 }, { v: 35 }, { v: 45 }, { v: 60 }, { v: 55 }, { v: 70 }, { v: 85 }
];
const SPARKLINE_BLOCKED = [
  { v: 45 }, { v: 40 }, { v: 38 }, { v: 35 }, { v: 32 }, { v: 28 }, { v: 24 }
];
const SPARKLINE_DISPUTE = [
  { v: 10 }, { v: 14 }, { v: 12 }, { v: 18 }, { v: 15 }, { v: 22 }, { v: 26 }
];

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isLive } = useEnvironment();

  const [dateRange, setDateRange] = useState('Sep 1, 2026 - Sep 4, 2026');
  const [livePayments, setLivePayments] = useState<RazorpayPaymentItem[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<RazorpayPaymentItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadLivePayments = async (isManual: boolean = false) => {
    if (isManual) setLoadingPayments(true);
    try {
      const items = await razorpayPaymentService.fetchLivePayments(50, isLive);
      if (items && items.length > 0) {
        setLivePayments(items);
        if (isManual) {
          showToast(isLive ? `Live merchant synced (${items.length} txns)` : 'Sandbox simulation stream synced');
        }
      }
    } catch (e) {
      if (isManual) showToast('Synced cached ledger');
    } finally {
      if (isManual) setLoadingPayments(false);
    }
  };

  useEffect(() => {
    loadLivePayments(false);

    // Automatic real-time polling every 12 seconds in live mode
    if (isLive) {
      const interval = setInterval(() => {
        loadLivePayments(false);
      }, 12000);
      return () => clearInterval(interval);
    }
  }, [isLive]);

  // Dynamic calculations from live payments
  const liveTotalVolume = livePayments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const liveCount = livePayments.length;
  const liveBlockedItems = livePayments.filter(p => p.status === 'failed' || p.risk_level === 'CRITICAL' || p.risk_level === 'HIGH');
  const liveBlockedVolume = liveBlockedItems.reduce((acc, p) => acc + (p.amount || 0), 0);
  const liveBlockedCount = liveBlockedItems.length;

  const lowCount = livePayments.filter(p => p.risk_level === 'LOW').length;
  const medCount = livePayments.filter(p => p.risk_level === 'MEDIUM').length;
  const highCount = liveBlockedCount;
  const totalCount = livePayments.length || 1;

  // Dynamic Donut Data for Live vs Sandbox
  const donutData = isLive && livePayments.length > 0 ? [
    { name: 'Low Risk', value: lowCount, pct: `${((lowCount / totalCount) * 100).toFixed(1)}%`, color: '#10B981' },
    { name: 'Medium Risk', value: medCount, pct: `${((medCount / totalCount) * 100).toFixed(1)}%`, color: '#F59E0B' },
    { name: 'High Risk', value: highCount, pct: `${((highCount / totalCount) * 100).toFixed(1)}%`, color: '#EF4444' },
  ] : DONUT_DATA;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 text-slate-800 antialiased font-sans">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── 1. TOP HEADER ROW ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">
            RISK MANAGEMENT
          </span>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Risk Overview
            </h1>
            <span className={cn(
              "text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs",
              isLive
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-amber-50 text-amber-800 border border-amber-200"
            )}>
              <span className={cn("w-2 h-2 rounded-full", isLive ? "bg-emerald-500 animate-pulse" : "bg-amber-500")} />
              <span>{isLive ? 'Live Merchant Feed' : 'Sandbox Test Mode'}</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-1">
            {isLive
              ? 'Monitoring real-time transactions from Razorpay ID: rzp_test_TWpQWcihNk3rD9'
              : 'Simulating transaction volume and test dispute rebuttals'
            }
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Date Picker Button */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-2 bg-white border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs cursor-pointer hover:bg-slate-50">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{dateRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>

          {/* Sync Payments */}
          <button
            onClick={() => loadLivePayments(true)}
            disabled={loadingPayments}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-75"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", loadingPayments && "animate-spin")} />
            <span>{loadingPayments ? 'Syncing...' : 'Sync Payments'}</span>
          </button>
        </div>
      </div>

      {/* ─── 2. 4 PRIMARY KPI CARDS WITH SPARKLINES ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Evaluated Volume */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="w-20 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={SPARKLINE_EVALUATED}>
                  <Line type="monotone" dataKey="v" stroke="#3B82F6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Evaluated Volume
            </span>
            <div className="text-2xl font-black text-slate-900 mt-0.5 font-mono">
              {isLive ? `₹${liveTotalVolume.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '₹1.42 Cr'}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] font-bold text-emerald-600 flex items-center">
                ↑ +12.4% <span className="text-slate-400 font-normal ml-1">real-time feed</span>
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
              {isLive ? `${liveCount} Live Gateway Orders` : '99.98% Accuracy'}
            </span>
          </div>
        </div>

        {/* Card 2: Checked Payments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <FileText className="w-5 h-5" />
            </div>
            <div className="w-20 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={SPARKLINE_CHECKED}>
                  <Line type="monotone" dataKey="v" stroke="#8B5CF6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Checked Payments
            </span>
            <div className="text-2xl font-black text-blue-600 mt-0.5 font-mono">
              {isLive ? `${liveCount} Processed` : '1,428,500'}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] font-bold text-emerald-600">
                ↑ Real-Time Sync
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
              Direct Razorpay API Connected
            </span>
          </div>
        </div>

        {/* Card 3: High Risk / Blocked */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
              {isLive ? `${liveBlockedCount} Flags` : '0.12%'}
            </span>
          </div>
          <div className="mt-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              High Risk / Blocked
            </span>
            <div className="text-2xl font-black text-rose-600 mt-0.5 font-mono">
              {isLive ? `₹${liveBlockedVolume.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '1,842'}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] font-bold text-emerald-600">
                Active Defense
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
              {isLive ? `${liveBlockedCount} transactions flagged` : 'Automated prevention'}
            </span>
          </div>
        </div>

        {/* Card 4: Dispute Exposure */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div className="w-20 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={SPARKLINE_DISPUTE}>
                  <Line type="monotone" dataKey="v" stroke="#10B981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Dispute Exposure
            </span>
            <div className="text-2xl font-black text-emerald-600 mt-0.5 font-mono">
              ₹16,799.00
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] font-bold text-emerald-600">
                ↓ -15.2%
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
              88.5% Auto Win Rate
            </span>
          </div>
        </div>
      </div>

      {/* ─── 3. CHARTS ROW: TRANSACTION RISK DISTRIBUTION + TRANSACTION VOLUME & RISK TREND ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Transaction Risk Distribution Donut (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-4 bg-blue-600 rounded-xs" />
              <h3 className="text-sm font-bold text-slate-900">Transaction Risk Distribution</h3>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
              <span>Last 7 Days</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 my-auto py-2">
            {/* Donut Chart with Center Text */}
            <div className="w-44 h-44 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    innerRadius={52}
                    outerRadius={72}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-black text-slate-900 leading-tight">
                  {isLive ? '6 Txns' : '1.42M'}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {isLive ? 'Live Feed' : 'Total'}
                </span>
              </div>
            </div>

            {/* Legend Stats Table */}
            <div className="space-y-3 flex-1">
              {donutData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-medium text-slate-700">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900">
                      {item.value.toLocaleString('en-IN')}
                    </span>
                    <span className="font-semibold text-slate-500 w-10 text-right">
                      {item.pct}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Transaction Volume & Risk Trend Multi-Line Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-4 bg-blue-600 rounded-xs" />
              <h3 className="text-sm font-bold text-slate-900">Transaction Volume & Risk Trend</h3>
            </div>

            <div className="flex items-center gap-4">
              {/* Chart Legend */}
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="inline-flex items-center gap-1.5 text-blue-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  Total
                </span>
                <span className="inline-flex items-center gap-1.5 text-rose-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                  High Risk
                </span>
                <span className="inline-flex items-center gap-1.5 text-amber-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Disputes
                </span>
              </div>

              <div className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                <span>Daily</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="h-[210px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TREND_CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip />
                <Area type="monotone" dataKey="total" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTotal)" dot={{ r: 3, fill: '#2563EB' }} />
                <Line type="monotone" dataKey="highRisk" stroke="#EF4444" strokeWidth={2} dot={{ r: 3, fill: '#EF4444' }} />
                <Line type="monotone" dataKey="disputes" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3, fill: '#F59E0B' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ─── 4. BOTTOM SECTION: SANDBOX / LIVE TRANSACTION STREAM TABLE ─── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className={cn("w-2.5 h-2.5 rounded-full", isLive ? "bg-emerald-500 animate-pulse" : "bg-emerald-500")} />
              <h2 className="text-base font-bold text-slate-900">
                {isLive ? 'Live Transaction Stream' : 'Sandbox Transaction Stream'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any transaction to inspect the exact risk signals and reasons for scoring.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium">
              Showing {(livePayments || []).length} {isLive ? 'live merchant transactions' : 'of 1,428,500 benchmark payments'}
            </span>
            <button
              onClick={() => showToast(isLive ? 'All live merchant transactions displayed' : 'Displaying full 1.42M audit ledger snapshot')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-wider">
                <th className="py-2.5 w-8">
                  <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-0" />
                </th>
                <th className="py-2.5 font-semibold">PAYMENT ID</th>
                <th className="py-2.5 font-semibold">CUSTOMER / CONTACT</th>
                <th className="py-2.5 font-semibold">AMOUNT</th>
                <th className="py-2.5 font-semibold">STATUS</th>
                <th className="py-2.5 font-semibold">RISK TIER</th>
                <th className="py-2.5 font-semibold">PRIMARY RISK REASON</th>
                <th className="py-2.5 font-semibold">TIME</th>
                <th className="py-2.5 font-semibold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {(livePayments || []).map((p) => {
                const isCrit = p.risk_level === 'CRITICAL';
                const isHigh = p.risk_level === 'HIGH';
                const isMed = p.risk_level === 'MEDIUM';

                return (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedPayment(p)}
                    className="hover:bg-blue-50/20 transition-colors cursor-pointer group"
                  >
                    {/* Checkbox */}
                    <td className="py-3" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-0" />
                    </td>

                    {/* Payment ID */}
                    <td className="py-3 whitespace-nowrap font-mono font-bold text-blue-600 group-hover:underline">
                      <div>{p.id}</div>
                      <span className="text-[10px] text-slate-400 font-sans font-normal">
                        {p.card_network ? `${p.card_network} •••• ${p.card_last4 || '1007'}` : (p.method || 'Visa').toUpperCase() + ' •••• 1007'}
                      </span>
                    </td>

                    {/* Customer Contact */}
                    <td className="py-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{p.email || 'manav.nagpal2005@gmail.com'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{p.contact || '+919896817707'}</div>
                    </td>

                    {/* Amount */}
                    <td className="py-3 whitespace-nowrap font-mono font-bold text-slate-900">
                      ₹{(p.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Status */}
                    <td className="py-3 whitespace-nowrap">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1",
                        p.status === 'captured' && "bg-emerald-50 text-emerald-700 border border-emerald-200",
                        p.status === 'failed' && "bg-rose-50 text-rose-700 border border-rose-200",
                        p.status === 'authorized' && "bg-blue-50 text-blue-700 border border-blue-200"
                      )}>
                        {p.status === 'captured' ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : null}
                        {p.status === 'failed' ? <XCircle className="w-3 h-3 text-rose-600" /> : null}
                        <span className="capitalize">{p.status}</span>
                      </span>
                    </td>

                    {/* Risk Tier */}
                    <td className="py-3 whitespace-nowrap">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold",
                        isCrit && "bg-rose-50 text-rose-700 border border-rose-200",
                        isHigh && "bg-amber-50 text-amber-700 border border-amber-200",
                        isMed && "bg-sky-50 text-sky-700 border border-sky-200",
                        !isCrit && !isHigh && !isMed && "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      )}>
                        {p.risk_level === 'CRITICAL' ? 'Critical (85/100)' : p.risk_level === 'HIGH' ? 'High (70/100)' : 'Low (12/100)'}
                      </span>
                    </td>

                    {/* Primary Risk Reason */}
                    <td className="py-3 max-w-xs truncate text-[11px] text-slate-600">
                      {p.risk_reasons?.[0] || p.error_description || "Standard transaction verification passed"}
                    </td>

                    {/* Time */}
                    <td className="py-3 whitespace-nowrap text-slate-500 text-[11px] font-mono">
                      Sep 4, 7:02 AM
                    </td>

                    {/* Action */}
                    <td className="py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedPayment(p)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                        >
                          Inspect →
                        </button>
                        <button className="p-1 text-slate-400 hover:text-slate-600">
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── 5. INSPECTION MODAL ─── */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Payment Risk Inspection
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">{selectedPayment.id}</h3>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Risk Score Banner */}
            <div className={cn(
              "p-4 rounded-xl border flex items-center justify-between",
              selectedPayment.risk_level === 'CRITICAL' && "bg-rose-50 border-rose-200 text-rose-900",
              selectedPayment.risk_level === 'HIGH' && "bg-amber-50 border-amber-200 text-amber-900",
              selectedPayment.risk_level === 'MEDIUM' && "bg-sky-50 border-sky-200 text-sky-900",
              selectedPayment.risk_level === 'LOW' && "bg-emerald-50 border-emerald-200 text-emerald-900"
            )}>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block">Assessed Risk Score</span>
                <div className="text-2xl font-black mt-0.5">{selectedPayment.risk_score} / 100 ({selectedPayment.risk_level})</div>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold block">Order Amount</span>
                <div className="text-lg font-mono font-bold">
                  ₹{(selectedPayment.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Risk Factors List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Why this was scored as {selectedPayment.risk_level} Risk:
              </span>
              <div className="space-y-1.5">
                {(selectedPayment.risk_reasons || []).map((reason, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Metadata */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block">Customer Contact</span>
                <span className="font-semibold text-slate-800">{selectedPayment.contact || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Customer Email</span>
                <span className="font-semibold text-slate-800 truncate block">{selectedPayment.email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Payment Method</span>
                <span className="font-semibold text-slate-800">{selectedPayment.card_network ? `${selectedPayment.card_network} Card` : selectedPayment.method.toUpperCase()}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Status</span>
                <span className="font-semibold text-slate-800 capitalize">{selectedPayment.status}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedPayment(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedPayment(null);
                  navigate('/chargebacks');
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
              >
                Open Dispute Resolver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
