import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  AlertTriangle,
  Users,
  CreditCard,
  Building2,
  BarChart3,
  FileText,
  ShieldCheck,
  Headphones,
  Settings,
  ShieldAlert,
  ArrowLeft,
  Activity,
  LogOut,
  Sliders,
  Sparkles,
  Layers,
  Network
} from 'lucide-react';
import { useCustomer } from '../../context/CustomerContext';
import { cn } from '../../lib/utils';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedCustomer, selectedCustomerId, returnToAdmin, isCustomerView } = useCustomer();

  // Admin Portal Navigation Items (Dark slate / Greenish-Blue Theme)
  const adminNavItems = [
    { name: 'Overview', path: '/admin/dashboard', icon: Home },
    { name: 'Risk & Alerts', path: '/admin/alerts', icon: AlertTriangle, badge: '12' },
    { name: 'Customers', path: '/admin/alerts?tab=customers', icon: Users },
    { name: 'Transactions', path: '/customer/CUST-001/payments', icon: CreditCard },
    { name: 'Payment Infrastructure', path: '/customer/CUST-001/twin', icon: Building2 },
    { name: 'Analytics', path: '/admin/reports', icon: BarChart3 },
    { name: 'Reports', path: '/admin/reports', icon: FileText },
    { name: 'Audit Trails', path: '/admin/dashboard#audit', icon: ShieldCheck },
    { name: 'Customer Services', path: '/admin/dashboard#services', icon: Headphones },
    { name: 'Settings', path: '/connectors', icon: Settings },
  ];

  // Customer View Navigation Items
  const custId = selectedCustomerId || 'CUST-001';
  const customerNavItems = [
    { name: 'Customer Dashboard', path: `/customer/${custId}/dashboard`, icon: Home },
    { name: 'Payment Flow', path: `/customer/${custId}/payments`, icon: CreditCard },
    { name: 'Digital Twin', path: `/customer/${custId}/twin`, icon: Network },
    { name: 'Twin Lab', path: `/customer/${custId}/lab`, icon: Layers },
    { name: 'Cross-System Risk', path: `/customer/${custId}/cross-system`, icon: Activity },
    { name: 'Alerts & Emergency', path: `/customer/${custId}/alerts`, icon: AlertTriangle },
    { name: 'Fraud Detection & Intelligence', path: `/customer/${custId}/detection`, icon: ShieldAlert },
    { name: 'Explainable AI', path: `/customer/${custId}/explain`, icon: Sparkles },
  ];

  return (
    <aside className="w-64 bg-[#0F172A] border-r border-slate-800 text-slate-300 h-screen flex flex-col pt-5 px-3.5 overflow-y-auto select-none shrink-0">
      {/* ─── KRYPTIC Brand Header (Banking Green & Blue Accent) ─── */}
      <div className="flex items-center gap-3 px-2 mb-6">
        <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-900/50 border border-emerald-500/30">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-black tracking-wider text-white block leading-none">
              KRYPTIC
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
              SOC
            </span>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 tracking-tight">
            {isCustomerView ? 'Customer Isolation View' : 'Financial Risk Command'}
          </span>
        </div>
      </div>

      {/* ─── Customer Mode Switcher Banner (if in Customer View) ─── */}
      {isCustomerView && (
        <div className="mb-4 p-3 bg-slate-800/80 border border-slate-700/80 rounded-xl space-y-2">
          <button
            onClick={returnToAdmin}
            className="w-full inline-flex items-center justify-center gap-2 py-1.5 px-2.5 rounded-lg border border-slate-600 bg-slate-700/50 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
            <span>← Back to Admin Portal</span>
          </button>
          
          <div className="pt-1.5 border-t border-slate-700 text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">Customer:</span>
              <span className="font-mono font-bold text-emerald-400">{custId}</span>
            </div>
            <p className="text-[10px] text-slate-400 truncate mt-0.5">
              {selectedCustomer?.name || 'Isolated Client Account'}
            </p>
          </div>
        </div>
      )}

      {/* ─── Section Header ─── */}
      <div className="px-2 pb-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {isCustomerView ? 'Customer Navigation' : 'Command Center'}
        </span>
      </div>

      {/* ─── Main Navigation ─── */}
      <nav className="flex-1 space-y-1">
        {(isCustomerView ? customerNavItems : adminNavItems).map((item: any) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 group",
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-xs"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                )
              }
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className="w-4 h-4 shrink-0 transition-colors group-hover:text-emerald-400" />
                <span className="truncate">{item.name}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ─── Bottom Admin Profile Card ─── */}
      <div className="mt-4 pt-3 border-t border-slate-800 pb-3">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-bold text-emerald-400">
                AV
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate leading-tight">
                Alex Vance
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                Chief Risk Officer
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('/connectors')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors"
            title="System Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
