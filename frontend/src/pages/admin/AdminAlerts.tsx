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
  ChevronDown,
  User,
  CreditCard,
  Building,
  Eye,
  SlidersHorizontal,
  Flame,
  AlertCircle
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

  // KPI Metrics
  const criticalCount = useMemo(() => alerts.filter(a => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length, [alerts]);
  const highCount = useMemo(() => alerts.filter(a => a.severity === 'HIGH' && a.status !== 'RESOLVED').length, [alerts]);
  const activeCount = useMemo(() => alerts.filter(a => a.status === 'ACTIVE').length, [alerts]);
  const totalValueAtRisk = useMemo(() => {
    return alerts
      .filter(a => a.status !== 'RESOLVED')
      .reduce((sum, a) => sum + (a.amount || 50000), 0);
  }, [alerts]);

  const severityConfigs: Record<AlertSeverity, { 
    pill: string; 
    dot: string; 
    label: string;
  }> = {
    CRITICAL: { 
      pill: 'bg-rose-50 text-rose-700 border-rose-200 font-bold', 
      dot: 'bg-rose-500', 
      label: 'Critical'
    },
    HIGH: { 
      pill: 'bg-orange-50 text-orange-700 border-orange-200 font-semibold', 
      dot: 'bg-orange-500', 
      label: 'High'
    },
    MEDIUM: { 
      pill: 'bg-amber-50 text-amber-700 border-amber-200 font-medium', 
      dot: 'bg-amber-500', 
      label: 'Medium'
    },
    LOW: { 
      pill: 'bg-slate-50 text-slate-700 border-slate-200 font-medium', 
      dot: 'bg-slate-400', 
      label: 'Low'
    }
  };

  const statusConfigs: Record<AlertStatus, { badge: string; label: string }> = {
    ACTIVE: {
      badge: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
      label: 'Active'
    },
    INVESTIGATING: {
      badge: 'bg-amber-50 text-amber-700 border-amber-200 font-bold',
      label: 'Investigating'
    },
    RESOLVED: {
      badge: 'bg-slate-100 text-slate-600 border-slate-200 font-medium',
      label: 'Resolved'
    }
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
    if (min < 1) return 'Just now';
    if (min < 60) return `${min}m ago`;
    return `${Math.floor(min / 60)}h ago`;
  };

  return (
    <div className="w-full max-w-none space-y-5 pb-12 font-sans text-slate-800 antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-8 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── 1. Command Center Top Header ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Risk &amp; Alerts Command Queue
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              SOC Live Monitor
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Centrally monitor threat triggers, velocity spikes, and high-risk payment anomalies across all merchant channels.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={loadAlerts}
            disabled={loading}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs flex items-center gap-1.5 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-60"
            title="Refresh Live Alert Feed"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 text-slate-500", loading && "animate-spin text-blue-600")} />
            <span>{loading ? 'Refreshing…' : 'Sync Telemetry'}</span>
          </button>

          <button
            onClick={() => navigate('/alerts')}
            className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Emergency Defenses</span>
          </button>

          <button
            onClick={() => {
              exportAlertsToCSV(filteredAlerts);
              showToast(`Exported ${filteredAlerts.length} alerts to CSV`);
            }}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs flex items-center gap-1.5 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ─── 2. Top Command Center Metrics Bar (4 Cards) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Critical Threats */}
        <div
          onClick={() => setSelectedSeverity(selectedSeverity === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
          className={cn(
            "bg-white border rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-between",
            selectedSeverity === 'CRITICAL' ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200'
          )}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Critical Threats</span>
            </div>
            <div className="text-2xl font-black text-rose-600 mt-1 tracking-tight">
              {criticalCount} <span className="text-xs font-medium text-slate-400">Active</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Immediate triage required</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: High Risk Alerts */}
        <div
          onClick={() => setSelectedSeverity(selectedSeverity === 'HIGH' ? 'ALL' : 'HIGH')}
          className={cn(
            "bg-white border rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-between",
            selectedSeverity === 'HIGH' ? 'border-orange-500 ring-1 ring-orange-500' : 'border-slate-200'
          )}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">High Risk Alerts</span>
            </div>
            <div className="text-2xl font-black text-orange-600 mt-1 tracking-tight">
              {highCount} <span className="text-xs font-medium text-slate-400">Active</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Velocity &amp; OTP spikes</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Value at Risk */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Exposure</span>
            <div className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
              ₹{(totalValueAtRisk / 100000).toFixed(2)}L
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Across active queue</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: Queue Status */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Queue Health</span>
            <div className="text-2xl font-black text-emerald-600 mt-1 tracking-tight">
              8.4 min
            </div>
            <p className="text-[11px] text-emerald-600 mt-0.5 font-medium">Avg response SLA met</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ─── 3. Modern Search & High-Contrast Filter Toolbar ─── */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col xl:flex-row items-center justify-between gap-3.5">
        {/* Search Input */}
        <div className="relative w-full xl:w-80 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Customer ID, Txn ID, merchant..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9.5 pr-8 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/60 focus:bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills Groups */}
        <div className="flex items-center gap-3 w-full xl:w-auto flex-wrap justify-start xl:justify-end">
          {/* Severity Segmented Control */}
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 text-xs">
            <span className="text-slate-400 px-2 font-bold uppercase text-[10px] tracking-wider">Severity</span>
            {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(sev => {
              const isSelected = selectedSeverity === sev;
              const count = sev === 'ALL' ? alerts.length : alerts.filter(a => a.severity === sev).length;
              return (
                <button
                  key={sev}
                  onClick={() => setSelectedSeverity(sev)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg font-bold transition-all text-[11px] flex items-center gap-1.5 cursor-pointer",
                    isSelected
                      ? "bg-white text-slate-900 shadow-2xs border border-slate-200/90 font-extrabold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  )}
                >
                  <span>{sev}</span>
                  <span className={cn(
                    "px-1.5 py-0.2 rounded-full text-[10px]",
                    isSelected ? "bg-slate-100 text-slate-900 font-bold" : "bg-slate-200/70 text-slate-500"
                  )}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Status Segmented Control */}
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 text-xs">
            <span className="text-slate-400 px-2 font-bold uppercase text-[10px] tracking-wider">Status</span>
            {(['ALL', 'ACTIVE', 'INVESTIGATING', 'RESOLVED'] as const).map(st => {
              const isSelected = selectedStatus === st;
              const count = st === 'ALL' ? alerts.length : alerts.filter(a => a.status === st).length;
              return (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg font-bold transition-all text-[11px] flex items-center gap-1.5 cursor-pointer",
                    isSelected
                      ? "bg-white text-slate-900 shadow-2xs border border-slate-200/90 font-extrabold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  )}
                >
                  <span>{st}</span>
                  <span className={cn(
                    "px-1.5 py-0.2 rounded-full text-[10px]",
                    isSelected ? "bg-slate-100 text-slate-900 font-bold" : "bg-slate-200/70 text-slate-500"
                  )}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── 4. Executive Alerts Command Table ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1050px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Severity &amp; Score</th>
                <th className="py-3.5 px-4">Customer &amp; Merchant</th>
                <th className="py-3.5 px-4">Transaction ID</th>
                <th className="py-3.5 px-4">Threat Trigger &amp; Signal</th>
                <th className="py-3.5 px-4">Exposure</th>
                <th className="py-3.5 px-4">Gateway</th>
                <th className="py-3.5 px-4">Detected</th>
                <th className="py-3.5 px-4">Triage Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400 font-semibold">
                    <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-bold text-slate-700">No matching threat alerts found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try resetting your filters or search terms.</p>
                  </td>
                </tr>
              ) : (
                filteredAlerts.map(alert => {
                  const config = severityConfigs[alert.severity] || severityConfigs.LOW;
                  const statusConf = statusConfigs[alert.status] || statusConfigs.ACTIVE;
                  const Icon = config.icon;

                  return (
                    <tr
                      key={alert.id}
                      onClick={() => setSelectedAlertForDrawer(alert)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    >
                      {/* Severity & Score */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={cn("w-2 h-2 rounded-full shrink-0", config.dot)} />
                          <span className={cn("px-2 py-0.5 rounded-lg border text-[11px] flex items-center gap-1", config.pill)}>
                            <Icon className="w-3 h-3" />
                            <span>{config.label}</span>
                            <span className="font-mono text-[10px] opacity-80">({alert.riskScore})</span>
                          </span>
                        </div>
                      </td>

                      {/* Customer ID & Name */}
                      <td className="py-3.5 px-4">
                        <div className="min-w-0">
                          <span className="font-mono font-bold text-blue-600 group-hover:text-blue-700 text-xs block">
                            {alert.customerId}
                          </span>
                          <span className="text-xs font-semibold text-slate-800 truncate block max-w-[180px]">
                            {alert.customerName || 'Apex Merchant Solutions'}
                          </span>
                        </div>
                      </td>

                      {/* Transaction ID */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono text-slate-700 bg-slate-100/90 px-2 py-1 rounded-lg text-[11px] font-bold border border-slate-200/80">
                          {alert.transactionId}
                        </span>
                      </td>

                      {/* Alert Title & Signal */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 text-xs">{alert.title}</span>
                            {alert.metric && (
                              <span className="px-1.5 py-0.2 rounded-md bg-rose-50 text-rose-600 font-bold text-[10px] border border-rose-100 shrink-0">
                                {alert.metric}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{alert.description}</p>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-slate-900 text-xs">
                        ₹{(alert.amount || 50000).toLocaleString('en-IN')}
                      </td>

                      {/* Gateway */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium">
                          {alert.gateway || 'Razorpay Gateway'}
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-[11px]">
                          <span className="text-slate-800 font-semibold block">
                            {alert.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-slate-400 text-[10px] block">
                            {timeAgo(alert.timestamp)}
                          </span>
                        </div>
                      </td>

                      {/* Status Dropdown / Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="relative inline-block" onClick={e => e.stopPropagation()}>
                          <select
                            value={alert.status}
                            onChange={e => handleStatusChange(alert.id, e.target.value as AlertStatus)}
                            className={cn(
                              "appearance-none pl-2.5 pr-6 py-1 rounded-lg text-[11px] font-bold border cursor-pointer focus:outline-none transition-all shadow-2xs",
                              statusConf.badge
                            )}
                          >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="INVESTIGATING">INVESTIGATING</option>
                            <option value="RESOLVED">RESOLVED</option>
                          </select>
                          <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </td>

                      {/* Action Button */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => handleOpenCustomer(alert, e)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-xs font-bold text-blue-700 transition-all shadow-2xs hover:shadow-xs active:scale-98 cursor-pointer"
                        >
                          <span>Customer Dossier</span>
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
      </div>

      {/* ─── 5. Alert Inspector Slide-over Drawer ─── */}
      {selectedAlertForDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedAlertForDrawer(null)}
          />
          <div className="relative w-full max-w-lg h-full bg-white shadow-2xl border-l border-slate-200 overflow-y-auto flex flex-col z-10 animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-[10.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border",
                    severityConfigs[selectedAlertForDrawer.severity].pill
                  )}>
                    {selectedAlertForDrawer.severity} THREAT TELEMETRY
                  </span>
                  <span className="text-xs font-mono text-slate-400">Score {selectedAlertForDrawer.riskScore}/100</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">{selectedAlertForDrawer.id}</h3>
              </div>
              <button
                onClick={() => setSelectedAlertForDrawer(null)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1">
              {/* Alert Title & Description */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">{selectedAlertForDrawer.title}</h4>
                  {selectedAlertForDrawer.metric && (
                    <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200">
                      {selectedAlertForDrawer.metric}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{selectedAlertForDrawer.description}</p>
              </div>

              {/* Grid Metadata */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer ID</span>
                  <p className="font-mono font-bold text-blue-600 mt-0.5 text-xs">{selectedAlertForDrawer.customerId}</p>
                  <p className="text-[11px] text-slate-600 font-medium truncate mt-0.5">{selectedAlertForDrawer.customerName}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transaction ID</span>
                  <p className="font-mono font-bold text-slate-900 mt-0.5 text-xs">{selectedAlertForDrawer.transactionId}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{selectedAlertForDrawer.gateway}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount at Risk</span>
                  <p className="font-mono font-black text-slate-900 mt-0.5 text-sm">
                    ₹{(selectedAlertForDrawer.amount || 50000).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detection Time</span>
                  <p className="font-semibold text-slate-800 mt-0.5 text-xs">
                    {selectedAlertForDrawer.timestamp.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Status Update Actions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Triage Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['ACTIVE', 'INVESTIGATING', 'RESOLVED'] as AlertStatus[]).map(st => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(selectedAlertForDrawer.id, st)}
                      className={cn(
                        "py-2.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer",
                        selectedAlertForDrawer.status === st
                          ? "bg-slate-900 text-white border-slate-900 shadow-md"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Deep Actions */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
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

