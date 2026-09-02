import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  Headphones,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  Clock,
  Search
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface AuditEntry {
  id: string;
  time: string;
  actor: 'SYSTEM' | 'ADMIN' | 'RISK ENGINE';
  action: string;
  target: string;
  riskScore?: number;
  result: string;
}

const AUDIT_DATA: AuditEntry[] = [
  { id: 'aud-1', time: '23:31:42', actor: 'SYSTEM', action: 'Critical transaction blocked', target: 'TXN-12345 (CUST-001)', riskScore: 94, result: 'Zero-loss interception' },
  { id: 'aud-2', time: '23:29:18', actor: 'ADMIN', action: 'Customer account flagged', target: 'CUST-002', riskScore: 88, result: '2FA enforced' },
  { id: 'aud-3', time: '23:25:03', actor: 'RISK ENGINE', action: 'High-risk velocity detected', target: 'TXN-88192 (CUST-2048)', riskScore: 78, result: 'Escalated to L2 Queue' },
  { id: 'aud-4', time: '23:18:50', actor: 'SYSTEM', action: 'Card token suspended', target: 'CARD-9921', riskScore: 82, result: 'Merchant notify sent' },
  { id: 'aud-5', time: '23:12:10', actor: 'ADMIN', action: 'Customer alert resolved', target: 'ALT-1094', result: 'Marked False Positive' },
  { id: 'aud-6', time: '23:05:40', actor: 'RISK ENGINE', action: 'XGBoost retraining batch verified', target: 'v2.0.0-xgb', result: '99.98% accuracy confirmed' },
];

const CUSTOMER_SERVICE_RECORDS = [
  { time: '23:31', customer: 'CUST-001', name: 'Apex Merchant Solutions', action: 'Transaction Blocked', reason: 'Critical spike anomaly', status: 'Completed' },
  { time: '23:18', customer: 'CUST-002', name: 'Quantum Digital Retail', action: 'Account Flagged', reason: 'OTP brute-force anomaly', status: 'Investigating' },
  { time: '22:54', customer: 'CUST-006', name: 'Global Logistics Hub', action: 'Payment Restricted', reason: 'Cross-border sanction risk', status: 'Completed' },
  { time: '22:30', customer: 'CUST-004', name: 'HyperFlow Direct', action: '2FA Reset Approved', reason: 'Customer identity verified', status: 'Resolved' },
  { time: '22:15', customer: 'CUST-005', name: 'SwiftPay P2P Network', action: 'Temporary Hold Lifted', reason: 'Legitimate holiday sale proof', status: 'Completed' },
];

