import React, { useState, useMemo, useCallback } from 'react';
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
  BarChart, Bar
} from 'recharts';
import {
  Calendar, Save, Activity, Filter, X, Search, ChevronDown,
  ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown,
  ShieldAlert, ShieldCheck, Shield, AlertTriangle, Download,
  TrendingUp, Users, CreditCard, Zap, Loader2
} from 'lucide-react';
import { ALL_TRANSACTIONS } from '../data/payment/mockData';
import type { Transaction, ClusterLabel, Channel } from '../data/payment/mockData';
import {
  filterTransactions, getOverviewMetrics, getHourlyData, detectSpikes,
  getChannelDistribution, getClusterStats, getOTPStats,
  getRiskDistribution, getExplanation, formatINR, formatTime,
  type FilterState, type SpikeAlert, type HourlyBucket,
} from '../services/payment/PaymentService';
import { useCustomer } from '../context/CustomerContext';

// ─── Types ────────────────────────────────────────────────────────
type Tab = 'overview' | 'transactions' | 'clusters' | 'otp' | 'risk';
type SortField = 'timestamp' | 'amount' | 'riskScore';
type SortDir = 'asc' | 'desc';

// ─── Color maps ───────────────────────────────────────────────────
const RISK_COLORS = { Low: '#10B981', Medium: '#F59E0B', High: '#EF4444' };
const STATUS_COLORS: Record<string, string> = {
  Completed: 'bg-emerald-100 text-emerald-700',
  Pending: 'bg-amber-100 text-amber-700',
  Failed: 'bg-rose-100 text-rose-700',
  Blocked: 'bg-red-100 text-red-800',
};
const CLUSTER_RISK_COLORS: Record<string, string> = {
  High: 'bg-rose-100 text-rose-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low: 'bg-emerald-100 text-emerald-700',
};
const CHANNEL_COLORS: Record<Channel, string> = {
  UPI: '#557CFF', Card: '#10B981', 'Net Banking': '#8B5CF6', Wallet: '#F59E0B', Others: '#94a3b8',
};

const DEFAULT_FILTER: FilterState = {
  volumeRanges: ['100–1K'],
  amountMin: '', amountMax: '',
  transactionTypes: [], channels: [],
  authentication: 'all', riskLevel: 'all',
  cluster: 'all', search: '',
};

const VOLUME_RANGES = ['< 100', '100–1K', '1K–10K', '10K–1L', '> 1L'];
const TXN_TYPES = ['Food Order','Shopping','Bill Payment','Money Transfer','Fuel','Electronics','Subscription','Travel','Other'];
const CHANNELS: Channel[] = ['UPI','Card','Net Banking','Wallet','Others'];
const CLUSTER_LABELS: ClusterLabel[] = ['OTP High Velocity','Large Volume Entities','New Device + New Location','Low Volume Stable','Card Not Present','Normal'];

const PAGE_SIZE_OPTIONS = [10, 25, 50];

// ─── Shared helpers ───────────────────────────────────────────────
function RiskBadge({ level, score }: { level: string; score?: number }) {
  const colors = level === 'High' ? 'bg-rose-100 text-rose-700'
    : level === 'Medium' ? 'bg-amber-100 text-amber-700'
    : 'bg-emerald-100 text-emerald-700';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${colors}`}>
      {level === 'High' ? <ShieldAlert size={10}/> : level === 'Medium' ? <Shield size={10}/> : <ShieldCheck size={10}/>}
      {score !== undefined ? score : level}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600';
  return <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-semibold ${cls}`}>{status}</span>;
}

// ─── Spike Tooltip ────────────────────────────────────────────────
function SpikeTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const actual   = payload.find((p: any) => p.dataKey === 'actual')?.value ?? 0;
  const baseline = payload.find((p: any) => p.dataKey === 'baseline')?.value ?? 0;
  const dev = baseline > 0 ? Math.round(((actual - baseline) / baseline) * 100) : 0;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-xs min-w-[170px]">
      <div className="font-bold text-gray-800 mb-1.5">{label}</div>
      <div className="flex justify-between gap-4 text-gray-600">
        <span>Actual</span><span className="font-semibold text-[#557CFF]">{actual} txns</span>
      </div>
      <div className="flex justify-between gap-4 text-gray-600">
        <span>Expected</span><span className="font-semibold text-gray-500">{baseline} txns</span>
      </div>
      {dev > 0 && (
        <div className="flex justify-between gap-4 mt-1 pt-1 border-t border-gray-100">
          <span className="text-rose-500 font-semibold">Deviation</span>
          <span className="text-rose-600 font-bold">+{dev}%</span>
        </div>
      )}
    </div>
  );
}

