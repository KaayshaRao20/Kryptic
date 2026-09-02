import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Shield, ShieldAlert, AlertTriangle, Zap, Eye, Lock,
  Key, Gauge, Radio, ChevronRight, Clock, X, CheckCircle,
  ArrowRight, Activity, TrendingUp, Users, MapPin,
  Network, BarChart2, AlertOctagon, Info, Loader2,
  Siren, WifiOff, BadgeCheck, ExternalLink, RefreshCw
} from 'lucide-react';
import {
  INITIAL_ALERTS, INITIAL_ACTIVITY_LOG, INCIDENTS, EMERGENCY_ACTIONS,
  TREND_LABELS, TREND_SERIES, generateNewAlert, INITIAL_SYSTEM_STATE,
  type KrypticAlert, type AlertSeverity, type EmergencyAction,
  type ActivityLogEntry, type SystemState,
} from '../services/AlertsService';

// ─── Constants ─────────────────────────────────────────────────────────────────
const SEV_STYLE: Record<AlertSeverity, {
  badge: string; borderL: string; dot: string; text: string; iconBg: string; chartClr: string;
}> = {
  CRITICAL: { badge: 'bg-rose-100 text-rose-700',   borderL: 'border-l-[3px] border-l-rose-500',   dot: 'bg-rose-500',   text: 'text-rose-600',  iconBg: 'bg-rose-100',   chartClr: '#EF4444' },
  HIGH:     { badge: 'bg-orange-100 text-orange-600',borderL: 'border-l-[3px] border-l-orange-400', dot: 'bg-orange-400', text: 'text-orange-500',iconBg: 'bg-orange-100', chartClr: '#F97316' },
  MEDIUM:   { badge: 'bg-amber-100 text-amber-700',  borderL: 'border-l-[3px] border-l-amber-400',  dot: 'bg-amber-400',  text: 'text-amber-500', iconBg: 'bg-amber-100',  chartClr: '#F59E0B' },
  LOW:      { badge: 'bg-blue-100 text-blue-700',    borderL: 'border-l-[3px] border-l-[#557CFF]',  dot: 'bg-[#557CFF]',  text: 'text-[#557CFF]', iconBg: 'bg-blue-100',   chartClr: '#557CFF' },
};

const STATUS_STYLE: Record<string, string> = {
  ACTIVE:        'bg-emerald-100 text-emerald-700',
  INVESTIGATING: 'bg-amber-100 text-amber-600',
  RESOLVED:      'bg-gray-100 text-gray-500',
};

const TIMELINE_CLR: Record<string, string> = {
  CRITICAL: 'bg-rose-500', WARNING: 'bg-amber-400',
  INFO:     'bg-[#557CFF]', SUCCESS: 'bg-[#4E9B78]',
};

const EA_ICONS: Record<string, React.ReactNode> = {
  BLOCK:    <Shield    className="w-5 h-5" />,
  FREEZE:   <Lock      className="w-5 h-5" />,
  AUTH:     <Key       className="w-5 h-5" />,
  REVIEW:   <Eye       className="w-5 h-5" />,
  THROTTLE: <Gauge     className="w-5 h-5" />,
  ALERT:    <Radio     className="w-5 h-5" />,
};

const EA_COLORS: Record<string, string> = {
  BLOCK: 'text-rose-600 bg-rose-100', FREEZE: 'text-orange-600 bg-orange-100',
  AUTH: 'text-[#557CFF] bg-blue-100', REVIEW: 'text-amber-600 bg-amber-100',
  THROTTLE: 'text-purple-600 bg-purple-100', ALERT: 'text-[#4E9B78] bg-emerald-100',
};

