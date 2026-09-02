import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
  Zap,
  ArrowLeft,
  Activity,
  Sliders,
  Sparkles
} from 'lucide-react';
import { useCustomer } from '../../context/CustomerContext';
import { cn } from '../../lib/utils';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedCustomer, selectedCustomerId, returnToAdmin, isCustomerView } = useCustomer();

  // Admin Portal primary items (strictly 3 administrative views)
  const adminNavItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Risk & Alerts', path: '/admin/alerts', icon: BellRing },
    { name: 'Risk Intelligence / Reports', path: '/admin/reports', icon: FileText },
  ];

  // Customer View items (customer-specific)
  const custId = selectedCustomerId || 'CUST-001';
  const customerNavItems = [
    { name: 'Customer Dashboard', path: `/customer/${custId}/dashboard`, icon: LayoutDashboard },
    { name: 'Payment Flow', path: `/customer/${custId}/payments`, icon: CreditCard },
    { name: 'Digital Twin', path: `/customer/${custId}/twin`, icon: Network },
    { name: 'Twin Lab', path: `/customer/${custId}/lab`, icon: TestTube2 },
    { name: 'Cross-System Risk', path: `/customer/${custId}/cross-system`, icon: Share2 },
    { name: 'Alerts & Emergency', path: `/customer/${custId}/alerts`, icon: BellRing },
    { name: 'Fraud Detection & Intelligence', path: `/customer/${custId}/detection`, icon: ShieldAlert },
    { name: 'Explainable AI', path: `/customer/${custId}/explain`, icon: Sparkles },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 h-screen flex flex-col pt-5 px-3.5 overflow-y-auto select-none shrink-0">
      {/* ─── KRYPTIC Brand Header ─── */}
      <div className="flex items-center justify-between px-2 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center shadow-md shadow-purple-200">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-base font-black tracking-wider text-textPrimary block leading-none">
              KRYPTIC
            </span>
            <span className="text-[10px] font-semibold text-textSecondary tracking-normal">
              {isCustomerView ? 'Customer Risk View' : 'Enterprise Risk Platform'}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Customer View Mode Switcher Header ─── */}
      {isCustomerView && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
          <button
            onClick={returnToAdmin}
            className="w-full inline-flex items-center justify-center gap-2 py-1.5 px-2.5 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-gray-500" />
            <span>Back to Admin Portal</span>
          </button>
          
          <div className="pt-1.5 border-t border-gray-200/80">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-400 font-medium">Customer:</span>
              <span className="font-mono font-bold text-gray-900">{custId}</span>
            </div>
            <p className="text-[10px] text-gray-500 truncate mt-0.5">
              {selectedCustomer?.name || 'Isolated Client Account'}
            </p>
          </div>
        </div>
      )}

      {/* ─── Section Header ─── */}
      <div className="px-2 pb-2">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          {isCustomerView ? 'Customer Navigation' : 'Admin Navigation'}
        </span>
      </div>

      {/* ─── Navigation Links ─── */}
      <nav className="flex-1 space-y-1">
        {(isCustomerView ? customerNavItems : adminNavItems).map((item) => {
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

      {/* ─── Bottom Footer System Status ─── */}
      <div className="mt-4 pt-3 border-t border-gray-100 space-y-3 pb-4">
        <div className="bg-secondary/40 border border-gray-100 rounded-xl p-3">
          <p className="text-[10px] font-bold text-textSecondary uppercase tracking-wider mb-1">
            {isCustomerView ? 'Client Isolation' : 'System Status'}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-textPrimary">
              {isCustomerView ? `Filtered: ${custId}` : 'All Systems Monitored'}
            </span>
          </div>
          <p className="text-[10px] text-textSecondary mt-0.5">
            {isCustomerView ? 'Zero leakage across tenants' : 'ML Engine: XGBoost v2.0.0'}
          </p>
        </div>
      </div>
    </aside>
  );
};
