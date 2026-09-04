import React, { useState } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Activity,
  Bell,
  Zap,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { useEnvironment } from '../../context/EnvironmentContext';
import { cn } from '../../lib/utils';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { isLive } = useEnvironment();
  const [isCollapsed, setIsCollapsed] = useState(false);

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
      name: 'Live Payment Test',
      path: '/test-payment',
      icon: CreditCard,
      badgeText: 'LIVE',
      badgeColor: 'bg-emerald-500 text-white font-bold'
    },
    {
      name: 'Alerts Queue',
      path: '/admin/alerts',
      icon: Bell,
      badgeText: '5',
      badgeColor: 'bg-amber-500 text-white font-bold'
    },
    {
      name: 'Model Evaluation',
      path: '/system/evaluation',
      icon: BarChart2,
      badgeText: null,
      badgeColor: ''
    },
    {
      name: 'Reports',
      path: '/admin/reports',
      icon: Activity,
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
  ];

  return (
    <aside
      className={cn(
        "bg-white border-r border-slate-200/90 h-screen flex flex-col pt-5 select-none shrink-0 font-sans z-30 transition-all duration-300 relative",
        isCollapsed ? "w-16 px-2" : "w-64 px-4"
      )}
    >
      {/* ─── Brand Logo & Header + Toggle Button ─── */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div
          className="flex items-center gap-3 cursor-pointer group min-w-0"
          onClick={() => navigate('/admin/dashboard')}
          title="Kryptic Risk Management"
        >
          <img
            src="/logo.png"
            alt="Kryptic Logo"
            className="w-9 h-9 rounded-xl object-contain shrink-0 shadow-xs group-hover:scale-105 transition-transform"
          />
          {!isCollapsed && (
            <div className="leading-tight truncate">
              <span className="text-base font-black tracking-tight text-slate-900 block group-hover:text-blue-600 transition-colors">
                Kryptic
              </span>
              <span className="text-[11px] text-slate-400 font-medium block">
                Risk Management
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* ─── MAIN Section Header ─── */}
      <div className={cn("mb-2 px-2", isCollapsed && "text-center px-0")}>
        {isCollapsed ? (
          <div className="h-px bg-slate-100 my-2" />
        ) : (
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            MAIN
          </span>
        )}
      </div>

      <nav className="space-y-1 mb-6 flex-1 overflow-y-auto">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              title={isCollapsed ? item.name : undefined}
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer group relative",
                  isCollapsed ? "justify-center p-2.5" : "justify-between px-3.5 py-2.5",
                  isActive
                    ? "bg-blue-50 text-blue-600 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className={cn("flex items-center gap-3 min-w-0", isCollapsed && "justify-center")}>
                    <Icon className={cn(
                      "w-4.5 h-4.5 shrink-0 transition-colors",
                      isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                    )} />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </div>

                  {item.badgeText && (
                    <span className={cn(
                      "rounded-full text-[10px] flex items-center justify-center shadow-xs shrink-0",
                      isCollapsed ? "absolute -top-0.5 -right-0.5 w-3.5 h-3.5 text-[9px]" : "w-4 h-4",
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

        {/* ─── CONFIGURATION Section ─── */}
        <div className={cn("mt-4 mb-2 px-2", isCollapsed && "text-center px-0")}>
          {isCollapsed ? (
            <div className="h-px bg-slate-100 my-2" />
          ) : (
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              CONFIGURATION
            </span>
          )}
        </div>

        {configNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              title={isCollapsed ? item.name : undefined}
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer group",
                  isCollapsed ? "justify-center p-2.5" : "justify-between px-3.5 py-2.5",
                  isActive && item.name === 'Razorpay Settings'
                    ? "bg-blue-50 text-blue-600 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )
              }
            >
              <div className={cn("flex items-center gap-3 min-w-0", isCollapsed && "justify-center")}>
                <Icon className="w-4.5 h-4.5 shrink-0 text-slate-400 group-hover:text-slate-600" />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* ─── Footer: Mode Status + User Profile + Log Out ─── */}
      <div className="mt-auto pt-3 border-t border-slate-100 space-y-2.5 pb-2">
        {/* Sandbox / Live indicator card */}
        {!isCollapsed ? (
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
        ) : (
          <div
            className="flex items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer"
            onClick={() => navigate('/connectors')}
            title={isLive ? 'Live Mode' : 'Sandbox Mode'}
          >
            <span className={cn(
              "w-2.5 h-2.5 rounded-full",
              isLive ? "bg-emerald-500 animate-pulse" : "bg-emerald-500"
            )} />
          </div>
        )}

        {/* User Profile Card */}
        <div
          className={cn(
            "flex items-center gap-2.5 px-1 pt-1",
            isCollapsed && "justify-center"
          )}
          title="Kaaysha Rao (kaaysha.rao@gmail.com)"
        >
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
            K
          </div>
          {!isCollapsed && (
            <div className="leading-tight min-w-0 flex-1">
              <span className="text-xs font-bold text-slate-900 truncate block">
                Kaaysha Rao
              </span>
              <span className="text-[10px] text-slate-400 truncate block">
                kaaysha.rao@gmail.com
              </span>
            </div>
          )}
        </div>

        {/* Log Out */}
        <button
          onClick={() => navigate('/')}
          title={isCollapsed ? "Log out" : undefined}
          className={cn(
            "w-full flex items-center gap-2 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer",
            isCollapsed ? "justify-center px-1" : "px-2"
          )}
        >
          <LogOut className="w-4 h-4 text-slate-400 shrink-0" />
          {!isCollapsed && <span>Log out</span>}
        </button>
      </div>
    </aside>
  );
};

