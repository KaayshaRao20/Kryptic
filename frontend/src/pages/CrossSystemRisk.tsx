import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Plus,
  Calendar,
  Filter,
  ChevronDown,
  Bell,
  Sun,
  Shield,
  Layers,
  AlertTriangle,
  Clock,
  Fingerprint,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { crossSystemRiskService } from '../services/CrossSystemRiskService';
import type {
  SystemId,
  RiskEntity,
  PaymentSystemInfo,
  EntityAttribute,
  CrossSystemConnection,
  CorrelatedTransaction,
  RiskLevel
} from '../services/CrossSystemRiskService';
import { CrossSystemNetwork } from '../components/cross-system/CrossSystemNetwork';
import { CrossSystemTable } from '../components/cross-system/CrossSystemTable';
import { EntityTimelineModal } from '../components/cross-system/EntityTimelineModal';
import { ConnectionDetailDrawer } from '../components/cross-system/ConnectionDetailDrawer';

// ─── Sparkline Component for System Cards ───────────────────────────────────
const MiniSparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const width = 100;
  const height = 30;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-24 h-8 overflow-visible">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#grad-${color.replace('#', '')})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ─── Semi-Circular Risk Gauge Component ─────────────────────────────────────
const RiskGauge: React.FC<{ score: number; label: string }> = ({ score, label }) => {
  const radius = 48;
  const strokeWidth = 9;
  const circ = Math.PI * radius; // Half-circle
  const progress = Math.min(100, Math.max(0, score)) / 100;
  const strokeDashoffset = circ - progress * circ;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-20 flex items-end justify-center">
        <svg viewBox="0 0 120 70" className="w-full h-full">
          {/* Background Arc */}
          <path
            d="M 12 60 A 48 48 0 0 1 108 60"
            fill="none"
            stroke="#FEE2E2"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Active Red Arc */}
          <path
            d="M 12 60 A 48 48 0 0 1 108 60"
            fill="none"
            stroke="#EF4444"
            strokeWidth={strokeWidth}
            strokeDasharray={circ}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Inner Score Counter */}
        <div className="absolute bottom-0 inset-x-0 flex flex-col items-center justify-center">
          <div className="text-xl font-black text-textPrimary leading-none">
            {score}<span className="text-xs font-semibold text-textSecondary">/100</span>
          </div>
          <span className="text-[10px] font-bold text-rose-600 mt-1">{label}</span>
        </div>
      </div>
    </div>
  );
};

