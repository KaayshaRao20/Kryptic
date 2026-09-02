import React, { useState } from 'react';
import {
  ShieldAlert,
  ChevronRight,
  Smartphone,
  Globe,
  Mail,
  CreditCard,
  Layers,
  Zap,
  Info
} from 'lucide-react';
import type {
  RiskEntity,
  PaymentSystemInfo,
  SystemId,
  EntityAttribute
} from '../../services/CrossSystemRiskService';

interface CrossSystemNetworkProps {
  entity: RiskEntity;
  systems: PaymentSystemInfo[];
  selectedSystemId: SystemId | 'ALL';
  onSelectSystem: (systemId: SystemId) => void;
  onSelectConnection: (systemId: SystemId) => void;
  onSelectAttribute: (attr: EntityAttribute) => void;
  onSelectEntity: (entityId: string) => void;
}

export const CrossSystemNetwork: React.FC<CrossSystemNetworkProps> = ({
  entity,
  systems,
  selectedSystemId,
  onSelectSystem,
  onSelectConnection,
  onSelectAttribute,
  onSelectEntity,
}) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // System positions in SVG coordinates (viewBox 0 0 760 460)
  const systemNodesConfig: Record<
    SystemId,
    {
      x: number;
      y: number;
      iconX: number;
      iconY: number;
      textAnchor: 'end' | 'start';
      textX: number;
      badgeT: number;
    }
  > = {
    'SYS-A': { x: 190, y: 115, iconX: 190, iconY: 115, textAnchor: 'end', textX: 165, badgeT: 0.45 },
    'SYS-B': { x: 190, y: 295, iconX: 190, iconY: 295, textAnchor: 'end', textX: 165, badgeT: 0.45 },
    'SYS-C': { x: 570, y: 115, iconX: 570, iconY: 115, textAnchor: 'start', textX: 595, badgeT: 0.45 },
    'SYS-D': { x: 570, y: 295, iconX: 570, iconY: 295, textAnchor: 'start', textX: 595, badgeT: 0.45 },
  };

  const centerNode = { x: 380, y: 220 };

  // Attribute tokens coordinates
  const attributeNodes = [
    { attr: entity.attributes[0], x: 250, y: 385, icon: Smartphone, label: 'Device', value: entity.attributes[0]?.value || 'D-3387' },
    { attr: entity.attributes[1], x: 335, y: 385, icon: Globe, label: 'IP Address', value: entity.attributes[1]?.value || '192.168.1.45' },
    { attr: entity.attributes[2], x: 425, y: 385, icon: Mail, label: 'Email', value: entity.attributes[2]?.value || 's****@gmail.com' },
    { attr: entity.attributes[3], x: 510, y: 385, icon: CreditCard, label: 'Account', value: entity.attributes[3]?.value || 'A-7792' },
  ];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between select-none">
      {/* Floating Top Warning Banner */}
      <div className="w-full flex justify-center pt-2 pb-1 z-10">
        <button
          onClick={() => onSelectEntity(entity.id)}
          className="group inline-flex items-center gap-3 px-4 py-2 bg-rose-50/90 hover:bg-rose-100/90 border border-rose-200/80 rounded-2xl shadow-sm transition-all duration-200 cursor-pointer"
        >
          <div className="w-7 h-7 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-rose-700 leading-tight">High Risk Entity Detected</p>
            <p className="text-[10px] text-textSecondary leading-tight">Active across {entity.systemsInvolved} systems</p>
          </div>
          <ChevronRight className="w-4 h-4 text-rose-400 group-hover:translate-x-0.5 transition-transform ml-1" />
        </button>
      </div>

      {/* Main Interactive Network SVG */}
      <div className="w-full flex-1 relative flex items-center justify-center min-h-[360px]">
        <svg
          viewBox="0 0 760 435"
          className="w-full h-full max-h-[460px] overflow-visible"
        >
          <defs>
            {/* Soft Radial Halos */}
            <radialGradient id="entityHaloGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.25" />
              <stop offset="60%" stopColor="#EF4444" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="centerEntityGrad" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#F87171" />
              <stop offset="100%" stopColor="#DC2626" />
            </radialGradient>

            {/* System Node Gradients */}
            <linearGradient id="sysAGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#6D28D9" />
            </linearGradient>

            <linearGradient id="sysBGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>

            <linearGradient id="sysCGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            <linearGradient id="sysDGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FB923C" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>

            {/* Subtle Drop Shadows */}
            <filter id="nodeShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.08" />
            </filter>
            <filter id="entityShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#EF4444" floodOpacity="0.28" />
            </filter>
          </defs>

          {/* ─── 1. Connection Lines to Systems ─── */}
          {systems.map((sys) => {
            const config = systemNodesConfig[sys.id];
            const connection = entity.connections[sys.id];
            if (!config || !connection) return null;

            const isWeak = connection.connectionType === 'WEAK_CONNECTION';
            const isDimmed = selectedSystemId !== 'ALL' && selectedSystemId !== sys.id;
            const isHovered = hoveredNode === `conn-${sys.id}`;

            // Calculate badge position along line
            const bx = config.iconX + (centerNode.x - config.iconX) * config.badgeT;
            const by = config.iconY + (centerNode.y - config.iconY) * config.badgeT;

            return (
              <g
                key={`line-${sys.id}`}
                className="cursor-pointer transition-opacity duration-300"
                style={{ opacity: isDimmed ? 0.25 : 1 }}
                onClick={() => onSelectConnection(sys.id)}
                onMouseEnter={() => setHoveredNode(`conn-${sys.id}`)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Hit area */}
                <line
                  x1={config.iconX}
                  y1={config.iconY}
                  x2={centerNode.x}
                  y2={centerNode.y}
                  stroke="transparent"
                  strokeWidth="16"
                />

                {/* Visible Connection Line */}
                <line
                  x1={config.iconX}
                  y1={config.iconY}
                  x2={centerNode.x}
                  y2={centerNode.y}
                  stroke={sys.color.stroke}
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  strokeDasharray={isWeak ? '5 5' : 'none'}
                  strokeOpacity={isHovered ? 0.95 : 0.45}
                  className="transition-all duration-200"
                />

                {/* Signal/Txn Count Badge on the Line */}
                <g transform={`translate(${bx}, ${by})`} className="transition-transform duration-200" style={{ transform: isHovered ? `translate(${bx}px, ${by}px) scale(1.15)` : `translate(${bx}px, ${by}px)` }}>
                  <circle
                    r="10"
                    fill={sys.color.stroke}
                    filter="url(#nodeShadow)"
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#FFFFFF"
                    fontSize="9"
                    fontWeight="700"
                    fontFamily="Inter, sans-serif"
                  >
                    {connection.transactionCount}
                  </text>
                </g>
              </g>
            );
          })}

          {/* ─── 2. Connection Lines to Bottom Attributes ─── */}
          {attributeNodes.map((item, idx) => (
            <g key={`attr-line-${idx}`}>
              <line
                x1={centerNode.x}
                y1={centerNode.y + 42}
                x2={item.x}
                y2={item.y - 20}
                stroke="#C084FC"
                strokeWidth="1"
                strokeDasharray="4 4"
                strokeOpacity="0.45"
              />
            </g>
          ))}

          {/* ─── 3. Central Entity Node ─── */}
          <g
            className="cursor-pointer"
            onClick={() => onSelectEntity(entity.id)}
            onMouseEnter={() => setHoveredNode('center-entity')}
            onMouseLeave={() => setHoveredNode(null)}
          >
            {/* Glowing outer halo */}
            <circle
              cx={centerNode.x}
              cy={centerNode.y}
              r="62"
              fill="url(#entityHaloGrad)"
              className="animate-pulse"
            />
            <circle
              cx={centerNode.x}
              cy={centerNode.y}
              r="44"
              fill="none"
              stroke="#FCA5A5"
              strokeWidth="1"
              strokeDasharray="3 3"
              strokeOpacity="0.8"
            />

            {/* Central Solid Red Avatar Node */}
            <circle
              cx={centerNode.x}
              cy={centerNode.y}
              r="30"
              fill="url(#centerEntityGrad)"
              filter="url(#entityShadow)"
              className="transition-transform duration-200"
            />

            {/* User Silhouette SVG Inside Red Node */}
            <g transform={`translate(${centerNode.x - 12}, ${centerNode.y - 12})`} fill="#FFFFFF">
              <circle cx="12" cy="7" r="4.5" />
              <path d="M4 21v-1.5a5.5 5.5 0 0 1 11 0V21" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" />
            </g>

            {/* Entity Label Card Below Avatar */}
            <g transform={`translate(${centerNode.x}, ${centerNode.y + 44})`}>
              {/* White capsule backdrop */}
              <rect
                x="-58"
                y="-10"
                width="116"
                height="34"
                rx="8"
                fill="#FFFFFF"
                stroke="#E5E7EB"
                strokeWidth="1"
                filter="url(#nodeShadow)"
              />
              <text
                x="0"
                y="3"
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill="#182124"
                fontFamily="Inter, sans-serif"
              >
                {entity.id}
              </text>
              {/* Red HIGH RISK Pill */}
              <rect
                x="-30"
                y="8"
                width="60"
                height="12"
                rx="6"
                fill="#EF4444"
              />
              <text
                x="0"
                y="17"
                textAnchor="middle"
                fontSize="7.5"
                fontWeight="800"
                fill="#FFFFFF"
                letterSpacing="0.4"
                fontFamily="Inter, sans-serif"
              >
                {entity.riskLevel} RISK
              </text>
            </g>
          </g>

          {/* ─── 4. Outer System Nodes ─── */}
          {systems.map((sys) => {
            const config = systemNodesConfig[sys.id];
            if (!config) return null;

            const isSelected = selectedSystemId === sys.id;
            const isHovered = hoveredNode === sys.id;
            const gradId =
              sys.id === 'SYS-A' ? 'sysAGrad' :
              sys.id === 'SYS-B' ? 'sysBGrad' :
              sys.id === 'SYS-C' ? 'sysCGrad' : 'sysDGrad';

            return (
              <g
                key={`node-${sys.id}`}
                className="cursor-pointer transition-all duration-200 group"
                onClick={() => onSelectSystem(sys.id)}
                onMouseEnter={() => setHoveredNode(sys.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Hover ring */}
                {(isHovered || isSelected) && (
                  <circle
                    cx={config.iconX}
                    cy={config.iconY}
                    r="25"
                    fill="none"
                    stroke={sys.color.stroke}
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                    className="animate-spin"
                    style={{ animationDuration: '10s' }}
                  />
                )}

                {/* System Icon Circle */}
                <circle
                  cx={config.iconX}
                  cy={config.iconY}
                  r="19"
                  fill={`url(#${gradId})`}
                  filter="url(#nodeShadow)"
                />

                {/* Inner Icon: Layered stack graphic */}
                <g transform={`translate(${config.iconX - 8}, ${config.iconY - 8})`} fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9.6 1.6-8 4.4 8 4.4 8-4.4-8-4.4Z" />
                  <path d="m1.6 10.4 8 4.4 8-4.4" />
                </g>

                {/* Text Metadata Block */}
                <g transform={`translate(${config.textX}, ${config.iconY})`}>
                  <text
                    x="0"
                    y="-10"
                    textAnchor={config.textAnchor}
                    fontSize="12.5"
                    fontWeight="700"
                    fill={sys.color.stroke}
                    fontFamily="Inter, sans-serif"
                  >
                    {sys.name}
                  </text>
                  <text
                    x="0"
                    y="4"
                    textAnchor={config.textAnchor}
                    fontSize="9.5"
                    fontWeight="500"
                    fill="#687276"
                    fontFamily="Inter, sans-serif"
                  >
                    {sys.transactionCount.toLocaleString()} txns
                  </text>
                  <text
                    x="0"
                    y="17"
                    textAnchor={config.textAnchor}
                    fontSize="9.5"
                    fontWeight="500"
                    fill="#687276"
                    fontFamily="Inter, sans-serif"
                  >
                    Risk Score: {sys.riskScore}
                  </text>
                </g>
              </g>
            );
          })}

          {/* ─── 5. Bottom Attribute Tokens ─── */}
          {attributeNodes.map((item, idx) => {
            const IconComponent = item.icon;
            const isHovered = hoveredNode === `attr-${idx}`;
            return (
              <foreignObject
                key={`attr-node-${idx}`}
                x={item.x - 40}
                y={item.y - 16}
                width="80"
                height="42"
                className="overflow-visible"
              >
                <div
                  onClick={() => item.attr && onSelectAttribute(item.attr)}
                  onMouseEnter={() => setHoveredNode(`attr-${idx}`)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className={`w-full h-full bg-white rounded-xl border flex flex-col items-center justify-center p-1 cursor-pointer shadow-xs transition-all duration-200 ${
                    isHovered
                      ? 'border-purple-500 ring-2 ring-purple-100 shadow-sm scale-105'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                      <IconComponent className="w-2.5 h-2.5 text-purple-600" />
                    </div>
                    <span className="text-[8px] font-semibold text-textSecondary leading-none">{item.label}</span>
                  </div>
                  <span className="text-[8.5px] font-bold text-textPrimary leading-tight mt-0.5 truncate max-w-[72px]">
                    {item.value}
                  </span>
                </div>
              </foreignObject>
            );
          })}
        </svg>
      </div>

      {/* ─── Network Legend at Bottom ─── */}
      <div className="w-full flex items-center justify-center gap-6 py-2.5 border-t border-gray-100 text-[11px] text-textSecondary">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-[2px] bg-purple-500" />
          <span>Transaction Flow</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-[2px] border-b border-dashed border-blue-400" />
          <span>Weak Connection</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-rose-500" />
          <span>High Risk</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-orange-400" />
          <span>Medium Risk</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Low Risk</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-purple-600" />
          <span>Entity</span>
        </div>
      </div>
    </div>
  );
};
