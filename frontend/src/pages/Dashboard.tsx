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
  Globe,
  Radio,
  Sliders,
  Play,
  Layers,
  X,
  Shield,
  Gauge,
  Check,
  AlertOctagon,
  Info,
  Users
} from 'lucide-react';
import { useCustomer, CUSTOMER_REGISTRY, type CustomerProfile } from '../context/CustomerContext';
import { simulationService } from '../services/SimulationService';
import { twinService, type TwinNodeData } from '../services/TwinService';
import { cn } from '../lib/utils';

// ─── Customer Transactions Dataset ───────────────────────────────────────────
const CUSTOMER_TRANSACTIONS_MAP: Record<string, Array<{
  id: string;
  time: string;
  amount: string;
  rawAmount: number;
  gateway: string;
  type: string;
  status: string;
  riskScore: number;
  riskLevel: string;
}>> = {
  'CUST-001': [
    { id: 'TXN-992381', time: '09:18:44 AM', amount: '₹2,45,000', rawAmount: 245000, gateway: 'System A (Corporate Gateway)', type: 'Wire Payment', status: 'Success', riskScore: 28, riskLevel: 'LOW' },
    { id: 'TXN-992380', time: '09:17:32 AM', amount: '₹9,82,000', rawAmount: 982000, gateway: 'System B (Bulk Pay Rail)', type: 'Payout', status: 'Success', riskScore: 36, riskLevel: 'LOW' },
    { id: 'TXN-992379', time: '09:16:05 AM', amount: '₹14,20,000', rawAmount: 1420000, gateway: 'System C (Core Banking)', type: 'Treasury Transfer', status: 'Success', riskScore: 22, riskLevel: 'LOW' },
    { id: 'TXN-992378', time: '09:14:48 AM', amount: '₹12,00,000', rawAmount: 1200000, gateway: 'System D (Card Rail)', type: 'Payment', status: 'Success', riskScore: 30, riskLevel: 'LOW' },
    { id: 'TXN-992377', time: '09:13:21 AM', amount: '₹85,000', rawAmount: 85000, gateway: 'System B (UPI Partner)', type: 'Payment', status: 'Failed', riskScore: 94, riskLevel: 'CRITICAL' },
  ],
  'CUST-002': [
    { id: 'TXN-884102', time: '10:14:02 AM', amount: '₹1,50,000', rawAmount: 150000, gateway: 'UPI Express Rail', type: 'Instant P2P', status: 'Failed', riskScore: 89, riskLevel: 'CRITICAL' },
    { id: 'TXN-884101', time: '10:12:45 AM', amount: '₹89,500', rawAmount: 89500, gateway: 'Credit Card Direct', type: 'Online Purchase', status: 'Success', riskScore: 42, riskLevel: 'MEDIUM' },
    { id: 'TXN-884100', time: '10:08:12 AM', amount: '₹45,000', rawAmount: 45000, gateway: 'NetBanking Portal', type: 'Bill Settlement', status: 'Success', riskScore: 18, riskLevel: 'LOW' },
    { id: 'TXN-884099', time: '09:55:30 AM', amount: '₹12,000', rawAmount: 12000, gateway: 'UPI Express Rail', type: 'Transfer', status: 'Success', riskScore: 15, riskLevel: 'LOW' },
  ],
  'CUST-2048': [
    { id: 'TXN-773190', time: '08:44:12 AM', amount: '₹5,12,000', rawAmount: 512000, gateway: 'SWIFT International', type: 'Cross-Border Wire', status: 'Success', riskScore: 78, riskLevel: 'HIGH' },
    { id: 'TXN-773189', time: '08:30:19 AM', amount: '₹2,10,000', rawAmount: 210000, gateway: 'Corporate ACH Rail', type: 'Vendor Payment', status: 'Success', riskScore: 32, riskLevel: 'LOW' },
    { id: 'TXN-773188', time: '08:15:00 AM', amount: '₹1,85,000', rawAmount: 185000, gateway: 'Customs Clear Rail', type: 'Duty Settlement', status: 'Success', riskScore: 24, riskLevel: 'LOW' },
  ],
  'CUST-004': [
    { id: 'TXN-552011', time: '11:05:14 AM', amount: '₹24,900', rawAmount: 24900, gateway: 'Consumer UPI', type: 'E-commerce Pay', status: 'Success', riskScore: 58, riskLevel: 'MEDIUM' },
    { id: 'TXN-552010', time: '10:48:22 AM', amount: '₹12,500', rawAmount: 12500, gateway: 'Debit Card Rail', type: 'ATM Cash Withdrawal', status: 'Success', riskScore: 12, riskLevel: 'LOW' },
    { id: 'TXN-552009', time: '09:20:00 AM', amount: '₹3,200', rawAmount: 3200, gateway: 'Consumer UPI', type: 'Merchant QR', status: 'Success', riskScore: 8, riskLevel: 'LOW' },
  ],
  'CUST-005': [
    { id: 'TXN-441908', time: '07:50:33 AM', amount: '₹1,85,000', rawAmount: 185000, gateway: 'POS Terminal Rail', type: 'Batch Settlement', status: 'Success', riskScore: 62, riskLevel: 'MEDIUM' },
    { id: 'TXN-441907', time: '07:35:10 AM', amount: '₹62,000', rawAmount: 62000, gateway: 'POS Terminal Rail', type: 'Terminal Sweep', status: 'Success', riskScore: 25, riskLevel: 'LOW' },
  ],
  'CUST-006': [
    { id: 'TXN-330811', time: '11:30:45 AM', amount: '₹6,70,000', rawAmount: 670000, gateway: 'SEPA Cross-Border', type: 'B2B Trade Invoice', status: 'Success', riskScore: 81, riskLevel: 'HIGH' },
    { id: 'TXN-330810', time: '11:02:19 AM', amount: '₹3,40,000', rawAmount: 340000, gateway: 'SWIFT International', type: 'Escrow Release', status: 'Success', riskScore: 48, riskLevel: 'MEDIUM' },
  ]
};

