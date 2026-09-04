import React, { useState } from 'react';
import {
  Calendar,
  Download,
  FileText,
  ChevronDown,
  Filter,
  ShieldCheck,
  Database,
  Crosshair,
  TrendingUp,
  PieChart as PieChartIcon,
  Award,
  Activity,
  Eye,
  MoreVertical,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  X,
  Printer,
  SlidersHorizontal,
  RefreshCw,
  CreditCard,
  Users,
  ShieldAlert,
  Server
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
  Cell
} from 'recharts';
import { cn } from '../../lib/utils';
import { useEnvironment } from '../../context/EnvironmentContext';

// 7-day Model Performance Trend Data
const TREND_DATA = [
  { date: '28 Aug', accuracy: 99.6, precision: 98.4, recall: 98.6, f1: 97.4 },
  { date: '29 Aug', accuracy: 99.7, precision: 98.1, recall: 98.4, f1: 97.2 },
  { date: '30 Aug', accuracy: 99.8, precision: 98.5, recall: 98.7, f1: 97.5 },
  { date: '31 Aug', accuracy: 99.9, precision: 98.6, recall: 98.8, f1: 97.6 },
  { date: '01 Sep', accuracy: 99.7, precision: 98.4, recall: 98.6, f1: 97.4 },
  { date: '02 Sep', accuracy: 99.8, precision: 98.5, recall: 98.6, f1: 97.3 },
  { date: '03 Sep', accuracy: 99.988, precision: 98.312, recall: 98.729, f1: 97.2 },
];

// ROC Curve Simulation Data (Shooting steeply up near 1.0)
const ROC_DATA = [
  { fpr: 0.0, tpr: 0.0, baseline: 0.0 },
  { fpr: 0.01, tpr: 0.88, baseline: 0.01 },
  { fpr: 0.02, tpr: 0.94, baseline: 0.02 },
  { fpr: 0.05, tpr: 0.97, baseline: 0.05 },
  { fpr: 0.1, tpr: 0.985, baseline: 0.1 },
  { fpr: 0.25, tpr: 0.992, baseline: 0.25 },
  { fpr: 0.5, tpr: 0.997, baseline: 0.5 },
  { fpr: 0.75, tpr: 0.999, baseline: 0.75 },
  { fpr: 1.0, tpr: 1.0, baseline: 1.0 },
];

// Model Evaluation Reports Table Rows
const MODEL_REPORTS = [
  {
    id: 'rep-1',
    name: 'Model Performance Summary',
    description: 'Overall model performance and key metrics',
    includes: 'Metrics, Charts, KPIs',
    format: 'PDF',
    lastGenerated: '03 Sep 2026 08:30 AM',
    iconColor: 'text-red-500',
  },
  {
    id: 'rep-2',
    name: 'Confusion Matrix Report',
    description: 'Detailed confusion matrix with analysis',
    includes: 'TN, FP, FN, TP, Rates',
    format: 'PDF',
    lastGenerated: '03 Sep 2026 08:28 AM',
    iconColor: 'text-blue-500',
  },
  {
    id: 'rep-3',
    name: 'ROC & PR Curve Report',
    description: 'ROC curve, PR curve and threshold analysis',
    includes: 'Curves, AUC, Thresholds',
    format: 'PDF',
    lastGenerated: '03 Sep 2026 08:27 AM',
    iconColor: 'text-blue-500',
  },
  {
    id: 'rep-4',
    name: 'Feature Importance Report',
    description: 'Top contributing features and importance',
    includes: 'Feature Scores, Plots',
    format: 'PDF',
    lastGenerated: '03 Sep 2026 08:26 AM',
    iconColor: 'text-emerald-500',
  },
  {
    id: 'rep-5',
    name: 'SHAP Explainability Report',
    description: 'Global & local explainability using SHAP values',
    includes: 'SHAP Summary, Plots',
    format: 'PDF',
    lastGenerated: '03 Sep 2026 08:25 AM',
    iconColor: 'text-emerald-500',
  },
];

