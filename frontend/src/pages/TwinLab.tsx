import React, { useState, useRef, useMemo, useCallback, useLayoutEffect } from "react";
import {
  Radar, GitBranch, MousePointer2, Hand, Share2,
  Plus, Maximize2, Layers, Play,
  ChevronRight, ChevronDown,
  SkipBack, SkipForward, CheckCircle2, AlertTriangle, ShieldAlert,
  Zap, Users, X, Sliders, RefreshCw
} from "lucide-react";
import { simulationService, type SimulationResultMetrics } from "../services/SimulationService";
import { twinService, type TwinNodeData } from "../services/TwinService";

/* ------------------------------------------------------------------ */
/*  Static Config & Themes                                             */
/* ------------------------------------------------------------------ */

const SCENARIOS = [
  {
    key: "fraud_spike",
    icon: ShieldAlert,
    tone: "rose",
    title: "Fraud Spike",
    desc: "Sudden surge in fraudulent activity",
  },
  {
    key: "coordinated",
    icon: Users,
    tone: "amber",
    title: "Coordinated Attack",
    desc: "Multiple entities acting together",
  },
  {
    key: "velocity",
    icon: Zap,
    tone: "sky",
    title: "High Velocity",
    desc: "Abnormally high transaction speed",
  },
  {
    key: "behavioral",
    icon: Radar,
    tone: "violet",
    title: "Behavioral Anomaly",
    desc: "Unusual user behaviour patterns",
  },
];

const TONE_MAP: Record<string, { bg: string; border: string; icon: string; iconBg: string }> = {
  rose: { bg: "bg-rose-50", border: "border-rose-200", icon: "text-rose-500", iconBg: "bg-rose-100" },
  amber: { bg: "bg-amber-50", border: "border-amber-200", icon: "text-amber-500", iconBg: "bg-amber-100" },
  sky: { bg: "bg-sky-50", border: "border-sky-200", icon: "text-sky-500", iconBg: "bg-sky-100" },
  violet: { bg: "bg-violet-50", border: "border-violet-200", icon: "text-violet-500", iconBg: "bg-violet-100" },
};

const CANVAS_W = 1200;
const CANVAS_H = 620;

const STATUS_DOT: Record<string, string> = {
  healthy: "bg-emerald-500",
  processing: "bg-sky-500",
  warning: "bg-amber-500",
  anomalous: "bg-rose-500",
  idle: "bg-gray-300",
};

const STATUS_TEXT: Record<string, string> = {
  healthy: "text-emerald-600",
  processing: "text-sky-600",
  warning: "text-amber-600",
  anomalous: "text-rose-600",
  idle: "text-gray-400",
};

const STATUS_RING: Record<string, string> = {
  healthy: "ring-emerald-200",
  processing: "ring-sky-200",
  warning: "ring-amber-200",
  anomalous: "ring-rose-200",
  idle: "ring-gray-200",
};

const GLOW_RGB: Record<string, string> = {
  healthy: "16,185,129",
  processing: "56,150,240",
  warning: "245,158,11",
  anomalous: "244,63,94",
  idle: "156,163,175",
};

/* ------------------------------------------------------------------ */
/*  Isometric 3D Surface Generator                                     */
/* ------------------------------------------------------------------ */

function makeHeatGrid(seed: number) {
  const rows = 10, cols = 14;
  let s = seed;
  const rand = () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
  const peaks = [
    { cx: 4, cy: 3, h: 1.0 },
    { cx: 9, cy: 5, h: 0.85 },
    { cx: 6, cy: 8, h: 0.55 },
  ];
  const grid: number[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: number[] = [];
    for (let c = 0; c < cols; c++) {
      let v = 0.08 + rand() * 0.08;
      for (const p of peaks) {
        const d = Math.hypot(c - p.cx, r - p.cy);
        v += p.h * Math.exp(-(d * d) / 9);
      }
      row.push(Math.min(1, v));
    }
    grid.push(row);
  }
  return grid;
}

function heatColor(v: number): string {
  const stops: [number, [number, number, number]][] = [
    [0.0, [40, 60, 200]],
    [0.25, [30, 160, 230]],
    [0.5, [60, 200, 120]],
    [0.75, [240, 200, 40]],
    [1.0, [230, 55, 55]],
  ];
  for (let i = 0; i < stops.length - 1; i++) {
    const [p0, c0] = stops[i];
    const [p1, c1] = stops[i + 1];
    if (v >= p0 && v <= p1) {
      const t = (v - p0) / (p1 - p0);
      const c = c0.map((ch, idx) => Math.round(ch + (c1[idx] - ch) * t));
      return `rgb(${c[0]},${c[1]},${c[2]})`;
    }
  }
  return `rgb(230,55,55)`;
}

