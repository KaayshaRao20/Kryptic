import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, CheckCircle, Clock, Shield, Layers, RefreshCw, Cpu } from 'lucide-react';
import { CONFIGURED_SYSTEMS } from '../services/CrossSystemRiskService';

export const Connectors: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Back Button & Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/cross-system')}
            className="p-2 rounded-xl bg-white border border-gray-200 text-textSecondary hover:text-textPrimary hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-textPrimary">Payment System Connectors</h1>
            <p className="text-xs text-textSecondary">
              Manage configured payment rails, telemetry pipelines, and cross-system correlation webhooks.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/cross-system')}
          className="px-4 py-2 bg-textPrimary text-white text-xs font-semibold rounded-xl hover:bg-textPrimary/90 transition-colors"
        >
          Return to Risk Intelligence
        </button>
      </div>

      {/* Notice Banner */}
      <div className="p-4 bg-purple-50/70 border border-purple-200/80 rounded-2xl flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5">
          <Cpu className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-purple-900">System Connector Orchestration Engine</h4>
          <p className="text-xs text-purple-700 mt-0.5 leading-relaxed">
            Connected systems (System A, System B, System C, and System D) are actively streaming synchronized telemetry into the KRYPTIC Digital Twin & Risk Engine. The self-service connector onboarding workflow is currently reserved for platform administrators.
          </p>
        </div>
      </div>

      {/* Active Connectors Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-textPrimary">Active Connected Payment Systems (4)</h3>
          <span className="text-xs font-medium text-emerald-600 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> All 4 Connectors Healthy
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CONFIGURED_SYSTEMS.map((sys) => (
            <div key={sys.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-white ${sys.color.bg}`}>
                    <Layers className="w-4 h-4" />
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {sys.status}
                  </span>
                </div>
                <h4 className="text-base font-bold text-textPrimary">{sys.name}</h4>
                <p className="text-xs text-textSecondary">{sys.category}</p>

                <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5 text-xs text-textSecondary">
                  <div className="flex justify-between">
                    <span>Processed:</span>
                    <strong className="text-textPrimary">{sys.transactionCount.toLocaleString()} txns</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Risk Index:</span>
                    <strong className="text-textPrimary">{sys.riskScore} / 100</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Heartbeat:</span>
                    <strong className="text-textPrimary">{sys.lastSeen}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[11px] text-textSecondary">
                <span>Protocol: gRPC / TLS 1.3</span>
                <span className="text-techBlue font-medium">Configured</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available Connector Integrations (Placeholder Slots) */}
      <div>
        <h3 className="text-sm font-bold text-textPrimary mb-3">Available Integration Protocols</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Generic Gateway Webhook v2', desc: 'Real-time JSON webhook receiver with HMAC-SHA256 signature verification.', status: 'Ready to Deploy' },
            { name: 'Core Banking ISO-8583 Adapter', desc: 'Direct socket connector for high-throughput core ledger feeds.', status: 'Staging' },
            { name: 'Real-Time UPI Switch Listener', desc: 'Low-latency packet inspection agent for UPI transaction flows.', status: 'Ready to Deploy' }
          ].map((item, idx) => (
            <div key={idx} className="bg-white border border-dashed border-gray-200 rounded-2xl p-5 hover:border-gray-300 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-textSecondary">
                  {item.status}
                </span>
                <Clock className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <h4 className="text-sm font-bold text-textPrimary">{item.name}</h4>
              <p className="text-xs text-textSecondary mt-1 leading-relaxed">{item.desc}</p>
              <button
                disabled
                className="mt-4 w-full py-2 bg-secondary/80 text-textSecondary text-xs font-semibold rounded-xl cursor-not-allowed text-center"
              >
                Provisioning via Admin Pipeline
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
