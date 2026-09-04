import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  CheckCircle2,
  Shield,
  ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { settingsService } from '../../services/SettingsService';
import { useEnvironment } from '../../context/EnvironmentContext';
import { cn } from '../../lib/utils';

export const TopNavbar: React.FC = () => {
  const navigate = useNavigate();
  const { mode, setMode, isLive } = useEnvironment();
  const [searchQuery, setSearchQuery] = useState('');
  const [rzpConnected, setRzpConnected] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    settingsService.getKeyStatus().then(status => {
      setRzpConnected(status.razorpay_configured);
    }).catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.trim().toLowerCase();
    if (q.startsWith('disp_') || q.includes('dispute') || q.includes('chargeback')) {
      navigate('/chargebacks');
    } else if (q.startsWith('ord_') || q.includes('return') || q.includes('rto')) {
      navigate('/returns');
    } else {
      navigate('/intelligence/detection');
    }
  };

  return (
    <div className="flex flex-col shrink-0 z-20">
      {/* ─── Mode Indicator Banner ─── */}
      <div className={cn(
        "px-6 py-1 text-[11px] font-medium flex items-center justify-between border-b transition-colors",
        isLive
          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
          : "bg-amber-50 text-amber-900 border-amber-200"
      )}>
        <div className="flex items-center gap-2">
          <span className={cn(
            "w-2 h-2 rounded-full",
            isLive ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
          )} />
          <span>
            {isLive
              ? "Live Mode Active • Connected to Razorpay Live Merchant Gateway (ID: rzp_test_TWpQWcihNk3rD9)"
              : "Test Mode Active • Simulating sandbox transactions and test disputes (Safe environment)"
            }
          </span>
        </div>
        <span className="text-[10px] font-semibold text-slate-500 hidden sm:inline">
          Click toggle below to switch
        </span>
      </div>

      <header className="h-14 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between shrink-0 select-none">
        {/* ─── Search Bar ─── */}
        <div className="flex items-center gap-3 flex-1 max-w-lg">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search payments, disputes, customer email or order ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-12 py-2 text-xs bg-slate-50/80 border border-slate-200/90 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all shadow-2xs"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs pointer-events-none">
              <span>⌘</span>
              <span>K</span>
            </div>
          </form>
        </div>

        {/* ─── Right Actions ─── */}
        <div className="flex items-center gap-3">
          {/* Active Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs shadow-2xs">
            <button
              onClick={() => setMode('TEST')}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium text-xs",
                !isLive ? "bg-blue-600 text-white shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
              )}
            >
              Test Mode
            </button>
            <button
              onClick={() => setMode('LIVE')}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium text-xs",
                isLive ? "bg-emerald-600 text-white shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
              )}
            >
              Live Mode
            </button>
          </div>

          {/* Sandbox Ready Status */}
          <button
            onClick={() => navigate('/connectors')}
            className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-left transition-colors cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div className="leading-tight">
              <span className="text-[11px] font-bold text-emerald-800 block">
                {isLive ? 'Razorpay Live' : 'Sandbox Ready'}
              </span>
              <span className="text-[9px] text-emerald-600 block">
                {isLive ? 'Live processing' : 'Safe environment'}
              </span>
            </div>
          </button>

          {/* Alerts Bell */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors relative cursor-pointer"
            >
              <Bell className="w-4 h-4 text-slate-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 space-y-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <span className="font-bold text-slate-900">Recent Alerts</span>
                  <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-1.5 py-0.5 rounded-md border border-rose-200">2 Action</span>
                </div>
                <div className="space-y-1.5">
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="font-semibold text-slate-800">New Dispute Received</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Order #TXdDsUreQjF6g2 • ₹4,299.00</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="font-semibold text-slate-800">High Risk COD Order</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">PIN 110092 • High return history</p>
                  </div>
                </div>
                <button
                  onClick={() => { setNotificationsOpen(false); navigate('/chargebacks'); }}
                  className="w-full text-center text-xs font-bold text-blue-600 hover:underline pt-1 block cursor-pointer"
                >
                  View All Alerts →
                </button>
              </div>
            )}
          </div>

          {/* Merchant Account */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              M
            </div>
            <div className="hidden sm:flex items-center gap-1 text-xs cursor-pointer">
              <span className="font-bold text-slate-800">Merchant Store</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};