export const CrossSystemRisk: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [systems] = useState<PaymentSystemInfo[]>(crossSystemRiskService.getSystems());
  const [selectedEntityId, setSelectedEntityId] = useState<string>('Entity E-2048');
  const [activeView, setActiveView] = useState<'NETWORK' | 'TABLE'>('NETWORK');
  const [selectedSystemFilter, setSelectedSystemFilter] = useState<SystemId | 'ALL'>('ALL');
  const [dateRange, setDateRange] = useState('01 Sep 2026 - 01 Sep 2026');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Modals & Drawers
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<'SYSTEM' | 'CONNECTION' | 'ATTRIBUTE' | null>(null);
  const [activeDrawerSystem, setActiveDrawerSystem] = useState<PaymentSystemInfo | undefined>();
  const [activeDrawerConnection, setActiveDrawerConnection] = useState<CrossSystemConnection | undefined>();
  const [activeDrawerAttribute, setActiveDrawerAttribute] = useState<EntityAttribute | undefined>();

  // Data fetching based on current entity
  const currentEntity = crossSystemRiskService.getEntityById(selectedEntityId);
  const recentAlerts = crossSystemRiskService.getRecentAlerts();
  const transactions = crossSystemRiskService.getCorrelatedTransactions(selectedSystemFilter);

  // Handlers
  const handleSystemCardClick = (sys: PaymentSystemInfo) => {
    setActiveDrawerSystem(sys);
    setDrawerType('SYSTEM');
    setDrawerOpen(true);
  };

  const handleConnectionClick = (sysId: SystemId) => {
    const conn = currentEntity.connections[sysId];
    if (conn) {
      setActiveDrawerConnection(conn);
      setDrawerType('CONNECTION');
      setDrawerOpen(true);
    }
  };

  const handleAttributeClick = (attr: EntityAttribute) => {
    setActiveDrawerAttribute(attr);
    setDrawerType('ATTRIBUTE');
    setDrawerOpen(true);
  };

  const handleSelectEntity = (entityId: string) => {
    setSelectedEntityId(entityId);
  };

  return (
    <div className="space-y-6 max-w-[1520px] mx-auto pb-10">
      {/* ─── 1. Top Header ─── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary tracking-tight">
            Cross-System Risk Intelligence
          </h1>
          <p className="text-xs text-textSecondary mt-0.5">
            Detect risky entities and connected behaviour across multiple payment systems.
          </p>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/alerts')}
            className="relative p-2 rounded-xl bg-white border border-gray-200 text-textSecondary hover:text-textPrimary hover:bg-secondary transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
              12
            </span>
          </button>

          <button
            className="p-2 rounded-xl bg-white border border-gray-200 text-textSecondary hover:text-textPrimary hover:bg-secondary transition-colors"
            title="Theme"
          >
            <Sun className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
            <div className="w-8 h-8 rounded-full bg-techBlue text-white font-bold text-xs flex items-center justify-center shadow-xs">
              AD
            </div>
            <div className="flex items-center gap-1 cursor-pointer">
              <span className="text-xs font-semibold text-textPrimary">Admin</span>
              <ChevronDown className="w-3.5 h-3.5 text-textSecondary" />
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. Configured Payment Systems Section ─── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-textPrimary">Configured Payment Systems</h2>
            <p className="text-xs text-textSecondary">
              Payment systems and data sources connected to the platform.
            </p>
          </div>

          <button
            onClick={() => navigate('/connectors')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-gray-200 hover:border-gray-300 text-textPrimary text-xs font-semibold rounded-xl shadow-xs hover:bg-secondary/50 transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-purple-600" />
            <span>Manage Configuration</span>
          </button>
        </div>

        {/* 5 Cards Row: 4 Systems + 1 "Add New System" */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {systems.map((sys) => {
            const isSelected = selectedSystemFilter === sys.id;
            return (
              <div
                key={sys.id}
                onClick={() => handleSystemCardClick(sys)}
                className={`bg-white border rounded-2xl p-4 shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected ? 'border-techBlue ring-2 ring-techBlue/20' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white ${sys.color.bg}`}>
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-textPrimary">{sys.name}</h3>
                        <p className="text-[10px] text-textSecondary">{sys.category}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                      {sys.status}
                    </span>
                  </div>

                  <div className="mt-2">
                    <p className="text-sm font-black text-textPrimary tracking-tight">
                      {sys.transactionCount.toLocaleString()} <span className="text-xs font-medium text-textSecondary">txns</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-end justify-between mt-3 pt-2 border-t border-gray-50">
                  <span className="text-[10px] text-textSecondary">Last seen: {sys.lastSeen}</span>
                  <MiniSparkline data={sys.sparkline} color={sys.color.stroke} />
                </div>
              </div>
            );
          })}

          {/* Card 5: Add New System Card */}
          <div
            onClick={() => navigate('/connectors')}
            className="bg-white/70 hover:bg-white border-2 border-dashed border-gray-200 hover:border-techBlue/50 rounded-2xl p-4 shadow-xs transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center group min-h-[130px]"
          >
            <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-600 group-hover:bg-purple-100 flex items-center justify-center transition-colors mb-2">
              <Plus className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-purple-700">Add New System</p>
            <p className="text-[10.5px] text-textSecondary mt-0.5 max-w-[150px] leading-tight">
              Connect a new payment system or data source
            </p>
          </div>
        </div>
      </div>

      {/* ─── 3. Main Network / Table & Entity Overview Section ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Network / Table View (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-gray-100 rounded-2xl shadow-xs flex flex-col overflow-hidden">
          {/* Subnav & Filter Toolbar */}
          <div className="px-5 py-3.5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-white">
            {/* View Switcher Tabs */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => setActiveView('NETWORK')}
                className={`text-xs font-bold pb-2 relative transition-colors ${
                  activeView === 'NETWORK'
                    ? 'text-techBlue after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-techBlue'
                    : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                Network View
              </button>
              <button
                onClick={() => setActiveView('TABLE')}
                className={`text-xs font-bold pb-2 relative transition-colors ${
                  activeView === 'TABLE'
                    ? 'text-techBlue after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-techBlue'
                    : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                Table View
              </button>
            </div>

            {/* Controls Right */}
            <div className="flex items-center gap-2">
              {/* System Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                  className="px-3 py-1.5 bg-secondary/60 hover:bg-secondary border border-gray-200 rounded-xl text-xs font-semibold text-textPrimary flex items-center gap-1.5 transition-colors"
                >
                  <span>
                    {selectedSystemFilter === 'ALL'
                      ? 'All Systems'
                      : systems.find((s) => s.id === selectedSystemFilter)?.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-textSecondary" />
                </button>

                {isFilterDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-lg z-30 py-1 text-xs">
                    <button
                      onClick={() => {
                        setSelectedSystemFilter('ALL');
                        setIsFilterDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 hover:bg-secondary ${
                        selectedSystemFilter === 'ALL' ? 'font-bold text-techBlue' : 'text-textPrimary'
                      }`}
                    >
                      All Systems
                    </button>
                    {systems.map((sys) => (
                      <button
                        key={sys.id}
                        onClick={() => {
                          setSelectedSystemFilter(sys.id);
                          setIsFilterDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-secondary ${
                          selectedSystemFilter === sys.id ? 'font-bold text-techBlue' : 'text-textPrimary'
                        }`}
                      >
                        {sys.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Date Range Picker Placeholder */}
              <div className="px-3 py-1.5 bg-secondary/60 border border-gray-200 rounded-xl text-xs font-semibold text-textPrimary flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-textSecondary" />
                <span>{dateRange}</span>
                <ChevronDown className="w-3 h-3 text-textSecondary" />
              </div>

              {/* Filters Button */}
              <button
                onClick={() => {
                  // Cycle or reset system filter for fast interaction
                  setSelectedSystemFilter((prev) => (prev === 'ALL' ? 'SYS-A' : prev === 'SYS-A' ? 'SYS-C' : 'ALL'));
                }}
                className="px-3 py-1.5 bg-secondary/60 hover:bg-secondary border border-gray-200 rounded-xl text-xs font-semibold text-textPrimary flex items-center gap-1.5 transition-colors"
                title="Toggle risk filter"
              >
                <Filter className="w-3.5 h-3.5 text-textSecondary" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* View Body */}
          <div className="flex-1 p-3 min-h-[460px]">
            {activeView === 'NETWORK' ? (
              <CrossSystemNetwork
                entity={currentEntity}
                systems={systems}
                selectedSystemId={selectedSystemFilter}
                onSelectSystem={(sysId) => {
                  const sys = systems.find((s) => s.id === sysId);
                  if (sys) handleSystemCardClick(sys);
                }}
                onSelectConnection={handleConnectionClick}
                onSelectAttribute={handleAttributeClick}
                onSelectEntity={() => setIsTimelineOpen(true)}
              />
            ) : (
              <CrossSystemTable
                transactions={transactions}
                selectedSystemId={selectedSystemFilter}
                onSelectEntity={handleSelectEntity}
                onSelectTransaction={(txn) => {
                  const sys = systems.find((s) => s.id === txn.systemId);
                  if (sys) handleSystemCardClick(sys);
                }}
              />
            )}
          </div>
        </div>

        {/* Right Column: Entity Details & Risk Overview (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-5">
          <div>
            {/* Entity Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-bold text-textPrimary">{currentEntity.id}</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                {currentEntity.riskLevel} RISK
              </span>
            </div>

            {/* 4 Metadata Stats Grid */}
            <div className="grid grid-cols-2 gap-3 py-3 border-b border-gray-100">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-textSecondary">First Seen</p>
                <p className="text-xs font-bold text-textPrimary mt-0.5">{currentEntity.firstSeen}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-textSecondary">Last Seen</p>
                <p className="text-xs font-bold text-textPrimary mt-0.5">{currentEntity.lastSeen}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-textSecondary">Total Transactions</p>
                <p className="text-xs font-black text-textPrimary mt-0.5">
                  {currentEntity.totalTransactions.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-textSecondary">Systems Involved</p>
                <p className="text-xs font-black text-textPrimary mt-0.5">{currentEntity.systemsInvolved}</p>
              </div>
            </div>

            {/* Risk Overview with Semi-Circle Gauge */}
            <div className="py-3 border-b border-gray-100">
              <h4 className="text-xs font-bold text-textPrimary mb-2">Risk Overview</h4>
              <div className="flex items-center justify-between gap-4">
                <RiskGauge score={currentEntity.riskScore} label={currentEntity.riskCategory} />

                {/* Risk Factors List */}
                <div className="flex-1 space-y-1.5">
                  {currentEntity.riskFactors.map((rf) => (
                    <div key={rf.id} className="flex items-center gap-2 text-xs">
                      {rf.level === 'HIGH' ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      ) : rf.iconType === 'clock' ? (
                        <Clock className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      ) : rf.iconType === 'fingerprint' ? (
                        <Fingerprint className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      )}
                      <span className="text-[11px] text-textSecondary leading-tight">{rf.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Exposed Areas */}
            <div className="pt-3">
              <h4 className="text-xs font-bold text-textPrimary mb-2.5">Top Exposed Areas</h4>
              <div className="space-y-2">
                {currentEntity.topExposedAreas.map((area) => (
                  <div
                    key={area.id}
                    className="p-2.5 rounded-xl bg-secondary/40 border border-gray-100 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-textPrimary">{area.title}</p>
                      <p className="text-[10.5px] text-textSecondary">{area.reason}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[9.5px] font-bold ${
                        area.riskLevel === 'HIGH'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {area.riskLevel}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* View Full Entity Timeline Button */}
          <button
            onClick={() => setIsTimelineOpen(true)}
            className="w-full py-3 px-4 bg-[#5538EE] hover:bg-[#4828E0] text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all duration-200 active:scale-98"
          >
            <span>View Full Entity Timeline</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── 4. Bottom Recent Cross-System Alerts (5) ─── */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-textPrimary">Recent Cross-System Alerts</h3>
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
              5
            </span>
          </div>

          <button
            onClick={() => navigate('/alerts')}
            className="text-xs font-semibold text-techBlue hover:underline flex items-center gap-1"
          >
            <span>View All Alerts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Alert Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {recentAlerts.slice(0, 4).map((alert) => {
            const isSelected = selectedEntityId === alert.entityId;
            const badgeColor =
              alert.severity === 'HIGH' ? 'bg-rose-100 text-rose-700' :
              alert.severity === 'MEDIUM' ? 'bg-orange-100 text-orange-700' :
              'bg-emerald-100 text-emerald-700';

            const iconBg =
              alert.severity === 'HIGH' ? 'bg-rose-100 text-rose-600' :
              alert.severity === 'MEDIUM' ? 'bg-orange-100 text-orange-600' :
              'bg-emerald-100 text-emerald-600';

            return (
              <div
                key={alert.id}
                onClick={() => handleSelectEntity(alert.entityId)}
                className={`bg-white border rounded-2xl p-4 shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected ? 'border-techBlue ring-2 ring-techBlue/20' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${iconBg}`}>
                        <Bell className="w-3 h-3" />
                      </div>
                      <span className="text-xs font-bold text-textPrimary">{alert.title}</span>
                    </div>
                    <span className="text-[10px] text-textSecondary font-medium">{alert.timestamp}</span>
                  </div>
                  <p className="text-xs text-textSecondary line-clamp-2 leading-relaxed mt-1">
                    {alert.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
                  <span className="text-[10px] text-textSecondary">{alert.timeAgo}</span>
                  <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold ${badgeColor}`}>
                    {alert.severity}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── 5. Drawers & Modals ─── */}
      <EntityTimelineModal
        entity={currentEntity}
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
      />

      <ConnectionDetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        entity={currentEntity}
        activeType={drawerType}
        activeSystem={activeDrawerSystem}
        activeConnection={activeDrawerConnection}
        activeAttribute={activeDrawerAttribute}
        onSelectSystemFilter={(sysId) => setSelectedSystemFilter(sysId)}
      />
    </div>
  );
};
