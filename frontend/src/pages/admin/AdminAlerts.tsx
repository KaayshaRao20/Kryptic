import React, { useState } from 'react';
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
  DollarSign,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useCustomer } from '../../context/CustomerContext';
import { INITIAL_ALERTS, type KrypticAlert, type AlertSeverity, type AlertStatus } from '../../services/AlertsService';
import { cn } from '../../lib/utils';

export const AdminAlerts: React.FC = () => {
  const navigate = useNavigate();
  const { selectCustomer } = useCustomer();
  const [alerts, setAlerts] = useState<KrypticAlert[]>(INITIAL_ALERTS);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredAlerts = alerts.filter(alert => {
    if (selectedSeverity !== 'ALL' && alert.severity !== selectedSeverity) return false;
    if (selectedStatus !== 'ALL' && alert.status !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        alert.id.toLowerCase().includes(q) ||
        alert.customerId.toLowerCase().includes(q) ||
        alert.transactionId.toLowerCase().includes(q) ||
        alert.title.toLowerCase().includes(q) ||
        (alert.customerName && alert.customerName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const severityBadges: Record<AlertSeverity, { badge: string; dot: string }> = {
    CRITICAL: { badge: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
    HIGH: { badge: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
    MEDIUM: { badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
    LOW: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' }
  };

  const statusBadges: Record<AlertStatus, string> = {
    ACTIVE: 'bg-rose-50 text-rose-700 border-rose-200',
    INVESTIGATING: 'bg-amber-50 text-amber-700 border-amber-200',
    RESOLVED: 'bg-gray-100 text-gray-600 border-gray-200'
  };

  const handleOpenCustomer = (alert: KrypticAlert) => {
    selectCustomer(alert.customerId, {
      transactionId: alert.transactionId,
      alertId: alert.id,
      targetPath: `/customer/${alert.customerId}/dashboard`
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Risk & Alerts Command Queue</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
              Admin Portal
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Centrally monitor high-risk events. Click any alert to inspect the customer's isolated Digital Twin and payment history.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-500">
            Total Alerts: <strong className="text-gray-900">{alerts.length}</strong> (Filtered: {filteredAlerts.length})
          </div>
        </div>
      </div>

      {/* ─── Search & Filters Bar ─── */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Customer ID, Txn ID, name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-gray-300 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap justify-end">
          {/* Severity */}
          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200 text-xs">
            <span className="text-gray-400 px-2 font-medium">Severity:</span>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(sev => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={cn(
                  "px-2.5 py-1 rounded-md font-semibold transition-all text-xs",
                  selectedSeverity === sev
                    ? "bg-white text-gray-900 shadow-xs border border-gray-200"
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Status */}
          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200 text-xs">
            <span className="text-gray-400 px-2 font-medium">Status:</span>
            {['ALL', 'ACTIVE', 'INVESTIGATING', 'RESOLVED'].map(st => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={cn(
                  "px-2 py-1 rounded-md font-semibold transition-all text-[11px]",
                  selectedStatus === st
                    ? "bg-white text-gray-900 shadow-xs border border-gray-200"
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Alerts Table ─── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">Severity & Score</th>
                <th className="py-3 px-4">Customer ID</th>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Alert Title & Type</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Gateway</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-400 font-medium">
                    No alerts found matching the active filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map(alert => (
                  <tr
                    key={alert.id}
                    onClick={() => handleOpenCustomer(alert)}
                    className="hover:bg-gray-50/80 cursor-pointer transition-colors group"
                  >
                    {/* Severity */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={cn("w-2 h-2 rounded-full shrink-0", severityBadges[alert.severity].dot)} />
                        <span className={cn("px-2 py-0.5 rounded border text-[11px] font-bold uppercase", severityBadges[alert.severity].badge)}>
                          {alert.severity} ({alert.riskScore})
                        </span>
                      </div>
                    </td>

                    {/* Customer ID */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div>
                        <span className="font-mono font-bold text-blue-600 group-hover:underline">
                          {alert.customerId}
                        </span>
                        <p className="text-[11px] text-gray-400">{alert.customerName || 'Enterprise Customer'}</p>
                      </div>
                    </td>

                    {/* Transaction ID */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                        {alert.transactionId}
                      </span>
                    </td>

                    {/* Alert Title */}
                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-semibold text-gray-900 truncate">{alert.title}</p>
                      <p className="text-[11px] text-gray-400 truncate">{alert.description}</p>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono font-medium text-gray-900">
                      ₹{(alert.amount || 50000).toLocaleString()}
                    </td>

                    {/* Gateway */}
                    <td className="py-3 px-4 whitespace-nowrap text-gray-600">
                      {alert.gateway || 'System A'}
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-4 whitespace-nowrap text-gray-400 text-[11px]">
                      {alert.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase border", statusBadges[alert.status])}>
                        {alert.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenCustomer(alert);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-xs"
                      >
                        <span>Customer View</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
