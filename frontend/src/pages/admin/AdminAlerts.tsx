import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  ShieldCheck,
  Search,
  Filter,
  ArrowRight,
  RefreshCw,
  Clock,
  ExternalLink,
  ChevronRight,
  X,
  Zap,
  CheckCircle2,
  Download,
  Activity,
  Radio,
  Siren,
  Lock,
  Layers,
  ChevronDown
} from 'lucide-react';
import { useCustomer } from '../../context/CustomerContext';
import {
  INITIAL_ALERTS,
  fetchLiveBackendAlerts,
  exportAlertsToCSV,
  type KrypticAlert,
  type AlertSeverity,
  type AlertStatus
} from '../../services/AlertsService';
import { cn } from '../../lib/utils';

export const AdminAlerts: React.FC = () => {
  const navigate = useNavigate();
  const { selectCustomer } = useCustomer();
  const [alerts, setAlerts] = useState<KrypticAlert[]>(INITIAL_ALERTS);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAlertForDrawer, setSelectedAlertForDrawer] = useState<KrypticAlert | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const live = await fetchLiveBackendAlerts();
      setAlerts(live);
      showToast(`Loaded ${live.length} real-time risk events from telemetry engine`);
    } catch (e) {
      console.warn('Could not load live alerts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      if (selectedSeverity !== 'ALL' && alert.severity !== selectedSeverity) return false;
      if (selectedStatus !== 'ALL' && alert.status !== selectedStatus) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        return (
          alert.id.toLowerCase().includes(q) ||
          alert.customerId.toLowerCase().includes(q) ||
          alert.transactionId.toLowerCase().includes(q) ||
          alert.title.toLowerCase().includes(q) ||
          (alert.gateway && alert.gateway.toLowerCase().includes(q)) ||
          (alert.customerName && alert.customerName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [alerts, selectedSeverity, selectedStatus, searchQuery]);

  // Counts for filters & KPI metrics
  const criticalCount = useMemo(() => alerts.filter(a => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length, [alerts]);
  const highCount = useMemo(() => alerts.filter(a => a.severity === 'HIGH' && a.status !== 'RESOLVED').length, [alerts]);
  const activeCount = useMemo(() => alerts.filter(a => a.status === 'ACTIVE').length, [alerts]);
  const totalValueAtRisk = useMemo(() => {
    return alerts
      .filter(a => a.status !== 'RESOLVED')
      .reduce((sum, a) => sum + (a.amount || 50000), 0);
  }, [alerts]);

  const severityBadges: Record<AlertSeverity, { badge: string; dot: string; border: string }> = {
    CRITICAL: { badge: 'bg-rose-100 text-rose-800 font-extrabold border-rose-300', dot: 'bg-rose-500 animate-pulse', border: 'border-rose-200' },
    HIGH:     { badge: 'bg-orange-100 text-orange-800 font-extrabold border-orange-300', dot: 'bg-orange-500', border: 'border-orange-200' },
    MEDIUM:   { badge: 'bg-amber-100 text-amber-800 font-bold border-amber-300', dot: 'bg-amber-500', border: 'border-amber-200' },
    LOW:      { badge: 'bg-emerald-100 text-emerald-800 font-bold border-emerald-300', dot: 'bg-emerald-500', border: 'border-emerald-200' }
  };

  const statusBadges: Record<AlertStatus, string> = {
    ACTIVE:        'bg-rose-50 text-rose-700 border-rose-200',
    INVESTIGATING: 'bg-amber-50 text-amber-700 border-amber-200',
    RESOLVED:      'bg-gray-100 text-gray-600 border-gray-200'
  };

  const handleStatusChange = (alertId: string, newStatus: AlertStatus, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: newStatus } : a));
    showToast(`Alert ${alertId} status updated to ${newStatus}`);
  };

  const handleOpenCustomer = (alert: KrypticAlert, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    selectCustomer(alert.customerId, {
      transactionId: alert.transactionId,
      alertId: alert.id,
      targetPath: `/customer/${alert.customerId}/dashboard`
    });
  };

  const timeAgo = (d: Date) => {
    const min = Math.floor((Date.now() - d.getTime()) / 60000);
    if (min < 1) return 'just now';
    if (min < 60) return `${min}m ago`;
    return `${Math.floor(min / 60)}h ago`;
  };

  return (
    <div className="w-full max-w-none space-y-6 pb-12 font-sans relative px-0">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-8 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-3">
          <Zap className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── 1. Command Center Top Header ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
              <Siren className="w-6 h-6 text-rose-600 animate-pulse" />
              <span>Risk &amp; Alerts Command Queue</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              SOC Live Monitor
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Centrally monitor threat triggers, velocity spikes, and high-risk payment anomalies across all merchant channels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAlerts}
            disabled={loading}
            className="px-3 py-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-60"
            title="Refresh Live Alert Feed"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 text-gray-500", loading && "animate-spin text-blue-600")} />
            <span>{loading ? 'Refreshing…' : 'Sync Telemetry'}</span>
          </button>

          <button
            onClick={() => navigate('/alerts')}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Emergency Defense Console</span>
          </button>

          <button
            onClick={() => {
              exportAlertsToCSV(filteredAlerts);
              showToast(`Exported ${filteredAlerts.length} alerts to CSV`);
            }}
            className="px-3.5 py-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 text-xs font-bold rounded-xl shadow-2xs flex items-center gap-2 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-gray-500" />
            <span>Export Audit Log</span>
          </button>
        </div>
      </div>

      {/* ─── 2. Top Command Center Metrics Bar (4 Cards) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Critical Threats */}
        <div
          onClick={() => setSelectedSeverity('CRITICAL')}
          className={cn(
            "bg-white border rounded-2xl p-4.5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between",
            selectedSeverity === 'CRITICAL' ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-gray-200/90'
          )}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Critical Threats</span>
            </div>
            <div className="text-2xl font-black text-rose-600 mt-1 tracking-tight">
              {criticalCount} <span className="text-xs font-medium text-gray-400">Active</span>
            </div>
            <p className="text-[11px] text-rose-500 font-semibold mt-0.5">Immediate triage required</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: High Risk Alerts */}
        <div
          onClick={() => setSelectedSeverity('HIGH')}
          className={cn(
            "bg-white border rounded-2xl p-4.5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between",
            selectedSeverity === 'HIGH' ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-gray-200/90'
          )}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">High Risk Alerts</span>
            </div>
            <div className="text-2xl font-black text-orange-600 mt-1 tracking-tight">
              {highCount} <span className="text-xs font-medium text-gray-400">Active</span>
            </div>
            <p className="text-[11px] text-gray-500 font-semibold mt-0.5">Velocity &amp; OTP spikes</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Value at Risk */}
        <div className="bg-white border border-gray-200/90 rounded-2xl p-4.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Total Exposure</span>
            <div className="text-2xl font-black text-gray-900 mt-1 tracking-tight">
              ₹{(totalValueAtRisk / 100000).toFixed(2)}L
            </div>
            <p className="text-[11px] text-gray-500 font-semibold mt-0.5">Across active queue items</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Queue Status */}
        <div className="bg-white border border-gray-200/90 rounded-2xl p-4.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Queue Health</span>
            <div className="text-2xl font-black text-emerald-600 mt-1 tracking-tight">
              8.4 min
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Avg response SLA met</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ─── 3. Search & High-Contrast Filter Toolbar ─── */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Customer ID, Txn ID, merchant name, gateway..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9.5 pr-8 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50/50 focus:bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Group */}
        <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap justify-start lg:justify-end">
          {/* Severity Pills */}
          <div className="flex items-center gap-1 bg-gray-100/70 p-1 rounded-xl border border-gray-200/80 text-xs">
            <span className="text-gray-400 px-2 font-bold uppercase text-[10px] tracking-wider">Severity:</span>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(sev => {
              const isSelected = selectedSeverity === sev;
              const count = sev === 'ALL' ? alerts.length : alerts.filter(a => a.severity === sev).length;
              return (
                <button
                  key={sev}
                  onClick={() => setSelectedSeverity(sev)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg font-bold transition-all text-xs flex items-center gap-1.5 cursor-pointer",
                    isSelected
                      ? "bg-white text-gray-900 shadow-2xs border border-gray-200"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
                  )}
                >
                  <span>{sev}</span>
                  <span className={cn(
                    "px-1.5 py-0.2 rounded-full text-[10px]",
                    isSelected ? "bg-gray-100 text-gray-800" : "bg-gray-200/70 text-gray-600"
                  )}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-1 bg-gray-100/70 p-1 rounded-xl border border-gray-200/80 text-xs">
            <span className="text-gray-400 px-2 font-bold uppercase text-[10px] tracking-wider">Status:</span>
            {['ALL', 'ACTIVE', 'INVESTIGATING', 'RESOLVED'].map(st => {
              const isSelected = selectedStatus === st;
              const count = st === 'ALL' ? alerts.length : alerts.filter(a => a.status === st).length;
              return (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg font-bold transition-all text-xs flex items-center gap-1.5 cursor-pointer",
                    isSelected
                      ? "bg-white text-gray-900 shadow-2xs border border-gray-200"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
                  )}
                >
                  <span>{st}</span>
                  <span className={cn(
                    "px-1.5 py-0.2 rounded-full text-[10px]",
                    isSelected ? "bg-gray-100 text-gray-800" : "bg-gray-200/70 text-gray-600"
                  )}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── 4. Executive Alerts Command Table (Zero Overflow) ─── */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
        <table className="w-full text-left border-collapse table-auto">
          <thead>
            <tr className="bg-gray-50/90 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Severity &amp; Score</th>
              <th className="py-3.5 px-4">Customer &amp; Merchant</th>
              <th className="py-3.5 px-4">Transaction ID</th>
              <th className="py-3.5 px-4">Alert Signal</th>
              <th className="py-3.5 px-4">Amount</th>
              <th className="py-3.5 px-4">Gateway</th>
              <th className="py-3.5 px-4">Timestamp</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs">
            {filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-gray-400 font-semibold">
                  No risk alerts match your current filter criteria.
                </td>
              </tr>
            ) : (
              filteredAlerts.map(alert => {
                const sevConfig = severityBadges[alert.severity];
                return (
                  <tr
                    key={alert.id}
                    onClick={() => setSelectedAlertForDrawer(alert)}
                    className="hover:bg-blue-50/30 cursor-pointer transition-colors group"
                  >
                    {/* Severity & Score */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", sevConfig.dot)} />
                        <span className={cn("px-2.5 py-0.5 rounded-full border text-[11px] tracking-tight uppercase shadow-2xs", sevConfig.badge)}>
                          {alert.severity} ({alert.riskScore})
                        </span>
                      </div>
                    </td>

                    {/* Customer ID & Name */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-mono font-bold text-blue-600 group-hover:underline text-xs">
                          {alert.customerId}
                        </span>
                        <p className="text-[11.5px] font-semibold text-gray-800 line-clamp-1">
                          {alert.customerName || 'Apex Merchant Solutions'}
                        </p>
                      </div>
                    </td>

                    {/* Transaction ID */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded-md text-[11px] font-bold border border-gray-200/70">
                        {alert.transactionId}
                      </span>
                    </td>

                    {/* Alert Title & Signal */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900 text-xs leading-tight line-clamp-1">{alert.title}</p>
                        {alert.metric && (
                          <span className="px-1.5 py-0.2 rounded bg-rose-50 text-rose-600 font-bold text-[9.5px] shrink-0 border border-rose-100">
                            {alert.metric}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{alert.description}</p>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-mono font-black text-gray-900 text-xs">
                      ₹{(alert.amount || 50000).toLocaleString('en-IN')}
                    </td>

                    {/* Gateway */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-gray-50 text-gray-700 border border-gray-200 text-[11px] font-semibold">
                        {alert.gateway || 'System A (Gateway)'}
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3.5 px-4">
                      <span className="text-gray-800 font-semibold text-[11.5px] block">
                        {alert.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[10px] text-gray-400 block">
                        {timeAgo(alert.timestamp)}
                      </span>
                    </td>

                    {/* Status Dropdown / Badge */}
                    <td className="py-3.5 px-4">
                      <div className="relative inline-block" onClick={e => e.stopPropagation()}>
                        <select
                          value={alert.status}
                          onChange={e => handleStatusChange(alert.id, e.target.value as AlertStatus)}
                          className={cn(
                            "appearance-none px-2.5 py-1 pr-6 rounded-lg text-[10.5px] font-black uppercase border cursor-pointer focus:outline-none transition-all shadow-2xs",
                            statusBadges[alert.status]
                          )}
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="INVESTIGATING">INVESTIGATING</option>
                          <option value="RESOLVED">RESOLVED</option>
                        </select>
                        <ChevronDown className="w-3 h-3 text-gray-500 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </td>

                    {/* Action Button */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => handleOpenCustomer(alert, e)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-xs font-bold text-blue-700 transition-all shadow-2xs hover:shadow-xs active:scale-98 cursor-pointer"
                      >
                        <span>Customer View</span>
                        <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ─── 5. Alert Inspector Slide-over Drawer ─── */}
      {selectedAlertForDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setSelectedAlertForDrawer(null)}
          />
          <div className="relative w-full max-w-lg h-full bg-white shadow-2xl border-l border-gray-200 overflow-y-auto flex flex-col z-10 animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                  {selectedAlertForDrawer.severity} THREAT TELEMETRY
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-1">{selectedAlertForDrawer.id}</h3>
              </div>
              <button
                onClick={() => setSelectedAlertForDrawer(null)}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1">
              {/* Alert Title & Description */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-slate-900">{selectedAlertForDrawer.title}</h4>
                  <span className="text-xs font-black text-rose-600 font-mono">
                    Score: {selectedAlertForDrawer.riskScore}/100
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{selectedAlertForDrawer.description}</p>
              </div>

              {/* Grid Metadata */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Customer ID</span>
                  <p className="font-mono font-bold text-blue-600 mt-0.5">{selectedAlertForDrawer.customerId}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Transaction ID</span>
                  <p className="font-mono font-bold text-gray-900 mt-0.5">{selectedAlertForDrawer.transactionId}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Amount at Risk</span>
                  <p className="font-mono font-black text-gray-900 mt-0.5">
                    ₹{(selectedAlertForDrawer.amount || 50000).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Gateway System</span>
                  <p className="font-semibold text-gray-800 mt-0.5">{selectedAlertForDrawer.gateway}</p>
                </div>
              </div>

              {/* Status Update Actions */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Triage Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['ACTIVE', 'INVESTIGATING', 'RESOLVED'] as AlertStatus[]).map(st => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(selectedAlertForDrawer.id, st)}
                      className={cn(
                        "py-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer",
                        selectedAlertForDrawer.status === st
                          ? "bg-slate-900 text-white border-slate-900 shadow-md"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      )}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Launch Customer Digital Twin Button */}
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <button
                  onClick={() => {
                    handleOpenCustomer(selectedAlertForDrawer);
                    setSelectedAlertForDrawer(null);
                  }}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
                >
                  <Activity className="w-4 h-4" />
                  <span>Launch Isolated Customer Digital Twin</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    setSelectedAlertForDrawer(null);
                    navigate('/alerts');
                  }}
                  className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Execute Emergency Defenses</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAlerts;

