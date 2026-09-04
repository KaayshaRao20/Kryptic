import React, { useState, useCallback, useEffect } from 'react';
import {
  Sparkles, ChevronDown, ShieldCheck, ShieldAlert,
  Play, Info, Download, HelpCircle, Zap, Users, Activity,
  CheckCircle, Clock, ArrowRight,
  Loader2, BarChart2, Target, Layers, Server, RefreshCw
} from 'lucide-react';
import {
  analyzeFraud, analyzeFraudAsync, DEFAULT_PARAMS, fetchModelCard, getNextAutoFillProfile,
  TRANSACTION_TYPE_OPTIONS, PAYMENT_CHANNEL_OPTIONS, TIME_OF_DAY_OPTIONS,
  type TransactionParams, type FraudPrediction, type RiskLevel, type FactorLevel, type ModelCard,
} from '../services/FraudDetectionService';
import { getRecommendation, getInjectionRecommendation, type AIRecommendation, type InjectionAIRecommendation } from '../services/RecommendationService';
import { runInjectionSimulation, type InjectionConfig, type SimulationOutput, type PaymentComponent, type TimelineSeverity } from '../services/InjectionSimulationService';
import { cn } from '../lib/utils';

/* ─── Colour maps ─────────────────────────────────────────────── */
const RISK_GAUGE: Record<RiskLevel, { stroke: string; bg: string; text: string; badge: string }> = {
  LOW:      { stroke: '#10B981', bg: 'bg-emerald-50',  text: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  MEDIUM:   { stroke: '#F59E0B', bg: 'bg-amber-50',    text: 'text-amber-600',   badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  HIGH:     { stroke: '#F97316', bg: 'bg-orange-50',   text: 'text-orange-600',  badge: 'bg-orange-50 text-orange-700 border-orange-200' },
  CRITICAL: { stroke: '#EF4444', bg: 'bg-rose-50',     text: 'text-rose-600',    badge: 'bg-rose-50 text-rose-700 border-rose-200' },
};

const FACTOR_COLOUR: Record<FactorLevel, string> = {
  HIGH:   'text-rose-600',
  MEDIUM: 'text-amber-600',
  LOW:    'text-sky-600',
  NORMAL: 'text-emerald-600',
};

const COMP_STATUS: Record<string, { border: string; bg: string; text: string; dot: string }> = {
  healthy:   { border: 'border-slate-200',   bg: 'bg-white',        text: 'text-slate-500',   dot: 'bg-emerald-500' },
  warning:   { border: 'border-amber-300',  bg: 'bg-amber-50',     text: 'text-amber-700',   dot: 'bg-amber-500' },
  anomalous: { border: 'border-rose-400',   bg: 'bg-rose-50',      text: 'text-rose-700',    dot: 'bg-rose-500' },
};

const TIMELINE_COLOUR: Record<TimelineSeverity, string> = {
  INFO:    'bg-blue-500',
  WARNING: 'bg-amber-500',
  CRITICAL:'bg-rose-500',
  SUCCESS: 'bg-emerald-500',
};

const SCENARIO_OPTS = [
  { key: 'fraud_spike',  title: 'Fraud Spike',         desc: 'Sudden surge in fraudulent activity',    Icon: ShieldAlert, tone: { card: 'border-rose-300 bg-rose-50/50',  icon: 'text-rose-500', iconBg: 'bg-rose-100'   } },
  { key: 'high_velocity',title: 'High Velocity',        desc: 'Unusually high transaction speed',        Icon: Zap,         tone: { card: 'border-sky-300 bg-sky-50/50',    icon: 'text-sky-500',  iconBg: 'bg-sky-100'    } },
  { key: 'coordinated',  title: 'Coordinated Activity', desc: 'Multiple entities acting together',       Icon: Users,       tone: { card: 'border-violet-300 bg-violet-50/50', icon: 'text-violet-500', iconBg: 'bg-violet-100' } },
  { key: 'behavioral',   title: 'Behavioral Anomaly',   desc: 'Unusual user behaviour patterns',         Icon: Activity,    tone: { card: 'border-teal-300 bg-teal-50/50',  icon: 'text-teal-500', iconBg: 'bg-teal-100'   } },
];

const inr = new Intl.NumberFormat('en-IN');

const fallbackModelCard: ModelCard = {
  status: 'degraded',
  active_model_version: 'v2.0.0-xgb-paysim',
  loss_class: 'payment_fraud_spike_detection',
  dataset: 'PaySim Financial Benchmark',
  train_samples: 240800,
  test_samples: 60200,
  features_count: 17,
  artifacts: {},
  holdout_metrics: {
    accuracy: 0.999884,
    precision: 0.983122,
    recall: 0.987288,
    f1: 0.985201,
    roc_auc: 0.998922,
    pr_auc: 0.992663,
    false_positive_rate: 0.000067,
    false_negative_rate: 0.012712,
    avg_inference_latency_ms: 0.503,
    p95_inference_latency_ms: 0.698,
    confusion_matrix: {
      true_negatives: 59960,
      false_positives: 4,
      false_negatives: 3,
      true_positives: 233,
    },
  },
  operational_cost: {
    false_positive_review_cost_inr: 65,
    holdout_false_positive_cost_inr: 260,
    decision_policy: 'APPROVE below 25%, REVIEW 25-49%, CHALLENGE_2FA 50-74%, DECLINE 75%+',
  },
};

function pct(value: number, digits = 2) {
  return `${(value * 100).toFixed(digits)}%`;
}

function ModelProofStrip({ modelCard }: { modelCard: ModelCard }) {
  const m = modelCard.holdout_metrics;
  const online = modelCard.status === 'operational';
  const stats = [
    { label: 'Precision', value: pct(m.precision), color: 'text-emerald-600' },
    { label: 'Recall', value: pct(m.recall), color: 'text-blue-600' },
    { label: 'FPR', value: pct(m.false_positive_rate, 4), color: 'text-amber-600' },
    { label: 'FP Cost', value: `INR ${inr.format(modelCard.operational_cost.holdout_false_positive_cost_inr)}`, color: 'text-slate-800' },
  ];

  return (
    <div className="grid grid-cols-12 gap-3 mb-5">
      <div className="col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Production ML Model</div>
            <div className="text-sm font-black text-slate-900 font-mono mt-0.5">{modelCard.active_model_version}</div>
          </div>
          <span className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${online ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200'}`}>
            {online ? <CheckCircle size={12} /> : <Clock size={12} />}
            {online ? 'Live ML' : 'Report Mode'}
          </span>
        </div>
        <div className="text-xs text-slate-500 font-medium mt-2">
          {inr.format(modelCard.test_samples)} untouched holdout transactions • {modelCard.features_count} engineered features
        </div>
      </div>

      <div className="col-span-8 grid grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between">
            <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">{s.label}</div>
            <div className={`text-xl font-bold font-mono tracking-tight mt-1 ${s.color}`}>{s.value}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Held-out validation</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ValidationPanel({ modelCard, prediction }: { modelCard: ModelCard; prediction: FraudPrediction }) {
  const cm = modelCard.holdout_metrics.confusion_matrix;
  const sourceOnline = prediction.source === 'backend_ml';
  const rows = [
    { label: 'True Positives', value: cm.true_positives, tone: 'text-emerald-600' },
    { label: 'False Positives', value: cm.false_positives, tone: 'text-amber-600' },
    { label: 'False Negatives', value: cm.false_negatives, tone: 'text-rose-600' },
    { label: 'True Negatives', value: cm.true_negatives, tone: 'text-slate-700' },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">Holdout Validation Proof</div>
        <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${sourceOnline ? 'text-emerald-700 bg-white border-emerald-200' : 'text-amber-700 bg-white border-amber-200'}`}>
          {sourceOnline ? <CheckCircle size={11} /> : <Clock size={11} />}
          {sourceOnline ? 'Backend ML scored' : 'Offline fallback'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {rows.map((row) => (
          <div key={row.label} className="rounded-lg bg-white border border-slate-100 p-2">
            <div className="text-[10px] text-slate-400 font-medium">{row.label}</div>
            <div className={`text-sm font-bold font-mono ${row.tone}`}>{inr.format(row.value)}</div>
          </div>
        ))}
      </div>
      <div className="pt-1.5 border-t border-slate-200/60 text-[10.5px] text-slate-500 leading-snug">
        Review cost: INR {inr.format(modelCard.operational_cost.false_positive_review_cost_inr)} per alert. Policy: {modelCard.operational_cost.decision_policy}
      </div>
    </div>
  );
}

/* ─── Sleek Thin Fraud Gauge Component ───────────────────────────── */

function FraudGauge({ probability, riskLevel }: { probability: number; riskLevel: RiskLevel }) {
  const r = 68;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, probability));
  const offset = circ - (pct / 100) * circ;
  const color = RISK_GAUGE[riskLevel].stroke;

  return (
    <div className="relative w-40 h-40 mx-auto flex-shrink-0 my-1">
      <svg viewBox="0 0 165 165" className="-rotate-90 w-full h-full">
        <circle cx="82.5" cy="82.5" r={r} stroke="#F1F5F9" strokeWidth="8" fill="none" />
        <circle
          cx="82.5" cy="82.5" r={r}
          stroke={color} strokeWidth="8" fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(.4,0,.2,1), stroke 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="flex items-baseline justify-center font-mono font-bold text-slate-900 tracking-tight">
          <span className="text-2xl">{pct.toFixed(1)}</span>
          <span className="text-xs text-slate-500 font-semibold ml-0.5">%</span>
        </div>
        <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
          Fraud Probability
        </span>
      </div>
    </div>
  );
}

function RiskBadge({ level }: { level: RiskLevel }) {
  const c = RISK_GAUGE[level];
  return (
    <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold mt-2 shadow-2xs", c.badge)}>
      {level === 'LOW' ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
      <span>{level} RISK</span>
    </div>
  );
}

function SliderField({ label, min, max, value, onChange, unit }: {
  label: string; min: number; max: number; value: number;
  onChange: (v: number) => void; unit?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[11px] font-semibold text-slate-600">{label}</label>
        <span className="text-xs font-mono font-semibold text-slate-900">{value.toLocaleString()}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full accent-blue-600 cursor-pointer"
        style={{ background: `linear-gradient(to right, #2563EB ${((value - min) / (max - min)) * 100}%, #E2E8F0 ${((value - min) / (max - min)) * 100}%)` }}
      />
      <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
        <span>{min.toLocaleString()}</span><span>{max.toLocaleString()}</span>
      </div>
    </div>
  );
}

function DropdownField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">{label}</label>
      <div className="relative">
        <select
          value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer pr-8 transition-all"
        >
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}

function TextInputField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">{label}</label>
      <input
        type="text" value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
      />
    </div>
  );
}

function SmallDropdown({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="relative">
      <select
        value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none cursor-pointer pr-6"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  );
}

function CompactFlowDiagram({ components }: { components: PaymentComponent[] }) {
  const byId = Object.fromEntries(components.map((c) => [c.id, c]));
  const row1 = ['entry', 'auth', 'risk', 'router'];
  const row2 = ['settlement', 'authz', 'processor'];

  const NodeBox = ({ id }: { id: string }) => {
    const comp = byId[id];
    if (!comp) return null;
    const s = COMP_STATUS[comp.status];
    return (
      <div className={`rounded-xl border px-2.5 py-1.5 flex flex-col items-center flex-1 min-w-[72px] ${s.border} ${s.bg} shadow-2xs`}>
        <div className={`w-2 h-2 rounded-full mb-1 ${s.dot}`} />
        <div className="text-[10px] font-bold text-slate-900 text-center leading-tight">{comp.shortName}</div>
        <div className="text-[9px] text-slate-400">{comp.type}</div>
        <div className={`text-[9px] font-bold mt-0.5 ${s.text}`}>
          {comp.status === 'anomalous' ? 'ANOMALOUS' : comp.status === 'warning' ? 'Warning' : 'Healthy'}
        </div>
      </div>
    );
  };

  const Arrow = ({ vertical = false }: { vertical?: boolean }) => (
    <div className={`flex items-center justify-center shrink-0 ${vertical ? 'flex-col h-4' : 'mx-0.5'}`}>
      <ArrowRight size={12} className="text-slate-400" style={vertical ? { transform: 'rotate(90deg)' } : {}} />
    </div>
  );

  const anomalous = components.find((c) => c.status === 'anomalous');

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-1 justify-between">
        {row1.map((id, i) => (
          <React.Fragment key={id}>
            <NodeBox id={id} />
            {i < row1.length - 1 && <Arrow />}
          </React.Fragment>
        ))}
      </div>
      <div className="flex items-center gap-1 justify-between flex-row-reverse">
        {row2.map((id, i) => (
          <React.Fragment key={id}>
            <NodeBox id={id} />
            {i < row2.length - 1 && <Arrow />}
          </React.Fragment>
        ))}
      </div>
      {anomalous && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Anomalous Target:</span>
            <span className="text-rose-600 font-bold">{anomalous.shortName}</span>
          </div>
          <span className="text-rose-600 font-mono font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            {anomalous.riskScore}% Risk Peak
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────── */
export const FraudDetection: React.FC = () => {
  const [params, setParams] = useState<TransactionParams>(DEFAULT_PARAMS);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState<FraudPrediction | null>(null);
  const [aiRec, setAiRec] = useState<AIRecommendation | null>(null);
  const [isLoadingRec, setIsLoadingRec] = useState(false);
  const [modelCard, setModelCard] = useState<ModelCard>(fallbackModelCard);

  const [activeTab, setActiveTab] = useState<'detection' | 'lab'>('detection');

  const [labScenario, setLabScenario] = useState('fraud_spike');
  const [injCfg, setInjCfg] = useState<InjectionConfig>({
    scenario: 'fraud_spike',
    transactionVolume: 5000,
    fraudRatio: 30,
    velocity: 120,
    amountPattern: 'Random High',
    targetEntity: 'acc_0987',
    duration: 10,
    fraudIntensity: 'High',
    transactionType: 'Mixed',
  });
  const [simState, setSimState] = useState<'idle' | 'running' | 'completed'>('idle');
  const [simOutput, setSimOutput] = useState<SimulationOutput | null>(null);
  const [injRec, setInjRec] = useState<InjectionAIRecommendation | null>(null);
  const [isLoadingInjRec, setIsLoadingInjRec] = useState(false);
  const [timelineVisible, setTimelineVisible] = useState(0);

  useEffect(() => {
    let mounted = true;
    fetchModelCard().then((card) => {
      if (mounted && card) {
        setModelCard(card);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleAutoFill = useCallback(() => {
    setParams(getNextAutoFillProfile());
    setPrediction(null);
    setAiRec(null);
  }, []);

  const handleAnalyze = useCallback(async () => {
    setIsAnalyzing(true);
    setAiRec(null);
    try {
      const result = await analyzeFraudAsync(params);
      setPrediction(result);
    } catch (e) {
      const result = analyzeFraud(params);
      setPrediction(result);
    } finally {
      setIsAnalyzing(false);
    }
  }, [params]);

  const handleReset = useCallback(() => {
    setParams(DEFAULT_PARAMS);
    setPrediction(null);
    setAiRec(null);
  }, []);

  const handleGetRecommendation = useCallback(() => {
    if (!prediction) return;
    setIsLoadingRec(true);
    setTimeout(() => {
      setAiRec(getRecommendation(prediction, params));
      setIsLoadingRec(false);
    }, 800);
  }, [prediction, params]);

  const handleInjectFraud = useCallback(() => {
    setSimState('running');
    setSimOutput(null);
    setInjRec(null);
    setTimelineVisible(0);
    const cfg = { ...injCfg, scenario: labScenario };
    setTimeout(() => {
      const output = runInjectionSimulation(cfg);
      setSimOutput(output);
      setSimState('completed');
      output.timeline.forEach((_, i) => {
        setTimeout(() => setTimelineVisible(i + 1), i * 350);
      });
    }, 1800);
  }, [injCfg, labScenario]);

  const handleGetInjectionRec = useCallback(() => {
    if (!simOutput) return;
    setIsLoadingInjRec(true);
    setTimeout(() => {
      const rec = getInjectionRecommendation(
        labScenario,
        simOutput.results.affectedComponent,
        simOutput.propagatedToNames,
        simOutput.results.detectionRate,
        simOutput.results.riskScorePeak,
        injCfg.targetEntity,
        injCfg.velocity,
      );
      setInjRec(rec);
      setIsLoadingInjRec(false);
    }, 900);
  }, [simOutput, labScenario, injCfg]);

  const updateParam = <K extends keyof TransactionParams>(key: K, val: TransactionParams[K]) => {
    setParams((p) => ({ ...p, [key]: val }));
    setPrediction(null);
    setAiRec(null);
  };

  const updateInj = <K extends keyof InjectionConfig>(key: K, val: InjectionConfig[K]) =>
    setInjCfg((c) => ({ ...c, [key]: val }));

  return (
    <div className="w-full min-h-screen pb-12 space-y-5 text-slate-800 antialiased font-sans">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Fraud Detection &amp; Lab</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Payment fraud-spike detector with held-out precision, recall, and false-positive cost
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer">
            <HelpCircle size={15} /> How it works
          </button>
          <button className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-900 font-semibold border border-slate-200 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 shadow-2xs cursor-pointer">
            <Download size={14} /> Export Report
          </button>
        </div>
      </div>

      <ModelProofStrip modelCard={modelCard} />

      {/* ── Top two-column layout ─────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-5 items-stretch">
        {/* ── LEFT: Transaction Parameters (4 Cols) ────────────────── */}
        <div className="col-span-4 flex flex-col">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-900">Transaction Parameters</span>
                <button
                  onClick={handleAutoFill}
                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-xl hover:bg-blue-100 transition-colors border border-blue-200/60 cursor-pointer"
                >
                  <Sparkles size={13} /> AI Auto-Fill
                </button>
              </div>

              <div className="px-5 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <TextInputField label="Transaction ID" value={params.transactionId} onChange={(v) => updateParam('transactionId', v)} />
                  <TextInputField label="Account ID" value={params.accountId} onChange={(v) => updateParam('accountId', v)} />
                </div>

                <DropdownField
                  label="Transaction Type" value={params.transactionType}
                  onChange={(v) => updateParam('transactionType', v)}
                  options={TRANSACTION_TYPE_OPTIONS}
                />

                <SliderField label="Amount (USD)" min={10} max={10000} value={params.amount} onChange={(v) => updateParam('amount', v)} />
                <SliderField label="Velocity (Txns/24h)" min={1} max={100} value={params.velocity} onChange={(v) => updateParam('velocity', v)} />

                <div className="grid grid-cols-2 gap-3">
                  <DropdownField label="Payment Channel" value={params.paymentChannel} onChange={(v) => updateParam('paymentChannel', v)} options={PAYMENT_CHANNEL_OPTIONS} />
                  <DropdownField label="Time of Day" value={params.timeOfDay} onChange={(v) => updateParam('timeOfDay', v)} options={TIME_OF_DAY_OPTIONS} />
                </div>

                <SliderField label="Customer Age (Years)" min={18} max={90} value={params.customerAge} onChange={(v) => updateParam('customerAge', v)} />
                <SliderField label="Account Age (Days)" min={1} max={2000} value={params.accountAge} onChange={(v) => updateParam('accountAge', v)} />
              </div>
            </div>

            <div className="px-5 pb-5 pt-2 space-y-2">
              <div className="flex gap-2.5">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
                >
                  {isAnalyzing
                    ? <><Loader2 size={15} className="animate-spin" /> Analyzing…</>
                    : <><Activity size={15} /> Analyze Transaction</>}
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 bg-white transition-colors cursor-pointer"
                >
                  Reset
                </button>
              </div>

              {prediction && activeTab === 'detection' && (
                <button
                  onClick={() => setActiveTab('lab')}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-rose-200 text-rose-600 font-bold text-xs hover:bg-rose-50 bg-white transition-colors cursor-pointer"
                >
                  <ShieldAlert size={14} /> Open Fraud Injection Lab →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Model Output (8 Cols - No Empty Spaces!) ────────────────── */}
        <div className="col-span-8 flex flex-col">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex-1 flex flex-col justify-between">
            <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400" />

            <div className="p-5 lg:p-6 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-slate-900">Real-Time ML Model Output</span>
                {prediction && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">Run ID: <span className="font-mono text-slate-700 font-bold">{prediction.predictionId}</span></span>
                    <span className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${prediction.source === 'backend_ml' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200'}`}>
                      {prediction.source === 'backend_ml' ? <CheckCircle size={11} /> : <Clock size={11} />}
                      {prediction.source === 'backend_ml' ? 'Live ML' : 'Fallback'}
                    </span>
                  </div>
                )}
              </div>

              {!prediction && !isAnalyzing && (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400 my-auto">
                  <ShieldCheck size={48} strokeWidth={1.5} className="text-slate-300" />
                  <div className="text-center max-w-sm">
                    <p className="text-sm font-bold text-slate-700">Run Inference to View Output</p>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Adjust transaction parameters or click "AI Auto-Fill", then click "Analyze Transaction" to inspect live SHAP factors and model confidence.
                    </p>
                  </div>
                </div>
              )}

              {isAnalyzing && (
                <div className="flex flex-col items-center justify-center py-20 gap-4 my-auto">
                  <Loader2 size={36} className="animate-spin text-blue-600" />
                  <span className="text-xs font-semibold text-slate-600">Executing XGBoost Risk Model…</span>
                </div>
              )}

              {prediction && !isAnalyzing && (
                <div className="grid grid-cols-12 gap-5 items-start">
                  {/* Gauge Column (3 Cols) */}
                  <div className="col-span-3 flex flex-col items-center justify-center text-center">
                    <FraudGauge probability={prediction.fraudProbability} riskLevel={prediction.riskLevel} />
                    <RiskBadge level={prediction.riskLevel} />
                    <p className="text-[10px] text-slate-400 mt-2 font-mono">ID: {prediction.predictionId}</p>
                  </div>

                  {/* Key Risk Factors with Feature Contribution Bars (5 Cols - No empty gap!) */}
                  <div className="col-span-5 border-l border-slate-100 pl-5 space-y-3">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                      <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1.5">
                        <span>Key Risk Factors</span>
                        <Info size={12} className="text-slate-400" />
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">SHAP Score</span>
                    </div>

                    <div className="space-y-3">
                      {prediction.riskFactors.map((f) => (
                        <div key={f.name} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{f.displayName}</span>
                              <span className={`text-[10.5px] font-semibold ${FACTOR_COLOUR[f.level]}`}>({f.value})</span>
                            </div>
                            <span className="font-mono font-bold text-slate-700 text-xs">
                              +{f.shapScore.toFixed(2)}
                            </span>
                          </div>
                          {/* Visual Feature Impact Progress Bar */}
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                f.level === 'HIGH' ? "bg-rose-500" :
                                f.level === 'MEDIUM' ? "bg-amber-500" :
                                f.level === 'LOW' ? "bg-sky-500" : "bg-emerald-500"
                              )}
                              style={{ width: `${Math.min(100, Math.max(10, f.shapScore * 100))}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Model Evidence + AI Recommendation (4 Cols) */}
                  <div className="col-span-4 space-y-3 border-l border-slate-100 pl-5">
                    <div>
                      <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase mb-2">Model Evidence</div>
                      <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                        {prediction.modelEvidence.map((e) => (
                          <div key={e.name} className="flex items-center justify-between py-0.5">
                            <span className="text-slate-500 font-medium">{e.name}</span>
                            <span className="font-bold text-slate-800 font-mono">{e.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <ValidationPanel modelCard={modelCard} prediction={prediction} />

                    <div className="bg-blue-50/70 rounded-2xl border border-blue-100 p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Sparkles size={14} className="text-blue-600" />
                          <span className="text-xs font-bold text-blue-900">AI Recommendation</span>
                        </div>
                      </div>

                      {!aiRec && (
                        <p className="text-[11px] text-blue-800/80 font-medium leading-snug">
                          Click below for automated AI mitigation recommendation.
                        </p>
                      )}

                      {aiRec && (
                        <div className="space-y-1.5">
                          <p className="text-xs text-blue-900 leading-snug font-semibold">{aiRec.assessment}</p>
                          <div className="space-y-1 pt-1">
                            {aiRec.actions.map((a, i) => (
                              <div key={i} className="flex items-start gap-1.5 text-[11px] text-blue-800">
                                <CheckCircle size={11} className="text-emerald-600 shrink-0 mt-0.5" />
                                <span>{a}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={handleGetRecommendation}
                        disabled={isLoadingRec}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors disabled:opacity-60 cursor-pointer shadow-2xs"
                      >
                        {isLoadingRec
                          ? <><Loader2 size={13} className="animate-spin" /> Generating…</>
                          : <><Sparkles size={13} /> {aiRec ? 'Refresh Recommendation' : 'Get AI Recommendation'}</>}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ──────────────────────────────────────── */}
      <div className="pt-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('detection')}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer",
              activeTab === 'detection'
                ? "text-blue-600 border-blue-600"
                : "text-slate-500 border-transparent hover:text-slate-900"
            )}
          >
            <Activity size={14} /> Real-Time Detection
          </button>
          <button
            onClick={() => setActiveTab('lab')}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer",
              activeTab === 'lab'
                ? "text-rose-600 border-rose-600"
                : "text-slate-500 border-transparent hover:text-slate-900"
            )}
          >
            <ShieldAlert size={14} /> Fraud Injection Lab
            <span className="text-[9px] font-bold bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded-full ml-1">
              SIMULATOR
            </span>
          </button>
        </div>
      </div>

      {/* ── Fraud Injection Lab Content ────────────────────────────── */}
      {activeTab === 'lab' && (
        <div className="grid grid-cols-12 gap-5 items-start">
          {/* Controls (4 Cols) */}
          <div className="col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-900">Fraud Injection Lab</div>
                <div className="text-xs text-slate-400 font-medium">Inject synthetic attacks to stress-test detection rails</div>
              </div>
              <button className="flex items-center gap-1 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg px-2.5 py-1 hover:bg-slate-50 bg-white shadow-2xs">
                Presets <ChevronDown size={12} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">1. Select Attack Scenario</div>
                <div className="grid grid-cols-2 gap-2">
                  {SCENARIO_OPTS.map((s) => {
                    const active = labScenario === s.key;
                    return (
                      <button
                        key={s.key}
                        onClick={() => setLabScenario(s.key)}
                        className={cn(
                          "text-left rounded-xl border p-3 transition-all cursor-pointer select-none",
                          active
                            ? s.tone.card + ' shadow-2xs ring-1 ring-rose-400/40'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        )}
                      >
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center mb-1.5 ${active ? s.tone.iconBg : 'bg-slate-100'}`}>
                          <s.Icon size={13} className={active ? s.tone.icon : 'text-slate-400'} />
                        </div>
                        <div className="text-xs font-bold text-slate-900 leading-tight">{s.title}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">{s.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">2. Configure Injection Parameters</div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Transaction Volume</label>
                    <input
                      type="number" value={injCfg.transactionVolume}
                      onChange={(e) => updateInj('transactionVolume', Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Amount Pattern</label>
                    <SmallDropdown value={injCfg.amountPattern} onChange={(v) => updateInj('amountPattern', v)} options={['Random High', 'Burst', 'Gradual', 'Fixed']} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Velocity (Txns/min)</label>
                    <input
                      type="number" value={injCfg.velocity}
                      onChange={(e) => updateInj('velocity', Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Fraud Ratio (%)</label>
                    <input
                      type="number" min={1} max={100} value={injCfg.fraudRatio}
                      onChange={(e) => updateInj('fraudRatio', Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Target Entity</label>
                    <input
                      type="text" value={injCfg.targetEntity}
                      onChange={(e) => updateInj('targetEntity', e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Transaction Type</label>
                    <SmallDropdown value={injCfg.transactionType} onChange={(v) => updateInj('transactionType', v)} options={['Mixed', 'Purchase', 'Transfer', 'Cash']} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Duration (min)</label>
                    <input
                      type="number" min={1} max={60} value={injCfg.duration}
                      onChange={(e) => updateInj('duration', Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Fraud Intensity</label>
                    <SmallDropdown value={injCfg.fraudIntensity} onChange={(v) => updateInj('fraudIntensity', v)} options={['Low', 'Medium', 'High', 'Extreme']} />
                  </div>
                </div>
              </div>

              <button
                onClick={handleInjectFraud}
                disabled={simState === 'running'}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                {simState === 'running'
                  ? <><Loader2 size={16} className="animate-spin" /> Executing Attack Simulation…</>
                  : <><Play size={15} className="fill-white" /> INJECT FRAUD SCENARIO</>}
              </button>
            </div>
          </div>

          {/* Right Column: Lab Results (8 Cols - No Empty Dead Box!) ────────────── */}
          <div className="col-span-8 space-y-4">
            {/* When Idle: Show Architecture Preview & Quick Run Overview */}
            {simState === 'idle' && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Target size={18} className="text-rose-500" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Fraud Simulation Target Architecture</h3>
                      <p className="text-xs text-slate-400 font-medium">Ready to inject synthetic threat vectors across payment rails</p>
                    </div>
                  </div>
                  <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Ready
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Selected Target</span>
                    <span className="font-mono font-bold text-slate-900 block mt-0.5">{injCfg.targetEntity}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Scenario</span>
                    <span className="font-bold text-rose-600 block mt-0.5">{SCENARIO_OPTS.find(s=>s.key===labScenario)?.title}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Target Volume</span>
                    <span className="font-mono font-bold text-slate-900 block mt-0.5">{injCfg.transactionVolume.toLocaleString()} Txns</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Injection Velocity</span>
                    <span className="font-mono font-bold text-slate-900 block mt-0.5">{injCfg.velocity} / min</span>
                  </div>
                </div>

                <div className="bg-slate-900 text-white rounded-xl p-5 space-y-3 shadow-inner">
                  <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                    <span className="font-mono text-slate-400 uppercase tracking-wider text-[10px]">Payment Rail Architecture</span>
                    <span className="text-emerald-400 text-[11px] font-semibold">Monitoring Active</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2 text-center text-xs">
                    {['Entry Gateway', 'Auth Service', 'Risk Engine', 'Payment Router', 'Settlement'].map((n) => (
                      <div key={n} className="bg-slate-800 border border-slate-700/80 rounded-lg p-2 font-bold text-[11px] text-slate-200">
                        {n}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-slate-500 font-medium">Click "INJECT FRAUD SCENARIO" to trigger live simulation telemetry.</p>
                  <button
                    onClick={handleInjectFraud}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    <Play size={13} className="fill-white" />
                    <span>Run Simulation Now</span>
                  </button>
                </div>
              </div>
            )}

            {simState === 'running' && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 size={40} className="animate-spin text-rose-500" />
                <span className="text-xs text-slate-600 font-semibold">Injecting synthetic attack vectors &amp; telemetry…</span>
              </div>
            )}

            {simState === 'completed' && simOutput && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <BarChart2 size={16} className="text-slate-600" />
                      <span className="text-sm font-bold text-slate-900">Injection Telemetry Results</span>
                    </div>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle size={11} /> Simulation Completed
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Injected Events</div>
                      <div className="text-2xl font-black text-blue-600 font-mono mt-0.5">{simOutput.results.injectedEvents.toLocaleString()}</div>
                    </div>
                    <div className="text-center p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Detected Events</div>
                      <div className="text-2xl font-black text-emerald-600 font-mono mt-0.5">{simOutput.results.detectedEvents.toLocaleString()}</div>
                      <div className="text-[10px] text-emerald-600 font-bold mt-0.5">{simOutput.results.detectionRate}% Rate</div>
                    </div>
                    <div className="text-center p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Missed Events</div>
                      <div className="text-2xl font-black text-rose-500 font-mono mt-0.5">{simOutput.results.missedEvents.toLocaleString()}</div>
                      <div className="text-[10px] text-rose-500 font-bold mt-0.5">{(100 - simOutput.results.detectionRate).toFixed(1)}% Rate</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Detection Rate</span>
                      <span className="text-base font-bold text-emerald-600 font-mono">{simOutput.results.detectionRate}%</span>
                    </div>
                    <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">False Positive Rate</span>
                      <span className="text-base font-bold text-amber-600 font-mono">{simOutput.results.falsePositiveRate}%</span>
                    </div>
                    <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Detection Latency</span>
                      <span className="text-base font-bold text-blue-600 font-mono">{simOutput.results.detectionLatencyMs}ms</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Risk Score Peak</span>
                      <span className="text-base font-bold text-rose-600 font-mono">{simOutput.results.riskScorePeak} / 100</span>
                    </div>
                    <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Affected Rail</span>
                      <span className="text-xs font-bold text-slate-900 truncate block mt-0.5">{simOutput.results.affectedComponent}</span>
                    </div>
                    <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Simulation Duration</span>
                      <span className="text-xs font-bold text-slate-900 font-mono block mt-0.5">{simOutput.results.simulationTime}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-3">
                    <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
                      <Info size={13} className="text-slate-400" />
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Detection Topology</span>
                    </div>
                    <CompactFlowDiagram components={simOutput.components} />
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Event Timeline</span>
                      </div>
                      <span className="text-[11px] text-blue-600 font-bold">{simOutput.timeline.length} Events</span>
                    </div>
                    <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
                      {simOutput.timeline.slice(0, timelineVisible).map((ev, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <div className={`w-2 h-2 rounded-full shrink-0 mt-1 ${TIMELINE_COLOUR[ev.severity]}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] font-mono text-slate-400">{ev.time}</span>
                              {ev.severity === 'CRITICAL' && (
                                <span className="text-[9px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded">CRITICAL</span>
                              )}
                            </div>
                            <p className="text-xs font-bold text-slate-900 leading-snug">{ev.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50/70 rounded-2xl border border-blue-100 p-5 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-blue-600" />
                      <span className="text-xs font-bold text-blue-900">AI Mitigation Strategy</span>
                    </div>
                    {!injRec && (
                      <button
                        onClick={handleGetInjectionRec}
                        disabled={isLoadingInjRec}
                        className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-white border border-blue-200 px-3 py-1.5 rounded-xl hover:bg-blue-600 hover:text-white transition-colors cursor-pointer shadow-2xs"
                      >
                        {isLoadingInjRec ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                        <span>Get Strategy Recommendation</span>
                      </button>
                    )}
                  </div>

                  {!injRec && !isLoadingInjRec && (
                    <p className="text-xs text-blue-800 font-medium">
                      Synthetic attack vectors completed. Click "Get Strategy Recommendation" for automated response rules.
                    </p>
                  )}

                  {isLoadingInjRec && (
                    <div className="flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin text-blue-600" />
                      <span className="text-xs text-blue-800 font-medium">Synthesizing mitigation playbook…</span>
                    </div>
                  )}

                  {injRec && (
                    <div className="space-y-3 pt-1">
                      <p className="text-xs text-blue-950 font-bold leading-relaxed">{injRec.summary}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-blue-100">
                        <div><span className="font-bold text-slate-500 block text-[10px] uppercase">Incident Trigger</span><span className="font-semibold text-slate-900">{injRec.whatHappened}</span></div>
                        <div><span className="font-bold text-slate-500 block text-[10px] uppercase">Target Rail</span><span className="font-semibold text-slate-900">{injRec.whereDetected}</span></div>
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Recommended Actions:</div>
                        <div className="space-y-1">
                          {injRec.actions.map((a, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-slate-800">
                              <CheckCircle size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                              <span>{a}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
