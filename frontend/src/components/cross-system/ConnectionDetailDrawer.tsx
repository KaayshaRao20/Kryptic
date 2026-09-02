import React from 'react';
import { X, Network, AlertTriangle, ShieldCheck, ArrowRight, Layers, Smartphone, Globe, Mail, CreditCard } from 'lucide-react';
import type {
  PaymentSystemInfo,
  CrossSystemConnection,
  EntityAttribute,
  RiskEntity,
  SystemId
} from '../../services/CrossSystemRiskService';

interface ConnectionDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  entity: RiskEntity;
  activeType: 'SYSTEM' | 'CONNECTION' | 'ATTRIBUTE' | null;
  activeSystem?: PaymentSystemInfo;
  activeConnection?: CrossSystemConnection;
  activeAttribute?: EntityAttribute;
  onSelectSystemFilter: (sysId: SystemId) => void;
}

export const ConnectionDetailDrawer: React.FC<ConnectionDetailDrawerProps> = ({
  isOpen,
  onClose,
  entity,
  activeType,
  activeSystem,
  activeConnection,
  activeAttribute,
  onSelectSystemFilter
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex">
      {/* Dim overlay */}
      <div className="fixed inset-0 bg-black/25 backdrop-blur-[1px]" onClick={onClose} />

      {/* Drawer */}
      <div className="relative ml-auto w-full sm:w-[440px] bg-white shadow-2xl flex flex-col h-full border-l border-gray-100 z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-secondary/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              {activeType === 'SYSTEM' && <Layers className="w-5 h-5" />}
              {activeType === 'CONNECTION' && <Network className="w-5 h-5" />}
              {activeType === 'ATTRIBUTE' && (
                activeAttribute?.type === 'Device' ? <Smartphone className="w-5 h-5" /> :
                activeAttribute?.type === 'IP Address' ? <Globe className="w-5 h-5" /> :
                activeAttribute?.type === 'Email' ? <Mail className="w-5 h-5" /> :
                <CreditCard className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-textPrimary">
                {activeType === 'SYSTEM' && `${activeSystem?.name} Intelligence`}
                {activeType === 'CONNECTION' && `${activeConnection?.systemName} ↔ ${entity.id}`}
                {activeType === 'ATTRIBUTE' && `${activeAttribute?.label}: ${activeAttribute?.value}`}
              </h3>
              <p className="text-[11px] text-textSecondary">
                {activeType === 'SYSTEM' && `${activeSystem?.category} · Configured Payment System`}
                {activeType === 'CONNECTION' && `Correlated Flow · ${activeConnection?.transactionCount} signals detected`}
                {activeType === 'ATTRIBUTE' && `Correlated Token across ${activeAttribute?.systemsObserved.length} systems`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-textSecondary hover:bg-secondary hover:text-textPrimary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* SYSTEM DETAILS VIEW */}
          {activeType === 'SYSTEM' && activeSystem && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary/60 p-3 rounded-xl">
                  <p className="text-[10px] uppercase font-bold text-textSecondary">System Status</p>
                  <p className="text-xs font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> {activeSystem.status}
                  </p>
                </div>
                <div className="bg-secondary/60 p-3 rounded-xl">
                  <p className="text-[10px] uppercase font-bold text-textSecondary">Risk Score</p>
                  <p className="text-xs font-bold text-textPrimary mt-1">{activeSystem.riskScore} / 100</p>
                </div>
                <div className="bg-secondary/60 p-3 rounded-xl">
                  <p className="text-[10px] uppercase font-bold text-textSecondary">Total Volume</p>
                  <p className="text-xs font-bold text-textPrimary mt-1">{activeSystem.transactionCount.toLocaleString()} txns</p>
                </div>
                <div className="bg-secondary/60 p-3 rounded-xl">
                  <p className="text-[10px] uppercase font-bold text-textSecondary">Last Telemetry Sync</p>
                  <p className="text-xs font-bold text-textPrimary mt-1">{activeSystem.lastSeen}</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Connected Cross-System Entity</h4>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-rose-700">{entity.id}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
                      {entity.connections[activeSystem.id]?.transactionCount || 0} Txns
                    </span>
                  </div>
                  <p className="text-[11px] text-textSecondary">
                    Contributes to anomalous velocity score inside {activeSystem.name}.
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Cross-System Signals Observed</h4>
                <ul className="space-y-2">
                  {entity.connections[activeSystem.id]?.signals.map((sig, i) => (
                    <li key={i} className="text-xs text-textSecondary flex items-start gap-2 bg-secondary/40 p-2.5 rounded-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                      <span>{sig}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => {
                  onSelectSystemFilter(activeSystem.id);
                  onClose();
                }}
                className="w-full py-2.5 bg-techBlue text-white text-xs font-semibold rounded-xl hover:bg-techBlue/90 transition-colors flex items-center justify-center gap-1.5"
              >
                Filter Workspace to {activeSystem.name} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {/* CONNECTION SIGNALS VIEW */}
          {activeType === 'CONNECTION' && activeConnection && (
            <>
              <div className="p-4 rounded-xl border border-gray-100 bg-secondary/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-textPrimary">Anomaly Correlation Weight</span>
                  <span className="text-xs font-bold text-rose-600">{activeConnection.anomalyWeight}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{ width: `${activeConnection.anomalyWeight}%` }}
                  />
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Signals Creating This Connection</h4>
                <div className="space-y-2">
                  {activeConnection.signals.map((signal, index) => (
                    <div key={index} className="p-3 bg-white border border-gray-100 rounded-xl shadow-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-xs font-bold text-textPrimary">Signal #{index + 1}</span>
                      </div>
                      <p className="text-xs text-textSecondary leading-relaxed">{signal}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-secondary/40 p-3 rounded-xl text-xs space-y-1 text-textSecondary">
                <p><strong>Connection Classification:</strong> {activeConnection.connectionType.replace('_', ' ')}</p>
                <p><strong>Total Transactions Intercepted:</strong> {activeConnection.transactionCount}</p>
                <p><strong>Last Associated Activity:</strong> {activeConnection.lastActivity}</p>
              </div>
            </>
          )}

          {/* ATTRIBUTE TOKEN VIEW */}
          {activeType === 'ATTRIBUTE' && activeAttribute && (
            <>
              <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-xl">
                <p className="text-[10px] uppercase font-bold text-purple-700">{activeAttribute.type} Identifier</p>
                <p className="text-sm font-mono font-bold text-textPrimary mt-0.5">{activeAttribute.value}</p>
                <p className="text-xs text-textSecondary mt-2 leading-relaxed">{activeAttribute.notes}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Observed Across Configured Systems</h4>
                <div className="flex flex-wrap gap-2">
                  {activeAttribute.systemsObserved.map((sysId) => (
                    <span
                      key={sysId}
                      className="px-3 py-1 bg-white border border-gray-200 text-xs font-semibold rounded-lg shadow-xs"
                    >
                      {sysId === 'SYS-A' ? 'System A (Payment Gateway)' :
                       sysId === 'SYS-B' ? 'System B (Payment Gateway)' :
                       sysId === 'SYS-C' ? 'System C (UPI Provider)' : 'System D (Banking Partner)'}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                <strong>Anomalous Entity Linkage:</strong> This token appears in high-velocity batches across independent payment rails without corresponding session authentication history.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
