import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CreditCard,
  Network,
  TestTube2,
  Share2,
  BellRing,
  FileText,
  Settings,
  ShieldAlert,
  Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Payment', path: '/payments', icon: CreditCard },
  { name: 'Digital Twin', path: '/infrastructure/twin', icon: Network },
  { name: 'Twin Lab', path: '/infrastructure/lab', icon: TestTube2 },
  { name: 'Cross-System Risk Intelligence', path: '/cross-system', icon: Share2 },
  { name: 'Alerts & Emergency', path: '/alerts', icon: BellRing },
  { name: 'Reports', path: '/system/datasets', icon: FileText },
  { name: 'Configuration', path: '/connectors', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-white border-r border-gray-100 h-screen flex flex-col pt-5 px-3.5 overflow-y-auto select-none">
      {/* ─── KRYPTIC Header / Logo ─── */}
      <div className="flex items-center gap-3 px-2 mb-7">
        <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center shadow-md shadow-purple-200">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-base font-black tracking-wider text-textPrimary block leading-none">
            KRYPTIC
          </span>
          <span className="text-[10px] font-semibold text-textSecondary tracking-normal">
            AI Risk Manager
          </span>
        </div>
      </div>

      {/* ─── Main Navigation ─── */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150",
                  isActive
                    ? "bg-purple-50/80 text-purple-700 border border-purple-200/70 shadow-xs"
                    : "text-textSecondary hover:bg-secondary/60 hover:text-textPrimary"
                )
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* ─── Bottom Footer Widgets Matching Reference ─── */}
      <div className="mt-4 pt-3 border-t border-gray-100 space-y-3 pb-4">
        {/* System Status Card */}
        <div className="bg-secondary/40 border border-gray-100 rounded-xl p-3">
          <p className="text-[10px] font-bold text-textSecondary uppercase tracking-wider mb-1">
            System Status
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-textPrimary">All Systems Operational</span>
          </div>
          <p className="text-[10px] text-textSecondary mt-0.5">Last updated: 10:32:45 AM</p>
        </div>

        {/* 3D Isometric Platform Graphic */}
        <div className="relative w-full h-28 flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-purple-50/30 to-purple-100/30 border border-purple-100/50">
          <svg viewBox="0 0 160 110" className="w-full h-full">
            <defs>
              <linearGradient id="shieldGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#A855F7" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
              <linearGradient id="platformGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EDE9FE" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#DDD6FE" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {/* Isometric Platform Planes */}
            <polygon points="80,50 135,72 80,94 25,72" fill="url(#platformGrad)" stroke="#C4B5FD" strokeWidth="1" />
            <polygon points="25,72 80,94 80,102 25,80" fill="#DDD6FE" />
            <polygon points="135,72 80,94 80,102 135,80" fill="#C4B5FD" />

            {/* Inner Ring */}
            <ellipse cx="80" cy="72" rx="34" ry="16" fill="none" stroke="#A78BFA" strokeWidth="1" strokeDasharray="3 3" />

            {/* Glowing 3D Shield */}
            <g transform="translate(68, 30)">
              <polygon points="12,0 24,5 24,18 12,25 0,18 0,5" fill="url(#shieldGrad)" />
              <polygon points="12,2 22,6 22,17 12,23 2,17 2,6" fill="#8B5CF6" opacity="0.6" />
              <path d="M12 5 L8 13 L12 13 L11 20 L16 11 L12 11 Z" fill="#FFFFFF" />
            </g>

            {/* Floating Dots / Data Nodes */}
            <circle cx="45" cy="55" r="2.5" fill="#8B5CF6" />
            <circle cx="115" cy="55" r="2.5" fill="#8B5CF6" />
            <circle cx="80" cy="98" r="2" fill="#6366F1" />
            <line x1="45" y1="55" x2="68" y2="42" stroke="#C4B5FD" strokeWidth="0.8" strokeDasharray="2 2" />
            <line x1="115" y1="55" x2="92" y2="42" stroke="#C4B5FD" strokeWidth="0.8" strokeDasharray="2 2" />
          </svg>
        </div>

        {/* Motto Text */}
        <p className="text-center text-[10.5px] font-bold text-purple-700 tracking-tight leading-snug">
          Stronger together.<br />
          Safer everywhere.
        </p>
      </div>
    </aside>
  );
};
