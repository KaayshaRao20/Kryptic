import React from 'react';
import { ShieldAlert, AlertOctagon, X, CheckCircle, ArrowRight, Ban, Eye, Search } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface CriticalIncident {
  id: string;
  customerId: string;
  customerName: string;
  transactionId: string;
  amount: number;
  riskScore: number;
  gateway: string;
  ruleViolated: string;
  timestamp: string;
}

interface CriticalAlertModalProps {
  incident: CriticalIncident | null;
  isOpen: boolean;
  onClose: () => void;
  onBlock: (incident: CriticalIncident) => void;
  onInvestigate: (incident: CriticalIncident) => void;
  onInspectCustomer: (customerId: string, txnId?: string) => void;
}

export const CriticalAlertModal: React.FC<CriticalAlertModalProps> = ({
  incident,
  isOpen,
  onClose,
  onBlock,
  onInvestigate,
  onInspectCustomer
}) => {
  if (!isOpen || !incident) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-lg bg-[#0F172A] border border-rose-500/50 rounded-2xl shadow-2xl text-slate-100 overflow-hidden animate-critical-pulse">
        {/* Modal Top Urgency Header */}
        <div className="bg-rose-950/80 border-b border-rose-900/60 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-600/30 border border-rose-500 flex items-center justify-center text-rose-400">
              <AlertOctagon className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wider text-rose-400 uppercase">
                  🚨 CRITICAL RISK EVENT
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500 text-white font-mono">
                  SCORE: {incident.riskScore}/100
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">
                {incident.ruleViolated}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Info */}
        <div className="p-5 space-y-4 text-xs">
          {/* Key Incident Grid */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <div>
              <span className="text-slate-400 text-[11px] block">Customer Account</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">{incident.customerId}</span>
              <span className="text-[10px] text-slate-400 block truncate">{incident.customerName}</span>
            </div>

            <div>
              <span className="text-slate-400 text-[11px] block">Transaction ID</span>
              <span className="font-mono font-bold text-blue-400 text-sm">{incident.transactionId}</span>
              <span className="text-[10px] text-slate-400 block">Gateway: {incident.gateway}</span>
            </div>

            <div>
              <span className="text-slate-400 text-[11px] block">Attempted Amount</span>
              <span className="font-mono font-bold text-white text-base">
                ₹{incident.amount.toLocaleString()}
              </span>
            </div>

            <div>
              <span className="text-slate-400 text-[11px] block">Detected Time</span>
              <span className="font-mono font-medium text-slate-300">{incident.timestamp}</span>
              <span className="text-[10px] text-rose-400 font-semibold block">ML Confidence: 99.4%</span>
            </div>
          </div>

          {/* Automated System Pre-Actions */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Automated Response Triggered:
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Transaction halted</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Session flagged</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Gateway telemetry logged</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Audit trail generated</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={() => onBlock(incident)}
            className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Block Transaction</span>
          </button>

          <button
            onClick={() => onInvestigate(incident)}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
          >
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <span>Investigate</span>
          </button>

          <button
            onClick={() => onInspectCustomer(incident.customerId, incident.transactionId)}
            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Customer →</span>
          </button>
        </div>
      </div>
    </div>
  );
};