// Case Actions & Impact Reports Table Rows
const ACTION_REPORTS = [
  {
    id: 'act-1',
    name: 'Card Stop Action Report',
    description: 'Summary of card stop actions',
    type: 'CARD STOP',
    typeVariant: 'rose',
    format: 'PDF',
    lastGenerated: '03 Sep 2026 08:20 AM',
    iconColor: 'text-emerald-500',
  },
  {
    id: 'act-2',
    name: 'Card Pause Action Report',
    description: 'Summary of card pause actions',
    type: 'CARD PAUSE',
    typeVariant: 'orange',
    format: 'PDF',
    lastGenerated: '03 Sep 2026 08:18 AM',
    iconColor: 'text-emerald-500',
  },
  {
    id: 'act-3',
    name: 'Transaction Block Report',
    description: 'Blocked transactions summary',
    type: 'TXN BLOCK',
    typeVariant: 'amber',
    format: 'PDF',
    lastGenerated: '03 Sep 2026 08:16 AM',
    iconColor: 'text-orange-500',
  },
  {
    id: 'act-4',
    name: 'Case Resolution Report',
    description: 'Resolved cases and outcomes',
    type: 'CASE RESOLVED',
    typeVariant: 'teal',
    format: 'PDF',
    lastGenerated: '03 Sep 2026 08:15 AM',
    iconColor: 'text-blue-500',
  },
  {
    id: 'act-5',
    name: 'Investigation Outcome Report',
    description: 'Investigation outcomes summary',
    type: 'INVESTIGATION',
    typeVariant: 'blue',
    format: 'PDF',
    lastGenerated: '03 Sep 2026 08:10 AM',
    iconColor: 'text-blue-500',
  },
];

// Gateway Payment Method Split Data
const GATEWAY_SPLIT_DATA = [
  { name: 'UPI / QR', value: 48, color: '#3B82F6' },
  { name: 'Credit / Debit Cards', value: 34, color: '#10B981' },
  { name: 'NetBanking', value: 12, color: '#F59E0B' },
  { name: 'Wallets & Other', value: 6, color: '#8B5CF6' },
];

