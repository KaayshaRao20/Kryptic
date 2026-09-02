import React, { useState, useEffect } from 'react';
import { Server, Activity, ArrowUpRight, ShieldAlert, CheckCircle2, AlertTriangle, Zap, Cpu } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SystemNode {
  id: string;
  name: string;
  type: string;
  status: 'OPERATIONAL' | 'CRITICAL' | 'ELEVATED' | 'DEGRADED';
  load: number;
  latencyMs: number;
  riskScore: number;
  throughput: number;
  history: number[];
}

const INITIAL_SYSTEMS: SystemNode[] = [
  {
    id: 'sys-a',
    name: 'System A — Card Gateway',
    type: 'Visa / Mastercard Direct Switch',
    status: 'OPERATIONAL',
    load: 68,
    latencyMs: 42,
    riskScore: 62,
    throughput: 1245,
    history: [45, 52, 60, 58, 64, 68]
  },
  {
    id: 'sys-b',
    name: 'System B — Instant UPI Rail',
    type: 'NPCI Switch & High-Volume PSPs',
    status: 'CRITICAL',
    load: 84,
    latencyMs: 28,
    riskScore: 89,
    throughput: 1892,
    history: [60, 72, 78, 82, 85, 84]
  },
  {
    id: 'sys-c',
    name: 'System C — Core Banking Rail',
    type: 'Settlement & CBS Gateway',
    status: 'OPERATIONAL',
    load: 45,
    latencyMs: 110,
    riskScore: 24,
    throughput: 620,
    history: [42, 44, 46, 43, 47, 45]
  },
  {
    id: 'sys-d',
    name: 'System D — Cross-Border Switch',
    type: 'SWIFT & Forex Processing Rail',
    status: 'ELEVATED',
    load: 52,
    latencyMs: 85,
    riskScore: 76,
    throughput: 340,
    history: [48, 50, 55, 62, 59, 52]
  }
];

function MicroSparkline({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data, min + 1);
  const width = 100;
  const height = 28;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / (max - min)) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export const InfrastructureGrid: React.FC = () => {
  const [systems, setSystems] = useState<SystemNode[]>(INITIAL_SYSTEMS);

  // Live telemetry pulse
  useEffect(() => {
    const interval = setInterval(() => {
      setSystems(prev =>
        prev.map(sys => {
          const loadDelta = (Math.random() - 0.48) * 2;
          const newLoad = Math.min(99, Math.max(20, Math.round(sys.load + loadDelta)));
          const newThroughput = Math.round(sys.throughput + (Math.random() - 0.5) * 30);
          const newHistory = [...sys.history.slice(1), newLoad];

          return {
            ...sys,
            load: newLoad,
            throughput: newThroughput,
            history: newHistory
          };
        })
      );
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  const statusConfig = {
    OPERATIONAL: { label: 'Operational', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', sparkColor: '#10B981' },
    CRITICAL: { label: 'Critical Alert', badge: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500 animate-pulse', sparkColor: '#EF4444' },
    ELEVATED: { label: 'Elevated Risk', badge: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500', sparkColor: '#F97316' },
    DEGRADED: { label: 'Degraded', badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', sparkColor: '#F59E0B' }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-4 flex flex-col h-[400px]">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-gray-900">Payment Infrastructure — Live Status</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                4 / 4 Connected
              </span>
            </div>
            <p className="text-[11px] text-gray-400">Direct gateway load, latency and risk telemetry</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-gray-500">
          <Cpu className="w-3.5 h-3.5 text-blue-600" />
          <span>Avg Latency: 66ms</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 overflow-y-auto flex-1">
        {systems.map(sys => {
          const cfg = statusConfig[sys.status];
          return (
            <div
              key={sys.id}
              className={cn(
                "p-3 rounded-xl border bg-gray-50/40 hover:bg-gray-50 hover:shadow-xs transition-all flex flex-col justify-between",
                sys.status === 'CRITICAL' ? "border-rose-200 bg-rose-50/20" : "border-gray-200"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <span className={cn("w-2 h-2 rounded-full", cfg.dot)} />
                    {sys.name}
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">{sys.type}</p>
                </div>

                <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase border", cfg.badge)}>
                  {cfg.label}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 my-2 py-2 border-y border-gray-100 text-center">
                <div className="text-left">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">Load</span>
                  <span className={cn("font-mono text-xs font-bold", sys.load > 80 ? "text-rose-600" : "text-gray-800")}>
                    {sys.load}%
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">Latency</span>
                  <span className="font-mono text-xs font-bold text-gray-800">
                    {sys.latencyMs} ms
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">Risk Score</span>
                  <span className={cn("font-mono text-xs font-bold", sys.riskScore > 80 ? "text-rose-600" : sys.riskScore > 60 ? "text-orange-600" : "text-emerald-600")}>
                    {sys.riskScore}/100
                  </span>
                </div>
              </div>

              {/* Bottom Throughput and Live Sparkline */}
              <div className="flex items-center justify-between text-[11px] pt-1">
                <div>
                  <span className="text-gray-400 text-[10px] block">Throughput:</span>
                  <span className="font-mono font-bold text-gray-900">
                    {sys.throughput.toLocaleString()} <span className="text-[9px] font-normal text-gray-500">tx/s</span>
                  </span>
                </div>

                <div className="flex flex-col items-end">
                  <MicroSparkline data={sys.history} color={cfg.sparkColor} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
