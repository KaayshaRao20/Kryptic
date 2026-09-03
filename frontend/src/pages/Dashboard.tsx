import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Menu,
  Bell,
  ChevronDown,
  Calendar,
  Clock,
  Eye,
  Download,
  MoreVertical,
  Building2,
  Mail,
  MapPin,
  CheckCircle2,
  ShieldAlert,
  CreditCard,
  IndianRupee,
  Activity,
  Briefcase,
  ArrowRight,
  Lock,
  ArrowRightLeft,
  Server,
  User,
  AlertTriangle,
  FileText,
  ShieldCheck,
  TrendingUp,
  SlidersHorizontal,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Zap,
  Globe
} from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';
import { cn } from '../lib/utils';

// Recent Transactions Data (Strictly matched & enriched)
const RECENT_TRANSACTIONS = [
  {
    id: 'TXN-992381',
    time: '09:18:44 AM',
    amount: '₹24,500',
    rawAmount: 24500,
    gateway: 'System A (Payment Gateway)',
    type: 'Payment',
    status: 'Success',
    riskScore: 28,
    riskLevel: 'LOW',
  },
  {
    id: 'TXN-992380',
    time: '09:17:32 AM',
    amount: '₹98,200',
    rawAmount: 98200,
    gateway: 'System B (UPI Partner)',
    type: 'Payment',
    status: 'Success',
    riskScore: 36,
    riskLevel: 'LOW',
  },
  {
    id: 'TXN-992379',
    time: '09:16:05 AM',
    amount: '₹14,200',
    rawAmount: 14200,
    gateway: 'System C (Core Banking)',
    type: 'Payout',
    status: 'Success',
    riskScore: 22,
    riskLevel: 'LOW',
  },
  {
    id: 'TXN-992378',
    time: '09:14:48 AM',
    amount: '₹1,20,000',
    rawAmount: 120000,
    gateway: 'System D (Card Rail)',
    type: 'Payment',
    status: 'Success',
    riskScore: 30,
    riskLevel: 'LOW',
  },
  {
    id: 'TXN-992377',
    time: '09:13:21 AM',
    amount: '₹8,500',
    rawAmount: 8500,
    gateway: 'System B (UPI Partner)',
    type: 'Payment',
    status: 'Failed',
    riskScore: 82,
    riskLevel: 'HIGH',
  },
];