// ─── Customer Activity Feed Dataset ───────────────────────────────────────────
const CUSTOMER_ACTIVITIES_MAP: Record<string, Array<{
  id: string;
  time: string;
  title: string;
  detail: string;
  amount: string | null;
  icon: any;
  iconBg: string;
  badge: { label: string; color: string } | null;
}>> = {
  'CUST-001': [
    { id: 'act-1', time: '09:18 AM', title: 'High-Volume Wire Authorized', detail: 'TXN-992381 | ₹2,45,000 | System A', amount: '₹2,45,000', icon: Building2, iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100', badge: null },
    { id: 'act-2', time: '09:17 AM', title: 'New Admin Login Detected', detail: 'User: treasury@apexmerchant.com', amount: null, icon: User, iconBg: 'bg-blue-50 text-blue-600 border border-blue-100', badge: { label: 'New Device', color: 'bg-blue-50 text-blue-700 border-blue-200' } },
    { id: 'act-3', time: '09:13 AM', title: 'Critical Risk Anomaly Alert', detail: 'High OTP Failure Rate & Stolen Credential Burst', amount: null, icon: AlertTriangle, iconBg: 'bg-rose-50 text-rose-600 border border-rose-100', badge: { label: 'CRITICAL', color: 'bg-rose-50 text-rose-700 border-rose-200' } },
    { id: 'act-4', time: '09:05 AM', title: 'API Key Rotated', detail: 'Production Webhook Secret updated by SecOps', amount: null, icon: Lock, iconBg: 'bg-slate-100 text-slate-600 border border-slate-200', badge: { label: 'Secured', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' } },
  ],
  'CUST-002': [
    { id: 'act-1', time: '10:14 AM', title: 'Failed High-Value Transfer', detail: 'TXN-884102 | ₹1,50,000 | Coordinated OTP Probe', amount: '₹1,50,000', icon: ShieldAlert, iconBg: 'bg-rose-50 text-rose-600 border border-rose-100', badge: { label: 'BLOCKED', color: 'bg-rose-50 text-rose-700 border-rose-200' } },
    { id: 'act-2', time: '10:10 AM', title: 'Multiple Failed Password Attempts', detail: '4 consecutive authentication failures from IP 185.220.101.4', amount: null, icon: Lock, iconBg: 'bg-amber-50 text-amber-600 border border-amber-100', badge: { label: 'WARNING', color: 'bg-amber-50 text-amber-700 border-amber-200' } },
    { id: 'act-3', time: '09:55 AM', title: 'Beneficiary Account Added', detail: 'Account: HDFC-98441022 (Unverified)', amount: null, icon: User, iconBg: 'bg-blue-50 text-blue-600 border border-blue-100', badge: { label: 'Flagged', color: 'bg-amber-50 text-amber-700 border-amber-200' } },
  ],
  'CUST-2048': [
    { id: 'act-1', time: '08:44 AM', title: 'Cross-Border Wire Executed', detail: 'TXN-773190 | ₹5,12,000 | Singapore Node', amount: '₹5,12,000', icon: Globe, iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100', badge: null },
    { id: 'act-2', time: '08:30 AM', title: 'Velocity Spike Flagged', detail: '3 international transfers initiated within 15 minutes', amount: null, icon: Zap, iconBg: 'bg-amber-50 text-amber-600 border border-amber-100', badge: { label: 'VELOCITY', color: 'bg-amber-50 text-amber-700 border-amber-200' } },
  ],
  'CUST-004': [
    { id: 'act-1', time: '11:05 AM', title: 'Merchant Payment Settled', detail: 'TXN-552011 | ₹24,900 | Consumer UPI', amount: '₹24,900', icon: CreditCard, iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100', badge: null },
    { id: 'act-2', time: '10:48 AM', title: 'Behavioral Anomaly Checked', detail: 'ATM Cash Withdrawal out of registered home city', amount: null, icon: MapPin, iconBg: 'bg-blue-50 text-blue-600 border border-blue-100', badge: { label: 'REVIEW', color: 'bg-blue-50 text-blue-700 border-blue-200' } },
  ],
  'CUST-005': [
    { id: 'act-1', time: '07:50 AM', title: 'Terminal Batch Settlement', detail: 'TXN-441908 | ₹1,85,000 | POS Terminal 04', amount: '₹1,85,000', icon: Server, iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100', badge: null },
  ],
  'CUST-006': [
    { id: 'act-1', time: '11:30 AM', title: 'Trade Invoice Payment Cleared', detail: 'TXN-330811 | ₹6,70,000 | SEPA Gateway', amount: '₹6,70,000', icon: Building2, iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100', badge: null },
    { id: 'act-2', time: '11:00 AM', title: 'Compliance Document Uploaded', detail: 'EUR Transfer Proof & Customs Declaration', amount: null, icon: FileText, iconBg: 'bg-slate-100 text-slate-600 border border-slate-200', badge: { label: 'VERIFIED', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' } },
  ]
};

// ─── Simulation Scenarios Config ──────────────────────────────────────────────
const SCENARIOS = [
  { key: 'fraud_spike', label: 'Fraud Spike', icon: ShieldAlert, color: 'text-rose-600 bg-rose-50 border-rose-200', desc: 'Sudden burst in fraudulent transactions targeting Risk Engine' },
  { key: 'coordinated', label: 'Coordinated Attack', icon: Users, color: 'text-amber-600 bg-amber-50 border-amber-200', desc: 'Distributed syndicate probing Gateway & Auth Service' },
  { key: 'velocity', label: 'High Velocity', icon: Zap, color: 'text-sky-600 bg-sky-50 border-sky-200', desc: 'Abnormally fast TPS burst across payment rails' },
  { key: 'behavioral', label: 'Behavioral Anomaly', icon: Radio, color: 'text-purple-600 bg-purple-50 border-purple-200', desc: 'Unusual customer device & location signature' },
  { key: 'normal', label: 'Normal Baseline', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-200', desc: 'Healthy payment system traffic with low risk' }
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { customerId: paramId } = useParams();
  const { selectedCustomer, selectCustomer } = useCustomer();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active customer identity
  const custId = paramId || selectedCustomer?.id || 'CUST-001';
  const custProfile: CustomerProfile = selectedCustomer && selectedCustomer.id === custId
    ? selectedCustomer
    : CUSTOMER_REGISTRY[custId] || {
        id: custId,
        name: `Customer Account ${custId}`,
        email: `treasury.${custId.toLowerCase()}@kryptic-network.com`,
        accountType: 'Enterprise Account',
        riskScore: 85,
        riskLevel: 'HIGH',
        activeCards: 3,
        totalTransactions: 620,
        totalVolume: 450000,
        joinedDate: '12 Jan 2025',
        status: 'FLAGGED',
        location: 'Mumbai, India',
        defaultScenario: 'fraud_spike'
      };

  // Simulation state inside Customer Dashboard
  const [activeScenario, setActiveScenario] = useState<string>(
    custProfile.defaultScenario || 'fraud_spike'
  );
  const [selectedNode, setSelectedNode] = useState<TwinNodeData | null>(null);
  const [isNodeModalOpen, setIsNodeModalOpen] = useState<boolean>(false);
  const [simRunning, setSimRunning] = useState<boolean>(true);

  // Auto-sync scenario when customer changes
  useEffect(() => {
    if (custProfile.defaultScenario) {
      setActiveScenario(custProfile.defaultScenario);
    }
  }, [custId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Compute node topology for current scenario and customer
  const isAnomalousScenario = activeScenario !== 'normal';
  const rawNodes = twinService.getDefaultNodes(activeScenario, isAnomalousScenario);

  // Customize nodes slightly for specific customer profile
  const nodes = rawNodes.map(n => {
    if (n.key === 'risk') {
      return {
        ...n,
        risk: Math.max(n.risk, custProfile.riskScore),
        status: custProfile.riskLevel === 'CRITICAL' ? 'anomalous' as const : n.status
      };
    }
    return n;
  });

  const timelineMetrics = simulationService.getTimelineForScenario(activeScenario, isAnomalousScenario);

  // Customer specific recent transactions & activities
  const recentTransactions = CUSTOMER_TRANSACTIONS_MAP[custId] || CUSTOMER_TRANSACTIONS_MAP['CUST-001'];
  const activityFeed = CUSTOMER_ACTIVITIES_MAP[custId] || CUSTOMER_ACTIVITIES_MAP['CUST-001'];

  const handleNodeClick = (node: TwinNodeData) => {
    setSelectedNode(node);
    setIsNodeModalOpen(true);
  };

  return (
    <div className="w-full max-w-none space-y-6 pb-12 text-slate-800 antialiased font-sans px-0">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 backdrop-blur-md text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-5 border border-slate-700/80">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Node Inspector Telemetry Modal */}
      {isNodeModalOpen && selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className={cn(
                  "w-3 h-3 rounded-full animate-pulse",
                  selectedNode.status === 'anomalous' ? "bg-rose-500 shadow-rose-200" :
                  selectedNode.status === 'warning' ? "bg-amber-500" : "bg-emerald-500"
                )} />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{selectedNode.name}</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{selectedNode.layer} LAYER • {selectedNode.key}</p>
                </div>
              </div>
              <button onClick={() => setIsNodeModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-200/60 text-slate-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Live Throughput</span>
                  <span className="text-base font-black text-slate-900 font-mono mt-0.5 block">{selectedNode.tps.toFixed(1)}K TPS</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Risk Score</span>
                  <span className={cn(
                    "text-base font-black font-mono mt-0.5 block",
                    selectedNode.risk > 50 ? "text-rose-600" : "text-emerald-600"
                  )}>{selectedNode.risk.toFixed(1)}%</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Avg Latency</span>
                  <span className="text-base font-bold text-slate-800 font-mono mt-0.5 block">{selectedNode.latencyMs} ms</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Error Rate</span>
                  <span className="text-base font-bold text-slate-800 font-mono mt-0.5 block">{(selectedNode.errorRate * 100).toFixed(2)}%</span>
                </div>
              </div>

              {selectedNode.details?.lastAnomalyDetected && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-rose-900">
                  <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs mb-1">
                    <AlertOctagon className="w-4 h-4 text-rose-600" />
                    <span>Active Anomaly Signature</span>
                  </div>
                  <p className="text-xs text-rose-800 leading-relaxed font-medium">
                    {selectedNode.details.lastAnomalyDetected}
                  </p>
                </div>
              )}

              {/* Node Telemetry Metadata */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">System Uptime:</span>
                  <span className="font-bold text-slate-800">{selectedNode.details?.uptime || '99.99%'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Peak Throughput:</span>
                  <span className="font-bold text-slate-800">{selectedNode.details?.throughputPeak || '18.5K'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Active Security Rules:</span>
                  <span className="font-bold text-slate-800">{selectedNode.details?.activeRuleCount || 24} Rules Active</span>
                </div>
              </div>

              {/* Node Emergency Actions */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Node Mitigations</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      showToast(`Node ${selectedNode.name} throughput throttled by 50%`);
                      setIsNodeModalOpen(false);
                    }}
                    className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-[11px] rounded-xl border border-amber-200 transition-colors"
                  >
                    Throttle Node TPS
                  </button>
                  <button
                    onClick={() => {
                      showToast(`Node ${selectedNode.name} traffic rail isolated for inspection`);
                      setIsNodeModalOpen(false);
                    }}
                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] rounded-xl border border-rose-200 transition-colors"
                  >
                    Isolate Traffic Rail
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. EXECUTIVE TOP CONTROL BAR
         ───────────────────────────────────────────────────────────── */}
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => showToast('Command Navigation Drawer Toggled')}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.04)] shrink-0 cursor-pointer"
          >
            <Menu className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Customer Command & Digital Twin</span>
              <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full font-bold">
                {custId}
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Isolated Digital Twin Simulation & Live Risk Telemetry for {custProfile.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Customer Switcher Pills */}
          <div className="flex items-center gap-1 bg-white border border-slate-200/90 rounded-full p-1 shadow-2xs overflow-x-auto">
            {Object.keys(CUSTOMER_REGISTRY).map(id => (
              <button
                key={id}
                onClick={() => selectCustomer(id, { targetPath: `/customer/${id}/dashboard` })}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer",
                  id === custId
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                {id}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200/90 rounded-full text-xs font-medium text-slate-600 shadow-[0_1px_2px_rgba(0,0,0,0.03)] shrink-0">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Real-time Active</span>
          </div>

          <button
            onClick={() => navigate('/admin/alerts')}
            className="w-8.5 h-8.5 rounded-full bg-white border border-slate-200/90 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 relative transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)] shrink-0 cursor-pointer"
            title="Return to Alerts Command Center"
          >
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. BREADCRUMB & ACTION BUTTONS BAR
         ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="hover:text-slate-900 transition-colors cursor-pointer" onClick={() => navigate('/admin/alerts')}>
            Alerts & Emergency
          </span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded-md">
            Customer Dashboard ({custId})
          </span>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => navigate(`/customer/${custId}/twin`)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 shadow-sm transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            <span>Full Screen Twin Lab →</span>
          </button>

          <button
            onClick={() => showToast(`Generating risk dossier PDF for ${custProfile.name}`)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Risk Report</span>
          </button>

          <button
            onClick={() => showToast(`Case desk opened for ${custProfile.name}`)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <span>Create Defense Case</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. CUSTOMER PROFILE & RISK OVERVIEW CARD
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.04)] transition-all duration-200 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Customer Identity */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
              {custProfile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{custProfile.name}</h2>
              <span className={cn(
                "px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                custProfile.status === 'FLAGGED' ? "bg-rose-50 text-rose-700 border-rose-200" :
                custProfile.status === 'FROZEN' ? "bg-slate-100 text-slate-700 border-slate-300" :
                "bg-emerald-50 text-emerald-700 border-emerald-200"
              )}>
                {custProfile.status}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3.5 text-xs text-slate-500 flex-wrap pt-0.5">
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              {custProfile.accountType}
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {custProfile.email}
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {custProfile.location || 'Mumbai, India'}
            </span>
          </div>
        </div>

        {/* Risk Score Gauge & Sparkline */}
        <div className={cn(
          "lg:col-span-4 rounded-2xl p-4.5 flex items-center justify-between gap-4 border",
          custProfile.riskScore > 75 ? "bg-rose-50/60 border-rose-200" :
          custProfile.riskScore > 50 ? "bg-amber-50/60 border-amber-200" :
          "bg-emerald-50/60 border-emerald-200"
        )}>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Customer Risk Score
            </span>
            <div className={cn(
              "text-3xl font-black tracking-tight mt-0.5",
              custProfile.riskScore > 75 ? "text-rose-600" :
              custProfile.riskScore > 50 ? "text-amber-600" : "text-emerald-600"
            )}>
              {custProfile.riskScore}/100
            </div>
            <span className={cn(
              "px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider mt-2 inline-block border",
              custProfile.riskLevel === 'CRITICAL' ? "bg-rose-100 text-rose-700 border-rose-300" :
              custProfile.riskLevel === 'HIGH' ? "bg-orange-100 text-orange-700 border-orange-300" :
              custProfile.riskLevel === 'MEDIUM' ? "bg-amber-100 text-amber-700 border-amber-300" :
              "bg-emerald-100 text-emerald-700 border-emerald-300"
            )}>
              {custProfile.riskLevel}
            </span>
          </div>

          <div className="w-36 h-14 relative">
            <svg viewBox="0 0 140 45" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="riskAreaGradCust" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={custProfile.riskScore > 75 ? "#EF4444" : "#F59E0B"} stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M 5,36 Q 30,32 55,34 T 90,20 T 115,12 T 135,4 L 135,45 L 5,45 Z" fill="url(#riskAreaGradCust)" />
              <path d="M 5,36 Q 30,32 55,34 T 90,20 T 115,12 T 135,4" fill="none" stroke={custProfile.riskScore > 75 ? "#EF4444" : "#F59E0B"} strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="135" cy="4" r="4" fill={custProfile.riskScore > 75 ? "#EF4444" : "#F59E0B"} className="animate-ping opacity-75" />
              <circle cx="135" cy="4" r="3.5" fill={custProfile.riskScore > 75 ? "#EF4444" : "#F59E0B"} stroke="#FFFFFF" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* Metadata Column */}
        <div className="lg:col-span-3 space-y-2.5 text-xs border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-6 pt-4 lg:pt-0">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Customer ID</span>
            <span className="font-bold text-slate-900 font-mono">{custProfile.id}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">KYC Verification</span>
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              <span>Verified</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Active Cards / Accounts</span>
            <span className="font-bold text-slate-900">{custProfile.activeCards} Active</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Member Since</span>
            <span className="font-bold text-slate-900 font-mono">{custProfile.joinedDate}</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. 6 KPI METRIC CARDS FOR CUSTOMER
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.04)] transition-all duration-200">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CreditCard className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-600">Total Transactions</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">{custProfile.totalTransactions.toLocaleString()}</div>
            <div className="mt-1 text-[11px] font-semibold text-emerald-600">8.4% ↗</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.04)] transition-all duration-200">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <IndianRupee className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-600">Total Volume</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">₹{custProfile.totalVolume.toLocaleString()}</div>
            <div className="mt-1 text-[11px] font-semibold text-emerald-600">12.2% ↗</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.04)] transition-all duration-200">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-600">Active Rails</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">5 Nodes</div>
            <div className="mt-1 text-[11px] text-slate-400">Isolated Twin</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.04)] transition-all duration-200">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-600">Events Logged</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">312</div>
            <div className="mt-1 text-[11px] font-semibold text-emerald-600">6.1% ↗</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.04)] transition-all duration-200">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600 border border-orange-100">
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-600">Active Cases</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">{custProfile.riskLevel === 'CRITICAL' ? 3 : 1}</div>
            <div className="mt-1 text-[11px] font-semibold text-rose-600">Under Review</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.04)] transition-all duration-200">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-600">Fraud Alerts</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-600 tracking-tight">{custProfile.riskLevel === 'CRITICAL' ? 14 : 3}</div>
            <div className="mt-1 text-[11px] font-semibold text-rose-600">Action Needed</div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. CUSTOMER DIGITAL TWIN SIMULATION LAB (EMBEDDED VISUAL CANVAS)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-6">
        {/* Lab Header & Scenario Control Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <Layers className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Simulation Digital Twin Lab</span>
                  <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Interactive Network Node Canvas
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visualizing node telemetry, payment rails, and attack vectors for <strong>{custProfile.name}</strong> ({custId})
                </p>
              </div>
            </div>
          </div>

          {/* Scenario Selector Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl overflow-x-auto">
            {SCENARIOS.map(sc => {
              const Icon = sc.icon;
              const isActive = activeScenario === sc.key;
              return (
                <button
                  key={sc.key}
                  onClick={() => {
                    setActiveScenario(sc.key);
                    showToast(`Switched simulation scenario to ${sc.label} for ${custId}`);
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                    isActive
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  )}
                  title={sc.desc}
                >
                  <Icon className={cn("w-3.5 h-3.5", isActive ? "text-blue-600" : "text-slate-400")} />
                  <span>{sc.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Visual Network Topology Canvas */}
        <div className="bg-slate-50/80 rounded-2xl p-6 relative overflow-hidden text-slate-800 min-h-[360px] flex flex-col justify-between border border-slate-200/90 shadow-2xs">
          {/* Network Grid Overlay Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] opacity-60 pointer-events-none" />

          {/* Canvas Top Bar */}
          <div className="relative z-10 flex items-center justify-between text-xs border-b border-slate-200/80 pb-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                Target: <span className="text-slate-900 font-bold">{custProfile.name}</span>
              </span>
              <span className="text-slate-300">|</span>
              <span className="font-mono text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                Active Pattern: <span className="text-amber-600 font-bold">{SCENARIOS.find(s => s.key === activeScenario)?.label}</span>
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Healthy
              </span>
              <span className="flex items-center gap-1.5 text-amber-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Warning
              </span>
              <span className="flex items-center gap-1.5 text-rose-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> Anomalous / Attack Target
              </span>
            </div>
          </div>

          {/* 7 Network System Nodes Topology Graph */}
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 my-6 items-center">
            {nodes.map((node) => {
              const isAnomalous = node.status === 'anomalous';
              const isWarning = node.status === 'warning';
              return (
                <div
                  key={node.key}
                  onClick={() => handleNodeClick(node)}
                  className={cn(
                    "relative bg-white border rounded-2xl p-3.5 text-center flex flex-col justify-between cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md group select-none shadow-2xs",
                    isAnomalous
                      ? "border-rose-400 bg-rose-50/70 ring-2 ring-rose-200"
                      : isWarning
                      ? "border-amber-400 bg-amber-50/70 ring-2 ring-amber-200"
                      : "border-slate-200/90 hover:border-blue-500/80"
                  )}
                >
                  {/* Top Status & Pulsing Beacon */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-bold font-mono uppercase text-slate-400 tracking-wider truncate">
                      {node.layer}
                    </span>
                    <span className={cn(
                      "w-2.5 h-2.5 rounded-full shrink-0",
                      isAnomalous ? "bg-rose-500 animate-ping" :
                      isWarning ? "bg-amber-500" : "bg-emerald-500"
                    )} />
                  </div>

                  {/* Node Name */}
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight min-h-[28px] flex items-center justify-center">
                    {node.name}
                  </h4>

                  {/* Node Telemetry Details */}
                  <div className="mt-3 space-y-1 text-[10px] font-mono border-t border-slate-100 pt-2">
                    <div className="flex justify-between text-slate-500">
                      <span>TPS</span>
                      <span className="text-slate-900 font-bold">{node.tps.toFixed(1)}K</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Risk</span>
                      <span className={cn(
                        "font-black",
                        isAnomalous ? "text-rose-600" : isWarning ? "text-amber-600" : "text-emerald-600"
                      )}>
                        {node.risk.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Hover Inspect Tooltip */}
                  <div className="mt-2 text-[9px] text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to Inspect →
                  </div>
                </div>
              );
            })}
          </div>

          {/* Canvas Bottom Live Data Stream Bar */}
          <div className="relative z-10 border-t border-slate-200/80 pt-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 text-[11px] font-mono text-slate-600 font-medium">
              <span>Detection Rate: <strong className="text-emerald-700 font-bold">96.4%</strong></span>
              <span>Avg Latency: <strong className="text-slate-900 font-bold">185ms</strong></span>
              <span>False Positives: <strong className="text-slate-700 font-bold">0.8%</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">Simulating live payment traffic...</span>
              <button
                onClick={() => navigate(`/customer/${custId}/twin`)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-xl transition-colors cursor-pointer shadow-2xs"
              >
                Inspect in 3D Twin Engine
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          6. BOTTOM ROW: RECENT TRANSACTIONS & CUSTOMER ACTIVITY FEED
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Recent Transactions Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 lg:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Recent Customer Transactions</h3>
              <button
                onClick={() => navigate(`/customer/${custId}/payments`)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
              >
                View All →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase">
                    <th className="py-2.5 font-semibold">Time</th>
                    <th className="py-2.5 font-semibold">Transaction ID</th>
                    <th className="py-2.5 font-semibold">Amount</th>
                    <th className="py-2.5 font-semibold">Gateway / Rail</th>
                    <th className="py-2.5 font-semibold">Status</th>
                    <th className="py-2.5 font-semibold text-right">Risk Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium">
                  {recentTransactions.map((tx) => (
                    <tr
                      key={tx.id}
                      onClick={() => showToast(`Selected transaction ${tx.id} for ${custProfile.name}`)}
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
                      <td className="py-3 whitespace-nowrap">
                        <span className={cn(
                          "font-bold text-[11px]",
                          tx.status === 'Success' ? "text-emerald-600" : "text-rose-600"
                        )}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 whitespace-nowrap text-right">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            tx.riskLevel === 'CRITICAL' || tx.riskLevel === 'HIGH' ? "bg-rose-500" : "bg-emerald-500"
                          )} />
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
              <span>View Full Payment History for {custId}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Right: Customer Activity Timeline */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 lg:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Customer Audit Log</h3>
              <button
                onClick={() => navigate(`/customer/${custId}/alerts`)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
              >
                View Alerts →
              </button>
            </div>

            <div className="relative pl-4 space-y-4 pt-3">
              <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-200 pointer-events-none" />

              {activityFeed.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className="relative flex items-start gap-3 text-xs">
                    <span className="text-[10px] font-mono text-slate-400 w-14 shrink-0 pt-0.5">
                      {item.time}
                    </span>

                    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center z-10 shrink-0 shadow-2xs", item.iconBg)}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex-1 flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-900 text-[11px] leading-tight">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{item.detail}</div>
                      </div>

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
              <span>View Security Logs</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
