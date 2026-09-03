import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CreditCard,
  Network,
  Share2,
  Bell,
  FileText,
  Shield,
  Zap,
  ArrowLeft,
  LayoutGrid
} from 'lucide-react';
import { useCustomer } from '../../context/CustomerContext';
import { cn } from '../../lib/utils';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedCustomer, selectedCustomerId, returnToAdmin, isCustomerView } = useCustomer();

  // Admin Portal primary items
  const adminNavItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Risk & Alerts', path: '/admin/alerts', icon: Bell },
    { name: 'Risk Intelligence / Reports', path: '/admin/reports', icon: FileText },
  ];

  // Customer View items (strictly 6 items matching screenshot)
  const custId = selectedCustomerId || 'CUST-001';
  const customerNavItems = [
    { name: 'Customer Dashboard', path: `/customer/${custId}/dashboard`, icon: LayoutGrid },
    { name: 'Payment Flow', path: `/customer/${custId}/payments`, icon: CreditCard },
    { name: 'Digital Twin', path: `/customer/${custId}/twin`, icon: Network },
    { name: 'Cross-System Risk', path: `/customer/${custId}/cross-system`, icon: Share2 },
    { name: 'Alerts & Emergency', path: `/customer/${custId}/alerts`, icon: Bell },
    { name: 'Fraud Detection & Intelligence', path: `/customer/${custId}/detection`, icon: Shield },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 h-screen flex flex-col pt-6 px-4 overflow-y-auto select-none shrink-0 font-sans">
      {/* ─── KRYPTIC Shield Brand Header (Exact match to screenshot) ─── */}
      <div className="flex items-center gap-3 px-1 mb-6 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
        <div className="relative w-8 h-9 flex items-center justify-center shrink-0">
          <Shield className="w-8 h-9 text-blue-700 stroke-[2.2]" />
          <Zap className="w-4 h-4 text-blue-700 fill-blue-700 absolute" />
        </div>
        <div className="leading-none">
          <span className="text-xl font-black tracking-widest text-slate-900 block font-mono">
            KRYPTIC
          </span>
          <span className="text-xs font-semibold text-slate-500 block mt-1.5">
            {isCustomerView ? 'Customer Risk View' : 'Enterprise Risk Platform'}
          </span>
        </div>
      </div>

      {/* ─── Customer View Mode Switcher Header (2 Cards matching screenshot) ─── */}
      {isCustomerView && (
        <div className="mb-5 space-y-3">
          {/* Card 1: Back to Admin Portal Blue Outline Button */}
          <button
            onClick={returnToAdmin}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-blue-200 bg-white text-xs font-bold text-blue-700 hover:bg-blue-50/50 transition-all shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-blue-700" />
            <span>Back to Admin Portal</span>
          </button>
          
          {/* Card 2: Customer Identity Card */}
          <div className="p-3.5 bg-white border border-slate-200/80 rounded-2xl space-y-1 shadow-2xs">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Customer:</span>
              <span className="font-mono font-bold text-slate-900">{custId}</span>
            </div>
            <p className="text-xs text-slate-700 font-semibold truncate pt-0.5">
              {selectedCustomer?.name || 'Apex Merchant Solutions'}
            </p>
          </div>
        </div>
      )}

      {/* ─── Section Header & Horizontal Line ─── */}
      <div className="px-1 mb-3">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          {isCustomerView ? 'CUSTOMER NAVIGATION' : 'ADMIN NAVIGATION'}
        </span>
        <div className="h-px bg-slate-100 mt-2" />
      </div>

      {/* ─── Navigation Links ─── */}
      <nav className="flex-1 space-y-1.5">
        {(isCustomerView ? customerNavItems : adminNavItems).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs transition-all duration-150 relative overflow-hidden group",
                  isActive
                    ? "bg-blue-50/80 text-blue-600 border border-blue-200 font-bold shadow-2xs"
                    : "text-slate-800 hover:bg-slate-50/80 font-semibold"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active Blue Left Vertical Bar */}
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-md" />
                  )}
                  <Icon className={cn("w-4.5 h-4.5 shrink-0 transition-colors", isActive ? "text-blue-600" : "text-slate-800 group-hover:text-slate-900")} />
                  <span className="truncate">{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ─── Bottom System Status Widget ─── */}
      <div className="mt-4 pt-3 border-t border-slate-100 pb-5">
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            {isCustomerView ? 'Client Isolation' : 'System Status'}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-900">
              {isCustomerView ? `Filtered: ${custId}` : 'All Systems Monitored'}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {isCustomerView ? 'Zero leakage across tenants' : 'ML Engine: XGBoost v2.0.0'}
          </p>
        </div>
      </div>
    </aside>
  );
};