export const OperationsSection: React.FC<{ onInspectCustomer?: (customerId: string) => void }> = ({ onInspectCustomer }) => {
  const [activeTab, setActiveTab] = useState<'REPORTS' | 'AUDIT' | 'SERVICES'>('REPORTS');
  const [auditFilter, setAuditFilter] = useState<'TODAY' | '7D' | '30D'>('TODAY');

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs flex flex-col">
      {/* ─── Operations Header with Tab Switcher ─── */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Reports & Operations Console</h2>
            <p className="text-[11px] text-gray-400">Auditing, daily executive summaries, and customer risk defense logs</p>
          </div>
        </div>

        {/* 3 Major Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-xs">
          <button
            onClick={() => setActiveTab('REPORTS')}
            className={cn(
              "px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5",
              activeTab === 'REPORTS' ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
            )}
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Daily Reports</span>
          </button>

          <button
            onClick={() => setActiveTab('AUDIT')}
            className={cn(
              "px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5",
              activeTab === 'AUDIT' ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
            )}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Audit Trails</span>
          </button>

          <button
            onClick={() => setActiveTab('SERVICES')}
            className={cn(
              "px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5",
              activeTab === 'SERVICES' ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
            )}
          >
            <Headphones className="w-3.5 h-3.5 text-amber-600" />
            <span>Customer Services</span>
          </button>
        </div>
      </div>

      {/* ─── TAB 1: REPORTS ─── */}
      {activeTab === 'REPORTS' && (
        <div className="p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Daily Risk Summary Card */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Daily Risk Summary (Today)
                </span>
                <span className="text-[11px] font-mono text-gray-500">01 Sep 2026</span>
              </div>

              <div className="grid grid-cols-5 gap-2 text-center pt-1">
                <div className="p-2 rounded-lg bg-white border border-gray-200">
                  <span className="text-[10px] text-gray-400 block font-semibold">Total</span>
                  <span className="font-mono text-sm font-bold text-gray-900">37</span>
                </div>
                <div className="p-2 rounded-lg bg-rose-50 border border-rose-200">
                  <span className="text-[10px] text-rose-600 block font-semibold">Critical</span>
                  <span className="font-mono text-sm font-bold text-rose-700">12</span>
                </div>
                <div className="p-2 rounded-lg bg-orange-50 border border-orange-200">
                  <span className="text-[10px] text-orange-600 block font-semibold">High</span>
                  <span className="font-mono text-sm font-bold text-orange-700">9</span>
                </div>
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-200">
                  <span className="text-[10px] text-amber-600 block font-semibold">Medium</span>
                  <span className="font-mono text-sm font-bold text-amber-700">11</span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] text-emerald-600 block font-semibold">Low</span>
                  <span className="font-mono text-sm font-bold text-emerald-700">5</span>
                </div>
              </div>
            </div>

            {/* Actions Taken Card */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Automated Enforcement & Reviews
                </span>
                <span className="text-[11px] font-semibold text-emerald-600">Zero Breach</span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center pt-1">
                <div className="p-2 rounded-lg bg-white border border-gray-200">
                  <span className="text-[10px] text-gray-400 block font-semibold">Blocked</span>
                  <span className="font-mono text-sm font-bold text-rose-600">28</span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-gray-200">
                  <span className="text-[10px] text-gray-400 block font-semibold">Flagged</span>
                  <span className="font-mono text-sm font-bold text-orange-600">14</span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-gray-200">
                  <span className="text-[10px] text-gray-400 block font-semibold">Inquiries</span>
                  <span className="font-mono text-sm font-bold text-blue-600">19</span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-gray-200">
                  <span className="text-[10px] text-gray-400 block font-semibold">Cleared</span>
                  <span className="font-mono text-sm font-bold text-emerald-600">342</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 shadow-xs transition-colors">
              <Download className="w-3.5 h-3.5 text-gray-500" />
              <span>Download Executive PDF</span>
            </button>
            <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-xs transition-colors">
              <span>Generate Daily Report →</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── TAB 2: AUDIT TRAILS ─── */}
      {activeTab === 'AUDIT' && (
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-900">Immutable Audit Ledger</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono font-semibold border border-emerald-200">
                Tamper-Evident SHA-256
              </span>
            </div>

            <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-xs">
              <button
                onClick={() => setAuditFilter('TODAY')}
                className={cn("px-2.5 py-1 rounded font-semibold", auditFilter === 'TODAY' ? "bg-white text-gray-900 shadow-xs" : "text-gray-500")}
              >
                Today
              </button>
              <button
                onClick={() => setAuditFilter('7D')}
                className={cn("px-2.5 py-1 rounded font-semibold", auditFilter === '7D' ? "bg-white text-gray-900 shadow-xs" : "text-gray-500")}
              >
                7 Days
              </button>
              <button
                onClick={() => setAuditFilter('30D')}
                className={cn("px-2.5 py-1 rounded font-semibold", auditFilter === '30D' ? "bg-white text-gray-900 shadow-xs" : "text-gray-500")}
              >
                30 Days
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 text-[11px] uppercase border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Timestamp</th>
                  <th className="px-4 py-2.5 font-semibold">Actor</th>
                  <th className="px-4 py-2.5 font-semibold">Action Triggered</th>
                  <th className="px-4 py-2.5 font-semibold">Target Entity</th>
                  <th className="px-4 py-2.5 font-semibold">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {AUDIT_DATA.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-gray-500 font-medium">{a.time}</td>
                    <td className="px-4 py-2.5">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                        a.actor === 'SYSTEM' ? "bg-blue-50 text-blue-700" :
                        a.actor === 'ADMIN' ? "bg-purple-50 text-purple-700" : "bg-emerald-50 text-emerald-700"
                      )}>
                        {a.actor}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-gray-900">{a.action}</td>
                    <td className="px-4 py-2.5 font-mono text-blue-600 font-medium">{a.target}</td>
                    <td className="px-4 py-2.5 text-gray-600">{a.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 3: CUSTOMER SERVICES ─── */}
      {activeTab === 'SERVICES' && (
        <div className="p-5 space-y-5">
          {/* Customer Service Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3 rounded-xl border border-gray-200 bg-gray-50/50">
              <span className="text-[10px] font-semibold text-gray-400 uppercase block">Customers Assisted</span>
              <span className="font-mono text-lg font-bold text-gray-900">342</span>
            </div>
            <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/30">
              <span className="text-[10px] font-semibold text-emerald-700 uppercase block">Accounts Protected</span>
              <span className="font-mono text-lg font-bold text-emerald-800">87</span>
            </div>
            <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/30">
              <span className="text-[10px] font-semibold text-rose-700 uppercase block">Txns Stopped</span>
              <span className="font-mono text-lg font-bold text-rose-800">28</span>
            </div>
            <div className="p-3 rounded-xl border border-orange-200 bg-orange-50/30">
              <span className="text-[10px] font-semibold text-orange-700 uppercase block">Accounts Restricted</span>
              <span className="font-mono text-lg font-bold text-orange-800">14</span>
            </div>
            <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/30">
              <span className="text-[10px] font-semibold text-blue-700 uppercase block">Cases Resolved</span>
              <span className="font-mono text-lg font-bold text-blue-800">219</span>
            </div>
          </div>

          {/* Customer Support Resolution Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 text-[11px] uppercase border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Time</th>
                  <th className="px-4 py-2.5 font-semibold">Customer</th>
                  <th className="px-4 py-2.5 font-semibold">Protective Action</th>
                  <th className="px-4 py-2.5 font-semibold">Risk Reason</th>
                  <th className="px-4 py-2.5 font-semibold">Status</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {CUSTOMER_SERVICE_RECORDS.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-gray-500 font-medium">{r.time}</td>
                    <td className="px-4 py-2.5">
                      <div className="font-semibold text-gray-900">{r.customer}</div>
                      <div className="text-[10px] text-gray-400">{r.name}</div>
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-gray-800">{r.action}</td>
                    <td className="px-4 py-2.5 text-gray-600">{r.reason}</td>
                    <td className="px-4 py-2.5">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                        r.status === 'Completed' || r.status === 'Resolved' ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      )}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => onInspectCustomer && onInspectCustomer(r.customer)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Inspect →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
