import React from 'react';
import { ArrowLeft, ShieldAlert, ShieldCheck, AlertTriangle, CreditCard, Lock, PauseCircle, ExternalLink } from 'lucide-react';
import { useCustomer } from '../../context/CustomerContext';
import { cn } from '../../lib/utils';

export const CustomerHeaderBanner: React.FC = () => {
  const { selectedCustomer, activeTransactionId, activeAlertId, returnToAdmin } = useCustomer();

  if (!selectedCustomer) return null;

  const riskBadgeStyles = {
    CRITICAL: 'bg-rose-50 text-rose-700 border-rose-200',
    HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
    LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  const statusBadgeStyles = {
    FLAGGED: 'bg-rose-100 text-rose-800',
    ACTIVE: 'bg-emerald-100 text-emerald-800',
    FROZEN: 'bg-gray-200 text-gray-800'
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3.5 mb-6 -mx-8 -mt-8 sticky top-0 z-30 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Back to Admin & Customer Identification */}
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={returnToAdmin}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-xs"
            title="Return to Admin Risk & Alerts Portal"
          >
            <ArrowLeft className="w-4 h-4 text-gray-500" />
            <span>Back to Admin Portal</span>
          </button>

          <div className="h-6 w-px bg-gray-200 hidden sm:block" />

          {/* Customer ID & Profile Badge */}
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-gray-900 text-white tracking-wider">
              {selectedCustomer.id}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">{selectedCustomer.name}</span>
                <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider", statusBadgeStyles[selectedCustomer.status])}>
                  {selectedCustomer.status}
                </span>
              </div>
              <p className="text-[11px] text-gray-500">
                {selectedCustomer.accountType} • {selectedCustomer.email}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Risk Assessment & Context Badges */}
        <div className="flex items-center gap-3 flex-wrap">
          {activeTransactionId && (
            <div className="px-2.5 py-1 rounded-md bg-gray-50 border border-gray-200 text-xs flex items-center gap-1.5">
              <span className="text-gray-400 font-medium">Txn Focus:</span>
              <span className="font-mono font-bold text-gray-800">{activeTransactionId}</span>
            </div>
          )}

          <div className={cn("px-3 py-1 rounded-md border text-xs font-semibold flex items-center gap-1.5", riskBadgeStyles[selectedCustomer.riskLevel])}>
            {selectedCustomer.riskLevel === 'CRITICAL' ? (
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            ) : selectedCustomer.riskLevel === 'HIGH' ? (
              <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span>Risk Score: {selectedCustomer.riskScore}/100 ({selectedCustomer.riskLevel})</span>
          </div>

          <div className="text-[11px] text-gray-400 border-l border-gray-200 pl-3 hidden xl:block">
            Isolated View • {selectedCustomer.totalTransactions.toLocaleString()} Customer Txns
          </div>
        </div>
      </div>
    </div>
  );
};
