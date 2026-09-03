import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  IndianRupee,
  ShieldAlert,
  TrendingUp,
  Bell,
  ArrowRight,
  Layers,
  Search,
  ChevronDown,
  Activity,
  User
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useCustomer } from '../../context/CustomerContext';
import { IndiaRiskHeatmap } from '../../components/admin/IndiaRiskHeatmap';
import { cn } from '../../lib/utils';

// Hourly stacked transaction data matching the reference chart
const ACTIVITY_DATA_24H = [
  { time: '00:00', normal: 12000, highRisk: 1200, fraud: 180 },
  { time: '01:00', normal: 13500, highRisk: 1100, fraud: 150 },
  { time: '02:00', normal: 15000, highRisk: 1400, fraud: 220 },
  { time: '03:00', normal: 14000, highRisk: 1300, fraud: 190 },
  { time: '04:00', normal: 13000, highRisk: 1250, fraud: 180 },
  { time: '05:00', normal: 16000, highRisk: 1500, fraud: 230 },
  { time: '06:00', normal: 18000, highRisk: 1600, fraud: 260 },
  { time: '07:00', normal: 21000, highRisk: 1800, fraud: 290 },
  { time: '08:00', normal: 25000, highRisk: 2100, fraud: 340 },
  { time: '09:00', normal: 31000, highRisk: 2400, fraud: 380 },
  { time: '10:00', normal: 36000, highRisk: 2700, fraud: 420 },
  { time: '11:00', normal: 39000, highRisk: 2900, fraud: 460 },
  { time: '12:00', normal: 40328, highRisk: 2043, fraud: 312, highlighted: true }, // Peak annotated
  { time: '13:00', normal: 38000, highRisk: 2600, fraud: 390 },
  { time: '14:00', normal: 32000, highRisk: 2300, fraud: 350 },
  { time: '15:00', normal: 27000, highRisk: 2000, fraud: 310 },
  { time: '16:00', normal: 22000, highRisk: 1700, fraud: 270 },
  { time: '17:00', normal: 19000, highRisk: 1500, fraud: 240 },
  { time: '18:00', normal: 23000, highRisk: 1900, fraud: 290 },
  { time: '19:00', normal: 26000, highRisk: 2100, fraud: 330 },
  { time: '20:00', normal: 22000, highRisk: 1800, fraud: 270 },
  { time: '21:00', normal: 17000, highRisk: 1400, fraud: 220 },
  { time: '22:00', normal: 15000, highRisk: 1300, fraud: 200 },
  { time: '23:00', normal: 14000, highRisk: 1200, fraud: 180 },
];

// Transaction Channels Donut Data
const CHANNEL_DATA = [
  { name: 'UPI', value: 42.6, color: '#1D4ED8' },
  { name: 'Cards', value: 24.8, color: '#0284C7' },
  { name: 'Net Banking', value: 15.4, color: '#F59E0B' },
  { name: 'Wallets', value: 8.7, color: '#8B5CF6' },
  { name: 'Others', value: 8.5, color: '#94A3B8' },
];

// Fraud Detected by Layer data
const LAYER_BREAKDOWN = [
  { name: 'Entry Gateway', pct: 28 },
  { name: 'Authentication', pct: 22 },
  { name: 'Risk Engine', pct: 20 },
  { name: 'Payment Router', pct: 14 },
  { name: 'Processing', pct: 8 },
  { name: 'Authorization', pct: 5 },
  { name: 'Settlement', pct: 3 },
];

// System Health Services Data
const HEALTH_SERVICES = [
  { name: 'Payment Gateway', latency: '42ms', status: 'Healthy' },
  { name: 'Authentication Service', latency: '36ms', status: 'Healthy' },
  { name: 'Risk Engine', latency: '28ms', status: 'Healthy' },
  { name: 'Payment Router', latency: '40ms', status: 'Healthy' },
  { name: 'Database', latency: '22ms', status: 'Healthy' },
  { name: 'ML Inference', latency: '18ms', status: 'Healthy' },
];

