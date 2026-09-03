import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface RegionNode {
  id: string;
  name: string;
  x: number; // percentage in viewBox
  y: number;
  level: 'HIGH' | 'MEDIUM' | 'LOW';
  txnCount: string;
  riskScore: number;
  isHighest?: boolean;
}

const REGIONS: RegionNode[] = [
  { id: 'mumbai', name: 'Mumbai', x: 28, y: 58, level: 'HIGH', txnCount: '542K', riskScore: 89, isHighest: true },
  { id: 'delhi', name: 'Delhi NCR', x: 38, y: 28, level: 'LOW', txnCount: '410K', riskScore: 24 },
  { id: 'bengaluru', name: 'Bengaluru', x: 42, y: 76, level: 'LOW', txnCount: '380K', riskScore: 19 },
  { id: 'hyderabad', name: 'Hyderabad', x: 46, y: 62, level: 'LOW', txnCount: '220K', riskScore: 28 },
  { id: 'chennai', name: 'Chennai', x: 50, y: 80, level: 'LOW', txnCount: '190K', riskScore: 22 },
  { id: 'kolkata', name: 'Kolkata', x: 74, y: 46, level: 'MEDIUM', txnCount: '165K', riskScore: 58 },
  { id: 'ahmedabad', name: 'Ahmedabad', x: 23, y: 46, level: 'LOW', txnCount: '145K', riskScore: 31 },
  { id: 'pune', name: 'Pune', x: 32, y: 64, level: 'LOW', txnCount: '120K', riskScore: 34 },
];

export const IndiaRiskHeatmap: React.FC = () => {
  const [hoveredRegion, setHoveredRegion] = useState<RegionNode | null>(null);

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex flex-col justify-between h-full relative overflow-hidden">
      {/* Top Header & Legend */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">System Risk Heatmap</h3>
        </div>

        {/* Legend */}
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Risk Level
          </span>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-gray-600">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              High
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Medium
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Low
            </span>
          </div>
        </div>
      </div>

      {/* Map Graphic Area */}
      <div className="relative w-full my-auto flex items-center justify-center min-h-[220px]">
        <svg
          viewBox="0 0 400 420"
          className="w-full h-auto max-h-[260px] drop-shadow-xs select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E9EEF4" />
              <stop offset="100%" stopColor="#D9E3EE" />
            </linearGradient>
            <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Detailed stylized India Map Path */}
          <path
            d="
              M 152,22
              C 165,22 178,35 182,50
              C 185,62 178,74 186,85
              C 194,96 215,102 232,108
              C 246,112 254,106 260,112
              C 272,118 282,108 296,104
              C 318,98 335,112 330,132
              C 324,148 312,168 300,188
              C 290,182 280,172 274,152
              C 264,152 252,162 246,172
              C 238,198 228,232 218,258
              C 208,284 196,308 186,338
              C 176,368 166,394 160,406
              C 154,400 144,370 138,336
              C 132,302 124,268 116,244
              C 110,228 106,204 100,188
              C 90,188 80,194 70,188
              C 58,182 54,166 64,154
              C 58,144 44,138 48,128
              C 58,118 70,104 86,94
              C 102,84 114,58 124,38
              Z
            "
            fill="url(#mapGradient)"
            stroke="#BDC9D7"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />

          {/* Minor State Partition Accents */}
          <path
            d="M 124,130 Q 150,150 186,160 M 186,160 Q 210,190 200,240 M 138,260 Q 160,280 180,310"
            fill="none"
            stroke="#CAD5E2"
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity="0.6"
          />

          {/* Region Nodes */}
          {REGIONS.map((region) => {
            // Transform percentage coordinates to 400x420 viewBox
            const cx = (region.x / 100) * 400;
            const cy = (region.y / 100) * 420;

            const isHigh = region.level === 'HIGH';
            const isMed = region.level === 'MEDIUM';

            const fillColor = isHigh ? '#EF4444' : isMed ? '#F59E0B' : '#3B82F6';
            const rippleColor = isHigh ? 'rgba(239, 68, 68, 0.4)' : isMed ? 'rgba(245, 158, 11, 0.3)' : 'rgba(59, 130, 246, 0.3)';

            return (
              <g
                key={region.id}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredRegion(region)}
                onMouseLeave={() => setHoveredRegion(null)}
              >
                {/* Ripple Effect for High / Active Nodes */}
                {isHigh && (
                  <circle cx={cx} cy={cy} r="16" fill={rippleColor} className="animate-ping" opacity="0.75" />
                )}
                <circle cx={cx} cy={cy} r={isHigh ? '10' : '7'} fill={rippleColor} />
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHigh ? '5.5' : '4'}
                  fill={fillColor}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  filter="url(#nodeGlow)"
                />
              </g>
            );
          })}
        </svg>

        {/* Mumbai Callout Warning Badge (Exact match to screenshot) */}
        <div
          className="absolute z-20 pointer-events-none transition-all duration-300"
          style={{ left: '26%', top: '56%', transform: 'translate(-50%, -120%)' }}
        >
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-xs border border-red-200/90 rounded-xl px-2.5 py-1.5 shadow-md shadow-red-500/10">
            <div className="w-5 h-5 rounded-md bg-red-100 flex items-center justify-center text-red-600 shrink-0">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col text-left leading-tight">
              <span className="text-[10px] font-bold text-gray-900">Highest Risk</span>
              <span className="text-[9px] font-medium text-gray-500">Mumbai</span>
            </div>
          </div>
          {/* Subtle pointer tip */}
          <div className="w-2 h-2 bg-white border-r border-b border-red-200 transform rotate-45 mx-auto -mt-1" />
        </div>

        {/* Dynamic Tooltip on Hover */}
        {hoveredRegion && !hoveredRegion.isHighest && (
          <div
            className="absolute z-30 pointer-events-none bg-gray-900 text-white text-[11px] rounded-lg px-2.5 py-1.5 shadow-lg flex flex-col gap-0.5"
            style={{
              left: `${hoveredRegion.x}%`,
              top: `${hoveredRegion.y}%`,
              transform: 'translate(-50%, -130%)'
            }}
          >
            <span className="font-bold">{hoveredRegion.name}</span>
            <span className="text-gray-300 text-[10px]">
              {hoveredRegion.txnCount} Txns • Risk: {hoveredRegion.riskScore}/100
            </span>
          </div>
        )}
      </div>

      {/* Bottom Subtitle */}
      <div className="pt-2 flex justify-end">
        <span className="text-xs font-semibold text-gray-700">
          8 Regions Live Monitoring
        </span>
      </div>
    </div>
  );
};