function buildIsoSurface(grid: number[][]) {
  const rows = grid.length;
  const cols = grid[0].length;
  const dx = 20, dy = 11, hz = 70;
  const pts: { x: number; y: number; h: number }[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: { x: number; y: number; h: number }[] = [];
    for (let c = 0; c < cols; c++) {
      const h = grid[r][c];
      const x = (c - r) * dx;
      const y = (c + r) * dy - h * hz;
      row.push({ x, y, h });
    }
    pts.push(row);
  }
  const quads: { d: string; color: string; depth: number }[] = [];
  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const p00 = pts[r][c], p01 = pts[r][c + 1], p11 = pts[r + 1][c + 1], p10 = pts[r + 1][c];
      const avgH = (p00.h + p01.h + p11.h + p10.h) / 4;
      quads.push({
        d: `M${p00.x},${p00.y} L${p01.x},${p01.y} L${p11.x},${p11.y} L${p10.x},${p10.y} Z`,
        color: heatColor(avgH),
        depth: r + c,
      });
    }
  }
  quads.sort((a, b) => a.depth - b.depth);
  return quads;
}

/* ------------------------------------------------------------------ */
/*  Child Components                                                   */
/* ------------------------------------------------------------------ */

function Toolbar({ tool, setTool }: { tool: string; setTool: (t: string) => void }) {
  const tools = [
    { key: "select", icon: MousePointer2, label: "Select Mode" },
    { key: "pan", icon: Hand, label: "Pan Canvas" },
    { key: "connect", icon: Share2, label: "Inspect Edges" },
    { key: "add", icon: Plus, label: "Add Component" },
    { key: "expand", icon: Maximize2, label: "Fit View" },
    { key: "layers", icon: Layers, label: "Toggle Layers" },
  ];
  return (
    <div className="absolute left-4 top-4 z-20 flex flex-col gap-1 bg-white rounded-xl border border-gray-200 shadow-sm p-1.5">
      {tools.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          title={label}
          onClick={() => setTool(key)}
          className={`p-2 rounded-lg transition-colors ${
            tool === key ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          <Icon size={15} />
        </button>
      ))}
    </div>
  );
}

function NodeCard({ node, selected, onClick, is3D }: { node: TwinNodeData; selected: boolean; onClick: () => void; is3D: boolean }) {
  const isAnomalous = node.status === "anomalous";
  const glow = GLOW_RGB[node.status] || "156,163,175";

  return (
    <div
      onClick={onClick}
      style={{ left: node.x, top: node.y, width: node.w, height: node.h + 22 }}
      className="absolute cursor-pointer select-none group"
    >
      {/* 3D Pedestal shadow */}
      <div
        className={isAnomalous ? "twin-pedestal twin-pedestal-pulse" : "twin-pedestal"}
        style={{
          left: 10,
          right: 10,
          bottom: 0,
          height: node.h * 0.7,
          background: `linear-gradient(180deg, rgba(${glow},0.55) 0%, rgba(${glow},0.12) 55%, rgba(${glow},0) 100%)`,
        }}
      />
      {/* Card Face */}
      <div
        style={{
          height: node.h,
          transform: is3D ? "perspective(500px) rotateX(8deg)" : "none",
          transition: "transform 0.25s ease, box-shadow 0.25s ease"
        }}
        className={`absolute inset-x-0 top-0 rounded-2xl border group-hover:-translate-y-1 ${
          isAnomalous
            ? "bg-gradient-to-br from-rose-50 to-rose-100/90 border-rose-300"
            : node.status === "warning"
            ? "bg-gradient-to-br from-amber-50 to-amber-100/80 border-amber-300"
            : "bg-white/95 border-gray-200"
        } ${selected ? "ring-2 ring-offset-2 ring-gray-900 shadow-md" : ""}`}
      >
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ boxShadow: `0 18px 30px -12px rgba(${glow},0.45), 0 2px 6px rgba(16,24,40,0.06)` }}
        />
        <div className="relative p-3.5 h-full flex flex-col justify-between">
          <div className={`text-[11px] font-bold tracking-wide ${isAnomalous ? "text-rose-600" : node.status === "warning" ? "text-amber-700" : "text-gray-800"}`}>
            {node.name}
          </div>
          <div>
            <div className="text-[13px] font-semibold text-gray-900">{node.tps.toFixed(1)}K TPS</div>
            <div className={`text-[11px] font-medium ${isAnomalous ? "text-rose-600 font-semibold" : node.status === "warning" ? "text-amber-600" : "text-gray-500"}`}>
              {node.risk.toFixed(1)}% risk
            </div>
          </div>
        </div>
        <div
          className={`absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full flex items-center justify-center text-white ring-2 ring-white ${STATUS_DOT[node.status]} ${
            isAnomalous ? "twin-badge-pulse" : ""
          }`}
        >
          {node.status === "anomalous" ? <AlertTriangle size={12} /> : <CheckCircle2 size={13} />}
        </div>
      </div>
    </div>
  );
}

function FlowParticle({ x1, y1, x2, y2, color, dur, delay }: { x1: number; y1: number; x2: number; y2: number; color: string; dur: number; delay: number }) {
  return (
    <circle r="3.2" fill={color}>
      <animateMotion
        dur={`${dur}s`}
        begin={`${delay}s`}
        repeatCount="indefinite"
        path={`M${x1},${y1} L${x2},${y2}`}
      />
    </circle>
  );
}

function Legend() {
  const items = [
    { label: "Healthy", color: "bg-emerald-500" },
    { label: "Processing", color: "bg-sky-500" },
    { label: "Warning", color: "bg-amber-500" },
    { label: "Anomalous", color: "bg-rose-500" },
    { label: "Idle", color: "bg-gray-300" },
  ];
  return (
    <div className="flex items-center gap-5 flex-wrap">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-1.5 text-[12px] text-gray-500 font-medium">
          <span className={`w-2.5 h-2.5 rounded-full ${it.color}`} />
          {it.label}
        </div>
      ))}
    </div>
  );
}

function Gauge({ value }: { value: number }) {
  const r = 68;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const offset = c - (pct / 100) * c;
  return (
    <div className="relative w-[168px] h-[168px] mx-auto">
      <svg viewBox="0 0 168 168" className="-rotate-90">
        <circle cx="84" cy="84" r={r} stroke="#EEF1F4" strokeWidth="14" fill="none" />
        <circle
          cx="84"
          cy="84"
          r={r}
          stroke="url(#gaugeGrad)"
          strokeWidth="14"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[26px] font-bold text-gray-900">{pct.toFixed(1)}%</div>
        <div className="text-[11px] text-gray-400 font-medium tracking-wide">Detection Rate</div>
      </div>
    </div>
  );
}

function StatBox({ label, value, delta, up }: { label: string; value: string | number; delta?: string; up?: boolean }) {
  return (
    <div>
      <div className="text-[12px] text-gray-400">{label}</div>
      <div className="text-[15px] font-semibold text-gray-900 mt-0.5">{value}</div>
      {delta != null && (
        <div className={`text-[11px] font-medium mt-0.5 ${up ? "text-emerald-600" : "text-rose-500"}`}>
          {up ? "▲" : "▼"} {delta}
        </div>
      )}
    </div>
  );
}

function ControlSelect({ label, value, onChange, options, info }: { label: string; value: string; onChange: (v: string) => void; options: string[]; info?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-1 text-[13px] text-gray-500">
        {label}
        {info && <span className="text-gray-300 text-[11px]" title="Simulation Parameter">ⓘ</span>}
      </div>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none bg-gray-50 border border-gray-200 rounded-lg pl-3 pr-7 py-1.5 text-[13px] font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/10 cursor-pointer"
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function TwinLab() {
  const [scenario, setScenario] = useState("fraud_spike");
  const [tool, setTool] = useState("select");
  const [selectedNodeKey, setSelectedNodeKey] = useState<string>("risk");
  const [is3DView, setIs3DView] = useState(true);
  const [isLiveStream, setIsLiveStream] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState("1.0x");
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Simulation Parameters
  const [totalEvents, setTotalEvents] = useState(10000);
  const [fraudRatio, setFraudRatio] = useState(15);
  const [duration, setDuration] = useState("10 min");
  const [startTime, setStartTime] = useState("Now");
  const [injectionPattern, setInjectionPattern] = useState("Burst");
  const [customTargetNode, setCustomTargetNode] = useState("risk_engine");

  const [running, setRunning] = useState(false);
  const [seed, setSeed] = useState(7);
  const [isSimulatedAnomaly, setIsSimulatedAnomaly] = useState(true);

  // Responsive Canvas Scaling
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const [canvasScale, setCanvasScale] = useState(1);

  useLayoutEffect(() => {
    const el = canvasWrapRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth || CANVAS_W;
      setCanvasScale(Math.max(0.32, Math.min(1, w / CANVAS_W)));
    };
    update();
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => ro.disconnect();
    }
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Compute Results from Simulation Service
  const [results, setResults] = useState<SimulationResultMetrics>(() =>
    simulationService.calculateDeterministicMetrics({
      scenarioKey: "fraud_spike",
      totalEvents: 10000,
      fraudRatio: 15,
      duration: "10 min",
      startTime: "Now",
      injectionPattern: "Burst",
    })
  );

  const nodes = useMemo(
    () => twinService.getDefaultNodes(scenario, isSimulatedAnomaly),
    [scenario, isSimulatedAnomaly]
  );
  const nodeMap = useMemo(() => Object.fromEntries(nodes.map((n) => [n.key, n])), [nodes]);
  const edges = useMemo(() => twinService.getEdges(isSimulatedAnomaly), [isSimulatedAnomaly]);

  const heat = useMemo(() => makeHeatGrid(seed), [seed]);
  const isoSurface = useMemo(() => buildIsoSurface(heat), [heat]);

  const timelineEvents = useMemo(
    () => simulationService.getTimelineForScenario(scenario, isSimulatedAnomaly),
    [scenario, isSimulatedAnomaly]
  );

  const selectedNode = useMemo(
    () => nodes.find((n) => n.key === selectedNodeKey) || nodes[2],
    [nodes, selectedNodeKey]
  );

  const runSimulation = useCallback(() => {
    setRunning(true);
    setTimeout(() => {
      const res = simulationService.calculateDeterministicMetrics({
        scenarioKey: scenario,
        totalEvents,
        fraudRatio,
        duration,
        startTime,
        injectionPattern,
      });
      setResults(res);
      setSeed((s) => s + 1);
      setIsSimulatedAnomaly(true);
      setRunning(false);
    }, 850);
  }, [scenario, totalEvents, fraudRatio, duration, startTime, injectionPattern]);

  const resetTopology = useCallback(() => {
    setIsSimulatedAnomaly(false);
    setResults({
      detectionRate: 98.4,
      injected: totalEvents,
      detected: Math.round(totalEvents * 0.984),
      missed: Math.round(totalEvents * 0.016),
      falsePositives: 18,
      precision: 98.9,
      recall: 98.4,
      f1: 98.6,
      fpr: 0.9,
      latency: 120,
      fpCost: 3.6,
    });
  }, [totalEvents]);

  return (
    <div className="w-full text-gray-900 flex flex-col space-y-6" style={{ fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif" }}>
      <style>{`
        .twin-pedestal {
          position: absolute;
          border-radius: 999px 999px 40% 40% / 100% 100% 60% 60%;
          filter: blur(6px);
          transform: scaleX(0.85);
        }
        @keyframes twinPulse {
          0%, 100% { opacity: 0.9; transform: scaleX(0.85) scaleY(1); }
          50% { opacity: 1; transform: scaleX(0.95) scaleY(1.12); }
        }
        .twin-pedestal-pulse { animation: twinPulse 2.2s ease-in-out infinite; }

        @keyframes badgePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(244,63,94,0.55); }
          70% { box-shadow: 0 0 0 8px rgba(244,63,94,0); }
        }
        .twin-badge-pulse { animation: badgePulse 1.8s ease-out infinite; }

        .risk-glow-ring {
          transform-box: fill-box;
          transform-origin: center;
          animation: riskGlow 2.2s ease-in-out infinite;
        }
        @keyframes riskGlow {
          0% { r: 8; opacity: 0.45; }
          70% { r: 60; opacity: 0; }
          100% { r: 60; opacity: 0; }
        }

        @keyframes slowSpin {
          0% { transform: perspective(700px) rotateX(52deg) rotateZ(-10deg); }
          50% { transform: perspective(700px) rotateX(52deg) rotateZ(6deg); }
          100% { transform: perspective(700px) rotateX(52deg) rotateZ(-10deg); }
        }
        .heat-slow-spin { animation: slowSpin 14s ease-in-out infinite; transform-style: preserve-3d; }

        @keyframes timelinePing {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(2.6); opacity: 0; }
        }
        .timeline-ping { animation: timelinePing 1.8s cubic-bezier(0,0,0.2,1) infinite; }

        @keyframes burstSpin {
          from { transform: rotate(0deg); opacity: 0.9; }
          to { transform: rotate(360deg); opacity: 0.3; }
        }
        .timeline-burst-spin { animation: burstSpin 6s linear infinite; transform-origin: center; }
      `}</style>

      {/* Header Banner */}
      <div className="flex items-center justify-between bg-white px-7 py-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white">
            <GitBranch size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[18px] font-bold text-gray-900">Payment Flow Digital Twin</h1>
              <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">Active Mesh</span>
              <span className="text-[11px] font-semibold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md">v1.0</span>
            </div>
            <p className="text-[12.5px] text-gray-400 mt-0.5">
              Simulate, stress and evaluate merchant payment infrastructure against multi-vector fraud attacks
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[12.5px] text-emerald-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> System Online (Razorpay / Instant Rail)
          </div>
          <button
            onClick={resetTopology}
            className="flex items-center gap-1.5 text-[12.5px] font-medium text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50"
          >
            <RefreshCw size={13} /> Reset Baseline
          </button>
        </div>
      </div>

      {/* Select Scenario Row */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11.5px] font-semibold tracking-wider text-gray-400">SELECT ATTACK SCENARIO</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCustomModal(true)}
              className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600 border border-gray-200 rounded-lg px-3.5 py-2 hover:bg-gray-50 bg-white shadow-2xs"
            >
              <Sliders size={14} /> Configure Scenario
            </button>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {SCENARIOS.map((s) => {
            const tone = TONE_MAP[s.tone];
            const active = scenario === s.key;
            const Icon = s.icon;
            return (
              <button
                key={s.key}
                onClick={() => setScenario(s.key)}
                className={`text-left rounded-xl border p-3.5 transition-all cursor-pointer ${
                  active ? `${tone.bg} ${tone.border} ring-1 ring-inset ${tone.border} shadow-sm` : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${active ? tone.iconBg : "bg-gray-100"}`}>
                  <Icon size={15} className={active ? tone.icon : "text-gray-400"} />
                </div>
                <div className="text-[13px] font-semibold text-gray-900">{s.title}</div>
                <div className="text-[11.5px] text-gray-400 mt-0.5 leading-snug">{s.desc}</div>
              </button>
            );
          })}
          <button
            onClick={() => setShowCustomModal(true)}
            className="text-left rounded-xl border border-dashed border-gray-300 p-3.5 flex flex-col items-start justify-center bg-white hover:border-gray-400 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2 bg-gray-100">
              <Plus size={15} className="text-gray-400" />
            </div>
            <div className="text-[13px] font-semibold text-gray-900">Custom Scenario</div>
            <div className="text-[11.5px] text-gray-400 mt-0.5 leading-snug">Define custom entropy & volume</div>
          </button>
        </div>
      </section>

      {/* Main Grid: Full-Width Payment Flow Twin Canvas */}
      <section className="grid grid-cols-12 gap-5 items-start">
        {/* Payment Flow Twin Canvas (Full Width col-span-12) */}
        <div className="col-span-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-50">
            <div className="flex items-center gap-2.5">
              <span className="text-[13px] font-semibold tracking-wide text-gray-500">PAYMENT FLOW TWIN</span>
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Simulation
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIs3DView(!is3DView)}
                className="flex items-center gap-1 text-[12.5px] font-medium text-gray-600 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-50"
              >
                {is3DView ? "3D View" : "2D Graph"} <ChevronDown size={13} />
              </button>
              <button onClick={() => setCanvasScale(1)} title="Reset Zoom" className="p-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50">
                <Maximize2 size={14} />
              </button>
            </div>
          </div>

          <div
            ref={canvasWrapRef}
            className="relative overflow-hidden bg-[#FCFDFD]"
            style={{ height: CANVAS_H * canvasScale }}
          >
            <div
              style={{
                width: CANVAS_W,
                height: CANVAS_H,
                transform: `scale(${canvasScale})`,
                transformOrigin: "top left",
              }}
              className="absolute top-0 left-0"
            >
              <Toolbar tool={tool} setTool={setTool} />

              {/* SVG Edges & Flow Particles */}
              <div className="absolute inset-0">
                <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}>
                  <defs>
                    <marker id="arrowGreen" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                      <path d="M0,0 L8,4 L0,8 Z" fill="#34d399" />
                    </marker>
                    <marker id="arrowRed" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                      <path d="M0,0 L8,4 L0,8 Z" fill="#f43f5e" />
                    </marker>
                  </defs>

                  {/* Pulsing glow ring on active anomalous node */}
                  {(() => {
                    const rn = nodeMap.risk || nodes[2];
                    if (isSimulatedAnomaly && rn) {
                      const cx = rn.x + rn.w / 2;
                      const cy = rn.y + rn.h / 2;
                      return <circle cx={cx} cy={cy} r="10" fill="#f43f5e" opacity="0.35" className="risk-glow-ring" />;
                    }
                    return null;
                  })()}

                  {edges.map((e, i) => {
                    const na = nodeMap[e.source];
                    const nb = nodeMap[e.target];
                    if (!na || !nb) return null;
                    const x1 = na.x + na.w / 2;
                    const y1 = na.y + na.h / 2;
                    const x2 = nb.x + nb.w / 2;
                    const y2 = nb.y + nb.h / 2;
                    const isRed = e.status === "anomalous";
                    return (
                      <React.Fragment key={i}>
                        <line
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke={isRed ? "#f43f5e" : "#6ee7b7"}
                          strokeWidth={isRed ? 2 : 2}
                          markerEnd={isRed ? "url(#arrowRed)" : "url(#arrowGreen)"}
                          opacity={0.8}
                        />
                        <FlowParticle x1={x1} y1={y1} x2={x2} y2={y2} color={isRed ? "#fb7185" : "#34d399"} dur={isRed ? 1.1 : 1.8} delay={i * 0.25} />
                        <FlowParticle x1={x1} y1={y1} x2={x2} y2={y2} color={isRed ? "#fb7185" : "#34d399"} dur={isRed ? 1.1 : 1.8} delay={i * 0.25 + (isRed ? 0.55 : 0.9)} />
                      </React.Fragment>
                    );
                  })}
                  {/* Dashed line to anomaly propagation card */}
                  {isSimulatedAnomaly && (
                    <line x1="560" y1="270" x2="420" y2="330" stroke="#f43f5e" strokeDasharray="4 4" strokeWidth="1.5" opacity="0.6" />
                  )}
                </svg>

                {/* Render All 7 3D Nodes */}
                {nodes.map((n) => (
                  <NodeCard
                    key={n.key}
                    node={n}
                    selected={selectedNodeKey === n.key}
                    is3D={is3DView}
                    onClick={() => setSelectedNodeKey(n.key)}
                  />
                ))}

                {/* Anomaly Propagation Card */}
                {isSimulatedAnomaly && (
                  <div className="absolute bg-rose-50 border border-rose-200 rounded-xl p-3.5 w-[230px] shadow-sm animate-in fade-in duration-300" style={{ left: 180, top: 335 }}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">A</span>
                      <span className="text-[12px] font-bold text-rose-600">ANOMALY PROPAGATION</span>
                    </div>
                    <div className="text-[11.5px] text-gray-500 mb-1">Risk propagating to</div>
                    <ul className="text-[11.5px] text-gray-600 space-y-0.5 mb-2 list-disc list-inside">
                      <li>Payment Router</li>
                      <li>Processing Service</li>
                    </ul>
                    <div className="flex items-center justify-between text-[11.5px]">
                      <span className="text-gray-500">Impact Score</span>
                      <span className="bg-rose-100 text-rose-600 font-semibold px-2 py-0.5 rounded-md text-[10.5px]">High (Cascading)</span>
                    </div>
                  </div>
                )}

                {/* Mini-Map */}
                <div className="absolute left-4 bottom-4 w-[170px] h-[130px] bg-white border-2 border-emerald-400 rounded-xl p-2 shadow-sm">
                  <svg viewBox="0 0 170 130" className="w-full h-full">
                    <line x1="20" y1="60" x2="60" y2="30" stroke="#a7f3d0" strokeWidth="2" />
                    <line x1="60" y1="30" x2="95" y2="55" stroke="#fca5a5" strokeWidth="2" />
                    <line x1="95" y1="55" x2="135" y2="35" stroke="#a7f3d0" strokeWidth="2" />
                    <line x1="95" y1="55" x2="135" y2="80" stroke="#a7f3d0" strokeWidth="2" />
                    <line x1="135" y1="80" x2="100" y2="105" stroke="#a7f3d0" strokeWidth="2" />
                    <line x1="100" y1="105" x2="65" y2="90" stroke="#a7f3d0" strokeWidth="2" />
                    <rect x="12" y="52" width="16" height="16" rx="3" fill="#6ee7b7" />
                    <rect x="52" y="22" width="16" height="16" rx="3" fill="#6ee7b7" />
                    <rect x="87" y="47" width="18" height="18" rx="3" fill={isSimulatedAnomaly ? "#fda4af" : "#6ee7b7"} stroke={isSimulatedAnomaly ? "#f43f5e" : "#34d399"} />
                    <rect x="127" y="27" width="16" height="16" rx="3" fill="#93c5fd" />
                    <rect x="127" y="72" width="16" height="16" rx="3" fill="#6ee7b7" />
                    <rect x="92" y="97" width="16" height="16" rx="3" fill="#6ee7b7" />
                    <rect x="57" y="82" width="16" height="16" rx="3" fill="#6ee7b7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
            <Legend />
            {selectedNode && (
              <div className="text-[12px] text-gray-500">
                Selected Node: <span className="font-semibold text-gray-800">{selectedNode.name}</span> ({selectedNode.layer}) · Latency: {selectedNode.latencyMs}ms
              </div>
            )}
          </div>
        </div>

        {/* Full-width Live Telemetry & Results Section Below Canvas (3 Full Columns) */}
        <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Core Detection Efficiency */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-[13px] font-bold tracking-wide text-gray-800">LIVE TELEMETRY RESULTS</div>
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Stream
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center mt-3">
                <Gauge value={results.detectionRate} />
                <div className="space-y-2.5">
                  <StatBox label="Injected Events" value={results.injected.toLocaleString()} />
                  <StatBox label="Detected Events" value={results.detected.toLocaleString()} />
                  <StatBox label="Missed Events" value={results.missed.toLocaleString()} />
                  <StatBox label="False Positives" value={results.falsePositives.toLocaleString()} />
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
              <span>Entropy Source: Stochastic Mesh</span>
              <span className="font-semibold text-emerald-600">99.8% Online</span>
            </div>
          </div>

          {/* Card 2: ML Statistical Performance & Latency */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-[13px] font-bold tracking-wide text-gray-800">STATISTICAL METRICS &amp; SLA</div>
                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">ML Eval</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <StatBox label="Precision" value={`${results.precision.toFixed(1)}%`} delta="8.7%" up />
                <StatBox label="Recall" value={`${results.recall.toFixed(1)}%`} delta="12.4%" up />
                <StatBox label="F1 Score" value={`${results.f1.toFixed(1)}%`} delta="10.3%" up />
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-gray-50">
                <StatBox label="FP Rate" value={`${results.fpr.toFixed(1)}%`} delta="2.1%" up={false} />
                <StatBox label="Latency" value={`${results.latency} ms`} delta="35 ms" up={false} />
                <StatBox label="FP Cost" value={`$${results.fpCost.toFixed(2)}`} delta="$32.10" up={false} />
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
              <span>Confidence Interval: 99.4%</span>
              <span className="font-semibold text-gray-700">Threshold: 0.72</span>
            </div>
          </div>

          {/* Card 3: Automated Risk Policy Actions & Mitigation */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-[13px] font-bold tracking-wide text-gray-800">AUTOMATED CONTAINMENT</div>
                <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">DEFENSE ACTIVE</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50/80 border border-gray-100">
                  <span className="text-gray-600 font-medium">3DS Step-Up Challenge</span>
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">Enforced (99.2%)</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50/80 border border-gray-100">
                  <span className="text-gray-600 font-medium">Velocity Rate Limiter</span>
                  <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[11px]">350 req/min</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50/80 border border-gray-100">
                  <span className="text-gray-600 font-medium">Risk Anomaly Quarantine</span>
                  <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded text-[11px]">4 IPs Contained</span>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
              <span>Cascade Circuit: ARMED</span>
              <span className="font-semibold text-emerald-600">Zero Leakage</span>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Row: Event Timeline + 3D Risk Heatmap with Coordinates */}
      <section className="grid grid-cols-12 gap-5">
        {/* Timeline */}
        <div className="col-span-12 lg:col-span-7 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="text-[13px] font-semibold tracking-wide text-gray-500">EVENT TIMELINE (Live Stream)</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSeed((s) => s - 1)}
                  className="p-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 cursor-pointer"
                >
                  <SkipBack size={13} />
                </button>
                <button
                  onClick={() => setSeed((s) => s + 1)}
                  className="p-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 cursor-pointer"
                >
                  <SkipForward size={13} />
                </button>
                <select
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(e.target.value)}
                  className="text-[12px] font-medium text-gray-600 border border-gray-200 rounded-lg px-2 py-1 bg-white cursor-pointer"
                >
                  <option value="0.5x">0.5x</option>
                  <option value="1.0x">1.0x</option>
                  <option value="2.0x">2.0x</option>
                </select>
                <button
                  onClick={() => setIsLiveStream(!isLiveStream)}
                  className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    isLiveStream ? "text-emerald-600 bg-emerald-50" : "text-gray-500 bg-gray-100"
                  }`}
                >
                  {isLiveStream ? "Live" : "Paused"}
                </button>
              </div>
            </div>

            <div className="text-[11px] text-gray-400 mb-2">12:21:03 · Live Ingestion Stream</div>
            <div className="relative">
              <div className="absolute left-0 right-0 top-[9px] h-px bg-gray-200" />
              <div className="grid grid-cols-7 gap-2 relative">
                {timelineEvents.map((ev) => (
                  <div key={ev.key} className="flex flex-col items-center text-center">
                    {ev.status === "anomalous" ? (
                      <div className="relative w-4 h-4 mb-3 flex items-center justify-center">
                        <span className="absolute w-4 h-4 rounded-full bg-rose-500 ring-2 ring-white z-10" />
                        <span className="absolute w-4 h-4 rounded-full bg-rose-400 timeline-ping" />
                        <span className="absolute w-4 h-4 rounded-full bg-rose-400 timeline-ping" style={{ animationDelay: "0.6s" }} />
                        <svg viewBox="0 0 40 40" className="absolute w-10 h-10 -z-0 timeline-burst-spin">
                          {Array.from({ length: 8 }).map((_, i) => (
                            <line
                              key={i}
                              x1="20"
                              y1="20"
                              x2={20 + 17 * Math.cos((i * Math.PI) / 4)}
                              y2={20 + 17 * Math.sin((i * Math.PI) / 4)}
                              stroke="#fda4af"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          ))}
                        </svg>
                      </div>
                    ) : (
                      <div className={`w-4 h-4 rounded-full ring-4 ${STATUS_RING[ev.status]} mb-3 ${STATUS_DOT[ev.status]}`} />
                    )}
                    <div
                      className={`w-full rounded-lg border px-2 py-2 ${
                        ev.status === "anomalous" ? "border-rose-200 bg-rose-50 shadow-sm" : "border-gray-100 bg-gray-50"
                      }`}
                    >
                      <div className="text-[10.5px] font-semibold text-gray-700 leading-tight">{ev.label}</div>
                      <div className="text-[10.5px] text-gray-400 mt-1">{ev.trps}</div>
                      <div className={`text-[10.5px] font-medium mt-0.5 ${STATUS_TEXT[ev.status]}`}>{ev.risk}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 mt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
            <span>Synchronized telemetry clock: UTC+05:30</span>
            <span className="font-semibold text-gray-700">7 Active Pipeline Stages</span>
          </div>
        </div>

        {/* 3D Risk Heatmap with Detailed Coordinates */}
        <div className="col-span-12 lg:col-span-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[13px] font-semibold tracking-wide text-gray-800">RISK HEATMAP (Twin Topology)</div>
                <div className="text-[10.5px] text-gray-400">3D Coordinate Mesh &amp; Risk Iso-surface</div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-medium text-white bg-gray-900 px-2.5 py-1 rounded-lg shadow-2xs">Heat (3D)</span>
                <span className="text-[11px] font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">Grid</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 aspect-[16/11] rounded-xl bg-gradient-to-b from-slate-900 to-slate-950 overflow-hidden flex items-center justify-center shadow-inner relative border border-slate-800">
                {/* Visual coordinate axes labels */}
                <span className="absolute top-2 left-2 text-[9px] font-mono text-cyan-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
                  Z: Altitude (Risk Density)
                </span>
                <span className="absolute bottom-2 left-2 text-[9px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
                  X: Nodes [0..14]
                </span>
                <span className="absolute bottom-2 right-2 text-[9px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
                  Y: Velocity [0..10]
                </span>

                <div className="heat-slow-spin" style={{ width: "85%", height: "85%" }}>
                  <svg viewBox="-160 -110 400 300" className="w-full h-full overflow-visible">
                    <g opacity="0.35">
                      {Array.from({ length: 11 }).map((_, i) => (
                        <line key={`h${i}`} x1={-110 + i * 20} y1={100} x2={-110 + i * 20 + 130} y2={-30} stroke="#38bdf8" strokeWidth="0.6" />
                      ))}
                    </g>
                    {isoSurface.map((q, i) => (
                      <path key={i} d={q.d} fill={q.color} stroke="rgba(255,255,255,0.25)" strokeWidth="0.4" />
                    ))}
                  </svg>
                </div>
              </div>
              <div className="flex flex-col items-center h-full justify-between py-2">
                <span className="text-[10px] text-rose-500 font-bold">1.0</span>
                <div className="w-2 flex-1 my-1 rounded-full" style={{ background: "linear-gradient(to bottom, #e33737, #f0c828, #3cc878, #1ea0e6, #283cc8)" }} />
                <span className="text-[10px] text-blue-500 font-bold">0.0</span>
              </div>
            </div>
          </div>

          {/* Explicit Coordinate Readouts Below Heatmap */}
          <div className="pt-3 mt-3 border-t border-gray-100">
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="p-1.5 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-[9.5px] text-gray-400 block font-sans uppercase">Peak Coords</span>
                <span className="font-bold text-gray-800">X:4, Y:3</span>
              </div>
              <div className="p-1.5 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-[9.5px] text-gray-400 block font-sans uppercase">Peak Density</span>
                <span className="font-bold text-rose-600">Z: 0.94</span>
              </div>
              <div className="p-1.5 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-[9.5px] text-gray-400 block font-sans uppercase">Topology</span>
                <span className="font-bold text-emerald-600">140 Nodes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Scenario Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Sliders size={18} className="text-gray-700" />
                <h3 className="font-bold text-gray-900 text-[16px]">Custom Attack Scenario</h3>
              </div>
              <button onClick={() => setShowCustomModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 text-[13px]">
              <div>
                <label className="text-gray-600 font-medium block mb-1">Scenario Name</label>
                <input
                  type="text"
                  defaultValue="Custom Distributed Attack Profile"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800"
                />
              </div>
              <div>
                <label className="text-gray-600 font-medium block mb-1">Primary Target Node</label>
                <select
                  value={customTargetNode}
                  onChange={(e) => setCustomTargetNode(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800"
                >
                  <option value="risk_engine">KRYPTIC Risk Engine</option>
                  <option value="auth_service">Auth & Tokenization</option>
                  <option value="entry_gateway">API Entry Gateway</option>
                  <option value="smart_router">Smart Payment Router</option>
                  <option value="card_processor">Acquiring Processor</option>
                </select>
              </div>
              <div>
                <label className="text-gray-600 font-medium block mb-1">Traffic Pattern</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Burst", "Exponential", "Wave"].map((p) => (
                    <button
                      key={p}
                      onClick={() => setInjectionPattern(p)}
                      className={`py-1.5 rounded-lg border text-center font-medium ${
                        injectionPattern === p ? "bg-gray-900 text-white border-gray-900" : "bg-gray-50 text-gray-700 border-gray-200"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowCustomModal(false);
                  setScenario("custom");
                  runSimulation();
                }}
                className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 shadow-sm"
              >
                Apply & Inject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
