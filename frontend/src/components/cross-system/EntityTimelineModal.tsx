import React from 'react';
import { X, Clock, AlertTriangle, ShieldCheck, ArrowRight, ShieldAlert, Smartphone, Globe } from 'lucide-react';
import type { RiskEntity } from '../../services/CrossSystemRiskService';

interface EntityTimelineModalProps {
  entity: RiskEntity;
  isOpen: boolean;
  onClose: () => void;
}

export const EntityTimelineModal: React.FC<EntityTimelineModalProps> = ({ entity, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      {/* Modal Container */}
      <div
        className="relative w-full max-w-3xl max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col mx-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50/80 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-200">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-textPrimary">{entity.id}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                  {entity.riskLevel} RISK ({entity.riskScore}/100)
                </span>
              </div>
              <p className="text-xs text-textSecondary">
                Cross-System Multi-Hop Activity Timeline ({entity.systemsInvolved} Configured Systems Involved)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-textSecondary hover:bg-secondary hover:text-textPrimary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Summary Grid */}
          <div className="grid grid-cols-4 gap-3 bg-secondary/60 p-4 rounded-xl">
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-textSecondary">First Seen</p>
              <p className="text-xs font-bold text-textPrimary mt-0.5">{entity.firstSeen}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-textSecondary">Last Seen</p>
              <p className="text-xs font-bold text-textPrimary mt-0.5">{entity.lastSeen}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-textSecondary">Total Transactions</p>
              <p className="text-xs font-bold text-textPrimary mt-0.5">{entity.totalTransactions.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-textSecondary">Risk Classification</p>
              <p className="text-xs font-bold text-rose-600 mt-0.5">{entity.riskCategory}</p>
            </div>
          </div>

          {/* Timeline Stream */}
          <div>
            <h4 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> Correlated Signal Progression
            </h4>

            <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-200">
              {entity.timeline.map((event, idx) => {
                const sysBadgeColor =
                  event.systemId === 'SYS-A' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                  event.systemId === 'SYS-B' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                  event.systemId === 'SYS-C' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                  'bg-orange-100 text-orange-700 border-orange-200';

                const dotColor =
                  event.riskLevel === 'HIGH' ? 'bg-rose-500 ring-rose-200' :
                  event.riskLevel === 'MEDIUM' ? 'bg-orange-400 ring-orange-200' :
                  'bg-emerald-500 ring-emerald-200';

                return (
                  <div key={event.id} className="relative group">
                    {/* Glowing timeline dot */}
                    <div
                      className={`absolute -left-[19px] top-1.5 w-3 h-3 rounded-full ${dotColor} ring-4 ring-offset-1`}
                    />

                    {/* Event Card */}
                    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm group-hover:border-gray-300 transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${sysBadgeColor}`}>
                            {event.systemName}
                          </span>
                          <span className="text-xs font-bold text-textPrimary">{event.action}</span>
                          {event.amount && (
                            <span className="text-xs font-mono font-semibold text-textPrimary bg-gray-50 px-2 py-0.5 rounded">
                              {event.amount}
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] font-medium text-textSecondary">{event.timeAgo}</span>
                          <p className="text-[10px] text-gray-400">{event.timestamp}</p>
                        </div>
                      </div>

                      <p className="text-xs text-textSecondary mb-3 leading-relaxed">
                        {event.signalDetail}
                      </p>

                      <div className="flex items-center gap-4 text-[10.5px] text-textSecondary pt-2 border-t border-gray-50 flex-wrap">
                        <span>Channel: <strong className="text-textPrimary">{event.channel}</strong></span>
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3 text-gray-400" /> IP: <code className="text-textPrimary">{event.ip}</code>
                        </span>
                        <span className="flex items-center gap-1">
                          <Smartphone className="w-3 h-3 text-gray-400" /> Device: <code className="text-textPrimary">{event.device}</code>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <p className="text-xs text-textSecondary">
            Entity intelligence synced with local detection engine.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-textPrimary text-white text-xs font-semibold rounded-xl hover:bg-textPrimary/90 transition-colors"
          >
            Close Timeline
          </button>
        </div>
      </div>
    </div>
  );
};