// Recent High Risk Alerts Data (Matching Screenshot)
const RECENT_ALERTS = [
  {
    id: 'alt-1',
    time: '08:41 AM',
    customerId: 'CUST-001',
    customerName: 'Aarav Mehta',
    event: 'Unusual Payment Spike',
    amount: '₹2,84,500',
    riskLevel: 'Critical',
    status: 'Open',
    actionText: 'Investigate →',
    badgeVariant: 'critical',
  },
  {
    id: 'alt-2',
    time: '08:28 AM',
    customerId: 'CUST-027',
    customerName: 'Priya Sharma',
    event: 'Multiple OTP Failures',
    amount: '₹98,200',
    riskLevel: 'Critical',
    status: 'Open',
    actionText: 'Investigate →',
    badgeVariant: 'critical',
  },
  {
    id: 'alt-3',
    time: '08:15 AM',
    customerId: 'CUST-104',
    customerName: 'Rohan Verma',
    event: 'New Device Login',
    amount: '₹67,890',
    riskLevel: 'High',
    status: 'Open',
    actionText: 'Investigate →',
    badgeVariant: 'high',
  },
  {
    id: 'alt-4',
    time: '08:07 AM',
    customerId: 'CUST-317',
    customerName: 'Ananya Iyer',
    event: 'Velocity Anomaly',
    amount: '₹45,200',
    riskLevel: 'High',
    status: 'Open',
    actionText: 'Investigate →',
    badgeVariant: 'high',
  },
  {
    id: 'alt-5',
    time: '07:52 AM',
    customerId: 'CUST-412',
    customerName: 'Vikram Malhotra',
    event: 'Declined Txns Spike',
    amount: '₹1,12,300',
    riskLevel: 'Medium',
    status: 'Monitoring',
    actionText: 'Inspect →',
    badgeVariant: 'medium',
  },
];

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { selectCustomer } = useCustomer();

  const [timeframe, setTimeframe] = useState<'24H' | '7D' | '30D' | 'Live'>('24H');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState('Wed, 3 Sep 2026  08:43 AM');

  // Fetch optional backend stats if available
  const [stats, setStats] = useState({
    totalCustomers: '24,532',
    totalTransactions: '1,842,773',
    transactionValue: '₹ 48.32 Cr',
    fraudDetected: '4,291',
    fraudRate: '98.7%',
    activeAlerts: '37',
    criticalAlerts: '12',
    highAlerts: '15',
  });

  useEffect(() => {
    // Format live time
    const updateDate = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      };
      // Format as "Wed, 3 Sep 2026  08:43 AM"
      const str = now.toLocaleDateString('en-US', options).replace(',', '');
      setCurrentTime(str);
    };
    updateDate();
    const interval = setInterval(updateDate, 30000);
    return () => clearInterval(interval);
  }, []);

  // Sync with live backend API if available
  useEffect(() => {
    const fetchBackend = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/v1/transactions/stats/overview');
        if (res.ok) {
          const data = await res.json();
          if (data.total_transactions) {
            setStats(prev => ({
              ...prev,
              totalTransactions: data.total_transactions.toLocaleString(),
              fraudDetected: data.fraud_count ? data.fraud_count.toLocaleString() : prev.fraudDetected,
            }));
          }
        }
      } catch (err) {
        // Fallback gracefully to high-precision reference snapshot
      }
    };
    fetchBackend();
  }, []);

  const handleInvestigate = (customerId: string) => {
    selectCustomer(customerId);
  };

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto pb-10 text-slate-800 antialiased">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP NAVIGATION & HEADER BAR
         ───────────────────────────────────────────────────────────── */}
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-1">
        {/* Left: Admin Greeting */}
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span>Hello Admin</span>
            <span className="text-2xl">👋</span>
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Commanding a safer payments ecosystem
          </p>
        </div>

        {/* Center: Global Search Bar */}
        <div className="w-full xl:max-w-md">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customers, transactions, alerts..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200/90 rounded-full text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Right: Status, Time, Alerts, Profile */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200/90 rounded-full text-xs font-semibold text-gray-700 shadow-2xs shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px]">System Online</span>
          </div>

          {/* Time Badge */}
          <div className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200/90 rounded-full text-[11px] font-medium text-gray-600 shadow-2xs shrink-0">
            <span>{currentTime}</span>
          </div>

          {/* Alert Bell */}
          <button
            onClick={() => navigate('/admin/alerts')}
            className="w-8 h-8 rounded-full bg-white border border-gray-200/90 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 relative transition-all shadow-2xs shrink-0 cursor-pointer"
            title="Active Risk Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center border-2 border-white">
              12
            </span>
          </button>

          {/* Admin ID & Profile Badge */}
          <div className="flex items-center gap-2 bg-white border border-gray-200/90 rounded-full pl-1.5 pr-3 py-1 shadow-2xs hover:border-gray-300 transition-all cursor-pointer">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              AD
            </div>
            <div className="flex flex-col text-left leading-tight pr-0.5">
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-bold text-gray-400 uppercase">Admin ID</span>
                <span className="text-[11px] font-bold text-gray-900">ADM-001</span>
              </div>
              <span className="text-[10px] text-gray-500">Super Admin</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. ENTERPRISE RISK COMMAND CENTER HERO BANNER
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-white via-blue-50/25 to-blue-100/50 rounded-2xl border border-gray-200/80 p-5 lg:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        {/* Subtle Decorative Ambient Wave */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-100/40 to-transparent pointer-events-none" />

        <div className="relative z-10">
          <h2 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">
            Enterprise Risk Command Center
          </h2>
          <p className="text-xs lg:text-sm text-gray-500 mt-1">
            Real-time monitoring across all customers, merchants and payment routing layers.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          {/* Active ML Fraud Engine Chip */}
          <div className="bg-white/90 backdrop-blur-xs border border-gray-200/90 rounded-xl px-3.5 py-2 flex items-center gap-2.5 shadow-2xs">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Layers className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-gray-900 leading-tight">
                ML Fraud Engine : Active
              </span>
              <span className="text-[10px] font-medium text-gray-500 leading-tight">
                XGBoost v2.0
              </span>
            </div>
          </div>

          {/* View Live Alerts Button */}
          <button
            onClick={() => navigate('/admin/alerts')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <span>View Live Alerts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. PRIMARY KEY PERFORMANCE INDICATOR (KPI) CARDS (6 CARDS)
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Card 1: Total Customers */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs hover:border-gray-300 transition-all flex flex-col justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <User className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-gray-600">Total Customers</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-gray-900 tracking-tight">
              {stats.totalCustomers}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <span>↑ 4.2%</span>
              <span className="text-gray-400 font-normal">vs yesterday</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Transactions */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs hover:border-gray-300 transition-all flex flex-col justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CreditCard className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-gray-600">Total Transactions</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-gray-900 tracking-tight">
              {stats.totalTransactions}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <span>↑ 6.8%</span>
              <span className="text-gray-400 font-normal">vs yesterday</span>
            </div>
          </div>
        </div>

        {/* Card 3: Transaction Value */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs hover:border-gray-300 transition-all flex flex-col justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600">
              <IndianRupee className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-gray-600">Transaction Value</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-gray-900 tracking-tight">
              {stats.transactionValue}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <span>↑ 7.3%</span>
              <span className="text-gray-400 font-normal">vs yesterday</span>
            </div>
          </div>
        </div>

        {/* Card 4: Fraud Detected */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs hover:border-gray-300 transition-all flex flex-col justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <div className="p-1.5 rounded-lg bg-red-50 text-red-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-gray-600">Fraud Detected</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-gray-900 tracking-tight">
              {stats.fraudDetected}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-red-600">
              <span>↑ 13.4%</span>
              <span className="text-gray-400 font-normal">vs yesterday</span>
            </div>
          </div>
        </div>

        {/* Card 5: Fraud Detection Rate */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs hover:border-gray-300 transition-all flex flex-col justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-gray-600">Fraud Detection Rate</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-gray-900 tracking-tight">
              {stats.fraudRate}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <span>↑ 1.2%</span>
              <span className="text-gray-400 font-normal">vs yesterday</span>
            </div>
          </div>
        </div>

        {/* Card 6: Active Alerts */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs hover:border-gray-300 transition-all flex flex-col justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <div className="p-1.5 rounded-lg bg-red-50 text-red-600">
              <Bell className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-gray-600">Active Alerts</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-gray-900 tracking-tight">
              {stats.activeAlerts}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-red-600">
              <span>12 Critical</span>
              <span className="text-gray-300">•</span>
              <span className="text-amber-600">15 High</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. MIDDLE ROW: ACTIVITY CHART | CHANNELS DONUT | HEATMAP
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Transaction Activity Chart (6 Cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header with Title & Filter Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md text-blue-600">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">Transaction Activity</h3>
              </div>

              {/* Segmented Filter Pills */}
              <div className="inline-flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
                {(['24H', '7D', '30D', 'Live'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeframe(t)}
                    className={cn(
                      "px-3 py-1 rounded-lg transition-all cursor-pointer",
                      timeframe === t
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs font-medium text-gray-600 pb-2">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                Total
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                High Risk
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                Fraudulent
              </span>
            </div>
          </div>

          {/* Recharts Stacked Bar Chart with Annotated 12:00 Tooltip */}
          <div className="h-[270px] w-full relative pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ACTIVITY_DATA_24H}
                margin={{ top: 15, right: 10, left: -18, bottom: 0 }}
                barSize={5}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 10 }}
                  interval={2}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 10 }}
                  domain={[0, 50000]}
                  ticks={[0, 10000, 20000, 30000, 40000, 50000]}
                  tickFormatter={(val) => (val === 0 ? '0' : `${val / 1000}K`)}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const total =
                        Number(payload.find(p => p.dataKey === 'normal')?.value || 0) +
                        Number(payload.find(p => p.dataKey === 'highRisk')?.value || 0) +
                        Number(payload.find(p => p.dataKey === 'fraud')?.value || 0);
                      const highRisk = Number(payload.find(p => p.dataKey === 'highRisk')?.value || 0);
                      const fraud = Number(payload.find(p => p.dataKey === 'fraud')?.value || 0);

                      return (
                        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-xs space-y-1 z-30">
                          <p className="font-bold text-gray-800 pb-1 border-b border-gray-100">
                            {label} - {label === '12:00' ? '1:00 PM' : 'Next Hour'}
                          </p>
                          <div className="flex items-center justify-between gap-4 text-gray-600 pt-0.5">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-blue-600" /> Total
                            </span>
                            <span className="font-bold text-gray-900">{total.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-gray-600">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-amber-500" /> High Risk
                            </span>
                            <span className="font-bold text-gray-900">{highRisk.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-gray-600">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-red-500" /> Fraud
                            </span>
                            <span className="font-bold text-red-600">{fraud.toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* Stacked Bars: Fraud (base), High Risk (middle), Normal (top) */}
                <Bar dataKey="fraud" stackId="a" fill="#EF4444" radius={[0, 0, 0, 0]} />
                <Bar dataKey="highRisk" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} />
                <Bar dataKey="normal" stackId="a" fill="#2563EB" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            {/* Static Highlight Marker & Floating Callout matching screenshot */}
            <div
              className="absolute pointer-events-none transition-all hidden sm:block"
              style={{ left: '52.5%', top: '24%' }}
            >
              {/* Vertical Guide Line */}
              <div className="w-[1.5px] h-[170px] bg-blue-500/70 absolute top-2 left-0" />
              {/* Highlight Dot */}
              <div className="w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow-xs -left-[5px] -top-1 absolute" />

              {/* Floating Tooltip Box */}
              <div className="absolute left-4 -top-8 bg-white border border-gray-200/90 rounded-xl p-2.5 shadow-xl text-[11px] min-w-[130px] space-y-1 z-20">
                <div className="font-bold text-gray-800 pb-1 border-b border-gray-100 text-[10px]">
                  12:00 - 1:00 PM
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1 text-gray-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" /> Total
                  </span>
                  <span className="font-bold text-gray-900">42,683</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1 text-gray-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> High Risk
                  </span>
                  <span className="font-bold text-gray-900">2,043</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1 text-gray-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Fraud
                  </span>
                  <span className="font-bold text-red-600">312</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Transaction Channels Donut Chart (3 Cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="pb-2">
            <h3 className="text-sm font-bold text-gray-900">Transaction Channels</h3>
          </div>

          <div className="flex items-center justify-between gap-2 my-auto">
            {/* Donut Chart with Center Text */}
            <div className="w-[150px] h-[150px] relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CHANNEL_DATA}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={46}
                    outerRadius={65}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {CHANNEL_DATA.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-base font-black text-gray-900 leading-none">1.84M</span>
                <span className="text-[10px] font-medium text-gray-400 mt-0.5">Total Txns</span>
              </div>
            </div>

            {/* Channels Legend */}
            <div className="flex-1 space-y-2 pl-2">
              {CHANNEL_DATA.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-gray-700 text-[11px]">{item.name}</span>
                  </div>
                  <span className="font-bold text-gray-900 text-[11px]">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
            <span>Primary Routing</span>
            <span className="font-semibold text-blue-600">UPI 42.6%</span>
          </div>
        </div>

        {/* Right: System Risk Heatmap (3 Cols) */}
        <div className="lg:col-span-3">
          <IndiaRiskHeatmap />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. BOTTOM ROW: RECENT ALERTS | LAYER BREAKDOWN | SYSTEM HEALTH
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Recent High-Risk Alerts Table (6 Cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">Recent High-Risk Alerts</h3>
              <button
                onClick={() => navigate('/admin/alerts')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[10px] font-bold text-gray-400 border-b border-gray-100 uppercase">
                    <th className="py-2.5 font-semibold">Time</th>
                    <th className="py-2.5 font-semibold">Customer ID</th>
                    <th className="py-2.5 font-semibold">Event</th>
                    <th className="py-2.5 font-semibold">Amount</th>
                    <th className="py-2.5 font-semibold">Risk Level</th>
                    <th className="py-2.5 font-semibold">Status</th>
                    <th className="py-2.5 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-medium">
                  {RECENT_ALERTS.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => handleInvestigate(row.customerId)}
                      className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                    >
                      {/* Time with user circle avatar icon */}
                      <td className="py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                              row.badgeVariant === 'critical'
                                ? "bg-red-100 text-red-600"
                                : row.badgeVariant === 'high'
                                ? "bg-amber-100 text-amber-600"
                                : "bg-yellow-100 text-yellow-600"
                            )}
                          >
                            <User className="w-3 h-3" />
                          </div>
                          <span className="text-[11px] text-gray-500 font-mono">{row.time}</span>
                        </div>
                      </td>

                      {/* Customer ID */}
                      <td className="py-3 whitespace-nowrap font-mono font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {row.customerId}
                      </td>

                      {/* Event */}
                      <td className="py-3 whitespace-nowrap text-gray-800 text-[11px]">
                        {row.event}
                      </td>

                      {/* Amount */}
                      <td className="py-3 whitespace-nowrap font-bold text-gray-900 text-[11px]">
                        {row.amount}
                      </td>

                      {/* Risk Level Badge */}
                      <td className="py-3 whitespace-nowrap">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1",
                            row.badgeVariant === 'critical'
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : row.badgeVariant === 'high'
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                          )}
                        >
                          {row.badgeVariant === 'critical' && <span>^</span>}
                          {row.badgeVariant !== 'critical' && <span>+</span>}
                          {row.riskLevel}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-700">
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              row.status === 'Open' ? "bg-emerald-500" : "bg-amber-500"
                            )}
                          />
                          {row.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 whitespace-nowrap text-right">
                        <span className="text-blue-600 font-semibold text-[11px] group-hover:underline inline-flex items-center gap-0.5">
                          {row.actionText}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Center: Fraud Detected by Layer (3 Cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <span>Fraud Detected by Layer</span>
              <ArrowRight className="w-3 h-3 text-gray-400" />
            </h3>
          </div>

          <div className="space-y-3 my-auto pt-1">
            {LAYER_BREAKDOWN.map((layer) => (
              <div key={layer.name} className="flex items-center gap-3">
                <span className="text-[11px] font-semibold text-gray-700 w-28 shrink-0 truncate">
                  {layer.name}
                </span>

                {/* Progress Bar */}
                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-700"
                    style={{ width: `${layer.pct * 2.8}%` }}
                  />
                </div>

                <span className="text-[11px] font-bold text-gray-900 w-8 text-right shrink-0">
                  {layer.pct}%
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
            <span>Primary Block Point</span>
            <span className="font-semibold text-blue-600">Entry Gateway (28%)</span>
          </div>
        </div>

        {/* Right: System Health (3 Cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md text-emerald-600">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">System Health</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                All Services Operational
              </span>
            </div>

            {/* Health Rows */}
            <div className="divide-y divide-gray-50 pt-1">
              {HEALTH_SERVICES.map((srv) => (
                <div key={srv.name} className="py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-gray-800 font-medium text-[11px]">{srv.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {srv.status}
                    </span>
                    <span className="font-mono text-gray-400 text-[11px] w-10 text-right">
                      {srv.latency}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
            <span>Engine Runtime</span>
            <span className="font-semibold text-emerald-600">100% Uptime (99.98% SLA)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
