import React, { useState, useCallback } from 'react';
import {
  Sparkles, ChevronDown, ShieldCheck, ShieldAlert,
  Play, Info, Download, HelpCircle, Zap, Users, Activity,
  CheckCircle, Clock, ArrowRight,
  Loader2, BarChart2, Target
} from 'lucide-react';
import {
  analyzeFraud, DEFAULT_PARAMS, getNextAutoFillProfile,
  TRANSACTION_TYPE_OPTIONS, PAYMENT_CHANNEL_OPTIONS, TIME_OF_DAY_OPTIONS,
  type TransactionParams, type FraudPrediction, type RiskLevel, type FactorLevel,
} from '../services/FraudDetectionService';
import { getRecommendation, getInjectionRecommendation, type AIRecommendation, type InjectionAIRecommendation } from '../services/RecommendationService';
import { runInjectionSimulation, type InjectionConfig, type SimulationOutput, type PaymentComponent, type TimelineSeverity } from '../services/InjectionSimulationService';

/* ─── Colour maps ─────────────────────────────────────────────── */
const RISK_GAUGE: Record<RiskLevel, { stroke: string; bg: string; text: string; badge: string }> = {
  LOW:      { stroke: '#10B981', bg: 'bg-emerald-50',  text: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
  MEDIUM:   { stroke: '#F59E0B', bg: 'bg-amber-50',    text: 'text-amber-600',   badge: 'bg-amber-100 text-amber-700' },
  HIGH:     { stroke: '#F97316', bg: 'bg-orange-50',   text: 'text-orange-600',  badge: 'bg-orange-100 text-orange-700' },
  CRITICAL: { stroke: '#EF4444', bg: 'bg-rose-50',     text: 'text-rose-600',    badge: 'bg-rose-100 text-rose-700' },
};

const FACTOR_COLOUR: Record<FactorLevel, string> = {
  HIGH:   'text-rose-500',
  MEDIUM: 'text-amber-500',
  LOW:    'text-sky-500',
  NORMAL: 'text-emerald-600',
};

const COMP_STATUS: Record<string, { border: string; bg: string; text: string; dot: string }> = {
  healthy:   { border: 'border-gray-200',   bg: 'bg-white',        text: 'text-gray-500',    dot: 'bg-emerald-500' },
  warning:   { border: 'border-amber-300',  bg: 'bg-amber-50',     text: 'text-amber-600',   dot: 'bg-amber-500' },
  anomalous: { border: 'border-rose-400',   bg: 'bg-rose-50',      text: 'text-rose-600',    dot: 'bg-rose-500' },
};

const TIMELINE_COLOUR: Record<TimelineSeverity, string> = {
  INFO:    'bg-blue-500',
  WARNING: 'bg-amber-500',
  CRITICAL:'bg-rose-500',
  SUCCESS: 'bg-emerald-500',
};

const SCENARIO_OPTS = [
  { key: 'fraud_spike',  title: 'Fraud Spike',         desc: 'Sudden surge in fraudulent activity',    Icon: ShieldAlert, tone: { card: 'border-rose-300 bg-rose-50',  icon: 'text-rose-500', iconBg: 'bg-rose-100'   } },
  { key: 'high_velocity',title: 'High Velocity',        desc: 'Unusually high transaction speed',        Icon: Zap,         tone: { card: 'border-sky-300 bg-sky-50',    icon: 'text-sky-500',  iconBg: 'bg-sky-100'    } },
  { key: 'coordinated',  title: 'Coordinated Activity', desc: 'Multiple entities acting together',       Icon: Users,       tone: { card: 'border-violet-300 bg-violet-50', icon: 'text-violet-500', iconBg: 'bg-violet-100' } },
  { key: 'behavioral',   title: 'Behavioral Anomaly',   desc: 'Unusual user behaviour patterns',         Icon: Activity,    tone: { card: 'border-teal-300 bg-teal-50',  icon: 'text-teal-500', iconBg: 'bg-teal-100'   } },
];

/* ─── Sub-components ──────────────────────────────────────────── */

function FraudGauge({ probability, riskLevel }: { probability: number; riskLevel: RiskLevel }) {
  const r = 72;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, probability));
  const offset = circ - (pct / 100) * circ;
  const color = RISK_GAUGE[riskLevel].stroke;

  return (
    <div className="relative w-44 h-44 mx-auto flex-shrink-0">
      <svg viewBox="0 0 180 180" className="-rotate-90 w-full h-full">
        <circle cx="90" cy="90" r={r} stroke="#E5E7EB" strokeWidth="11" fill="none" />
        <circle
          cx="90" cy="90" r={r}
          stroke={color} strokeWidth="11" fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(.4,0,.2,1), stroke 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[28px] font-black text-gray-900 leading-none">{pct.toFixed(1)}</span>
        <span className="text-[11px] text-gray-400 font-semibold tracking-widest mt-0.5">%</span>
        <span className="text-[10.5px] text-gray-400 font-medium tracking-widest mt-0.5">FRAUD PROB</span>
      </div>
    </div>
  );
}

