import React from 'react';
import {
  FileText,
  BarChart2,
  ShieldCheck,
  Zap,
  TrendingUp,
  Cpu,
  Layers,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertOctagon
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const AdminReports: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">System Risk Intelligence & Audit Reports</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
              Admin Portal
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Global evaluation metrics, ML model performance audit, and cross-system rail telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold text-gray-700">Audit Status: Validated (No Data Leakage)</span>
        </div>
      </div>

      {/* ─── Top Row: Active ML Model Performance ─── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-5 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900">Primary Fraud Detection Engine: XGBoost v2.0.0</h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Production Active
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Evaluated on 60,200 untouched holdout financial transactions with stratified cross-validation.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-gray-400">Inference Latency: </span>
              <strong className="text-gray-900">0.503 ms</strong>
            </div>
            <div className="h-4 w-px bg-gray-200" />
            <div>
              <span className="text-gray-400">Throughput: </span>
              <strong className="text-gray-900">1,980 tx/sec</strong>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-100">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Holdout Accuracy</span>
            <span className="text-xl font-bold text-gray-900 mt-1 block">99.988%</span>
            <span className="text-[10px] font-medium text-emerald-600">Target &gt;90% Passed</span>
          </div>

          <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-100">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Precision</span>
            <span className="text-xl font-bold text-gray-900 mt-1 block">98.312%</span>
            <span className="text-[10px] font-medium text-gray-500">Only 4 FP / 59.9k txns</span>
          </div>

          <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-100">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Recall</span>
            <span className="text-xl font-bold text-gray-900 mt-1 block">98.729%</span>
            <span className="text-[10px] font-medium text-emerald-600">233 of 236 Frauds</span>
          </div>

          <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-100">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">F1 Score</span>
            <span className="text-xl font-bold text-gray-900 mt-1 block">0.9852</span>
            <span className="text-[10px] font-medium text-emerald-600">Harmonic Balance</span>
          </div>

          <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-100">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">ROC-AUC</span>
            <span className="text-xl font-bold text-gray-900 mt-1 block">0.9989</span>
            <span className="text-[10px] font-medium text-emerald-600">Near-Optimal Curve</span>
          </div>

          <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-100">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">False Positive Rate</span>
            <span className="text-xl font-bold text-gray-900 mt-1 block">0.0067%</span>
            <span className="text-[10px] font-medium text-emerald-600">Ultra-Low Friction</span>
          </div>
        </div>
      </div>

      {/* ─── Middle: Confusion Matrix & Cross-System Gateway Risk ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Holdout Confusion Matrix */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-gray-900 mb-1">Holdout Confusion Matrix (60,200 Unseen Samples)</h3>
          <p className="text-xs text-gray-500 mb-5">Independent evaluation on untouched holdout test partition.</p>

          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 text-center">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">True Negatives (TN)</span>
              <span className="text-2xl font-black text-emerald-900 mt-1 block">59,960</span>
              <span className="text-[11px] text-emerald-700">99.993% Genuine Approved</span>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 text-center">
              <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">False Positives (FP)</span>
              <span className="text-2xl font-black text-amber-900 mt-1 block">4</span>
              <span className="text-[11px] text-amber-700">0.0067% False Alarms</span>
            </div>

            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 text-center">
              <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider block">False Negatives (FN)</span>
              <span className="text-2xl font-black text-rose-900 mt-1 block">3</span>
              <span className="text-[11px] text-rose-700">1.27% Missed Frauds</span>
            </div>

            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 text-center">
              <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block">True Positives (TP)</span>
              <span className="text-2xl font-black text-blue-900 mt-1 block">233</span>
              <span className="text-[11px] text-blue-700">98.73% Fraud Captured</span>
            </div>
          </div>
        </div>

        {/* Multi-System Risk Intelligence */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-gray-900 mb-1">Cross-System Gateway Telemetry</h3>
          <p className="text-xs text-gray-500 mb-5">Aggregated risk score and anomaly velocity across payment rails.</p>

          <div className="space-y-3.5">
            {[
              { id: 'SYS-A', name: 'System A (Card Gateway)', score: 62, level: 'MEDIUM', txns: '125,430 txns', note: 'Unusual refund velocity in merchant tier 2' },
              { id: 'SYS-B', name: 'System B (Instant UPI)', score: 89, level: 'CRITICAL', txns: '94,210 txns', note: 'High OTP failure burst from proxy subnets' },
              { id: 'SYS-C', name: 'System C (Core Banking Rail)', score: 24, level: 'LOW', txns: '210,500 txns', note: 'Nominal baseline clearing' },
              { id: 'SYS-D', name: 'System D (Cross-Border Switch)', score: 76, level: 'HIGH', txns: '38,120 txns', note: 'Elevated cross-border volume to high-risk corridors' },
            ].map(sys => (
              <div key={sys.id} className="p-3.5 rounded-lg border border-gray-100 bg-gray-50/60 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-gray-900">{sys.name}</span>
                    <span className={cn(
                      "text-[10px] font-bold px-1.5 py-0.2 rounded uppercase",
                      sys.level === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : sys.level === 'HIGH' ? 'bg-orange-100 text-orange-700' : sys.level === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    )}>
                      {sys.level}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">{sys.note}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-bold font-mono text-gray-900">{sys.score}/100</span>
                  <span className="text-[10px] text-gray-400 block">{sys.txns}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