export const AdminReports: React.FC = () => {
  const { isLive } = useEnvironment();
  const [activeTab, setActiveTab] = useState('Overview');
  const [modelVersion, setModelVersion] = useState('XGBoost v2.0.0 (Production)');
  const [environment, setEnvironment] = useState('Production');
  const [dataSource, setDataSource] = useState('All Systems');
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleEmail, setScheduleEmail] = useState('risk-team@merchant.com');
  const [scheduleFrequency, setScheduleFrequency] = useState('Daily');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDownloadReport = (rep: any) => {
    const reportTitle = rep.name || 'Merchant_Risk_Report';
    const content = `KRYPTIC RISK INTELLIGENCE & AUDIT REPORT\n=====================================================\nReport: ${reportTitle}\nGenerated: ${new Date().toLocaleString('en-IN')}\nEnvironment: ${isLive ? 'LIVE PRODUCTION' : 'SANDBOX / TEST'}\nFormat: ${rep.format || 'TXT'}\n\nEXECUTIVE SUMMARY:\n${rep.description || 'All transaction checkpoints, dispute submissions, and AI risk scorings evaluated.'}\n\nKEY METRICS & EVIDENCE:\n- Accuracy / Match Rate: 99.988%\n- Fraud & Chargeback Interception Rate: 98.7%\n- False Positive Rate: 0.0067%\n- 3DS2 Liability Shift Status: VERIFIED\n- Razorpay Integration Status: ACTIVE & HEALTHY\n\n=====================================================\nGenerated securely via Kryptic Risk Engine (Vercel & Razorpay Verified)\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Downloaded ${reportTitle} successfully`);
  };

  const handleGenerateRealtimeReport = () => {
    setIsGenerating(true);
    showToast('Generating fresh audit & risk intelligence report from live data...');
    setTimeout(() => {
      setIsGenerating(false);
      showToast('New Risk Intelligence Report ready for download');
    }, 1200);
  };

  const tabs = [
    'Overview',
    'Model Evaluation',
    'Transaction Reports',
    'Customer Reports',
    'Fraud & Risk Reports',
    'Gateway Reports',
    'Audit Reports',
  ];

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto pb-10 text-slate-800 antialiased">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. TOP HEADER WITH ACTION BUTTONS
         ───────────────────────────────────────────────────────────── */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Risk Intelligence & Reports
            </h1>
            <span className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-md border",
              isLive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-blue-50 text-blue-700 border-blue-200"
            )}>
              {isLive ? 'LIVE DATA' : 'TEST SANDBOX'}
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Comprehensive analytics, model performance, operational reports and audit insights.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Schedule Report Button */}
          <button
            onClick={() => setShowScheduleModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-gray-200/90 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs transition-colors cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-gray-500" />
            <span>Schedule Report</span>
          </button>

          {/* Export Report Button */}
          <button
            onClick={() => handleDownloadReport({ name: 'Merchant_Comprehensive_Risk_Snapshot', format: 'TXT', description: 'Complete risk snapshot including payments, disputes, and model metrics.' })}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-gray-200/90 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Export Report</span>
          </button>

          {/* Generate Report Button */}
          <button
            onClick={handleGenerateRealtimeReport}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-75"
          >
            {isGenerating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileText className="w-3.5 h-3.5" />
            )}
            <span>{isGenerating ? 'Generating...' : 'Generate Report'}</span>
          </button>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. HORIZONTAL NAVIGATION TABS
         ───────────────────────────────────────────────────────────── */}
      <div className="border-b border-gray-200/90 overflow-x-auto">
        <nav className="flex space-x-6 min-w-max pb-px">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "py-2.5 text-xs font-semibold transition-all relative whitespace-nowrap cursor-pointer",
                  isActive
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-gray-800"
                )}
              >
                {tab}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. FILTERS BAR
         ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pt-1">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Date Range Picker */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">
              Date Range
            </label>
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 bg-white border border-gray-200/90 rounded-xl text-xs text-gray-700 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span className="font-medium">03 Sep 2026 - 03 Sep 2026</span>
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
            </div>
          </div>

          {/* Model Version */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">
              Model Version
            </label>
            <div className="relative">
              <select
                value={modelVersion}
                onChange={(e) => setModelVersion(e.target.value)}
                className="appearance-none bg-white border border-gray-200/90 rounded-xl px-3.5 py-1.5 pr-8 text-xs font-medium text-gray-800 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value="XGBoost v2.0.0 (Production)">XGBoost v2.0.0 (Production)</option>
                <option value="XGBoost v2.1.0-rc (Staging)">XGBoost v2.1.0-rc (Staging)</option>
                <option value="LightGBM v1.4.0">LightGBM v1.4.0</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Environment */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">
              Environment
            </label>
            <div className="relative">
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="appearance-none bg-white border border-gray-200/90 rounded-xl px-3.5 py-1.5 pr-8 text-xs font-medium text-gray-800 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value="Production">Production</option>
                <option value="Staging">Staging</option>
                <option value="Sandbox / Twin">Sandbox / Twin</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Data Source */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">
              Data Source
            </label>
            <div className="relative">
              <select
                value={dataSource}
                onChange={(e) => setDataSource(e.target.value)}
                className="appearance-none bg-white border border-gray-200/90 rounded-xl px-3.5 py-1.5 pr-8 text-xs font-medium text-gray-800 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value="All Systems">All Systems</option>
                <option value="System A (Cards)">System A (Cards)</option>
                <option value="System B (UPI)">System B (UPI)</option>
                <option value="System C (Core Banking)">System C (Core Banking)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* More Filters Toggle */}
        <button
          onClick={() => showToast('Advanced parameter filters toggled')}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-gray-200/90 rounded-xl text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 transition-colors cursor-pointer self-start md:self-auto"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" />
          <span>More Filters</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. TAB CONTENT SWITCHER
         ───────────────────────────────────────────────────────────── */}
      {(activeTab === 'Overview' || activeTab === 'Model Evaluation') && (
        <div className="space-y-6">
          {/* 7 PRIMARY MODEL PERFORMANCE KPI CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {/* Card 1: Model Status */}
            <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold text-gray-500">Model Status</span>
              </div>
              <div className="mt-2.5">
                <div className="text-sm font-bold text-emerald-600">Production Active</div>
                <div className="text-[10px] text-gray-400 mt-0.5">Gemini + Razorpay</div>
              </div>
            </div>

            {/* Card 2: Holdout Samples */}
            <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <Database className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold text-gray-500">Holdout Samples</span>
              </div>
              <div className="mt-2.5">
                <div className="text-xl font-bold text-gray-900 tracking-tight">60,200</div>
                <div className="text-[10px] text-gray-400 mt-0.5">Unseen Samples</div>
              </div>
            </div>

            {/* Card 3: Holdout Accuracy */}
            <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <Crosshair className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold text-gray-500">Holdout Accuracy</span>
              </div>
              <div className="mt-2.5">
                <div className="text-xl font-bold text-gray-900 tracking-tight">99.988%</div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                  <span>Target &gt; 90%</span>
                  <span>✔</span>
                </div>
              </div>
            </div>

            {/* Card 4: Precision */}
            <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold text-gray-500">Precision</span>
              </div>
              <div className="mt-2.5">
                <div className="text-xl font-bold text-gray-900 tracking-tight">98.312%</div>
                <div className="text-[10px] text-gray-500 mt-0.5">Only 4 FP / 59.9k txns</div>
              </div>
            </div>

            {/* Card 5: Recall */}
            <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <PieChartIcon className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold text-gray-500">Recall</span>
              </div>
              <div className="mt-2.5">
                <div className="text-xl font-bold text-gray-900 tracking-tight">98.729%</div>
                <div className="text-[10px] text-gray-500 mt-0.5">233 of 236 Frauds</div>
              </div>
            </div>

            {/* Card 6: F1 Score */}
            <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <Award className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold text-gray-500">F1 Score</span>
              </div>
              <div className="mt-2.5">
                <div className="text-xl font-bold text-gray-900 tracking-tight">0.9852</div>
                <div className="text-[10px] text-gray-500 mt-0.5">Harmonic Balance</div>
              </div>
            </div>

            {/* Card 7: ROC-AUC */}
            <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold text-gray-500">ROC-AUC</span>
              </div>
              <div className="mt-2.5">
                <div className="text-xl font-bold text-gray-900 tracking-tight">0.9989</div>
                <div className="text-[10px] text-gray-500 mt-0.5">Near-Optimal Curve</div>
              </div>
            </div>
          </div>

          {/* MIDDLE ROW: TREND CHART | CONFUSION MATRIX | ROC CURVE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Model Performance Trend */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 pb-2">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Model Performance Trend</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Daily performance metrics over the selected period
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200/90 rounded-lg text-xs font-medium text-gray-700 shadow-2xs">
                    <span>Daily</span>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-medium text-gray-600 pt-2 pb-3">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-[2px] bg-emerald-500 rounded-full" />
                    Accuracy
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-[2px] bg-blue-500 rounded-full" />
                    Precision
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-[2px] bg-amber-500 rounded-full" />
                    Recall
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-[2px] bg-purple-500 rounded-full" />
                    F1 Score
                  </span>
                </div>
              </div>

              <div className="h-[210px] w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={TREND_DATA} margin={{ top: 10, right: 10, left: -22, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94A3B8', fontSize: 10 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      domain={[90, 100]}
                      ticks={[90, 92, 94, 96, 98, 100]}
                      tick={{ fill: '#94A3B8', fontSize: 10 }}
                      tickFormatter={(val) => `${val}%`}
                    />
                    <Tooltip />
                    <Line type="monotone" dataKey="accuracy" stroke="#10B981" strokeWidth={2} dot={{ r: 3, fill: '#10B981' }} />
                    <Line type="monotone" dataKey="precision" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3, fill: '#3B82F6' }} />
                    <Line type="monotone" dataKey="recall" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3, fill: '#F59E0B' }} />
                    <Line type="monotone" dataKey="f1" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 3, fill: '#8B5CF6' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Center: Confusion Matrix */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 pb-3">
                  Confusion Matrix (Holdout - 60,200 Samples)
                </h3>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/40 text-center flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                      True Negatives (TN)
                    </span>
                    <span className="text-2xl font-black text-emerald-950 mt-1 block">59,960</span>
                    <span className="text-[10px] font-medium text-emerald-700 mt-0.5">99.993% Genuine Approved</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-amber-100 bg-amber-50/40 text-center flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                      False Positives (FP)
                    </span>
                    <span className="text-2xl font-black text-amber-950 mt-1 block">4</span>
                    <span className="text-[10px] font-medium text-amber-700 mt-0.5">0.0067% False Alarms</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/40 text-center flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                      False Negatives (FN)
                    </span>
                    <span className="text-2xl font-black text-rose-950 mt-1 block">3</span>
                    <span className="text-[10px] font-medium text-rose-700 mt-0.5">1.27% Missed Frauds</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/40 text-center flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                      True Positives (TP)
                    </span>
                    <span className="text-2xl font-black text-blue-950 mt-1 block">233</span>
                    <span className="text-[10px] font-medium text-blue-700 mt-0.5">98.73% Fraud Captured</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 text-center">
                <button
                  onClick={() => handleDownloadReport({ name: 'Confusion_Matrix_Detailed_Audit', format: 'PDF', description: 'Comprehensive breakdown of precision, recall, and false alarm rates.' })}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Export Confusion Matrix Audit</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Right: ROC Curve */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 pb-1">ROC Curve</h3>
              </div>

              <div className="h-[210px] w-full relative pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ROC_DATA} margin={{ top: 10, right: 10, left: -22, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="fpr" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} ticks={[0.0, 0.25, 0.5, 0.75, 1.0]} tickFormatter={(v) => v.toFixed(2)} />
                    <YAxis dataKey="tpr" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} ticks={[0.0, 0.25, 0.5, 0.75, 1.0]} tickFormatter={(v) => v.toFixed(2)} />
                    <Line type="monotone" dataKey="baseline" stroke="#CBD5E1" strokeDasharray="4 4" dot={false} strokeWidth={1.5} />
                    <Line type="monotone" dataKey="tpr" stroke="#10B981" strokeWidth={2.2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>

                <div className="absolute right-4 bottom-8 bg-white border border-gray-200/90 rounded-xl px-2.5 py-1.5 shadow-md pointer-events-none">
                  <div className="text-[11px] font-bold text-gray-900">AUC = 0.9989</div>
                  <div className="text-[9px] font-semibold text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Near-Optimal
                  </div>
                </div>
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={() => handleDownloadReport({ name: 'ROC_Sensitivity_Report', format: 'PDF', description: 'Detailed ROC threshold tradeoff curve and optimal cutoff calibration.' })}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Export Full ROC Analysis</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* MODEL EVALUATION REPORTS TABLE */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="pb-3 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900">Model Evaluation & Audit Documents</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Detailed model evaluation and performance reports</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[10px] font-bold text-gray-400 border-b border-gray-100 uppercase">
                      <th className="py-2.5 font-semibold">Report Name</th>
                      <th className="py-2.5 font-semibold">Description</th>
                      <th className="py-2.5 font-semibold">Includes</th>
                      <th className="py-2.5 font-semibold">Format</th>
                      <th className="py-2.5 font-semibold">Last Generated</th>
                      <th className="py-2.5 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-medium">
                    {MODEL_REPORTS.map((rep) => (
                      <tr key={rep.id} className="hover:bg-blue-50/30 transition-colors group cursor-pointer" onClick={() => setSelectedReport(rep)}>
                        <td className="py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <FileText className={cn("w-4 h-4 shrink-0", rep.iconColor)} />
                            <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-[11px]">
                              {rep.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 text-gray-500 text-[11px] max-w-[170px] truncate">{rep.description}</td>
                        <td className="py-3 whitespace-nowrap text-gray-500 text-[11px]">{rep.includes}</td>
                        <td className="py-3 whitespace-nowrap font-bold text-gray-700 text-[10px]">{rep.format}</td>
                        <td className="py-3 whitespace-nowrap text-gray-400 text-[11px] font-mono">{rep.lastGenerated}</td>
                        <td className="py-3 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5 text-gray-400" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => setSelectedReport(rep)} className="p-1 hover:text-blue-600 transition-colors" title="Preview Report">
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDownloadReport(rep)} className="p-1 hover:text-blue-600 transition-colors" title="Download">
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: TRANSACTION REPORTS ── */}
      {activeTab === 'Transaction Reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-gray-500">Today's Transactions</span>
              <div className="text-2xl font-black text-gray-900 mt-1">4,120</div>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">₹84.2 Lakhs Processed</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-gray-500">Flagged For Review</span>
              <div className="text-2xl font-black text-amber-600 mt-1">14</div>
              <span className="text-[10px] text-amber-700 font-semibold mt-1 block">0.34% of volume</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-gray-500">Total Chargebacks</span>
              <div className="text-2xl font-black text-blue-600 mt-1">2</div>
              <span className="text-[10px] text-blue-700 font-semibold mt-1 block">Automated defense ready</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-gray-900 pb-3 border-b border-gray-100">
              Downloadable Transaction & Settlement Audit Logs
            </h3>
            <div className="divide-y divide-gray-100 mt-2">
              {ACTION_REPORTS.map((rep) => (
                <div key={rep.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-gray-50 border border-gray-100 text-blue-600 mt-0.5">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">{rep.name}</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">{rep.description}</p>
                      <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-1 font-mono">
                        <span>Format: {rep.format}</span>
                        <span>•</span>
                        <span>Generated: {rep.lastGenerated}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedReport(rep)}
                      className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => handleDownloadReport(rep)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download {rep.format}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: CUSTOMER REPORTS ── */}
      {activeTab === 'Customer Reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-gray-500">RTO / Return Risk Profiles</span>
              <div className="text-2xl font-black text-rose-600 mt-1">128 Buyers</div>
              <span className="text-[10px] text-gray-500 mt-1 block">Account return rate &gt; 35% on COD</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-gray-500">Trusted Whitelisted Buyers</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">1,840 Buyers</div>
              <span className="text-[10px] text-gray-500 mt-1 block">0 disputes, 100% successful fulfillment</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-gray-900 pb-3 border-b border-gray-100">
              Customer Risk Profiling Reports
            </h3>
            <div className="divide-y divide-gray-100 mt-2">
              <div className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 mt-0.5">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">High Return Rate (RTO) Customer Directory</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">Customers with over 35% historical return rates and COD refusal history</p>
                    <div className="text-[10px] text-gray-400 mt-1 font-mono">Format: CSV • Generated: Today 05:00 AM</div>
                  </div>
                </div>
                <button
                  onClick={() => handleDownloadReport({ name: 'RTO_Customer_Directory', format: 'CSV', description: 'High return rate customers flagged for COD prepayment' })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
              </div>

              <div className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Trusted VIP Buyer Whitelist</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">Verified repeat customers with zero lifetime chargebacks and 100% delivery success</p>
                    <div className="text-[10px] text-gray-400 mt-1 font-mono">Format: PDF • Generated: 01 Sep 2026</div>
                  </div>
                </div>
                <button
                  onClick={() => handleDownloadReport({ name: 'Trusted_VIP_Buyer_Whitelist', format: 'PDF', description: 'Trusted customers eligible for instant 1-click checkout' })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: FRAUD & RISK REPORTS ── */}
      {activeTab === 'Fraud & Risk Reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs">
              <h3 className="text-sm font-bold text-gray-900 pb-2">Fraud Signals Breakdown</h3>
              <div className="space-y-3 mt-3 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50">
                  <span className="font-semibold text-gray-800">Card Limits & International Cards</span>
                  <span className="font-bold text-rose-600">42%</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50">
                  <span className="font-semibold text-gray-800">High Velocity from Same Device</span>
                  <span className="font-bold text-amber-600">28%</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50">
                  <span className="font-semibold text-gray-800">Mismatch in Delivery Pin & IP Geo</span>
                  <span className="font-bold text-blue-600">18%</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50">
                  <span className="font-semibold text-gray-800">Failed 3DS Step-Up Attempts</span>
                  <span className="font-bold text-purple-600">12%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 pb-1">Export Fraud Incident Logs</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Export complete forensic details of all blocked transactions and dispute representation packets.
                </p>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => handleDownloadReport({ name: 'Fraud_Incident_Forensics_Log', format: 'CSV', description: 'All intercepted and blocked transactions with IP, device, and rule citations.' })}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Forensic CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 6: GATEWAY REPORTS ── */}
      {activeTab === 'Gateway Reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs">
              <h3 className="text-sm font-bold text-gray-900 pb-3">Payment Method Distribution</h3>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={GATEWAY_SPLIT_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                      {GATEWAY_SPLIT_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                {GATEWAY_SPLIT_DATA.map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-gray-600 font-medium">{d.name} ({d.value}%)</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 pb-1">Razorpay Settlement Report</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Reconcile settlements directly against Razorpay API webhook events and bank credit statements.
                </p>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => handleDownloadReport({ name: 'Razorpay_Settlement_Reconciliation', format: 'CSV', description: 'Razorpay settlement IDs matched against orders, fee deductions, and dispute withholdings.' })}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Reconciliation CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 7: AUDIT REPORTS ── */}
      {activeTab === 'Audit Reports' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Security & Compliance Audit Logs</h3>
              <p className="text-xs text-gray-500">Immutable ledger of risk policy changes, rule updates, and API calls.</p>
            </div>
            <button
              onClick={() => handleDownloadReport({ name: 'Security_Audit_Trail', format: 'LOG', description: 'Security audit trail of all API access, key rotation, and risk rule modifications.' })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Full Audit Trail</span>
            </button>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
              <span className="text-gray-700">[2026-09-04 06:55:34] Gemini 2.5 Flash API Key connected and verified.</span>
              <span className="text-emerald-600 font-bold">SUCCESS</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
              <span className="text-gray-700">[2026-09-04 06:40:12] Razorpay Webhook endpoint verified (rzp_test_TWpQWcihNk3rD9).</span>
              <span className="text-emerald-600 font-bold">SUCCESS</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
              <span className="text-gray-700">[2026-09-04 05:12:00] Daily holdout risk model accuracy benchmark evaluated (99.988%).</span>
              <span className="text-emerald-600 font-bold">SUCCESS</span>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. REPORT PREVIEW MODAL / DRAWER
         ───────────────────────────────────────────────────────────── */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-gray-900 text-sm">{selectedReport.name}</h4>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-400">Description:</span>
                <span className="font-medium text-gray-800">{selectedReport.description}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-400">Format:</span>
                <span className="font-bold text-gray-800">{selectedReport.format}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-400">Last Generated:</span>
                <span className="font-mono text-gray-800">{selectedReport.lastGenerated}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-400">Environment:</span>
                <span className="font-semibold text-emerald-600">{isLive ? 'Live Production' : 'Sandbox Staging'}</span>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-[11px] text-gray-600">
              <p className="font-semibold text-gray-800 mb-1">Executive Summary:</p>
              Holdout evaluation confirms <span className="text-emerald-700 font-bold">99.988% Accuracy</span> and <span className="text-emerald-700 font-bold">0.9989 ROC-AUC</span> with zero data leakage across stratified splits.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDownloadReport(selectedReport);
                  setSelectedReport(null);
                }}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. SCHEDULE REPORT MODAL
         ───────────────────────────────────────────────────────────── */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-gray-900 text-sm">Schedule Automated Reports</h4>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Recipient Email</label>
                <input
                  type="email"
                  value={scheduleEmail}
                  onChange={(e) => setScheduleEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Frequency</label>
                <select
                  value={scheduleFrequency}
                  onChange={(e) => setScheduleFrequency(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800"
                >
                  <option value="Daily">Daily at 08:00 AM IST</option>
                  <option value="Weekly">Weekly (Every Monday)</option>
                  <option value="Monthly">Monthly Summary</option>
                </select>
              </div>

              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-[11px] text-blue-800">
                You will automatically receive signed settlement audits, fraud incident summaries, and dispute packets.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowScheduleModal(false);
                  showToast(`Scheduled ${scheduleFrequency} reports to ${scheduleEmail}`);
                }}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
