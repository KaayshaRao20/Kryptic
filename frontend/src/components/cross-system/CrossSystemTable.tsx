import React, { useState } from 'react';
import { Search, ShieldAlert, ArrowUpRight, ExternalLink, Filter } from 'lucide-react';
import type { CorrelatedTransaction, SystemId, RiskLevel } from '../../services/CrossSystemRiskService';

interface CrossSystemTableProps {
  transactions: CorrelatedTransaction[];
  selectedSystemId: SystemId | 'ALL';
  onSelectEntity: (entityId: string) => void;
  onSelectTransaction: (txn: CorrelatedTransaction) => void;
}

export const CrossSystemTable: React.FC<CrossSystemTableProps> = ({
  transactions,
  selectedSystemId,
  onSelectEntity,
  onSelectTransaction
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Flagged' | 'Challenged' | 'Monitored'>('ALL');

  const filtered = transactions.filter((txn) => {
    const matchesSystem = selectedSystemId === 'ALL' || txn.systemId === selectedSystemId;
    const matchesStatus = statusFilter === 'ALL' || txn.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.entityId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.primarySignal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.ipAddress.includes(searchQuery);
    return matchesSystem && matchesStatus && matchesSearch;
  });

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-2xl overflow-hidden p-4">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="w-4 h-4 text-textSecondary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Entity, Txn ID, Signal, IP..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-secondary/60 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-techBlue"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {(['ALL', 'Flagged', 'Challenged', 'Monitored'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === status
                  ? 'bg-textPrimary text-white'
                  : 'text-textSecondary hover:bg-secondary'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[380px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-[10.5px] font-bold text-textSecondary uppercase tracking-wider bg-gray-50/50">
              <th className="py-2.5 px-3">Transaction</th>
              <th className="py-2.5 px-3">Entity</th>
              <th className="py-2.5 px-3">System</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Amount</th>
              <th className="py-2.5 px-3">Risk</th>
              <th className="py-2.5 px-3">Cross-System Signal</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-textSecondary">
                  No cross-system transactions matching criteria.
                </td>
              </tr>
            ) : (
              filtered.map((txn) => {
                const sysBadgeColor =
                  txn.systemId === 'SYS-A' ? 'bg-purple-100 text-purple-700' :
                  txn.systemId === 'SYS-B' ? 'bg-blue-100 text-blue-700' :
                  txn.systemId === 'SYS-C' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-orange-100 text-orange-700';

                return (
                  <tr
                    key={txn.id}
                    onClick={() => onSelectTransaction(txn)}
                    className="hover:bg-secondary/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3 font-mono font-medium text-textPrimary text-[11px]">
                      {txn.id}
                    </td>
                    <td className="py-3 px-3 font-semibold text-techBlue">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEntity(txn.entityId);
                        }}
                        className="hover:underline flex items-center gap-1"
                      >
                        {txn.entityId}
                      </button>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${sysBadgeColor}`}>
                        {txn.systemName}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-textSecondary">{txn.type}</td>
                    <td className="py-3 px-3 font-semibold text-textPrimary">
                      ₹{txn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          txn.riskScore >= 75
                            ? 'bg-rose-100 text-rose-700'
                            : txn.riskScore >= 50
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {txn.riskScore}/100
                      </span>
                    </td>
                    <td className="py-3 px-3 text-textSecondary text-[11px] max-w-[200px] truncate" title={txn.primarySignal}>
                      {txn.primarySignal}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          txn.status === 'Flagged'
                            ? 'bg-rose-50 text-rose-600 border border-rose-200'
                            : txn.status === 'Challenged'
                            ? 'bg-amber-50 text-amber-600 border border-amber-200'
                            : txn.status === 'Monitored'
                            ? 'bg-blue-50 text-blue-600 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        }`}
                      >
                        {txn.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEntity(txn.entityId);
                        }}
                        className="p-1 rounded-lg hover:bg-secondary text-textSecondary hover:text-techBlue transition-colors inline-flex items-center gap-1 text-[11px] font-medium"
                      >
                        Inspect <ArrowUpRight className="w-3 h-3" />
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
  );
};
