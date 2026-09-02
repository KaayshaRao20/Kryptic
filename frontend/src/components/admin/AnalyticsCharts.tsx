import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { BarChart3, TrendingUp, ShieldAlert, Cpu, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';

const INITIAL_VOLUME = [
  { time: '23:00', volume: 3120, baseline: 3000 },
  { time: '23:05', volume: 3450, baseline: 3050 },
  { time: '23:10', volume: 3200, baseline: 3100 },
  { time: '23:15', volume: 4100, baseline: 3150 },
  { time: '23:20', volume: 4850, baseline: 3200 },
  { time: '23:25', volume: 4300, baseline: 3250 },
  { time: '23:30', volume: 5400, baseline: 3300 },
];

const INITIAL_RISK_TREND = [
  { time: '23:00', sysA: 55, sysB: 62, sysC: 20, sysD: 68 },
  { time: '23:05', sysA: 58, sysB: 70, sysC: 22, sysD: 72 },
  { time: '23:10', sysA: 62, sysB: 78, sysC: 24, sysD: 70 },
  { time: '23:15', sysA: 60, sysB: 85, sysC: 21, sysD: 74 },
  { time: '23:20', sysA: 65, sysB: 92, sysC: 25, sysD: 78 },
  { time: '23:25', sysA: 62, sysB: 89, sysC: 24, sysD: 76 },
];

const FRAUD_BREAKDOWN = [
  { time: '20:00', blocked: 42, investigated: 18, approved: 1240 },
  { time: '21:00', blocked: 68, investigated: 24, approved: 1580 },
  { time: '22:00', blocked: 95, investigated: 32, approved: 1890 },
  { time: '23:00', blocked: 124, investigated: 45, approved: 2150 },
];

const SYSTEM_LOAD_DATA = [
  { time: '23:00', sysA: 62, sysB: 72, sysC: 40, sysD: 48 },
  { time: '23:05', sysA: 65, sysB: 76, sysC: 42, sysD: 50 },
  { time: '23:10', sysA: 64, sysB: 80, sysC: 44, sysD: 51 },
  { time: '23:15', sysA: 68, sysB: 88, sysC: 45, sysD: 53 },
  { time: '23:20', sysA: 67, sysB: 86, sysC: 43, sysD: 52 },
  { time: '23:25', sysA: 68, sysB: 84, sysC: 45, sysD: 52 },
];

export const AnalyticsCharts: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'VOLUME' | 'RISK' | 'FRAUD' | 'LOAD'>('VOLUME');
  const [volumeData, setVolumeData] = useState(INITIAL_VOLUME);

  // Live real-time tick for volume chart
  useEffect(() => {
    const interval = setInterval(() => {
      setVolumeData(prev => {
        const last = prev[prev.length - 1];
        const nextVolume = Math.round(last.volume + (Math.random() - 0.45) * 200);
        const nextBaseline = Math.round(last.baseline + (Math.random() - 0.48) * 50);
        const now = new Date();
        const nextTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        return [...prev.slice(1), { time: nextTime, volume: nextVolume, baseline: nextBaseline }];
      });
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-4 flex flex-col">
      {/* ─── Analytics Header with Tabs ─── */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-gray-900">Real-Time Risk & Infrastructure Analytics</h2>
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE
              </span>
            </div>
            <p className="text-[11px] text-gray-400">Throughput velocity, systemic risk propagation, and gateway capacity</p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-xs">
          <button
            onClick={() => setActiveTab('VOLUME')}
            className={cn(
              "px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5",
              activeTab === 'VOLUME' ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
            )}
          >
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            <span>Volume (tx/min)</span>
          </button>

          <button
            onClick={() => setActiveTab('RISK')}
            className={cn(
              "px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5",
              activeTab === 'RISK' ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
            )}
          >
            <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
            <span>Risk Trend</span>
          </button>

          <button
            onClick={() => setActiveTab('FRAUD')}
            className={cn(
              "px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5",
              activeTab === 'FRAUD' ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
            )}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>Fraud vs Approved</span>
          </button>

          <button
            onClick={() => setActiveTab('LOAD')}
            className={cn(
              "px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5",
              activeTab === 'LOAD' ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
            )}
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-600" />
            <span>System Load %</span>
          </button>
        </div>
      </div>

      {/* ─── Chart Display Area ─── */}
      <div className="h-[280px] w-full pt-4">
        {activeTab === 'VOLUME' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={volumeData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', border: 'none', color: '#F8FAFC', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Area type="monotone" dataKey="volume" name="Live Volume (tx/min)" stroke="#2563EB" strokeWidth={2.5} fill="url(#volGrad)" />
              <Line type="monotone" dataKey="baseline" name="Expected Baseline" stroke="#94A3B8" strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'RISK' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={INITIAL_RISK_TREND} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', border: 'none', color: '#F8FAFC', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Line type="monotone" dataKey="sysB" name="System B (UPI)" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="sysD" name="System D (Forex)" stroke="#F97316" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="sysA" name="System A (Cards)" stroke="#2563EB" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="sysC" name="System C (Core CBS)" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'FRAUD' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={FRAUD_BREAKDOWN} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', border: 'none', color: '#F8FAFC', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Bar dataKey="blocked" name="Fraud Blocked" fill="#EF4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="investigated" name="Challenged (2FA / Review)" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="approved" name="Approved Transactions" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'LOAD' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={SYSTEM_LOAD_DATA} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', border: 'none', color: '#F8FAFC', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Line type="monotone" dataKey="sysB" name="System B (UPI)" stroke="#EF4444" strokeWidth={2.5} />
              <Line type="monotone" dataKey="sysA" name="System A (Cards)" stroke="#2563EB" strokeWidth={2} />
              <Line type="monotone" dataKey="sysD" name="System D (Forex)" stroke="#F59E0B" strokeWidth={2} />
              <Line type="monotone" dataKey="sysC" name="System C (Core CBS)" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