const IMPACT_CLR: Record<string, string> = {
  HIGH:   'bg-rose-100 text-rose-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  LOW:    'bg-[#4E9B78]/10 text-[#4E9B78]',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(d: Date) {
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}
function timeAgo(d: Date) {
  const m = Math.floor((Date.now() - d.getTime()) / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  return `${Math.floor(m / 60)}h ago`;
}
function fmtLakhs(n: number) {
  return n >= 100_000 ? `₹${(n / 100_000).toFixed(2)} L` : `₹${n.toLocaleString('en-IN')}`;
}

// ─── Sub-component: Sparkline ─────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data.length) return null;
  const W = 80, H = 28, max = Math.max(...data, 1);
  const xs = data.map((_, i) => (i / (data.length - 1)) * W);
  const ys = data.map(v => H - (v / max) * (H - 4) - 2);
  const poly = xs.map((x, i) => `${x},${ys[i]}`).join(' ');
  const area = `${xs[0]},${H} ` + poly + ` ${xs[xs.length - 1]},${H}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-20 h-7 flex-shrink-0">
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#sg-${color.replace('#','')})`} />
      <polyline points={poly} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Sub-component: TrendChart ────────────────────────────────────────────────
function TrendChart() {
  const W = 460, H = 130, PL = 28, PT = 8, PB = 22, PR = 8;
  const plotW = W - PL - PR, plotH = H - PT - PB;
  const n = TREND_LABELS.length, maxV = 25;
  const getX = (i: number) => PL + (i / (n - 1)) * plotW;
  const getY = (v: number) => PT + plotH - (v / maxV) * plotH;
  const path = (d: number[]) => d.map((v, i) => `${i ? 'L' : 'M'}${getX(i)},${getY(v)}`).join(' ');
  const area = (d: number[]) => `${path(d)} L${getX(n - 1)},${PT + plotH} L${getX(0)},${PT + plotH} Z`;

  const series = [
    { d: TREND_SERIES.medium, clr: '#F59E0B', w: 1.5 },
    { d: TREND_SERIES.high,   clr: '#F97316', w: 2 },
    { d: TREND_SERIES.critical,clr:'#EF4444', w: 2 },
    { d: TREND_SERIES.low,    clr: '#557CFF', w: 1.5 },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        {series.map(s => (
          <linearGradient key={s.clr} id={`tg${s.clr.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={s.clr} stopOpacity="0.18" />
            <stop offset="100%" stopColor={s.clr} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>
      {[0, 5, 10, 15, 20, 25].map(v => (
        <line key={v} x1={PL} y1={getY(v)} x2={W - PR} y2={getY(v)}
          stroke="#E5E7EB" strokeWidth="1" strokeDasharray="3 3" />
      ))}
      {[0, 5, 10, 15, 20, 25].map(v => (
        <text key={`yl${v}`} x={PL - 4} y={getY(v) + 4} textAnchor="end" fontSize="7.5" fill="#9CA3AF">{v}</text>
      ))}
      {series.map(s => <path key={s.clr} d={area(s.d)} fill={`url(#tg${s.clr.replace('#','')})`} />)}
      {series.map(s => <path key={`l${s.clr}`} d={path(s.d)} fill="none" stroke={s.clr} strokeWidth={s.w} strokeLinejoin="round" />)}
      {TREND_LABELS.map((lbl, i) => (
        <text key={`${lbl}-${i}`} x={getX(i)} y={H - 5} textAnchor="middle" fontSize="8" fill="#9CA3AF">{lbl}</text>
      ))}
    </svg>
  );
}

// ─── Sub-component: ThreatRadar ───────────────────────────────────────────────
function ThreatRadar({ alerts }: { alerts: KrypticAlert[] }) {
  const active = alerts.filter(a => a.status !== 'RESOLVED');
  const cnt = (layer: string) => active.filter(a => a.paymentLayer === layer).length;

  return (
    <div className="relative flex items-center justify-center w-full h-full min-h-[200px] select-none">
      <style>{`
        @keyframes radar-ping { 0%{r:32;opacity:.7} 100%{r:80;opacity:0} }
        @keyframes radar-ping2{ 0%{r:32;opacity:.5} 100%{r:65;opacity:0} }
        @keyframes dash-flow  { to{stroke-dashoffset:-12} }
        .radar-ring1 { animation: radar-ping  2.8s ease-out infinite; }
        .radar-ring2 { animation: radar-ping2 2.8s ease-out .9s infinite; }
        .dash-anim   { animation: dash-flow   1.4s linear infinite; }
      `}</style>

      <svg viewBox="0 0 500 240" className="w-full max-w-[580px]">
        <defs>
          <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#EEF2FF" stopOpacity="1" />
            <stop offset="100%" stopColor="#F7F8F7" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="cGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#FCA5A5" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0"   />
          </radialGradient>
          <filter id="dropshadow"><feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.12"/></filter>
        </defs>

        {/* Background glow */}
        <ellipse cx="250" cy="120" rx="210" ry="115" fill="url(#bgGrad)" />

        {/* Radar rings */}
        {[100, 70, 42].map((r, i) => (
          <circle key={r} cx="250" cy="120" r={r}
            fill="none" stroke="#557CFF"
            strokeOpacity={0.08 + i * 0.05} strokeWidth="1"
            strokeDasharray="5 5" />
        ))}

        {/* Connection lines */}
        {[
          { x2: 75,  y2: 68,  stroke: '#557CFF' },
          { x2: 425, y2: 68,  stroke: '#EF4444' },
          { x2: 75,  y2: 178, stroke: '#4E9B78' },
          { x2: 425, y2: 178, stroke: '#557CFF' },
        ].map(({ x2, y2, stroke }, i) => (
          <line key={i} x1="250" y1="120" x2={x2} y2={y2}
            stroke={stroke} strokeOpacity="0.55" strokeWidth="1.5"
            strokeDasharray="6 4" className="dash-anim" />
        ))}

        {/* Center glow halo */}
        <circle cx="250" cy="120" r="32" fill="url(#cGlow)" />
        <circle className="radar-ring1" cx="250" cy="120" fill="none" stroke="#EF4444" strokeWidth="1" strokeOpacity="0.6" />
        <circle className="radar-ring2" cx="250" cy="120" fill="none" stroke="#EF4444" strokeWidth="1" strokeOpacity="0.4" />

        {/* Center alert disc */}
        <circle cx="250" cy="120" r="30" fill="#FEF2F2" stroke="#EF4444" strokeWidth="2" />
        <text x="250" y="115" textAnchor="middle" dominantBaseline="middle"
          fontSize="11" fontWeight="800" fill="#EF4444" fontFamily="Inter,sans-serif">
          ALERT
        </text>
        <text x="250" y="128" textAnchor="middle" dominantBaseline="middle"
          fontSize="18" fill="#EF4444">⚠</text>

        {/* Endpoint dots */}
        {[[75,68,'#557CFF'],[425,68,'#EF4444'],[75,178,'#4E9B78'],[425,178,'#557CFF']].map(([cx,cy,fill],i)=>(
          <circle key={i} cx={cx as number} cy={cy as number} r="4.5" fill={fill as string} />
        ))}

        {/* Node boxes — Payment Layer */}
        <g filter="url(#dropshadow)">
          <rect x="6" y="43" width="128" height="50" rx="9" fill="white" stroke="#E5E7EB" strokeWidth="0.8"/>
        </g>
        <text x="20" y="63" fontSize="7.5" fill="#687276" fontWeight="700" fontFamily="Inter,sans-serif">PAYMENT LAYER</text>
        <text x="20" y="80" fontSize="12" fill="#182124" fontWeight="800" fontFamily="Inter,sans-serif">{cnt('PAYMENT_LAYER')} Active Alerts</text>

        {/* Node boxes — Risk Engine */}
        <g filter="url(#dropshadow)">
          <rect x="366" y="43" width="128" height="50" rx="9" fill="white" stroke="#FCA5A5" strokeWidth="0.8"/>
        </g>
        <circle cx="380" cy="68" r="4" fill="#EF4444" />
        <text x="390" y="63" fontSize="7.5" fill="#687276" fontWeight="700" fontFamily="Inter,sans-serif">RISK ENGINE</text>
        <text x="390" y="80" fontSize="12" fill="#182124" fontWeight="800" fontFamily="Inter,sans-serif">{cnt('RISK_ENGINE')} Active Alerts</text>

        {/* Node boxes — Auth Service */}
        <g filter="url(#dropshadow)">
          <rect x="6" y="152" width="128" height="50" rx="9" fill="white" stroke="#E5E7EB" strokeWidth="0.8"/>
        </g>
        <circle cx="20" cy="177" r="4" fill="#4E9B78" />
        <text x="30" y="172" fontSize="7.5" fill="#687276" fontWeight="700" fontFamily="Inter,sans-serif">AUTH SERVICE</text>
        <text x="30" y="189" fontSize="12" fill="#182124" fontWeight="800" fontFamily="Inter,sans-serif">{cnt('AUTH_SERVICE')} Active Alerts</text>

        {/* Node boxes — Router */}
        <g filter="url(#dropshadow)">
          <rect x="366" y="152" width="128" height="50" rx="9" fill="white" stroke="#E5E7EB" strokeWidth="0.8"/>
        </g>
        <circle cx="380" cy="177" r="4" fill="#557CFF" />
        <text x="390" y="172" fontSize="7.5" fill="#687276" fontWeight="700" fontFamily="Inter,sans-serif">ROUTER</text>
        <text x="390" y="189" fontSize="12" fill="#182124" fontWeight="800" fontFamily="Inter,sans-serif">{cnt('ROUTER')} Active Alert</text>
      </svg>
    </div>
  );
}

// ─── Sub-component: Alert List Item ──────────────────────────────────────────
function AlertItem({
  alert, isSelected, onClick
}: { alert: KrypticAlert; isSelected: boolean; onClick: () => void }) {
  const sev = SEV_STYLE[alert.severity];
  const Icon = alert.severity === 'CRITICAL' ? AlertOctagon
             : alert.severity === 'HIGH'     ? AlertTriangle
             : alert.severity === 'MEDIUM'   ? Bell
             :                                 Info;
  return (
    <div
      onClick={onClick}
      className={`
        flex items-start gap-3 p-3.5 bg-white rounded-xl border cursor-pointer
        transition-all duration-200 hover:shadow-sm hover:-translate-y-[1px]
        ${sev.borderL} ${isSelected ? 'shadow-md ring-1 ring-[#557CFF]/30 border-[#557CFF]/40' : 'border-gray-100'}
      `}
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${sev.iconBg}`}>
        <Icon className={`w-4 h-4 ${sev.text}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded ${sev.badge}`}>
            {alert.severity}
          </span>
          <span className="text-sm font-semibold text-textPrimary truncate">{alert.title}</span>
        </div>
        <p className="text-xs text-textSecondary truncate">{alert.source} · {alert.metric}</p>
      </div>
      <div className="flex-shrink-0 flex flex-col items-end gap-1">
        <span className="text-xs text-textSecondary">{formatTime(alert.timestamp)}</span>
        <span className="text-[10px] text-textSecondary">{timeAgo(alert.timestamp)}</span>
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${STATUS_STYLE[alert.status]}`}>
          {alert.status}
        </span>
      </div>
    </div>
  );
}

// ─── Sub-component: Alert Detail Drawer ──────────────────────────────────────
function AlertDetailDrawer({
  alert, onClose, onInvestigate, onResolve
}: {
  alert: KrypticAlert;
  onClose: () => void;
  onInvestigate: (id: string) => void;
  onResolve: (id: string) => void;
}) {
  const sev = SEV_STYLE[alert.severity];
  const incident = INCIDENTS[alert.incidentId];

  return (
    <div className="fixed inset-y-0 right-0 z-40 flex">
      <div className="w-full sm:w-[420px] bg-white shadow-2xl border-l border-gray-100 flex flex-col overflow-hidden"
        style={{ animation: 'slideInRight .22s ease-out' }}>
        <style>{`@keyframes slideInRight{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded ${sev.badge}`}>
                {alert.severity}
              </span>
              <span className="text-xs text-textSecondary font-mono">{alert.incidentId}</span>
            </div>
            <h3 className="text-base font-bold text-textPrimary">{alert.title}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-4 h-4 text-textSecondary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Status + Source */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Status',        value: alert.status },
              { label: 'Risk Score',    value: `${alert.riskScore}/100` },
              { label: 'Source',        value: alert.source },
              { label: 'Payment Layer', value: alert.paymentLayer.replace('_', ' ') },
            ].map(({ label, value }) => (
              <div key={label} className="bg-secondary rounded-xl p-3">
                <p className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider mb-1">{label}</p>
                <p className="text-sm font-bold text-textPrimary">{value}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <p className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider mb-2">Description</p>
            <p className="text-sm text-textPrimary leading-relaxed">{alert.description}</p>
          </div>

          {/* Metric */}
          <div className="bg-rose-50 rounded-xl p-3 border border-rose-100">
            <p className="text-[10px] font-semibold text-rose-500 uppercase tracking-wider mb-1">Live Metric</p>
            <p className="text-sm font-bold text-rose-700">{alert.metric}</p>
          </div>

          {/* Impact */}
          {incident && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary rounded-xl p-3">
                <p className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider mb-1">Affected Users</p>
                <p className="text-lg font-black text-textPrimary">{incident.affectedUsers.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-secondary rounded-xl p-3">
                <p className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider mb-1">Potential Loss</p>
                <p className="text-lg font-black text-textPrimary">{fmtLakhs(incident.potentialLoss)}</p>
              </div>
              <div className="col-span-2 bg-secondary rounded-xl p-3">
                <p className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider mb-2">Affected Regions</p>
                <div className="flex flex-wrap gap-1.5">
                  {incident.affectedRegions.map(r => (
                    <span key={r} className="text-xs bg-white text-textPrimary px-2 py-0.5 rounded-full border border-gray-200">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          {incident && (
            <div>
              <p className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider mb-3">Incident Timeline</p>
              <div className="space-y-2">
                {incident.timeline.map((t, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`w-2.5 h-2.5 rounded-full mt-0.5 ${TIMELINE_CLR[t.type] || 'bg-gray-300'}`} />
                      {i < incident.timeline.length - 1 && (
                        <div className="w-[1px] h-5 bg-gray-200 mt-0.5" />
                      )}
                    </div>
                    <div className="pb-1">
                      <p className="text-xs font-medium text-textPrimary">{t.event}</p>
                      <p className="text-[10px] text-textSecondary">{formatTime(t.time)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-5 border-t border-gray-100 flex gap-2">
          {alert.status !== 'RESOLVED' && alert.status !== 'INVESTIGATING' && (
            <button
              onClick={() => onInvestigate(alert.id)}
              className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
            >
              Mark Investigating
            </button>
          )}
          {alert.status !== 'RESOLVED' && (
            <button
              onClick={() => onResolve(alert.id)}
              className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              ✓ Resolve
            </button>
          )}
          {alert.status === 'RESOLVED' && (
            <div className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-400">
              <CheckCircle className="w-4 h-4" /> Resolved
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-component: Emergency Center Modal ────────────────────────────────────
function EmergencyCenterModal({
  onClose, systemState, setSystemState, activityLog, setActivityLog
}: {
  onClose: () => void;
  systemState: SystemState;
  setSystemState: React.Dispatch<React.SetStateAction<SystemState>>;
  activityLog: ActivityLogEntry[];
  setActivityLog: React.Dispatch<React.SetStateAction<ActivityLogEntry[]>>;
}) {
  const [executing, setExecuting] = useState<Set<string>>(new Set());
  const [executed, setExecuted] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<Record<string, string>>({});

  const executeAction = useCallback((action: EmergencyAction) => {
    if (executing.has(action.id) || executed.has(action.id)) return;
    setExecuting(prev => new Set(prev).add(action.id));
    setTimeout(() => {
      setExecuting(prev => { const s = new Set(prev); s.delete(action.id); return s; });
      setExecuted(prev => new Set(prev).add(action.id));
      setResults(prev => ({ ...prev, [action.id]: action.resultMessage }));
      setSystemState(prev => {
        const n = { ...prev, activeDefenses: prev.activeDefenses + 1 };
        if (action.category === 'BLOCK')    { n.blockedIPRanges   += 3; }
        if (action.category === 'FREEZE')   { n.frozenAccounts    += 47; }
        if (action.category === 'AUTH')     { n.stepUpAuthEnabled  = true; }
        if (action.category === 'REVIEW')   { n.manualReviewQueue += 23; }
        if (action.category === 'THROTTLE') { n.tpsThrottled       = true; }
        if (action.category === 'ALERT')    { n.systemAlertSent    = true; }
        return n;
      });
      const entry: ActivityLogEntry = {
        id: `LOG-${Date.now()}`,
        timestamp: new Date(),
        incidentId: 'SYSTEM',
        action: `Emergency: ${action.label}`,
        result: action.resultMessage,
        severity: action.impact === 'HIGH' ? 'CRITICAL' : action.impact === 'MEDIUM' ? 'HIGH' : 'LOW',
        actor: 'Admin (Emergency Mode)',
      };
      setActivityLog(prev => [entry, ...prev]);
    }, 1600);
  }, [executing, executed, setSystemState, setActivityLog]);

  const activateEmergencyMode = () => {
    setSystemState(prev => ({ ...prev, emergencyMode: true }));
    const entry: ActivityLogEntry = {
      id: `LOG-EM-${Date.now()}`, timestamp: new Date(), incidentId: 'SYSTEM',
      action: 'Emergency Mode Activated', result: 'System switched to Emergency protection level.',
      severity: 'CRITICAL', actor: 'Admin',
    };
    setActivityLog(prev => [entry, ...prev]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden mx-4"
        style={{ animation: 'modalIn .22s ease-out' }}>
        <style>{`@keyframes modalIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}`}</style>

        {/* Modal Header */}
        <div className="flex-shrink-0 px-6 py-5"
          style={{ background: 'linear-gradient(135deg, #FEF2F2 0%, #FFF7ED 50%, #FEF2F2 100%)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center shadow-lg shadow-rose-200">
                <Siren className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-textPrimary">Emergency Center</h2>
                <p className="text-xs text-textSecondary">Immediate defensive actions — changes take effect system-wide.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!systemState.emergencyMode ? (
                <button onClick={activateEmergencyMode}
                  className="px-4 py-2 bg-rose-600 text-white text-sm font-bold rounded-xl flex items-center gap-2 hover:bg-rose-700 transition-colors shadow-md shadow-rose-200">
                  <Zap className="w-4 h-4" /> Activate Emergency Mode
                </button>
              ) : (
                <span className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 animate-pulse">
                  <Radio className="w-3 h-3" /> EMERGENCY MODE ACTIVE
                </span>
              )}
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/60 transition-colors">
                <X className="w-5 h-5 text-textSecondary" />
              </button>
            </div>
          </div>

          {/* System state bar */}
          <div className="mt-4 flex flex-wrap gap-3">
            {[
              { label: 'Active Defenses', value: systemState.activeDefenses, clr: 'text-rose-600' },
              { label: 'Blocked IP Ranges', value: systemState.blockedIPRanges, clr: 'text-orange-600' },
              { label: 'Frozen Accounts', value: systemState.frozenAccounts, clr: 'text-amber-600' },
              { label: 'Review Queue', value: systemState.manualReviewQueue, clr: 'text-[#557CFF]' },
            ].map(({ label, value, clr }) => (
              <div key={label} className="bg-white/80 rounded-lg px-3 py-1.5 border border-white">
                <span className="text-[10px] text-textSecondary">{label}: </span>
                <span className={`text-xs font-bold ${clr}`}>{value}</span>
              </div>
            ))}
            {systemState.stepUpAuthEnabled && (
              <div className="bg-[#557CFF]/10 rounded-lg px-3 py-1.5 border border-[#557CFF]/20 flex items-center gap-1.5">
                <Key className="w-3 h-3 text-[#557CFF]" />
                <span className="text-xs font-bold text-[#557CFF]">Step-Up Auth ON</span>
              </div>
            )}
            {systemState.tpsThrottled && (
              <div className="bg-purple-50 rounded-lg px-3 py-1.5 border border-purple-200 flex items-center gap-1.5">
                <Gauge className="w-3 h-3 text-purple-600" />
                <span className="text-xs font-bold text-purple-600">TPS Throttled</span>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Action Grid */}
          <div>
            <h3 className="text-sm font-bold text-textPrimary mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-rose-500" /> Defensive Actions
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {EMERGENCY_ACTIONS.map(action => {
                const isExec = executed.has(action.id);
                const isExecing = executing.has(action.id);
                return (
                  <div key={action.id}
                    className={`
                      bg-white rounded-xl border p-4 flex flex-col gap-3 transition-all duration-200
                      ${isExec ? 'border-[#4E9B78]/40 bg-[#4E9B78]/5' : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'}
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${EA_COLORS[action.category]}`}>
                        {EA_ICONS[action.category]}
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${IMPACT_CLR[action.impact]}`}>
                        {action.impact}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-textPrimary">{action.label}</p>
                      <p className="text-[11px] text-textSecondary mt-1 leading-relaxed">{action.description}</p>
                    </div>
                    <div className="text-[10px] text-textSecondary flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> {action.estimatedTime}
                    </div>

                    {isExec ? (
                      <div className="mt-auto">
                        <div className="flex items-center gap-1.5 text-[#4E9B78] mb-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span className="text-xs font-semibold">Executed</span>
                        </div>
                        <p className="text-[10px] text-[#4E9B78]/80 leading-relaxed">{results[action.id]}</p>
                      </div>
                    ) : (
                      <button
                        onClick={() => executeAction(action)}
                        disabled={isExecing}
                        className={`
                          mt-auto w-full py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all
                          ${isExecing
                            ? 'bg-gray-100 text-textSecondary cursor-not-allowed'
                            : 'bg-textPrimary text-white hover:bg-textPrimary/90 active:scale-95'}
                        `}
                      >
                        {isExecing ? (
                          <><Loader2 className="w-3 h-3 animate-spin" /> Executing...</>
                        ) : (
                          <><Zap className="w-3 h-3" /> Execute</>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Log */}
          <div>
            <h3 className="text-sm font-bold text-textPrimary mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#557CFF]" /> Activity Log
            </h3>
            <div className="space-y-2">
              {activityLog.length === 0 ? (
                <p className="text-sm text-textSecondary text-center py-4">No actions recorded yet.</p>
              ) : (
                activityLog.slice(0, 8).map(entry => (
                  <div key={entry.id} className="flex items-start gap-3 p-3 bg-secondary rounded-xl">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${
                      entry.severity === 'CRITICAL' ? 'bg-rose-500' :
                      entry.severity === 'HIGH'     ? 'bg-orange-400' :
                      entry.severity === 'LOW'      ? 'bg-[#4E9B78]' : 'bg-amber-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-textPrimary">{entry.action}</p>
                      <p className="text-[11px] text-textSecondary">{entry.result}</p>
                      <p className="text-[10px] text-textSecondary mt-0.5">{entry.actor} · {formatTime(entry.timestamp)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-component: Toast ─────────────────────────────────────────────────────
function Toast({ alert, onDismiss }: { alert: KrypticAlert; onDismiss: () => void }) {
  const sev = SEV_STYLE[alert.severity];
  return (
    <div className="w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
      style={{ animation: 'toastIn .25s ease-out' }}>
      <style>{`@keyframes toastIn{from{opacity:0;transform:translateX(100%)}to{opacity:1;transform:translateX(0)}}`}</style>
      <div className={`h-[3px] w-full ${sev.dot}`} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">🚨</span>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={`text-[10px] font-bold ${sev.text}`}>{alert.severity}</span>
                <span className="text-[10px] text-textSecondary">· {alert.incidentId}</span>
              </div>
              <p className="text-xs font-bold text-textPrimary leading-tight">{alert.title}</p>
              <p className="text-[11px] text-textSecondary mt-0.5">{alert.source} · {alert.metric}</p>
            </div>
          </div>
          <button onClick={onDismiss} className="flex-shrink-0 p-1 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-3.5 h-3.5 text-textSecondary" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────
type FilterType = 'All' | AlertSeverity;

export function AlertsEmergency() {
  const navigate = useNavigate();
  const alertsRef = useRef<HTMLDivElement>(null);

  const [alerts,        setAlerts]        = useState<KrypticAlert[]>(INITIAL_ALERTS);
  const [filter,        setFilter]        = useState<FilterType>('All');
  const [showAll,       setShowAll]       = useState(false);
  const [selectedId,    setSelectedId]    = useState<string | null>(null);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [systemState,   setSystemState]   = useState<SystemState>(INITIAL_SYSTEM_STATE);
  const [activityLog,   setActivityLog]   = useState<ActivityLogEntry[]>(INITIAL_ACTIVITY_LOG);
  const [toasts,        setToasts]        = useState<{ id: string; alert: KrypticAlert }[]>([]);

  // ── Auto-generate alerts every 8s ─────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      const a = generateNewAlert();
      setAlerts(prev => [a, ...prev]);
      if (a.severity === 'CRITICAL' || a.severity === 'HIGH') {
        const tid = `toast-${Date.now()}`;
        setToasts(prev => [...prev, { id: tid, alert: a }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== tid)), 7000);
      }
    }, 8000);
    return () => clearInterval(id);
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const dismissToast     = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));
  const selectAlert      = (id: string) => setSelectedId(prev => prev === id ? null : id);
  const closeDrawer      = () => setSelectedId(null);
  const openEmergency    = () => setEmergencyOpen(true);
  const closeEmergency   = () => setEmergencyOpen(false);
  const scrollToAlerts   = () => { alertsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); setShowAll(true); };

  const markInvestigating = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'INVESTIGATING' } : a));
    const entry: ActivityLogEntry = {
      id: `LOG-${Date.now()}`, timestamp: new Date(), incidentId: alertId,
      action: 'Marked as Investigating', result: `Alert ${alertId} escalated to investigation.`,
      severity: 'HIGH', actor: 'Admin',
    };
    setActivityLog(prev => [entry, ...prev]);
  };

  const resolveAlert = (alertId: string) => {
    const a = alerts.find(x => x.id === alertId);
    setAlerts(prev => prev.map(x => x.id === alertId ? { ...x, status: 'RESOLVED' } : x));
    const entry: ActivityLogEntry = {
      id: `LOG-${Date.now()}`, timestamp: new Date(), incidentId: a?.incidentId ?? alertId,
      action: 'Alert Resolved', result: `${a?.incidentId ?? alertId} resolved successfully.`,
      severity: 'LOW', actor: 'Admin',
    };
    setActivityLog(prev => [entry, ...prev]);
    setSelectedId(null);
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const totalAlerts       = alerts.length;
  const criticalCount     = alerts.filter(a => a.severity === 'CRITICAL').length;
  const investigatingCount= alerts.filter(a => a.status === 'INVESTIGATING').length;
  const resolvedCount     = alerts.filter(a => a.status === 'RESOLVED').length;

  const filteredAlerts = filter === 'All' ? alerts : alerts.filter(a => a.severity === filter);
  const displayedAlerts = showAll ? filteredAlerts : filteredAlerts.slice(0, 5);

  const activeAlerts       = alerts.filter(a => a.status !== 'RESOLVED');
  const liveRiskScore      = activeAlerts.length
    ? activeAlerts.reduce((acc, a) => acc + a.riskScore, 0) / activeAlerts.length
    : 0;
  const affectedTxTotal    = activeAlerts.reduce((acc, a) => acc + a.affectedTx, 0);
  const potentialImpact    = Object.values(INCIDENTS)
    .filter(inc => activeAlerts.find(a => a.incidentId === inc.incidentId))
    .reduce((acc, inc) => acc + inc.potentialLoss, 0);

  const selectedAlert      = alerts.find(a => a.id === selectedId) ?? null;
  const recentResolutions  = activityLog.filter(l => l.action.includes('Resolved')).slice(0, 3);

  const QUICK_ACTIONS = [
    { label: 'View Digital Twin',   icon: Network,   path: '/infrastructure/twin' },
    { label: 'Go to Risk Engine',   icon: ShieldAlert,path: '/intelligence/detection' },
    { label: 'Open Twin Lab',       icon: BarChart2, path: '/infrastructure/lab' },
    { label: 'Generate Report',     icon: ExternalLink,path: '' },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">

      {/* ── Toast Container ───────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map(t => (
          <Toast key={t.id} alert={t.alert} onDismiss={() => dismissToast(t.id)} />
        ))}
      </div>

      {/* ── Emergency Center Modal ────────────────────────────────────── */}
      {emergencyOpen && (
        <EmergencyCenterModal
          onClose={closeEmergency}
          systemState={systemState}
          setSystemState={setSystemState}
          activityLog={activityLog}
          setActivityLog={setActivityLog}
        />
      )}

      {/* ── Alert Detail Drawer ───────────────────────────────────────── */}
      {selectedAlert && (
        <AlertDetailDrawer
          alert={selectedAlert}
          onClose={closeDrawer}
          onInvestigate={markInvestigating}
          onResolve={resolveAlert}
        />
      )}

      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[#557CFF] text-lg font-light">+</span>
          <h1 className="text-2xl font-bold text-textPrimary">Alerts & Emergency Center</h1>
        </div>
        <p className="text-textSecondary text-sm">Monitor threats. Act fast. Stay secure.</p>
      </div>

      {/* ── Hero Card (Threat Monitoring + CTAs) ──────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
        <div className="flex min-h-[220px]">

          {/* Left: Info + Stats */}
          <div className="flex-none w-[260px] p-6 border-r border-gray-100 flex flex-col">
            <div className="mb-4">
              <h2 className="text-base font-bold text-textPrimary">Centralized Threat Monitoring</h2>
              <p className="text-xs text-textSecondary mt-1 leading-relaxed">
                Real-time alerts from across your payment ecosystem and infrastructure.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-auto">
              {[
                { label: 'Total Alerts',  value: totalAlerts,        icon: Bell,         color: 'text-[#557CFF]', bg: 'bg-blue-50'   },
                { label: 'Critical',      value: criticalCount,       icon: AlertOctagon, color: 'text-rose-600',  bg: 'bg-rose-50'   },
                { label: 'Investigating', value: investigatingCount,  icon: Activity,     color: 'text-amber-600', bg: 'bg-amber-50'  },
                { label: 'Resolved',      value: resolvedCount,       icon: CheckCircle,  color: 'text-[#4E9B78]', bg: 'bg-emerald-50'},
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className={`${bg} rounded-xl p-3`}>
                  <Icon className={`w-4 h-4 ${color} mb-1`} />
                  <p className={`text-xl font-black ${color}`}>{value}</p>
                  <p className="text-[10px] text-textSecondary font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Center: Threat Radar */}
          <div className="flex-1 flex items-center justify-center p-4">
            <ThreatRadar alerts={alerts} />
          </div>

          {/* Right: CTAs */}
          <div className="flex-none w-[240px] p-6 border-l border-gray-100 flex flex-col">
            <h2 className="text-base font-bold text-textPrimary">Detect. Respond. Resolve.</h2>
            <p className="text-xs text-textSecondary mt-1 mb-6 leading-relaxed">
              Switch to Emergency mode to take immediate action on critical incidents.
            </p>
            <div className="space-y-3 mt-auto">
              <button
                onClick={scrollToAlerts}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-[#557CFF] text-[#557CFF] text-sm font-bold hover:bg-[#557CFF]/5 transition-all active:scale-95"
              >
                <Bell className="w-4 h-4" /> View All Alerts
              </button>
              <button
                onClick={openEmergency}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-600 text-white text-sm font-bold hover:bg-rose-700 transition-all active:scale-95 shadow-md shadow-rose-200"
              >
                <Siren className="w-4 h-4" /> Emergency Center
              </button>
            </div>
            {systemState.emergencyMode && (
              <div className="mt-3 flex items-center gap-1.5 text-rose-600">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-[10px] font-bold">EMERGENCY MODE ACTIVE</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Content Grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-6">

        {/* ── Left: Active Alerts List ──────────────────────── */}
        <div className="col-span-7 space-y-4" ref={alertsRef}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-textPrimary">Active Alerts</h2>
                  <span className="px-2 py-0.5 bg-[#557CFF]/10 text-[#557CFF] text-xs font-bold rounded-full">
                    {filteredAlerts.length}
                  </span>
                  {criticalCount > 0 && (
                    <span className="flex items-center gap-1 text-rose-600">
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-bold">{criticalCount} critical</span>
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setAlerts(prev => [...prev, generateNewAlert()])}
                  className="p-1.5 rounded-lg hover:bg-secondary text-textSecondary hover:text-textPrimary transition-colors"
                  title="Simulate new alert"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Filter tabs */}
              <div className="flex items-center gap-2 mt-4">
                {(['All', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(f => {
                  const label = f === 'All' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase();
                  const count = f === 'All' ? alerts.length : alerts.filter(a => a.severity === f).length;
                  const isActive = filter === f;
                  return (
                    <button
                      key={f}
                      onClick={() => setFilter(f as FilterType)}
                      className={`
                        px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                        ${isActive
                          ? f === 'All'
                            ? 'bg-textPrimary text-white'
                            : `${SEV_STYLE[f as AlertSeverity]?.badge ?? ''} border border-current/20`
                          : 'text-textSecondary hover:bg-secondary'}
                      `}
                    >
                      {label} {count > 0 && <span className="ml-1 opacity-70">({count})</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Alert items */}
            <div className="p-4 space-y-2">
              {displayedAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-textSecondary">
                  <CheckCircle className="w-8 h-8 mb-2 text-[#4E9B78]" />
                  <p className="text-sm font-medium">No alerts in this category</p>
                </div>
              ) : (
                displayedAlerts.map(alert => (
                  <AlertItem
                    key={alert.id}
                    alert={alert}
                    isSelected={selectedId === alert.id}
                    onClick={() => selectAlert(alert.id)}
                  />
                ))
              )}
            </div>

            {filteredAlerts.length > 5 && (
              <div className="px-4 pb-4">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-gray-200 text-sm text-[#557CFF] font-semibold hover:bg-[#557CFF]/5 transition-colors"
                >
                  {showAll
                    ? 'Show Less'
                    : <><ArrowRight className="w-3.5 h-3.5" /> View All Alerts ({filteredAlerts.length})</>
                  }
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Metrics + Chart + Actions ──────────────── */}
        <div className="col-span-5 space-y-4">

          {/* Metric cards 2x2 */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: 'Risk Score (Live)',
                value: liveRiskScore.toFixed(1),
                unit: '/100',
                tag: liveRiskScore > 75 ? 'Very High Risk' : liveRiskScore > 50 ? 'High Risk' : 'Moderate',
                tagClr: liveRiskScore > 75 ? 'text-rose-600' : 'text-amber-600',
                sparkData: [60, 65, 70, 85, 82, 88, liveRiskScore],
                sparkClr: '#EF4444',
              },
              {
                label: 'Affected Transactions',
                value: affectedTxTotal.toString(),
                unit: '',
                tag: '+55% vs baseline',
                tagClr: 'text-[#4E9B78]',
                sparkData: [80, 100, 120, 155, 148, 165, affectedTxTotal > 0 ? Math.min(affectedTxTotal, 200) : 155],
                sparkClr: '#4E9B78',
              },
              {
                label: 'Potential Impact',
                value: fmtLakhs(potentialImpact),
                unit: '',
                tag: 'Est. Loss Prevented',
                tagClr: 'text-textSecondary',
                sparkData: [10, 18, 24, 28, 26, 28, 28],
                sparkClr: '#557CFF',
              },
              {
                label: 'MTTR (Today)',
                value: '18m 32s',
                unit: '',
                tag: 'Mean Time To Resolve',
                tagClr: 'text-textSecondary',
                sparkData: [22, 20, 18, 19, 17, 19, 18],
                sparkClr: '#557CFF',
              },
            ].map(({ label, value, unit, tag, tagClr, sparkData, sparkClr }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <p className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider mb-2">{label}</p>
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <span className="text-xl font-black text-textPrimary">{value}</span>
                    {unit && <span className="text-xs text-textSecondary ml-0.5">{unit}</span>}
                    <p className={`text-[10px] font-semibold mt-1 ${tagClr}`}>{tag}</p>
                  </div>
                  <Sparkline data={sparkData} color={sparkClr} />
                </div>
              </div>
            ))}
          </div>

          {/* Alerts Trend Chart */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-textPrimary mb-1">Alerts Trend (Last 24 Hours)</h3>
            <TrendChart />
            <div className="flex items-center gap-4 mt-2">
              {[
                { clr: '#EF4444', label: 'Critical' },
                { clr: '#F97316', label: 'High' },
                { clr: '#F59E0B', label: 'Medium' },
                { clr: '#557CFF', label: 'Low' },
              ].map(({ clr, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-1 rounded-full" style={{ backgroundColor: clr }} />
                  <span className="text-[10px] text-textSecondary">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-textPrimary mb-3">Quick Actions</h3>
            <div className="space-y-1">
              {QUICK_ACTIONS.map(({ label, icon: Icon, path }) => (
                <button
                  key={label}
                  onClick={() => path && navigate(path)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-secondary transition-colors group text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-textSecondary group-hover:text-[#557CFF] transition-colors" />
                    <span className="text-sm text-textSecondary group-hover:text-textPrimary transition-colors">{label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#557CFF] transition-colors" />
                </button>
              ))}
            </div>
          </div>

          {/* Recent Resolutions */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-textPrimary">Recent Resolutions</h3>
              <button className="text-[#557CFF] text-xs font-semibold hover:underline">View All</button>
            </div>
            <div className="space-y-2">
              {recentResolutions.length === 0 ? (
                <p className="text-xs text-textSecondary py-2">No resolutions yet.</p>
              ) : (
                recentResolutions.map(entry => (
                  <div key={entry.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-xs font-semibold text-textPrimary">Incident #{entry.incidentId}</p>
                      <p className="text-[10px] text-textSecondary mt-0.5">{formatTime(entry.timestamp)} · {entry.actor}</p>
                    </div>
                    <span className="text-[10px] font-bold bg-[#4E9B78]/10 text-[#4E9B78] px-2 py-1 rounded-lg">
                      RESOLVED
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Emergency Mode Banner ──────────────────────────────────────── */}
      <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center flex-shrink-0">
              <Zap className="w-7 h-7 text-rose-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-textPrimary">
                Emergency Mode is your shield against critical threats.
              </h3>
              <p className="text-sm text-textSecondary mt-0.5">
                Act now. Minimize risk. Protect every transaction.
              </p>
            </div>
          </div>
          <button
            onClick={openEmergency}
            className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-rose-600 text-white text-sm font-bold rounded-xl hover:bg-rose-700 active:scale-95 transition-all shadow-lg shadow-rose-200"
          >
            <Siren className="w-4 h-4" /> Enter Emergency Mode
          </button>
        </div>
        <div className="h-1 w-full" style={{
          background: 'linear-gradient(90deg, #EF4444 0%, #F97316 33%, #F59E0B 66%, #4E9B78 100%)'
        }} />
      </div>

    </div>
  );
}

export default AlertsEmergency;
