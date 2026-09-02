import React, { useState, useEffect, useRef } from 'react';
import { Activity, Play, Pause, RefreshCw, ShieldAlert, ShieldCheck, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ActivityEvent {
  id: string;
  timestamp: string;
  system: string;
  action: string;
  entityId: string;
  amount?: number;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'BLOCKED' | 'APPROVED' | 'FLAGGED' | 'CHALLENGED';
}

const SEED_EVENTS: ActivityEvent[] = [
  { id: 'ev-1', timestamp: '23:31:42', system: 'System A', action: 'Fraud transaction blocked', entityId: 'CUST-001', amount: 284500, riskLevel: 'CRITICAL', status: 'BLOCKED' },
  { id: 'ev-2', timestamp: '23:31:39', system: 'System B', action: 'OTP anomaly detected', entityId: 'CUST-002', amount: 98200, riskLevel: 'HIGH', status: 'CHALLENGED' },
  { id: 'ev-3', timestamp: '23:31:37', system: 'System C', action: 'Transaction cleared', entityId: 'CUST-2048', amount: 8200, riskLevel: 'LOW', status: 'APPROVED' },
  { id: 'ev-4', timestamp: '23:31:34', system: 'System D', action: 'Cross-border velocity spike', entityId: 'CUST-006', amount: 560000, riskLevel: 'MEDIUM', status: 'FLAGGED' },
  { id: 'ev-5', timestamp: '23:31:31', system: 'System A', action: 'High-value transfer verified', entityId: 'CUST-005', amount: 120000, riskLevel: 'LOW', status: 'APPROVED' },
  { id: 'ev-6', timestamp: '23:31:28', system: 'System B', action: 'Instant UPI P2P cleared', entityId: 'CUST-004', amount: 4500, riskLevel: 'LOW', status: 'APPROVED' },
];

const POOL_ACTIONS = [
  { system: 'System A', action: 'Card checkout authorized', riskLevel: 'LOW' as const, status: 'APPROVED' as const, baseAmt: 3200 },
  { system: 'System B', action: 'Multiple failed OTPs (3x)', riskLevel: 'HIGH' as const, status: 'CHALLENGED' as const, baseAmt: 45000 },
  { system: 'System C', action: 'ACH bulk settlement cleared', riskLevel: 'LOW' as const, status: 'APPROVED' as const, baseAmt: 185000 },
  { system: 'System A', action: 'Zero-balance cashout sweep', riskLevel: 'CRITICAL' as const, status: 'BLOCKED' as const, baseAmt: 295000 },
  { system: 'System D', action: 'Cross-border corridor review', riskLevel: 'MEDIUM' as const, status: 'FLAGGED' as const, baseAmt: 74000 },
  { system: 'System B', action: 'High-velocity micro-payments', riskLevel: 'HIGH' as const, status: 'FLAGGED' as const, baseAmt: 1200 },
];

export const LiveActivityStream: React.FC<{ onSelectCustomer?: (customerId: string) => void }> = ({ onSelectCustomer }) => {
  const [events, setEvents] = useState<ActivityEvent[]>(SEED_EVENTS);
  const [isLive, setIsLive] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH'>('ALL');

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const template = POOL_ACTIONS[Math.floor(Math.random() * POOL_ACTIONS.length)];
      const custNum = Math.floor(1 + Math.random() * 6);
      const custId = `CUST-${String(custNum).padStart(3, '0')}`;
      const variance = Math.floor(Math.random() * 5000) - 2500;
      const amt = Math.max(500, template.baseAmt + variance);

      const newEv: ActivityEvent = {
        id: `ev-${Date.now()}`,
        timestamp: timeStr,
        system: template.system,
        action: template.action,
        entityId: custId,
        amount: amt,
        riskLevel: template.riskLevel,
        status: template.status
      };

      setEvents(prev => [newEv, ...prev.slice(0, 24)]);
    }, 2800);

    return () => clearInterval(interval);
  }, [isLive]);

  const filteredEvents = events.filter(e => {
    if (filter === 'CRITICAL') return e.riskLevel === 'CRITICAL';
    if (filter === 'HIGH') return e.riskLevel === 'CRITICAL' || e.riskLevel === 'HIGH';
    return true;
  });

  const riskBadges = {
    CRITICAL: 'bg-rose-50 text-rose-700 border-rose-200',
    HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
    LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  const statusBadges = {
    BLOCKED: 'bg-rose-100 text-rose-800 font-bold',
    CHALLENGED: 'bg-amber-100 text-amber-800 font-bold',
    FLAGGED: 'bg-orange-100 text-orange-800 font-bold',
    APPROVED: 'bg-emerald-100 text-emerald-800 font-bold'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs flex flex-col h-[400px]">
      {/* ─── Stream Header ─── */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-gray-900">Live System Activity</h2>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700">
                <span className={cn("w-1.5 h-1.5 rounded-full bg-emerald-500", isLive && "animate-ping")} />
                <span>{isLive ? 'STREAMING' : 'PAUSED'}</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-400">Continuous payment telemetry across all routing switches</p>
          </div>
        </div>

        {/* Stream Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-50 p-0.5 rounded-lg border border-gray-200 text-[11px]">
            <button
              onClick={() => setFilter('ALL')}
              className={cn("px-2 py-1 rounded font-semibold transition-all", filter === 'ALL' ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900")}
            >
              All
            </button>
            <button
              onClick={() => setFilter('HIGH')}
              className={cn("px-2 py-1 rounded font-semibold transition-all", filter === 'HIGH' ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900")}
            >
              High+
            </button>
            <button
              onClick={() => setFilter('CRITICAL')}
              className={cn("px-2 py-1 rounded font-semibold transition-all", filter === 'CRITICAL' ? "bg-white text-rose-600 shadow-xs" : "text-gray-500 hover:text-gray-900")}
            >
              Critical
            </button>
          </div>

          <button
            onClick={() => setIsLive(!isLive)}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-xs"
            title={isLive ? 'Pause Stream' : 'Resume Stream'}
          >
            {isLive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ─── Scrollable Event List ─── */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-50 p-2 space-y-1">
        {filteredEvents.map((ev, idx) => (
          <div
            key={ev.id}
            onClick={() => onSelectCustomer && onSelectCustomer(ev.entityId)}
            className={cn(
              "p-2.5 rounded-lg flex items-center justify-between gap-3 text-xs hover:bg-gray-50/80 cursor-pointer transition-all group",
              idx === 0 && "animate-fade-in-down bg-emerald-50/20"
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-mono text-[11px] text-gray-400 shrink-0 font-medium">
                {ev.timestamp}
              </span>

              <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-semibold text-[10px] shrink-0">
                {ev.system}
              </span>

              <div className="min-w-0">
                <span className="font-semibold text-gray-900 truncate block">
                  {ev.action}
                </span>
                <span className="text-[11px] text-gray-400">
                  Target: <strong className="font-mono text-blue-600 group-hover:underline">{ev.entityId}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {ev.amount && (
                <span className="font-mono font-medium text-gray-800 hidden sm:inline">
                  ₹{ev.amount.toLocaleString()}
                </span>
              )}

              <span className={cn("px-2 py-0.5 rounded text-[10px] uppercase border", riskBadges[ev.riskLevel])}>
                {ev.riskLevel}
              </span>

              <span className={cn("px-2 py-0.5 rounded text-[10px] uppercase", statusBadges[ev.status])}>
                {ev.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