// Activity Feed Data
const ACTIVITY_FEED = [
  {
    id: 'act-1',
    time: '09:18 AM',
    title: 'Transaction Authorized',
    detail: 'TXN-992381 | ₹24,500 | System A',
    amount: '₹24,500',
    icon: Building2,
    iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    badge: null,
  },
  {
    id: 'act-2',
    time: '09:17 AM',
    title: 'Login Successful',
    detail: 'User: finance.apex@apexmerchant.com',
    amount: null,
    icon: User,
    iconBg: 'bg-blue-50 text-blue-600 border border-blue-100',
    badge: { label: 'New Device', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  },
  {
    id: 'act-3',
    time: '09:14 AM',
    title: 'Payment Initiated',
    detail: 'TXN-992380 | ₹98,200 | System B',
    amount: '₹98,200',
    icon: IndianRupee,
    iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    badge: null,
  },
  {
    id: 'act-4',
    time: '09:11 AM',
    title: 'KYC Document Uploaded',
    detail: 'PAN Verification',
    amount: null,
    icon: FileText,
    iconBg: 'bg-slate-100 text-slate-600 border border-slate-200',
    badge: { label: 'Verified', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  },
  {
    id: 'act-5',
    time: '09:09 AM',
    title: 'Alert Raised',
    detail: 'High OTP Failure Rate',
    amount: null,
    icon: AlertTriangle,
    iconBg: 'bg-red-50 text-red-600 border border-red-100',
    badge: { label: 'High', color: 'bg-red-50 text-red-700 border-red-200' },
  },
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { customerId: paramId } = useParams();
  const { selectedCustomer, selectCustomer } = useCustomer();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'activity'>('overview');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const custId = paramId || selectedCustomer?.id || 'CUST-001';

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 text-slate-800 antialiased font-sans">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 backdrop-blur-md text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-5 border border-slate-700/80">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. EXECUTIVE TOP CONTROL BAR
         ───────────────────────────────────────────────────────────── */}
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-2">
        {/* Left: Hamburger & Greeting */}
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => showToast('Command Navigation Drawer Toggled')}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.04)] shrink-0 cursor-pointer"
          >
            <Menu className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Hello Admin</span>
              <span className="text-2xl">👋</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Welcome to KRYPTIC Risk Command Center
            </p>
          </div>
        </div>

        {/* Right: Date Range, Time, Notification, Profile */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Date Picker Pill */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-white border border-slate-200/90 rounded-full text-xs font-semibold text-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.03)] shrink-0">
            <span>03 Sep 2026 - 03 Sep 2026</span>
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
          </div>

          {/* Clock Pill */}
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200/90 rounded-full text-xs font-medium text-slate-600 shadow-[0_1px_2px_rgba(0,0,0,0.03)] shrink-0">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>09:20 AM / 03 Sep 2026</span>
          </div>

          {/* Alert Bell */}
          <button
            onClick={() => navigate('/admin/alerts')}
            className="w-8.5 h-8.5 rounded-full bg-white border border-slate-200/90 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 relative transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)] shrink-0 cursor-pointer"
            title="Active Risk Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center border-2 border-white">
              12
            </span>
          </button>

          {/* Admin ID & Profile Badge */}
          <div className="flex items-center gap-2.5 bg-white border border-slate-200/90 rounded-full pl-1.5 pr-3.5 py-1 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all cursor-pointer">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
              AD
            </div>
            <div className="flex flex-col text-left leading-tight pr-0.5">
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Admin ID:</span>
                <span className="text-[11px] font-bold text-slate-900">ADM-001</span>
              </div>
              <span className="text-[10px] text-slate-500">Super Administrator</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. BREADCRUMB & ACTION BUTTONS BAR
         ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="hover:text-slate-900 transition-colors cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
            Customer Dashboard
          </span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded-md">Overview</span>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* View Digital Twin Button */}
          <button
            onClick={() => navigate(`/customer/${custId}/twin`)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>View Digital Twin</span>
          </button>

          {/* Export Report Button */}
          <button
            onClick={() => showToast(`Generating official risk report PDF for ${custId}`)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Report</span>
          </button>

          {/* Create Case Button */}
          <button
            onClick={() => showToast(`Opening Case Management Desk for ${custId}`)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <span>Create Case</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
          </button>

          {/* Options Menu Button */}
          <button
            onClick={() => showToast('Extended account controls loaded')}
            className="w-8 h-8 rounded-xl bg-white border border-slate-200/90 flex items-center justify-center text-slate-500 hover:text-slate-800 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all cursor-pointer"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. CUSTOMER PROFILE & RISK OVERVIEW CARD (PROFESSIONAL FINTECH CARD)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.04)] transition-all duration-200 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Customer Identity & Badges (5 Cols) */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="flex items-center gap-3">
            {/* Merchant Logo Avatar */}
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
              AM
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{custId}</h2>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 uppercase tracking-wider">
                ACTIVE
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-700 border border-rose-500/20 uppercase tracking-wider">
                FLAGGED
              </span>
            </div>
          </div>

          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Apex Merchant Solutions
          </h3>

          <div className="flex items-center gap-3.5 text-xs text-slate-500 flex-wrap pt-0.5">
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              Corporate
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              treasury@apexmerchant.com
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Mumbai, India
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1.5 text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Customer Since 12 Aug 2024
            </span>
          </div>
        </div>

        {/* Middle Column: Risk Score & Sparkline (4 Cols) */}
        <div className="lg:col-span-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl p-4.5 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Risk Score
            </span>
            <div className="text-3xl font-black text-rose-600 tracking-tight mt-0.5">
              94/100
            </div>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-700 border border-rose-500/20 uppercase tracking-wider mt-2 inline-block">
              CRITICAL
            </span>
          </div>

          {/* High-Precision Red Sparkline with Gradient Fill */}
          <div className="w-36 h-14 relative">
            <svg viewBox="0 0 140 45" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="riskAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 5,36 Q 30,32 55,34 T 90,20 T 115,12 T 135,4 L 135,45 L 5,45 Z"
                fill="url(#riskAreaGrad)"
              />
              <path
                d="M 5,36 Q 30,32 55,34 T 90,20 T 115,12 T 135,4"
                fill="none"
                stroke="#EF4444"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="135" cy="4" r="4" fill="#EF4444" className="animate-ping opacity-75" />
              <circle cx="135" cy="4" r="3.5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* Right Column: Compliance & Metadata (3 Cols) */}
        <div className="lg:col-span-3 space-y-2.5 text-xs border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-6 pt-4 lg:pt-0">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">KYC Status</span>
            <span className="font-bold text-emerald-600 flex items-center gap-1.5">
              <span>Verified</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Account Manager</span>
            <span className="font-bold text-slate-900">Rahul Sharma</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Customer Segment</span>
            <span className="font-bold text-slate-900">Corporate</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Last Review</span>
            <span className="font-bold text-slate-900 font-mono">03 Sep 2026</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. 6 PRIMARY METRIC KPI CARDS
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Card 1: Total Transactions */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.04)] transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CreditCard className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-600">Total Transactions</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">1,247</div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px]">
              <span className="text-slate-400">vs 02 Sep 2026</span>
              <span className="font-semibold text-emerald-600">8.43% ↗</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Transaction Value */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.04)] transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <IndianRupee className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-600">Total Transaction Value</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">₹8,42,000</div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px]">
              <span className="text-slate-400">vs 02 Sep 2026</span>
              <span className="font-semibold text-emerald-600">12.21% ↗</span>
            </div>
          </div>
        </div>

        {/* Card 3: Payment Gateway Usage */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.04)] transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-600">Payment Gateway Usage</span>
          </div>
          <div className="mt-3 flex items-end justify-between">
            <div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">5</div>
              <div className="text-[11px] text-slate-400 mt-1">All Systems</div>
            </div>
            {/* Mini bar graphic */}
            <div className="flex items-end gap-1 h-5 pb-0.5">
              <span className="w-1 h-3 bg-blue-300 rounded-xs" />
              <span className="w-1 h-5 bg-blue-600 rounded-xs" />
              <span className="w-1 h-2 bg-blue-300 rounded-xs" />
              <span className="w-1 h-4 bg-blue-400 rounded-xs" />
            </div>
          </div>
        </div>

        {/* Card 4: Total Activities */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.04)] transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-600">Total Activities</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">312</div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px]">
              <span className="text-slate-400">vs 02 Sep 2026</span>
              <span className="font-semibold text-emerald-600">6.11% ↗</span>
            </div>
          </div>
        </div>

        {/* Card 5: Active Cases */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.04)] transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600 border border-orange-100">
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-600">Active Cases</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">4</div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px]">
              <span className="text-slate-400">vs 02 Sep 2026</span>
              <span className="font-semibold text-rose-600">33.33% ↗</span>
            </div>
          </div>
        </div>

        {/* Card 6: Total Alerts */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.04)] transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-600">Total Alerts</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">23</div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px]">
              <span className="text-slate-400">vs 02 Sep 2026</span>
              <span className="font-semibold text-rose-600">4.55% ↗</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. MIDDLE ROW: DIGITAL TWIN LIVE FLOW & RISK STATUS
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Digital Twin - Live System Flow (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-5 lg:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Digital Twin - Live System Flow</h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>
              <button
                onClick={() => navigate(`/customer/${custId}/twin`)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
              >
                View Full Digital Twin →
              </button>
            </div>

            {/* 5 Connected System Nodes Flow */}
            <div className="grid grid-cols-5 gap-2 relative py-4 items-center">
              {/* Node 1: Entry Gateway */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 text-center space-y-1 z-10 shadow-2xs hover:border-slate-300 transition-all">
                <div className="flex justify-between items-center text-[10px]">
                  <ShieldAlert className="w-3.5 h-3.5 text-slate-600" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="text-[11px] font-bold text-slate-900 leading-tight pt-1">
                  Entry Gateway
                </div>
                <div className="text-[10px] text-slate-400 flex justify-between pt-1">
                  <span>TPS</span>
                  <span className="font-mono text-slate-700">12,400</span>
                </div>
                <div className="text-[10px] text-slate-400 flex justify-between">
                  <span>Risk</span>
                  <span className="font-mono text-emerald-600 font-bold">1.8%</span>
                </div>
              </div>

              {/* Node 2: Auth Service */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 text-center space-y-1 z-10 shadow-2xs hover:border-slate-300 transition-all">
                <div className="flex justify-between items-center text-[10px]">
                  <Lock className="w-3.5 h-3.5 text-slate-600" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="text-[11px] font-bold text-slate-900 leading-tight pt-1">
                  Auth Service
                </div>
                <div className="text-[10px] text-slate-400 flex justify-between pt-1">
                  <span>TPS</span>
                  <span className="font-mono text-slate-700">11,700</span>
                </div>
                <div className="text-[10px] text-slate-400 flex justify-between">
                  <span>Risk</span>
                  <span className="font-mono text-emerald-600 font-bold">2.1%</span>
                </div>
              </div>

              {/* Node 3: Risk Engine (CRITICAL ANOMALY HIGHLIGHTED IN RED) */}
              <div className="bg-rose-50/50 border-2 border-rose-400 rounded-xl p-3 text-center space-y-1 z-10 shadow-md relative">
                <div className="flex justify-between items-center text-[10px]">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center shadow-xs">
                    ▲
                  </span>
                </div>
                <div className="text-[11px] font-bold text-rose-950 leading-tight pt-1">
                  Risk Engine
                </div>
                <div className="text-[10px] text-slate-500 flex justify-between pt-1">
                  <span>TPS</span>
                  <span className="font-mono text-slate-800 font-bold">11,200</span>
                </div>
                <div className="text-[10px] text-slate-500 flex justify-between">
                  <span>Risk</span>
                  <span className="font-mono text-rose-600 font-black">87.6%</span>
                </div>
              </div>

              {/* Node 4: Payment Router */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 text-center space-y-1 z-10 shadow-2xs hover:border-slate-300 transition-all">
                <div className="flex justify-between items-center text-[10px]">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-slate-600" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="text-[11px] font-bold text-slate-900 leading-tight pt-1">
                  Payment Router
                </div>
                <div className="text-[10px] text-slate-400 flex justify-between pt-1">
                  <span>TPS</span>
                  <span className="font-mono text-slate-700">10,800</span>
                </div>
                <div className="text-[10px] text-slate-400 flex justify-between">
                  <span>Risk</span>
                  <span className="font-mono text-emerald-600 font-bold">6.3%</span>
                </div>
              </div>

              {/* Node 5: Settlement Svc */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 text-center space-y-1 z-10 shadow-2xs hover:border-slate-300 transition-all">
                <div className="flex justify-between items-center text-[10px]">
                  <Server className="w-3.5 h-3.5 text-slate-600" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="text-[11px] font-bold text-slate-900 leading-tight pt-1">
                  Settlement Svc
                </div>
                <div className="text-[10px] text-slate-400 flex justify-between pt-1">
                  <span>TPS</span>
                  <span className="font-mono text-slate-700">10,100</span>
                </div>
                <div className="text-[10px] text-slate-400 flex justify-between">
                  <span>Risk</span>
                  <span className="font-mono text-emerald-600 font-bold">3.2%</span>
                </div>
              </div>

              {/* Connecting Line */}
              <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 border-b-2 border-dashed border-slate-300 pointer-events-none z-0" />
            </div>
          </div>

          {/* Bottom Flow Legend */}
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500 pt-2 border-t border-slate-100">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Normal
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Warning
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Critical
            </span>
          </div>
        </div>

        {/* Right: Risk Status Spectrum Card (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 lg:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 pb-3">Risk Status</h3>

            {/* Risk Spectrum Labels & Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                <span>Low (0-40)</span>
                <span>Medium (41-70)</span>
                <span>High (71-100)</span>
              </div>

              {/* Spectrum Bar with Glowing Pointer */}
              <div className="relative">
                <div className="h-2 rounded-full w-full flex overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[40%]" />
                  <div className="bg-amber-500 h-full w-[30%]" />
                  <div className="bg-rose-500 h-full w-[30%]" />
                </div>
                {/* Pointer Arrow */}
                <div
                  className="absolute -top-1 w-2.5 h-2.5 bg-rose-600 border border-white transform rotate-45 shadow-sm rounded-xs transition-all"
                  style={{ left: '94%' }}
                />
              </div>
            </div>

            {/* Risk Score Row */}
            <div className="flex items-center justify-between pt-4">
              <span className="text-xs font-semibold text-slate-600">Risk Score</span>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-slate-900">94/100</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 uppercase border border-rose-200">
                  CRITICAL
                </span>
              </div>
            </div>

            {/* Model Confidence Progress Bar */}
            <div className="pt-3 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Model Confidence</span>
                <span className="font-bold text-blue-600">96.3%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full w-[96.3%]" />
              </div>
            </div>
          </div>

          {/* Risk Factors Metadata */}
          <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Top Risk Factor</span>
              <span className="font-bold text-rose-600">High OTP Failure Rate</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Next Review Date</span>
              <span className="font-bold text-slate-900 font-mono inline-flex items-center gap-1">
                <span>06 Sep 2026</span>
                <Calendar className="w-3 h-3 text-slate-400" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          6. BOTTOM ROW: RECENT TRANSACTIONS & CUSTOMER ACTIVITY FEED
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Recent Transactions Table (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 lg:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Recent Transactions</h3>
              <button
                onClick={() => navigate(`/customer/${custId}/payments`)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
              >
                View All →
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase">
                    <th className="py-2.5 font-semibold">Time</th>
                    <th className="py-2.5 font-semibold">Transaction ID</th>
                    <th className="py-2.5 font-semibold">Amount</th>
                    <th className="py-2.5 font-semibold">Gateway / System</th>
                    <th className="py-2.5 font-semibold">Type</th>
                    <th className="py-2.5 font-semibold">Status</th>
                    <th className="py-2.5 font-semibold text-right">Risk Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium">
                  {RECENT_TRANSACTIONS.map((tx) => (
                    <tr
                      key={tx.id}
                      onClick={() => showToast(`Selected transaction ${tx.id}`)}
                      className="hover:bg-blue-50/30 transition-colors cursor-pointer"
                    >
                      <td className="py-3 whitespace-nowrap text-slate-500 text-[11px] font-mono">
                        {tx.time}
                      </td>
                      <td className="py-3 whitespace-nowrap font-mono font-bold text-slate-900 text-[11px]">
                        {tx.id}
                      </td>
                      <td className="py-3 whitespace-nowrap font-bold text-slate-900 text-[11px]">
                        {tx.amount}
                      </td>
                      <td className="py-3 whitespace-nowrap text-slate-600 text-[11px]">
                        {tx.gateway}
                      </td>
                      <td className="py-3 whitespace-nowrap text-slate-600 text-[11px]">
                        {tx.type}
                      </td>
                      <td className="py-3 whitespace-nowrap">
                        <span
                          className={cn(
                            "font-bold text-[11px]",
                            tx.status === 'Success' ? "text-emerald-600" : "text-rose-600"
                          )}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 whitespace-nowrap text-right">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              tx.riskLevel === 'HIGH' ? "bg-rose-500" : "bg-emerald-500"
                            )}
                          />
                          {tx.riskScore}/100
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => navigate(`/customer/${custId}/payments`)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View All Transactions</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Right: Customer Activity Feed Timeline (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 lg:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Customer Activity Feed</h3>
              <button
                onClick={() => navigate(`/customer/${custId}/alerts`)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
              >
                View All →
              </button>
            </div>

            {/* Vertical Connected Timeline */}
            <div className="relative pl-4 space-y-4 pt-3">
              {/* Vertical line */}
              <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-200 pointer-events-none" />

              {ACTIVITY_FEED.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className="relative flex items-start gap-3 text-xs">
                    {/* Time */}
                    <span className="text-[10px] font-mono text-slate-400 w-14 shrink-0 pt-0.5">
                      {item.time}
                    </span>

                    {/* Node Circle Icon */}
                    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center z-10 shrink-0 shadow-2xs", item.iconBg)}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-900 text-[11px] leading-tight">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{item.detail}</div>
                      </div>

                      {/* Right Tag / Amount / Badge */}
                      <div className="shrink-0 text-right">
                        {item.amount && (
                          <span className="font-bold text-emerald-600 font-mono text-[11px]">
                            {item.amount}
                          </span>
                        )}
                        {item.badge && (
                          <span className={cn("px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider", item.badge.color)}>
                            {item.badge.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => navigate(`/customer/${custId}/alerts`)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Activity Timeline</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
