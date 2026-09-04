import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Shield,
  RotateCcw,
  CreditCard,
  BarChart2,
  Sliders,
  Store,
  LogOut,
  ChevronRight,
  Activity,
  Bell,
  Zap
} from 'lucide-react';
import { useEnvironment } from '../../context/EnvironmentContext';
import { cn } from '../../lib/utils';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { isLive } = useEnvironment();

  const mainNavItems = [
    {
      name: 'Overview',
      path: '/admin/dashboard',
      icon: Home,
      badgeText: null,
      badgeColor: ''
    },
    {
      name: 'Disputes & Chargebacks',
      path: '/chargebacks',
      icon: Shield,
      badgeText: '2',
      badgeColor: 'bg-rose-500 text-white font-bold'
    },
    {
      name: 'Order & Return Risk',
      path: '/returns',
      icon: RotateCcw,
      badgeText: null,
      badgeColor: ''
    },
    {
      name: 'Fraud Detection',
      path: '/intelligence/detection',
      icon: CreditCard,
      badgeText: null,
      badgeColor: ''
    },
    {
      name: 'Payment Intelligence',
      path: '/payments',
      icon: Zap,
      badgeText: null,
      badgeColor: ''
    },
    {
      name: 'Alerts Queue',
      path: '/admin/alerts',
      icon: Bell,
      badgeText: '5',
      badgeColor: 'bg-amber-500 text-white font-bold'
    },
    {
      name: 'Risk Simulation Lab',
      path: '/twin',
      icon: Activity,
      badgeText: null,
      badgeColor: ''
    },
    {
      name: 'Reports',
      path: '/admin/reports',
      icon: BarChart2,
      badgeText: null,
      badgeColor: ''
    },
  ];

  const configNavItems = [
    {
      name: 'Razorpay Settings',
      path: '/connectors',
      icon: Sliders,
      badgeText: null,
      badgeColor: ''
    },
    {
      name: 'Merchant Store',
      path: '/admin/dashboard',
      icon: Store,
      badgeText: null,
      badgeColor: ''
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 h-screen flex flex-col pt-6 px-4 select-none shrink-0 font-sans z-30">
      {/* ─── Brand Logo & Header ─── */}
      <div
        className="flex items-center gap-3 px-2 mb-8 cursor-pointer group"
        onClick={() => navigate('/admin/dashboard')}
      >
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Shield className="w-5 h-5 text-white fill-white/20" />
        </div>
        <div className="leading-tight">
          <span className="text-base font-black tracking-tight text-slate-900 block group-hover:text-blue-600 transition-colors">
            Kryptic
          </span>
          <span className="text-[11px] text-slate-400 font-medium block">
            Risk Management
          </span>
        </div>
      </div>

      {/* ─── MAIN Section ─── */}
      <div className="px-2 mb-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          MAIN
        </span>
      </div>

      <nav className="space-y-1 mb-6">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer group",
                  isActive
                    ? "bg-blue-50 text-blue-600 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={cn(
                      "w-4 h-4 shrink-0 transition-colors",
                      isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                    )} />
                    <span className="truncate">{item.name}</span>
                  </div>

                  {item.badgeText && (
                    <span className={cn(
                      "w-4 h-4 rounded-full text-[10px] flex items-center justify-center shadow-xs",
                      item.badgeColor
                    )}>
                      {item.badgeText}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ─── CONFIGURATION Section ─── */}
      <div className="px-2 mb-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          CONFIGURATION
        </span>
      </div>

      <nav className="space-y-1">
        {configNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer group",
                  isActive && item.name === 'Razorpay Settings'
                    ? "bg-blue-50 text-blue-600 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )
              }
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-slate-600" />
                <span className="truncate">{item.name}</span>
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* ─── Footer: Mode Status + User Profile + Log Out ─── */}
      <div className="mt-auto pt-4 border-t border-slate-100 space-y-3 pb-2">
        {/* Sandbox / Live indicator card */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2">
            <span className={cn(
              "w-2 h-2 rounded-full",
              isLive ? "bg-emerald-500 animate-pulse" : "bg-emerald-500"
            )} />
            <span className="text-xs font-bold text-slate-800">
              {isLive ? 'Live Mode' : 'Sandbox Mode'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {isLive ? 'Connected to live merchant gateway.' : 'Simulating transactions safely.'}
          </p>
          <button
            onClick={() => navigate('/connectors')}
            className="text-[11px] font-bold text-blue-600 hover:text-blue-700 mt-1 inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Manage</span>
            <span>→</span>
          </button>
        </div>

        {/* User Profile Card */}
        <div className="flex items-center gap-3 px-1 pt-1">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
            M
          </div>
          <div className="leading-tight min-w-0 flex-1">
            <span className="text-xs font-bold text-slate-900 truncate block">
              Manav Nagpal
            </span>
            <span className="text-[10px] text-slate-400 truncate block">
              manav.nagpal2005@gmail.com
            </span>
          </div>
        </div>

        {/* Log Out */}
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-400" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};