// ─── Transaction Detail Modal ─────────────────────────────────────
function TransactionDetail({ txn, onClose }: { txn: Transaction; onClose: () => void }) {
  const expl = useMemo(() => getExplanation(txn), [txn]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-[480px] h-full bg-white shadow-2xl overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
          <div>
            <div className="text-[15px] font-bold text-gray-900">{txn.id}</div>
            <div className="text-[12px] text-gray-400 font-mono">{formatTime(txn.timestamp)}</div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={16}/></button>
        </div>

        <div className="p-5 space-y-5 flex-1">
          {/* Risk summary */}
          <div className={`rounded-xl p-4 ${txn.riskLevel === 'High' ? 'bg-rose-50 border border-rose-200' : txn.riskLevel === 'Medium' ? 'bg-amber-50 border border-amber-200' : 'bg-emerald-50 border border-emerald-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[12px] font-medium text-gray-500">Risk Score</div>
                <div className="text-[28px] font-black text-gray-900">{txn.riskScore}<span className="text-[14px] text-gray-400">/100</span></div>
              </div>
              <RiskBadge level={txn.riskLevel} />
            </div>
            <p className="text-[12.5px] text-gray-600 mt-2 leading-snug">{expl.summary}</p>
          </div>

          {/* Transaction info */}
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Transaction Information</div>
            <div className="space-y-1.5">
              {[
                ['Entity ID', txn.entityId],
                ['Type', txn.type],
                ['Channel', txn.channel],
                ['Amount', `₹${txn.amount.toLocaleString('en-IN')}`],
                ['Location', txn.location],
                ['Device', txn.device],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-[12.5px]">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-medium text-gray-800">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Auth info */}
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Authentication</div>
            <div className="space-y-1.5 text-[12.5px]">
              <div className="flex justify-between"><span className="text-gray-500">Method</span><span className="font-medium">{txn.authentication}</span></div>
              {txn.otpStatus && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-500">OTP Status</span>
                    <span className={`font-semibold ${txn.otpStatus === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>{txn.otpStatus}</span>
                  </div>
                  {txn.otpRetryCount > 0 && <div className="flex justify-between"><span className="text-gray-500">Retry Count</span><span className="font-medium text-rose-600">{txn.otpRetryCount}</span></div>}
                </>
              )}
            </div>
          </div>

          {/* Behavioral signals */}
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Behavioral Signals</div>
            <div className="space-y-2">
              {[
                { label: 'New Device', val: txn.isNewDevice, risk: true },
                { label: 'New Location', val: txn.isNewLocation, risk: true },
                { label: 'Off-hours', val: txn.hour < 6 || txn.hour >= 22, risk: true },
                { label: 'High Velocity', val: txn.velocity > 15, risk: true },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between text-[12.5px]">
                  <span className="text-gray-600">{s.label}</span>
                  <span className={`font-semibold ${s.val && s.risk ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {s.val ? (s.risk ? '⚠ Yes' : 'Yes') : '✓ No'}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between text-[12.5px]">
                <span className="text-gray-600">Velocity</span>
                <span className={`font-semibold ${txn.velocity > 15 ? 'text-rose-600' : 'text-gray-800'}`}>{txn.velocity} txns/hr</span>
              </div>
            </div>
          </div>

          {/* SHAP-like explanation */}
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Key Risk Factors</div>
            <div className="space-y-2.5">
              {expl.factors.map((f, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-medium text-gray-700">{f.label}</span>
                    <span className={`text-[11px] font-bold ${f.direction === 'increases' ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {f.direction === 'increases' ? '↑ Increases Risk' : '↓ Decreases Risk'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${f.direction === 'increases' ? 'bg-rose-400' : 'bg-emerald-400'}`}
                      style={{ width: `${Math.round(f.weight * 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10.5px] text-gray-400">
                    <span>Actual: {f.actual}</span>
                    <span>Baseline: {f.baseline}</span>
                    <span className={f.direction === 'increases' ? 'text-rose-500' : 'text-emerald-500'}>{f.deviation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Transaction Table ────────────────────────────────────────────
function TransactionTable({
  txns, onSelect, spikeHours,
}: {
  txns: Transaction[]; onSelect: (t: Transaction) => void; spikeHours?: Set<number>;
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const sorted = useMemo(() => {
    return [...txns].sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1;
      if (sortField === 'timestamp') return (a.timestamp - b.timestamp) * mul;
      if (sortField === 'amount')    return (a.amount - b.amount) * mul;
      if (sortField === 'riskScore') return (a.riskScore - b.riskScore) * mul;
      return 0;
    });
  }, [txns, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (f: SortField) => {
    if (sortField === f) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(f); setSortDir('desc'); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="text-gray-300"/>;
    return sortDir === 'asc' ? <ArrowUp size={12} className="text-[#557CFF]"/> : <ArrowDown size={12} className="text-[#557CFF]"/>;
  };

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="border-b border-gray-100">
              {[
                { label: 'Time', field: 'timestamp' as SortField },
                { label: 'Txn ID', field: null },
                { label: 'Entity ID', field: null },
                { label: 'Type', field: null },
                { label: 'Channel', field: null },
                { label: 'Amount (₹)', field: 'amount' as SortField },
                { label: 'Auth', field: null },
                { label: 'Location', field: null },
                { label: 'Risk Score', field: 'riskScore' as SortField },
                { label: 'Status', field: null },
              ].map(col => (
                <th
                  key={col.label}
                  onClick={() => col.field && toggleSort(col.field)}
                  className={`text-left py-2.5 px-3 text-[11px] font-semibold text-gray-500 whitespace-nowrap ${col.field ? 'cursor-pointer hover:text-gray-700' : ''}`}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.field && <SortIcon field={col.field} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map(t => (
              <tr
                key={t.id}
                onClick={() => onSelect(t)}
                className={`border-b border-gray-50 hover:bg-blue-50/50 cursor-pointer transition-colors ${spikeHours?.has(t.hour) ? 'bg-rose-50/30' : ''}`}
              >
                <td className="py-2 px-3 font-mono text-gray-500 whitespace-nowrap">{`${String(t.hour).padStart(2,'0')}:${String(t.minute).padStart(2,'0')}`}</td>
                <td className="py-2 px-3 font-mono text-[#557CFF] whitespace-nowrap">{t.id}</td>
                <td className="py-2 px-3 font-mono text-[#557CFF] whitespace-nowrap">{t.entityId}</td>
                <td className="py-2 px-3 text-gray-700 whitespace-nowrap">{t.type}</td>
                <td className="py-2 px-3 text-gray-600 whitespace-nowrap">{t.channel}</td>
                <td className="py-2 px-3 font-semibold text-gray-800 whitespace-nowrap">{t.amount.toLocaleString('en-IN')}</td>
                <td className="py-2 px-3 text-gray-600 whitespace-nowrap">
                  {t.authentication}
                  {t.otpStatus && t.otpStatus !== 'success' && (
                    <span className="ml-1 text-rose-500 text-[10px]">({t.otpStatus})</span>
                  )}
                </td>
                <td className="py-2 px-3 text-gray-600 whitespace-nowrap">{t.location}</td>
                <td className="py-2 px-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${t.riskScore}%`, backgroundColor: RISK_COLORS[t.riskLevel] }}
                      />
                    </div>
                    <span className="font-semibold" style={{ color: RISK_COLORS[t.riskLevel] }}>{t.riskScore}</span>
                  </div>
                </td>
                <td className="py-2 px-3 whitespace-nowrap"><StatusBadge status={t.status}/></td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr><td colSpan={10} className="py-10 text-center text-gray-400 text-[13px]">No transactions match the current filters</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-3 py-2.5 border-t border-gray-100 mt-1">
        <span className="text-[11.5px] text-gray-500">
          Showing {Math.min((page-1)*pageSize+1, sorted.length)}–{Math.min(page*pageSize, sorted.length)} of {sorted.length.toLocaleString()} transactions
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[11.5px] text-gray-500">Rows per page:</span>
          <select
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="text-[11.5px] border border-gray-200 rounded px-1.5 py-1 text-gray-700"
          >
            {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30">
            <ChevronLeft size={14}/>
          </button>
          {Array.from({length: Math.min(5, totalPages)}, (_, i) => {
            let p = page <= 3 ? i+1 : page + i - 2;
            if (p > totalPages) return null;
            return (
              <button key={p} onClick={() => setPage(p)}
                className={`w-7 h-7 rounded text-[11.5px] font-medium ${p === page ? 'bg-[#557CFF] text-white' : 'hover:bg-gray-100 text-gray-600'}`}
              >{p}</button>
            );
          })}
          <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30">
            <ChevronRight size={14}/>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── OVERVIEW TAB ─────────────────────────────────────────────────
function OverviewTab({
  filteredTxns, hourlyData, spikes, onSelectTransaction, onSelectCluster, onSelectSpike, spikeHours,
}: {
  filteredTxns: Transaction[];
  hourlyData: HourlyBucket[];
  spikes: SpikeAlert[];
  onSelectTransaction: (t: Transaction) => void;
  onSelectCluster: (label: ClusterLabel) => void;
  onSelectSpike: (hour: number) => void;
  spikeHours: Set<number>;
}) {
  const [tableTab, setTableTab] = useState<'all'|'highrisk'|'spikes'|'otp'|'clusters'>('all');
  const metrics = useMemo(() => getOverviewMetrics(filteredTxns), [filteredTxns]);
  const channelData = useMemo(() => getChannelDistribution(filteredTxns), [filteredTxns]);
  const clusterStats = useMemo(() => getClusterStats(filteredTxns), [filteredTxns]);

  const tableTxns = useMemo(() => {
    if (tableTab === 'highrisk') return filteredTxns.filter(t => t.riskLevel === 'High');
    if (tableTab === 'spikes') return filteredTxns.filter(t => spikeHours.has(t.hour));
    if (tableTab === 'otp') return filteredTxns.filter(t => t.authentication === 'OTP' || t.authentication === '3DS');
    return filteredTxns;
  }, [filteredTxns, tableTab, spikeHours]);

  return (
    <div className="space-y-5">
      {/* Metric cards */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'Total Transactions', value: metrics.totalTransactions.toLocaleString(), sub: '+12.6% vs yesterday', icon: Activity, color: 'text-[#557CFF]', bg: 'bg-blue-50' },
          { label: 'Total Amount', value: formatINR(metrics.totalAmount), sub: '+18.3% vs yesterday', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'High Risk Transactions', value: `${metrics.highRiskCount} (${metrics.highRiskPct.toFixed(1)}%)`, sub: '+9.2% vs yesterday', icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Spike Alerts', value: String(metrics.spikeAlertCount), sub: 'View Details', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50', isLink: true },
          { label: 'Blocked Transactions', value: String(metrics.blockedCount), sub: '+2 vs yesterday', icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((m, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${m.bg}`}>
                <m.icon size={14} className={m.color}/>
              </div>
              <span className="text-[11px] font-medium text-gray-500">{m.label}</span>
            </div>
            <div className="text-[20px] font-black text-gray-900">{m.value}</div>
            <div className={`text-[11px] mt-0.5 ${m.isLink ? 'text-[#557CFF] cursor-pointer hover:underline' : 'text-gray-400'}`}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Spike graph */}
        <div className="col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[13.5px] font-bold text-gray-800">Transaction Volume Over Time</div>
            <div className="flex items-center gap-1">
              {['1H','6H','1D','7D'].map(t => (
                <button key={t} className={`px-2 py-1 text-[11px] rounded font-medium ${t === '1D' ? 'bg-[#557CFF] text-white' : 'text-gray-500 hover:bg-gray-100'}`}>{t}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4 mb-3 text-[11px]">
            <div className="flex items-center gap-1.5"><div className="w-6 h-0.5 bg-[#557CFF]"/><span className="text-gray-500">Actual Transactions</span></div>
            <div className="flex items-center gap-1.5"><div className="w-6 h-0.5 bg-gray-400 border-dashed border-t-2"/><span className="text-gray-500">Baseline (Expected)</span></div>
            <div className="flex items-center gap-1.5"><div className="w-4 h-3 bg-rose-200 rounded-sm opacity-70"/><span className="text-gray-500">Spike Range</span></div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={hourlyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="spikeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fca5a5" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#fca5a5" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} interval={3}/>
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false}/>
              <RTooltip content={<SpikeTooltip/>}/>
              {/* Spike shading area */}
              <Area type="monotone" dataKey="spikeHigh" stroke="none" fill="url(#spikeGrad)" dot={false} activeDot={false} isAnimationActive={false}/>
              <Area type="monotone" dataKey="spikeLow" stroke="none" fill="white" dot={false} activeDot={false} isAnimationActive={false}/>
              {/* Baseline dashed line */}
              <Line type="monotone" dataKey="baseline" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5 4" dot={false} activeDot={false}/>
              {/* Actual line */}
              <Line type="monotone" dataKey="actual" stroke="#557CFF" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#557CFF' }}/>
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Channel donut */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <div className="text-[13.5px] font-bold text-gray-800 mb-3">Transactions by Channel</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={channelData} dataKey="count" nameKey="channel" cx="40%" cy="50%" innerRadius={48} outerRadius={72}>
                {channelData.map(d => <Cell key={d.channel} fill={CHANNEL_COLORS[d.channel]}/>)}
              </Pie>
              <text x="40%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-[13px]" fontSize={12} fontWeight="700" fill="#1e293b">
                {filteredTxns.length.toLocaleString()}
              </text>
              <text x="40%" y="58%" textAnchor="middle" dominantBaseline="middle" fontSize={9} fill="#94a3b8">Total</text>
              <RTooltip formatter={(val: unknown, name: unknown) => [`${val} (${channelData.find(c=>c.channel===name)?.pct}%)`, String(name)]}/>  
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-1">
            {channelData.filter(d => d.count > 0).map(d => (
              <div key={d.channel} className="flex items-center justify-between text-[11.5px]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: d.color }}/>
                  <span className="text-gray-600">{d.channel}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-gray-800">{d.count.toLocaleString()}</span>
                  <span className="text-gray-400">({d.pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table + right panel */}
      <div className="grid grid-cols-3 gap-4">
        {/* Transaction table */}
        <div className="col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-gray-100">
            <div className="flex items-center gap-1">
              {[
                { key: 'all', label: 'All Transactions' },
                { key: 'highrisk', label: 'High Risk' },
                { key: 'spikes', label: 'Spikes' },
                { key: 'otp', label: 'OTP Transactions' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setTableTab(tab.key as typeof tableTab)}
                  className={`px-3 py-1.5 text-[12.5px] font-medium rounded-lg transition-colors ${tableTab === tab.key ? 'bg-[#557CFF] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-700 border border-gray-200 px-2.5 py-1.5 rounded-lg bg-white">
              <Download size={13}/> Export
            </button>
          </div>
          <TransactionTable txns={tableTxns} onSelect={onSelectTransaction} spikeHours={spikeHours}/>
        </div>

        {/* Right column: Cluster summary + Spike alerts */}
        <div className="space-y-4">
          {/* Cluster summary */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[13px] font-bold text-gray-800">Clusters Summary</div>
              <button className="text-[11.5px] text-[#557CFF] font-medium">View All</button>
            </div>
            <div className="space-y-2.5">
              {clusterStats.filter(c => c.count > 0).slice(0, 5).map(c => (
                <div
                  key={c.label}
                  onClick={() => onSelectCluster(c.label)}
                  className="flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1.5 -mx-2 transition-colors"
                >
                  <div>
                    <div className="text-[12.5px] font-semibold text-gray-800">{c.label}</div>
                    <div className="text-[11px] text-gray-400">{c.entityCount} entities</div>
                  </div>
                  <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${CLUSTER_RISK_COLORS[c.riskClassification]}`}>
                    {c.riskClassification} Risk
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Spike alerts */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[13px] font-bold text-gray-800">Spike Alerts (Today)</div>
              <button className="text-[11.5px] text-[#557CFF] font-medium">View All</button>
            </div>
            <div className="space-y-3">
              {spikes.slice(0, 4).map((s, i) => (
                <div
                  key={i}
                  onClick={() => onSelectSpike(s.spikeHour)}
                  className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={13} className={s.severity === 'high' ? 'text-rose-500 mt-0.5' : 'text-amber-500 mt-0.5'} />
                    <div>
                      <div className="text-[12.5px] font-semibold text-gray-800">{s.label || 'Volume anomaly'}</div>
                      <div className="text-[11px] text-gray-500">{s.timeRange} <span className={`font-bold ${s.severity === 'high' ? 'text-rose-600' : 'text-amber-600'}`}>{s.deviation}</span></div>
                      <div className="text-[10.5px] text-gray-400">{s.detail}</div>
                    </div>
                  </div>
                </div>
              ))}
              {spikes.length === 0 && <p className="text-[12px] text-gray-400 text-center py-3">No spikes detected</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CLUSTERS TAB ─────────────────────────────────────────────────
function ClustersTab({ filteredTxns, onSelectCluster }: {
  filteredTxns: Transaction[];
  onSelectCluster: (l: ClusterLabel) => void;
}) {
  const clusterStats = useMemo(() => getClusterStats(filteredTxns), [filteredTxns]);
  const [selectedDetail, setSelectedDetail] = useState<ClusterLabel | null>(null);
  const detailTxns = useMemo(() =>
    selectedDetail ? filteredTxns.filter(t => t.cluster === selectedDetail) : [],
    [filteredTxns, selectedDetail]
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {clusterStats.map(c => (
          <div
            key={c.label}
            onClick={() => { setSelectedDetail(c.label); onSelectCluster(c.label); }}
            className={`bg-white rounded-2xl border shadow-sm p-4 cursor-pointer transition-all hover:shadow-md ${selectedDetail === c.label ? 'border-[#557CFF] ring-1 ring-[#557CFF]/30' : 'border-gray-200'}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-[13px] font-bold text-gray-900">{c.label}</div>
              <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${CLUSTER_RISK_COLORS[c.riskClassification]}`}>
                {c.riskClassification}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[12px]">
              <div><span className="text-gray-400">Transactions</span><br/><span className="font-bold text-gray-800">{c.count.toLocaleString()}</span></div>
              <div><span className="text-gray-400">Entities</span><br/><span className="font-bold text-gray-800">{c.entityCount}</span></div>
              <div><span className="text-gray-400">Total Amount</span><br/><span className="font-bold text-gray-800">{formatINR(c.totalAmount)}</span></div>
              <div><span className="text-gray-400">Avg Amount</span><br/><span className="font-bold text-gray-800">{formatINR(c.avgAmount)}</span></div>
              <div><span className="text-gray-400">High Risk</span><br/><span className={`font-bold ${c.highRiskCount > 0 ? 'text-rose-600' : 'text-gray-800'}`}>{c.highRiskCount}</span></div>
              <div><span className="text-gray-400">OTP Fail Rate</span><br/><span className={`font-bold ${c.otpFailRate > 10 ? 'text-rose-600' : 'text-gray-800'}`}>{c.otpFailRate}%</span></div>
            </div>
          </div>
        ))}
      </div>
      {selectedDetail && detailTxns.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="text-[13.5px] font-bold text-gray-800">Cluster Detail: {selectedDetail}</div>
            <button onClick={() => { setSelectedDetail(null); onSelectCluster('all' as any); }} className="text-[11.5px] text-gray-500 hover:text-gray-700">Clear</button>
          </div>
          <TransactionTable txns={detailTxns} onSelect={() => {}} />
        </div>
      )}
    </div>
  );
}

// ─── OTP TAB ─────────────────────────────────────────────────────
function OTPTab({ filteredTxns }: { filteredTxns: Transaction[] }) {
  const stats = useMemo(() => getOTPStats(filteredTxns), [filteredTxns]);

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total OTP Transactions', value: stats.total, color: 'text-[#557CFF]', bg: 'bg-blue-50' },
          { label: 'Successful OTP', value: stats.success, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Failed OTP', value: stats.failed, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Expired OTP', value: stats.expired, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="text-[11.5px] text-gray-500 mb-1">{s.label}</div>
            <div className={`text-[24px] font-black ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* OTP Failure Rate chart */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <div className="text-[13px] font-bold text-gray-800 mb-3">OTP Failures by Hour</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.byHour.filter(h => h.total > 0)} margin={{ left: -20, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
              <XAxis dataKey="hour" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} interval={3}/>
              <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false}/>
              <RTooltip formatter={(v: unknown) => [`${v} failures`, 'OTP Failed']}/>
              <Bar dataKey="failed" fill="#ef4444" radius={[3,3,0,0]} maxBarSize={14}/>
              <Bar dataKey="total" fill="#e2e8f0" radius={[3,3,0,0]} maxBarSize={14}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* OTP stats summary */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <div className="text-[13px] font-bold text-gray-800 mb-3">OTP Health Overview</div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-[12.5px] mb-1.5">
                <span className="text-gray-500">Success Rate</span>
                <span className="font-bold text-emerald-600">{(100 - stats.failRate - (stats.expired/stats.total*100)).toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden flex">
                <div className="h-full bg-emerald-500" style={{ width: `${((stats.success / stats.total) * 100).toFixed(0)}%` }}/>
                <div className="h-full bg-rose-400" style={{ width: `${((stats.failed / stats.total) * 100).toFixed(0)}%` }}/>
                <div className="h-full bg-amber-400" style={{ width: `${((stats.expired / stats.total) * 100).toFixed(0)}%` }}/>
              </div>
              <div className="flex gap-3 mt-1 text-[10.5px] text-gray-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/>Success</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400 inline-block"/>Failed</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block"/>Expired</span>
              </div>
            </div>
            <div className="space-y-2.5">
              {[
                { label: 'OTP Failure Rate', value: `${stats.failRate}%`, bad: stats.failRate > 15 },
                { label: 'Avg Retry Count', value: `${stats.avgRetry}x`, bad: stats.avgRetry > 1 },
              ].map(r => (
                <div key={r.label} className="flex justify-between text-[12.5px]">
                  <span className="text-gray-500">{r.label}</span>
                  <span className={`font-bold ${r.bad ? 'text-rose-600' : 'text-emerald-600'}`}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* OTP filtered transactions */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 text-[13.5px] font-bold text-gray-800">
          OTP Transactions ({filteredTxns.filter(t => t.authentication !== 'Non-OTP').length})
        </div>
        <TransactionTable txns={filteredTxns.filter(t => t.authentication !== 'Non-OTP')} onSelect={() => {}}/>
      </div>
    </div>
  );
}

// ─── RISK TAB ─────────────────────────────────────────────────────
function RiskTab({ filteredTxns, onSelectTransaction }: { filteredTxns: Transaction[]; onSelectTransaction: (t: Transaction) => void }) {
  const dist = useMemo(() => getRiskDistribution(filteredTxns), [filteredTxns]);
  const highRisk = useMemo(() => filteredTxns.filter(t => t.riskLevel === 'High').sort((a,b) => b.riskScore - a.riskScore), [filteredTxns]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {/* Risk distribution card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <div className="text-[13px] font-bold text-gray-800 mb-3">Risk Distribution</div>
          <div className="space-y-3">
            {[
              { label: 'Low Risk', count: dist.low, pct: dist.lowPct, color: '#10B981' },
              { label: 'Medium Risk', count: dist.medium, pct: dist.mediumPct, color: '#F59E0B' },
              { label: 'High Risk', count: dist.high, pct: dist.highPct, color: '#EF4444' },
            ].map(r => (
              <div key={r.label}>
                <div className="flex justify-between text-[12px] mb-1">
                  <span className="text-gray-600 font-medium">{r.label}</span>
                  <span className="text-gray-800 font-bold">{r.count} ({r.pct}%)</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${r.pct}%`, backgroundColor: r.color }}/>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex justify-between text-[12.5px]">
              <span className="text-gray-500">Avg Risk Score</span>
              <span className="font-bold text-gray-800">{dist.avgScore} / 100</span>
            </div>
          </div>
        </div>

        {/* Risk by type */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <div className="text-[13px] font-bold text-gray-800 mb-3">Risk by Transaction Type</div>
          <div className="space-y-2">
            {dist.byType.slice(0, 7).map(r => (
              <div key={r.type} className="flex items-center gap-2">
                <span className="text-[11.5px] text-gray-500 w-28 truncate">{r.type}</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${r.avgScore}%`, backgroundColor: r.avgScore >= 60 ? '#EF4444' : r.avgScore >= 30 ? '#F59E0B' : '#10B981' }}/>
                </div>
                <span className="text-[11.5px] font-semibold text-gray-700 w-6 text-right">{r.avgScore}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk by channel */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <div className="text-[13px] font-bold text-gray-800 mb-3">Risk by Payment Channel</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dist.byChannel} layout="vertical" margin={{ left: 5, right: 20 }}>
              <XAxis type="number" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} domain={[0,100]}/>
              <YAxis type="category" dataKey="channel" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} width={75}/>
              <RTooltip formatter={(v: unknown) => [`${v} avg risk score`, 'Risk']}/>
              <Bar dataKey="avgScore" radius={[0,3,3,0]} maxBarSize={12}>
                {dist.byChannel.map(d => (
                  <Cell key={d.channel} fill={d.avgScore >= 60 ? '#EF4444' : d.avgScore >= 30 ? '#F59E0B' : '#10B981'}/>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* High risk table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 text-[13.5px] font-bold text-gray-800">
          High Risk Transactions ({highRisk.length})
        </div>
        <TransactionTable txns={highRisk} onSelect={onSelectTransaction}/>
      </div>
    </div>
  );
}

// ─── Filters Sidebar ─────────────────────────────────────────────
function FilterSidebar({
  filters, onFilterChange, onApply, onClear,
}: {
  filters: FilterState;
  onFilterChange: (f: Partial<FilterState>) => void;
  onApply: () => void;
  onClear: () => void;
}) {
  const toggleArr = (key: keyof FilterState, val: string) => {
    const arr = filters[key] as string[];
    const next = arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
    onFilterChange({ [key]: next });
  };

  return (
    <aside className="w-52 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-y-auto" style={{ minHeight: '100%' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-1.5 text-[13px] font-bold text-gray-800"><Filter size={13}/> Filters &amp; Segmentation</div>
        <button onClick={onClear} className="text-[11px] text-[#557CFF] font-medium hover:underline">Clear All</button>
      </div>

      <div className="p-4 space-y-5 flex-1 overflow-y-auto">
        {/* Date range */}
        <div>
          <div className="text-[11px] font-semibold text-gray-500 mb-1.5">Date Range</div>
          <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-2.5 py-2 text-[12px] text-gray-700 bg-gray-50">
            <Calendar size={12} className="text-gray-400"/>
            01 Sep 2026 - 01 Sep 2026
          </div>
        </div>

        {/* Volume */}
        <div>
          <div className="text-[11px] font-semibold text-gray-500 mb-1.5">Transaction Volume (per day)</div>
          <div className="flex flex-wrap gap-1">
            {VOLUME_RANGES.map(r => (
              <button key={r} onClick={() => toggleArr('volumeRanges', r)}
                className={`px-2 py-1 rounded text-[10.5px] font-medium border transition-colors ${filters.volumeRanges.includes(r) ? 'bg-[#557CFF] text-white border-[#557CFF]' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
              >{r}</button>
            ))}
          </div>
        </div>

        {/* Amount range */}
        <div>
          <div className="text-[11px] font-semibold text-gray-500 mb-1.5">Amount Range (₹)</div>
          <div className="grid grid-cols-2 gap-2">
            <input type="number" placeholder="Min" value={filters.amountMin}
              onChange={e => onFilterChange({ amountMin: e.target.value })}
              className="border border-gray-200 rounded-lg px-2 py-1.5 text-[12px] w-full focus:outline-none focus:ring-1 focus:ring-[#557CFF]/30"
            />
            <input type="number" placeholder="Max" value={filters.amountMax}
              onChange={e => onFilterChange({ amountMax: e.target.value })}
              className="border border-gray-200 rounded-lg px-2 py-1.5 text-[12px] w-full focus:outline-none focus:ring-1 focus:ring-[#557CFF]/30"
            />
          </div>
        </div>

        {/* Transaction type */}
        <div>
          <div className="text-[11px] font-semibold text-gray-500 mb-1.5">Transaction Type</div>
          <div className="relative">
            <select className="w-full appearance-none border border-gray-200 rounded-lg px-2.5 py-2 text-[12px] text-gray-700 focus:outline-none pr-6"
              value={filters.transactionTypes[0] || ''}
              onChange={e => onFilterChange({ transactionTypes: e.target.value ? [e.target.value] : [] })}
            >
              <option value="">All Types</option>
              {TXN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
          </div>
        </div>

        {/* Channel */}
        <div>
          <div className="text-[11px] font-semibold text-gray-500 mb-1.5">Payment Channel</div>
          <div className="relative">
            <select className="w-full appearance-none border border-gray-200 rounded-lg px-2.5 py-2 text-[12px] text-gray-700 focus:outline-none pr-6"
              value={filters.channels[0] || ''}
              onChange={e => onFilterChange({ channels: e.target.value ? [e.target.value] : [] })}
            >
              <option value="">All Channels</option>
              {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
          </div>
        </div>

        {/* Authentication */}
        <div>
          <div className="text-[11px] font-semibold text-gray-500 mb-1.5">Authentication</div>
          <div className="flex gap-1 flex-wrap">
            {['all','OTP Based','Non-OTP','3DS'].map(a => (
              <button key={a} onClick={() => onFilterChange({ authentication: a })}
                className={`px-2 py-1 rounded text-[10.5px] font-medium border transition-colors ${filters.authentication === a ? 'bg-[#557CFF] text-white border-[#557CFF]' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
              >{a === 'all' ? 'All' : a}</button>
            ))}
          </div>
        </div>

        {/* Risk level */}
        <div>
          <div className="text-[11px] font-semibold text-gray-500 mb-1.5">Risk Level</div>
          <div className="flex gap-1">
            {['all','Low','Medium','High'].map(r => (
              <button key={r} onClick={() => onFilterChange({ riskLevel: r })}
                className={`px-2 py-1 rounded text-[10.5px] font-medium border transition-colors ${filters.riskLevel === r ? 'bg-[#557CFF] text-white border-[#557CFF]' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
              >{r === 'all' ? 'All' : r}</button>
            ))}
          </div>
        </div>

        {/* Cluster */}
        <div>
          <div className="text-[11px] font-semibold text-gray-500 mb-1.5">Clusters</div>
          <div className="relative">
            <select className="w-full appearance-none border border-gray-200 rounded-lg px-2.5 py-2 text-[12px] text-gray-700 focus:outline-none pr-6"
              value={filters.cluster}
              onChange={e => onFilterChange({ cluster: e.target.value })}
            >
              <option value="all">All Clusters</option>
              {CLUSTER_LABELS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
          </div>
        </div>

        {/* Search */}
        <div>
          <div className="text-[11px] font-semibold text-gray-500 mb-1.5">Search</div>
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input type="text" placeholder="Search by Txn ID, Entity ID, or Location..."
              value={filters.search}
              onChange={e => onFilterChange({ search: e.target.value })}
              className="w-full border border-gray-200 rounded-lg pl-7 pr-2 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-[#557CFF]/30"
            />
          </div>
        </div>
      </div>

      {/* Footer buttons */}
      <div className="p-4 border-t border-gray-100 space-y-2">
        <button onClick={onApply}
          className="w-full py-2.5 rounded-xl bg-[#557CFF] hover:bg-[#4268e8] text-white font-semibold text-[13px] transition-colors"
        >Apply Filters</button>
        <button className="w-full text-[12px] text-[#557CFF] font-medium hover:underline flex items-center justify-center gap-1">
          <Save size={12}/> Save as Segment
        </button>
      </div>
    </aside>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────
export const Payment: React.FC = () => {
  const { selectedCustomer, activeTransactionId } = useCustomer();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [pendingFilters, setPendingFilters] = useState<FilterState>(DEFAULT_FILTER);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(DEFAULT_FILTER);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Derived data (always from applied filters)
  const filteredTxns = useMemo(() => filterTransactions(ALL_TRANSACTIONS, appliedFilters), [appliedFilters]);
  const hourlyData = useMemo(() => getHourlyData(filteredTxns), [filteredTxns]);
  const spikes = useMemo(() => detectSpikes(hourlyData), [hourlyData]);
  const spikeHours = useMemo(() => new Set(spikes.map(s => s.spikeHour)), [spikes]);

  const handleApply = useCallback(() => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setAppliedFilters({ ...pendingFilters });
      setIsAnalyzing(false);
    }, 400);
  }, [pendingFilters]);

  const handleClear = useCallback(() => {
    setPendingFilters(DEFAULT_FILTER);
    setAppliedFilters(DEFAULT_FILTER);
  }, []);

  const handleSelectCluster = useCallback((label: ClusterLabel) => {
    const next = { ...pendingFilters, cluster: label };
    setPendingFilters(next);
    setAppliedFilters(next);
    setActiveTab('clusters');
  }, [pendingFilters]);

  const handleSelectSpike = useCallback((_hour: number) => {
    // Filter transactions to only the spike hour
    const next = { ...pendingFilters, search: '' };
    setPendingFilters(next);
    setAppliedFilters(next);
    setActiveTab('transactions');
  }, [pendingFilters]);

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'overview',      label: 'Overview',             icon: Activity },
    { key: 'transactions',  label: 'Transactions',          icon: CreditCard },
    { key: 'clusters',      label: 'Clusters',              icon: Users },
    { key: 'otp',           label: 'OTP & Authentication',  icon: Shield },
    { key: 'risk',          label: 'Risk & Explainability', icon: AlertTriangle },
  ];

  return (
    <div
      className="flex -m-8 bg-[#F7F8F7] overflow-hidden"
      style={{ height: 'calc(100vh)', fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif' }}
    >
      {/* Filters Sidebar */}
      <FilterSidebar
        filters={pendingFilters}
        onFilterChange={p => setPendingFilters(f => ({ ...f, ...p }))}
        onApply={handleApply}
        onClear={handleClear}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-[18px] font-bold text-gray-900">
              {selectedCustomer ? `${selectedCustomer.name} • Payment Intelligence` : 'Payment Intelligence'}
            </h1>
            <p className="text-[12px] text-gray-400">
              {selectedCustomer
                ? `Isolated payment stream and risk clustering for ${selectedCustomer.id} (${selectedCustomer.accountType})`
                : 'Monitor, detect spikes, and analyze payment behavior in real-time'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[12.5px] text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
              <Calendar size={13} className="text-gray-400"/> 01 Sep 2026 - 01 Sep 2026 <ChevronDown size={12}/>
            </div>
            <button className="flex items-center gap-1.5 text-[12.5px] text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 bg-white hover:bg-gray-50">
              <Save size={13}/> Save View
            </button>
            <button
              onClick={handleApply}
              disabled={isAnalyzing}
              className="flex items-center gap-1.5 text-[13px] font-semibold text-white bg-[#557CFF] hover:bg-[#4268e8] rounded-lg px-4 py-1.5 transition-colors disabled:opacity-60"
            >
              {isAnalyzing ? <Loader2 size={14} className="animate-spin"/> : <Activity size={14}/>}
              Analyze
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-5 flex-shrink-0">
          <div className="flex items-center">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'text-[#557CFF] border-[#557CFF]'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  <Icon size={13}/> {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5">
          {isAnalyzing && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/10">
              <div className="bg-white rounded-2xl shadow-xl px-8 py-6 flex items-center gap-3">
                <Loader2 size={20} className="animate-spin text-[#557CFF]"/>
                <span className="text-[13.5px] font-semibold text-gray-700">Analyzing payment data…</span>
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <OverviewTab
              filteredTxns={filteredTxns}
              hourlyData={hourlyData}
              spikes={spikes}
              onSelectTransaction={setSelectedTxn}
              onSelectCluster={handleSelectCluster}
              onSelectSpike={handleSelectSpike}
              spikeHours={spikeHours}
            />
          )}
          {activeTab === 'transactions' && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <div className="text-[13.5px] font-bold text-gray-800">All Transactions ({filteredTxns.length.toLocaleString()})</div>
                <button className="flex items-center gap-1.5 text-[12px] text-gray-500 border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-50">
                  <Download size={13}/> Export
                </button>
              </div>
              <TransactionTable txns={filteredTxns} onSelect={setSelectedTxn} spikeHours={spikeHours}/>
            </div>
          )}
          {activeTab === 'clusters' && (
            <ClustersTab
              filteredTxns={filteredTxns}
              onSelectCluster={handleSelectCluster}
            />
          )}
          {activeTab === 'otp' && <OTPTab filteredTxns={filteredTxns}/>}
          {activeTab === 'risk' && <RiskTab filteredTxns={filteredTxns} onSelectTransaction={setSelectedTxn}/>}
        </div>
      </div>

      {/* Transaction detail modal */}
      {selectedTxn && (
        <TransactionDetail txn={selectedTxn} onClose={() => setSelectedTxn(null)}/>
      )}
    </div>
  );
};

export default Payment;