function RiskBadge({ level }: { level: RiskLevel }) {
  const c = RISK_GAUGE[level];
  return (
    <div className={`flex items-center gap-1.5 mt-2 ${c.text}`}>
      {level === 'LOW' ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
      <span className="text-[14px] font-bold tracking-wide">{level} RISK</span>
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
        <label className="text-[12.5px] font-medium text-gray-600">{label}</label>
        <span className="text-[13px] font-semibold text-gray-900">{value.toLocaleString()}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full accent-[#557CFF] cursor-pointer"
        style={{ background: `linear-gradient(to right, #557CFF ${((value - min) / (max - min)) * 100}%, #E5E7EB ${((value - min) / (max - min)) * 100}%)` }}
      />
      <div className="flex justify-between text-[11px] text-gray-400 mt-1">
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
      <label className="block text-[12.5px] font-medium text-gray-600 mb-1.5">{label}</label>
      <div className="relative">
        <select
          value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#557CFF]/20 cursor-pointer pr-8"
        >
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

function TextInputField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[12.5px] font-medium text-gray-600 mb-1.5">{label}</label>
      <input
        type="text" value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#557CFF]/20"
      />
    </div>
  );
}

function SmallDropdown({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="relative">
      <select
        value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-2.5 py-2 text-[12px] text-gray-800 font-medium focus:outline-none cursor-pointer pr-6"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

function CompactFlowDiagram({ components }: { components: PaymentComponent[] }) {
  const byId = Object.fromEntries(components.map((c) => [c.id, c]));
  // Row 1: entry → auth → risk → router
  // Row 2: settlement ← authz ← processor
  const row1 = ['entry', 'auth', 'risk', 'router'];
  const row2 = ['settlement', 'authz', 'processor'];

  const NodeBox = ({ id }: { id: string }) => {
    const comp = byId[id];
    if (!comp) return null;
    const s = COMP_STATUS[comp.status];
    return (
      <div className={`rounded-lg border-2 px-2 py-1.5 flex flex-col items-center min-w-[68px] ${s.border} ${s.bg}`}>
        <div className={`w-2 h-2 rounded-full mb-1 ${s.dot}`} />
        <div className={`text-[10px] font-bold text-gray-800 text-center leading-tight`}>{comp.shortName}</div>
        <div className="text-[9.5px] text-gray-400">{comp.type}</div>
        <div className={`text-[9px] font-semibold mt-0.5 ${s.text}`}>
          {comp.status === 'anomalous' ? 'ANOMALOUS' : comp.status === 'warning' ? 'Warning' : 'Healthy'}
        </div>
      </div>
    );
  };

  const Arrow = ({ vertical = false }: { vertical?: boolean }) => (
    <div className={`flex items-center justify-center ${vertical ? 'flex-col h-4' : 'mx-0.5'}`}>
      <ArrowRight size={12} className="text-gray-400" style={vertical ? { transform: 'rotate(90deg)' } : {}} />
    </div>
  );

  const anomalous = components.find((c) => c.status === 'anomalous');

  return (
    <div className="space-y-2">
      {/* Row 1 */}
      <div className="flex items-center gap-0.5">
        {row1.map((id, i) => (
          <React.Fragment key={id}>
            <NodeBox id={id} />
            {i < row1.length - 1 && <Arrow />}
          </React.Fragment>
        ))}
      </div>
      {/* Row 2 — reversed, connected from router down to processor */}
      <div className="flex items-center gap-0.5 flex-row-reverse">
        {row2.map((id, i) => (
          <React.Fragment key={id}>
            <NodeBox id={id} />
            {i < row2.length - 1 && <Arrow />}
          </React.Fragment>
        ))}
      </div>
      {anomalous && (
        <div className="flex items-center gap-3 pt-1.5 border-t border-gray-100 text-[11.5px]">
          <span className="text-gray-500">Detected at:</span>
          <span className="text-rose-600 font-bold">{anomalous.shortName}</span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-500">Risk Score:</span>
          <span className="text-rose-600 font-semibold">{anomalous.riskScore}%</span>
          <span className="text-gray-400">·</span>
          <span className="text-rose-600 font-bold">ANOMALOUS</span>
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────── */
export const FraudDetection: React.FC = () => {
  /* Transaction parameters */
  const [params, setParams] = useState<TransactionParams>(DEFAULT_PARAMS);

  /* Analysis state */
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState<FraudPrediction | null>(null);
  const [aiRec, setAiRec] = useState<AIRecommendation | null>(null);
  const [isLoadingRec, setIsLoadingRec] = useState(false);

  /* Tab state */
  const [activeTab, setActiveTab] = useState<'detection' | 'lab'>('detection');

  /* Lab state */
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
  const [timelineVisible, setTimelineVisible] = useState(0); // # events shown progressively

  /* ─── Handlers ──────────────────────────────────────────────── */
  const handleAutoFill = useCallback(() => {
    setParams(getNextAutoFillProfile());
    setPrediction(null);
    setAiRec(null);
  }, []);

  const handleAnalyze = useCallback(() => {
    setIsAnalyzing(true);
    setAiRec(null);
    setTimeout(() => {
      const result = analyzeFraud(params);
      setPrediction(result);
      setIsAnalyzing(false);
    }, 900);
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
      // Progressively reveal timeline events
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
    <div
      className="w-full min-h-screen pb-12 space-y-0"
      style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif' }}
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">Fraud Detection &amp; Lab</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">Interactive model sensitivity testing</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-700 font-medium">
            <HelpCircle size={15} /> How it works
          </button>
          <button className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-700 font-medium border border-gray-200 px-3 py-1.5 rounded-lg bg-white hover:bg-gray-50">
            <Download size={14} /> Export Report
          </button>
        </div>
      </div>

      {/* ── Top two-column layout ─────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-5 items-start">

        {/* ── LEFT: Transaction Parameters ─────────────────────── */}
        <div className="col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Card header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100">
              <span className="text-[14px] font-bold text-gray-900">Transaction Parameters</span>
              <button
                onClick={handleAutoFill}
                className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[#557CFF] bg-blue-50 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Sparkles size={13} /> AI Auto-Fill
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* IDs */}
              <div className="grid grid-cols-2 gap-3">
                <TextInputField label="Transaction ID" value={params.transactionId} onChange={(v) => updateParam('transactionId', v)} />
                <TextInputField label="Account ID" value={params.accountId} onChange={(v) => updateParam('accountId', v)} />
              </div>

              {/* Transaction type */}
              <DropdownField
                label="Transaction Type" value={params.transactionType}
                onChange={(v) => updateParam('transactionType', v)}
                options={TRANSACTION_TYPE_OPTIONS}
              />

              {/* Amount slider */}
              <SliderField label="Amount (USD)" min={10} max={10000} value={params.amount} onChange={(v) => updateParam('amount', v)} />

              {/* Velocity slider */}
              <SliderField label="Velocity (Txns/24h)" min={1} max={100} value={params.velocity} onChange={(v) => updateParam('velocity', v)} />

              {/* Channel + Time */}
              <div className="grid grid-cols-2 gap-3">
                <DropdownField label="Payment Channel" value={params.paymentChannel} onChange={(v) => updateParam('paymentChannel', v)} options={PAYMENT_CHANNEL_OPTIONS} />
                <DropdownField label="Time of Day" value={params.timeOfDay} onChange={(v) => updateParam('timeOfDay', v)} options={TIME_OF_DAY_OPTIONS} />
              </div>

              {/* Customer age */}
              <SliderField label="Customer Age (Years)" min={18} max={90} value={params.customerAge} onChange={(v) => updateParam('customerAge', v)} />

              {/* Account age */}
              <SliderField label="Account Age (Days)" min={1} max={2000} value={params.accountAge} onChange={(v) => updateParam('accountAge', v)} />

              {/* Buttons */}
              <div className="flex gap-2.5 pt-1">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#557CFF] hover:bg-[#4268e8] disabled:opacity-60 text-white font-semibold text-[13.5px] transition-colors shadow-sm"
                >
                  {isAnalyzing
                    ? <><Loader2 size={15} className="animate-spin" /> Analyzing…</>
                    : <><Activity size={15} /> Analyze Transaction</>}
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-[13.5px] font-medium text-gray-600 hover:bg-gray-50 bg-white transition-colors"
                >
                  Reset
                </button>
              </div>

              {/* Fraud Injection shortcut — only after analysis */}
              {prediction && activeTab === 'detection' && (
                <button
                  onClick={() => setActiveTab('lab')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-rose-300 text-rose-600 font-semibold text-[13.5px] hover:bg-rose-50 bg-white transition-colors"
                >
                  <ShieldAlert size={15} /> Fraud Injection
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Model Output ───────────────────────────────── */}
        <div className="col-span-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Blue top bar always visible */}
            <div className="h-1 w-full bg-gradient-to-r from-[#557CFF] to-emerald-400" />

            <div className="px-6 pt-4 pb-5">
              {/* Output header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[14px] font-bold text-gray-900">Model Output</span>
                {prediction && (
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-gray-400">Run ID: <span className="font-mono text-gray-700">{prediction.predictionId}</span></span>
                    <span className="flex items-center gap-1 text-[11.5px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle size={11} /> Completed
                    </span>
                  </div>
                )}
              </div>

              {/* Empty state */}
              {!prediction && !isAnalyzing && (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
                  <ShieldCheck size={44} strokeWidth={1.5} className="text-gray-300" />
                  <div className="text-center">
                    <p className="text-[14px] font-medium text-gray-500">Run analysis to see model output</p>
                    <p className="text-[12.5px] text-gray-400 mt-1">Configure transaction parameters and click "Analyze Transaction" to view AI prediction and insights.</p>
                  </div>
                </div>
              )}

              {/* Loading state */}
              {isAnalyzing && (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <Loader2 size={36} className="animate-spin text-[#557CFF]" />
                  <span className="text-[13px] text-gray-500 font-medium">Running inference model…</span>
                </div>
              )}

              {/* Results */}
              {prediction && !isAnalyzing && (
                <div className="grid grid-cols-12 gap-5">
                  {/* Gauge + risk level */}
                  <div className="col-span-3 flex flex-col items-center justify-start pt-2">
                    <FraudGauge probability={prediction.fraudProbability} riskLevel={prediction.riskLevel} />
                    <RiskBadge level={prediction.riskLevel} />
                    <p className="text-[11px] text-gray-400 mt-1.5 font-mono">ID: {prediction.predictionId}</p>
                  </div>

                  {/* Key Risk Factors */}
                  <div className="col-span-5 border-l border-gray-100 pl-5">
                    <div className="flex items-center gap-1.5 mb-3">
                      <span className="text-[12px] font-bold tracking-wide text-gray-600 uppercase">Key Risk Factors</span>
                      <Info size={13} className="text-gray-400" />
                    </div>
                    <div className="space-y-2.5">
                      {prediction.riskFactors.map((f) => (
                        <div key={f.name} className="flex items-start justify-between">
                          <div>
                            <div className="text-[12.5px] font-semibold text-gray-800">{f.displayName}</div>
                            <div className={`text-[11.5px] font-medium ${FACTOR_COLOUR[f.level]}`}>{f.value}</div>
                          </div>
                          <div className="text-[12.5px] font-semibold text-gray-600 tabular-nums mt-0.5">
                            {f.shapScore.toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Model Evidence + AI Recommendation */}
                  <div className="col-span-4 space-y-4 border-l border-gray-100 pl-5">
                    {/* SHAP Evidence */}
                    <div>
                      <div className="text-[11px] font-bold tracking-wider text-gray-500 uppercase mb-2">Model Evidence (Mock SHAP)</div>
                      <div className="space-y-1.5">
                        {prediction.modelEvidence.map((e) => (
                          <div key={e.name} className="flex items-center justify-between text-[12.5px]">
                            <span className="text-gray-600">{e.name}</span>
                            <span className="font-semibold text-gray-800">{e.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Recommendation box */}
                    <div className="bg-blue-50 rounded-xl border border-blue-100 p-3.5">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Sparkles size={14} className="text-[#557CFF]" />
                        <span className="text-[12.5px] font-bold text-[#557CFF]">Get AI Recommendation</span>
                      </div>
                      {!aiRec && (
                        <p className="text-[11.5px] text-gray-500 mb-2.5 leading-snug">
                          Click the button below to get AI-powered recommendation for this transaction.
                        </p>
                      )}
                      {aiRec && (
                        <div className="space-y-1.5 mb-2.5">
                          <p className="text-[11.5px] text-gray-700 leading-snug font-medium">{aiRec.assessment}</p>
                          <div className="space-y-1 mt-1">
                            {aiRec.actions.map((a, i) => (
                              <div key={i} className="flex items-start gap-1.5 text-[11px] text-gray-600">
                                <CheckCircle size={11} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                                {a}
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center justify-between pt-1.5 border-t border-blue-100 mt-1">
                            <span className="text-[11px] text-gray-400">Confidence</span>
                            <span className="text-[12px] font-bold text-[#557CFF]">{aiRec.confidence.toFixed(1)}%</span>
                          </div>
                        </div>
                      )}
                      <button
                        onClick={handleGetRecommendation}
                        disabled={isLoadingRec}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[#557CFF] text-[#557CFF] text-[12.5px] font-semibold hover:bg-[#557CFF] hover:text-white transition-colors disabled:opacity-60"
                      >
                        {isLoadingRec
                          ? <><Loader2 size={13} className="animate-spin" /> Generating…</>
                          : <><Sparkles size={13} /> Get AI Recommendation</>}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────── */}
      <div className="mt-6 border-b border-gray-200">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('detection')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-[13.5px] font-semibold border-b-2 transition-colors ${
              activeTab === 'detection'
                ? 'text-[#557CFF] border-[#557CFF]'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            <Activity size={14} /> Detection
          </button>
          <button
            onClick={() => setActiveTab('lab')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-[13.5px] font-semibold border-b-2 transition-colors ${
              activeTab === 'lab'
                ? 'text-rose-500 border-rose-500'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            <ShieldAlert size={14} /> Fraud Injection Lab
            <span className="text-[9.5px] font-bold bg-blue-100 text-[#557CFF] px-1.5 py-0.5 rounded-full ml-0.5">BETA</span>
          </button>
        </div>
      </div>

      {/* ── Lab content — only when lab tab is active ────────────── */}
      {activeTab === 'lab' && (
        <div className="mt-6 grid grid-cols-12 gap-5 items-start">

          {/* ── Lab Controls ──────────────────────────────────────── */}
          <div className="col-span-4 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
              <div>
                <div className="text-[14px] font-bold text-gray-900">Fraud Injection Lab</div>
                <div className="text-[11.5px] text-gray-400">Inject controlled fraud scenarios to test model and monitoring</div>
              </div>
              <button className="flex items-center gap-1 text-[12px] text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-50 bg-white">
                Presets <ChevronDown size={12} />
              </button>
            </div>

            <div className="px-5 py-4 space-y-5">
              {/* 1. Select Scenario */}
              <div>
                <div className="text-[11.5px] font-bold text-gray-500 uppercase tracking-wide mb-2.5">1. Select Scenario</div>
                <div className="grid grid-cols-2 gap-2">
                  {SCENARIO_OPTS.map((s) => {
                    const active = labScenario === s.key;
                    return (
                      <button
                        key={s.key}
                        onClick={() => setLabScenario(s.key)}
                        className={`text-left rounded-xl border p-2.5 transition-all ${
                          active ? s.tone.card + ' shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center mb-1.5 ${active ? s.tone.iconBg : 'bg-gray-100'}`}>
                          <s.Icon size={13} className={active ? s.tone.icon : 'text-gray-400'} />
                        </div>
                        <div className="text-[12px] font-semibold text-gray-900 leading-tight">{s.title}</div>
                        <div className="text-[10.5px] text-gray-400 mt-0.5 leading-snug">{s.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Configure Injection */}
              <div>
                <div className="text-[11.5px] font-bold text-gray-500 uppercase tracking-wide mb-2.5">2. Configure Injection</div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 mb-1">Transaction Volume</label>
                    <input
                      type="number" value={injCfg.transactionVolume}
                      onChange={(e) => updateInj('transactionVolume', Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-[12.5px] font-medium text-gray-800 bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 mb-1">Amount Pattern</label>
                    <SmallDropdown value={injCfg.amountPattern} onChange={(v) => updateInj('amountPattern', v)} options={['Random High', 'Burst', 'Gradual', 'Fixed']} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 mb-1">Velocity (Txns/min)</label>
                    <input
                      type="number" value={injCfg.velocity}
                      onChange={(e) => updateInj('velocity', Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-[12.5px] font-medium text-gray-800 bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 mb-1">Fraud Ratio (%)</label>
                    <input
                      type="number" min={1} max={100} value={injCfg.fraudRatio}
                      onChange={(e) => updateInj('fraudRatio', Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-[12.5px] font-medium text-gray-800 bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 mb-1">Target Entity</label>
                    <input
                      type="text" value={injCfg.targetEntity}
                      onChange={(e) => updateInj('targetEntity', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-[12.5px] font-medium text-gray-800 bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 mb-1">Transaction Type</label>
                    <SmallDropdown value={injCfg.transactionType} onChange={(v) => updateInj('transactionType', v)} options={['Mixed', 'Purchase', 'Transfer', 'Cash']} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 mb-1">Duration (min)</label>
                    <input
                      type="number" min={1} max={60} value={injCfg.duration}
                      onChange={(e) => updateInj('duration', Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-[12.5px] font-medium text-gray-800 bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 mb-1">Fraud Intensity</label>
                    <SmallDropdown value={injCfg.fraudIntensity} onChange={(v) => updateInj('fraudIntensity', v)} options={['Low', 'Medium', 'High', 'Extreme']} />
                  </div>
                </div>
              </div>

              {/* Inject button */}
              <button
                onClick={handleInjectFraud}
                disabled={simState === 'running'}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-bold text-[14px] transition-colors shadow-sm"
              >
                {simState === 'running'
                  ? <><Loader2 size={16} className="animate-spin" /> Running Simulation…</>
                  : <><Play size={15} className="fill-white" /> INJECT FRAUD</>}
              </button>
            </div>
          </div>

          {/* ── Right: Results + Detection + Timeline ─────────────── */}
          <div className="col-span-8 space-y-4">
            {/* No output yet */}
            {simState === 'idle' && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
                <Target size={44} strokeWidth={1.5} className="text-gray-300" />
                <p className="text-[14px] font-medium text-gray-500">Configure a scenario and click INJECT FRAUD</p>
                <p className="text-[12.5px] text-gray-400">Injection results, detection map and event timeline will appear here.</p>
              </div>
            )}

            {/* Running spinner */}
            {simState === 'running' && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 size={40} className="animate-spin text-rose-500" />
                <span className="text-[13.5px] text-gray-500 font-medium">Injecting synthetic fraud events…</span>
              </div>
            )}

            {/* Results */}
            {simState === 'completed' && simOutput && (
              <div className="space-y-4">
                {/* Injection Results card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <BarChart2 size={15} className="text-gray-500" />
                      <span className="text-[13.5px] font-bold text-gray-700">Injection Results</span>
                    </div>
                    <span className="flex items-center gap-1 text-[11.5px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle size={11} /> Simulation Completed
                    </span>
                  </div>

                  {/* Big three stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {[
                      { label: 'Injected Events', value: simOutput.results.injectedEvents.toLocaleString(), sub: null, color: 'text-[#557CFF]' },
                      { label: 'Detected Events', value: simOutput.results.detectedEvents.toLocaleString(), sub: `${simOutput.results.detectionRate}%`, color: 'text-emerald-600' },
                      { label: 'Missed Events', value: simOutput.results.missedEvents.toLocaleString(), sub: `${(100 - simOutput.results.detectionRate).toFixed(1)}%`, color: 'text-rose-500' },
                    ].map((s) => (
                      <div key={s.label} className="text-center p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="text-[11.5px] text-gray-500 font-medium">{s.label}</div>
                        <div className={`text-[22px] font-black ${s.color} mt-0.5`}>{s.value}</div>
                        {s.sub && <div className="text-[11px] text-gray-400">{s.sub}</div>}
                      </div>
                    ))}
                  </div>

                  {/* Secondary stats */}
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {[
                      { label: 'Detection Rate', value: `${simOutput.results.detectionRate}%`, color: 'text-emerald-600' },
                      { label: 'False Positive Rate', value: `${simOutput.results.falsePositiveRate}%`, color: 'text-amber-600' },
                      { label: 'Detection Latency', value: `${simOutput.results.detectionLatencyMs}ms`, sub: 'Avg.', color: 'text-[#557CFF]' },
                    ].map((s) => (
                      <div key={s.label} className="p-2.5 rounded-lg border border-gray-100">
                        <div className="text-[11px] text-gray-400">{s.label}</div>
                        <div className={`text-[15px] font-bold ${s.color} mt-0.5`}>{s.value}</div>
                        {s.sub && <div className="text-[10px] text-gray-400">{s.sub}</div>}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Risk Score (Peak)', value: `${simOutput.results.riskScorePeak} / 100`, color: 'text-rose-600' },
                      { label: 'Affected Component', value: simOutput.results.affectedComponent, color: 'text-gray-800' },
                      { label: 'Simulation Time', value: simOutput.results.simulationTime, color: 'text-gray-800' },
                    ].map((s) => (
                      <div key={s.label} className="p-2.5 rounded-lg border border-gray-100">
                        <div className="text-[11px] text-gray-400">{s.label}</div>
                        <div className={`text-[13.5px] font-bold ${s.color} mt-0.5`}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom row: Detection diagram + Timeline */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Where Fraud Was Detected */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                    <div className="flex items-center gap-1.5 mb-3">
                      <Info size={13} className="text-gray-400" />
                      <span className="text-[12.5px] font-bold text-gray-700">Where Fraud Was Detected</span>
                    </div>
                    <CompactFlowDiagram components={simOutput.components} />
                  </div>

                  {/* Event Timeline */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-gray-400" />
                        <span className="text-[12.5px] font-bold text-gray-700">Event Timeline</span>
                      </div>
                      <button className="text-[11.5px] text-[#557CFF] font-medium hover:underline">View Full Timeline →</button>
                    </div>
                    <div className="space-y-2.5">
                      {simOutput.timeline.slice(0, timelineVisible).map((ev, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <div className="flex-shrink-0 mt-1">
                            <div className={`w-2 h-2 rounded-full ${TIMELINE_COLOUR[ev.severity]}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-mono text-gray-400">{ev.time}</span>
                              {ev.severity === 'CRITICAL' && (
                                <span className="text-[9.5px] font-bold bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded flex-shrink-0">CRITICAL</span>
                              )}
                            </div>
                            <p className="text-[12px] font-medium text-gray-800 leading-snug">{ev.description}</p>
                            {ev.detail && <p className="text-[11px] text-gray-400">{ev.detail}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Recommendation for injection */}
                <div className="bg-blue-50 rounded-2xl border border-blue-100 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Sparkles size={15} className="text-[#557CFF]" />
                      <span className="text-[13.5px] font-bold text-[#557CFF]">AI Recommendation</span>
                      <span className="text-[9.5px] font-bold bg-[#557CFF] text-white px-1.5 py-0.5 rounded-full">New</span>
                    </div>
                    {!injRec && (
                      <button
                        onClick={handleGetInjectionRec}
                        disabled={isLoadingInjRec}
                        className="flex items-center gap-1.5 text-[12px] font-semibold text-[#557CFF] border border-[#557CFF] px-3 py-1.5 rounded-lg hover:bg-[#557CFF] hover:text-white transition-colors disabled:opacity-60"
                      >
                        {isLoadingInjRec ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                        Get Recommendation
                      </button>
                    )}
                  </div>

                  {!injRec && !isLoadingInjRec && (
                    <p className="text-[12.5px] text-gray-500 mt-2">
                      The Risk Engine detected an abnormal transaction pattern. Click "Get Recommendation" for a full analysis.
                    </p>
                  )}

                  {isLoadingInjRec && (
                    <div className="flex items-center gap-2 mt-2">
                      <Loader2 size={14} className="animate-spin text-[#557CFF]" />
                      <span className="text-[12.5px] text-gray-500">Generating contextual recommendation…</span>
                    </div>
                  )}

                  {injRec && (
                    <div className="mt-3 space-y-3">
                      <p className="text-[13px] text-gray-700 font-medium leading-relaxed">{injRec.summary}</p>
                      <div className="grid grid-cols-2 gap-2 text-[12px]">
                        <div><span className="font-semibold text-gray-600">What Happened: </span><span className="text-gray-700">{injRec.whatHappened}</span></div>
                        <div><span className="font-semibold text-gray-600">Where Detected: </span><span className="text-gray-700">{injRec.whereDetected}</span></div>
                      </div>
                      <div>
                        <div className="text-[12px] font-semibold text-gray-600 mb-1.5">Recommended Actions:</div>
                        <div className="space-y-1">
                          {injRec.actions.map((a, i) => (
                            <div key={i} className="flex items-start gap-2 text-[12px] text-gray-700">
                              <CheckCircle size={12} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                              {a}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-blue-100">
                        <span className="text-[11.5px] text-gray-400">Confidence</span>
                        <span className="text-[13px] font-bold text-[#557CFF]">{injRec.confidence}%</span>
                      </div>
                      <button className="text-[12px] text-[#557CFF] font-semibold hover:underline flex items-center gap-1">
                        View Full Recommendation <ArrowRight size={12} />
                      </button>
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
