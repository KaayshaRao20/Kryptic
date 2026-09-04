import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Zap,
  ArrowRight,
  Sparkles,
  Play,
  CheckCircle2,
  Lock,
  ChevronRight,
  CreditCard,
  Search,
  FileText,
  RotateCcw,
  Activity,
  Layers,
  BarChart3,
  ExternalLink,
  Check,
  X,
  Sliders,
  Bell,
  Cpu,
  TrendingUp,
  Package,
  Globe,
  Radio
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'detection' | 'disputes' | 'twin'>('overview');

  return (
    <div className="min-h-screen bg-[#FBFBFE] text-slate-900 font-sans selection:bg-indigo-600 selection:text-white antialiased overflow-x-hidden">
      
      {/* ─── Navigation Header ─── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/85 border-b border-slate-200/80 px-6 lg:px-12 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer group" 
            onClick={() => navigate('/')}
          >
            <div className="relative flex items-center justify-center">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Shield className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-lg font-extrabold tracking-tight text-slate-900">
                Krypt<span className="text-indigo-600">ic</span>
              </span>
            </div>
          </div>

          {/* Nav items */}
          <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-slate-600">
            <a href="#product" className="hover:text-indigo-600 transition-colors">Product</a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">Solutions</a>
            <button onClick={() => navigate('/test-payment')} className="hover:text-indigo-600 transition-colors text-slate-600 font-medium cursor-pointer">
              Live Test Store
            </button>
            <button onClick={() => navigate('/system/evaluation')} className="hover:text-indigo-600 transition-colors text-slate-600 font-medium cursor-pointer">
              Evaluation
            </button>
            <button onClick={() => navigate('/admin/reports')} className="hover:text-indigo-600 transition-colors text-slate-600 font-medium cursor-pointer">
              Resources
            </button>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="text-xs font-semibold text-slate-700 hover:text-slate-950 transition-colors cursor-pointer hidden sm:block"
            >
              Log in
            </button>

            <button
              onClick={() => navigate('/admin/dashboard')}
              className="px-4 py-2 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ─── Hero Section ─── */}
      <section className="relative pt-12 pb-20 px-6 lg:px-12 max-w-7xl mx-auto overflow-hidden">
        
        {/* Soft Ambient Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-indigo-200/40 via-violet-200/30 to-blue-200/40 blur-3xl pointer-events-none -z-10 rounded-full" />
        <div className="absolute top-10 right-10 w-96 h-96 bg-blue-100/50 blur-3xl pointer-events-none -z-10 rounded-full" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-6 space-y-6 text-left">
            
            {/* Top Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/80 border border-slate-200/80 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
              <span>AI-Native • Built for Payments</span>
            </div>

            {/* Massive Bold Headline */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.08]">
                Krypt<span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">ic</span>
              </h1>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-[1.12]">
                Smarter payments.
              </h2>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-[1.12]">
                Safer businesses.
              </h2>
            </div>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
              AI-powered risk intelligence, dispute automation, and payment flow observability — so you can detect threats early, reduce losses, and keep commerce moving.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="px-6 py-3 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer group"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => setShowDemoModal(true)}
                className="px-5 py-3 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-semibold text-xs transition-all shadow-2xs hover:border-slate-300 flex items-center gap-2 cursor-pointer"
              >
                <div className="w-4 h-4 rounded-full bg-slate-950 text-white flex items-center justify-center">
                  <Play className="w-2 h-2 fill-white translate-x-0.2" />
                </div>
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Bottom 3 Mini-Features */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-200/80">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <div className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Shield className="w-3 h-3" />
                  </div>
                  <span>Detect</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">Fraud & anomalies in real-time</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <div className="w-5 h-5 rounded-md bg-violet-50 text-violet-600 flex items-center justify-center">
                    <Zap className="w-3 h-3" />
                  </div>
                  <span>Prevent</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">Losses before they happen</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <TrendingUp className="w-3 h-3" />
                  </div>
                  <span>Grow</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">With trusted, risk-free payments</p>
              </div>
            </div>

          </div>

          {/* Right Hero Visual (3D Crystal Hologram + Floating Metric Cards) */}
          <div className="lg:col-span-6 relative flex items-center justify-center min-h-[420px]">
            
            {/* Center 3D Crystal Prism "K" Artwork */}
            <div className="relative w-72 h-72 sm:w-88 sm:h-88 flex items-center justify-center">
              
              {/* Radial glow backdrop */}
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 via-violet-500/20 to-blue-400/20 rounded-full blur-2xl animate-pulse" />
              
              {/* Orbital Rings */}
              <div className="absolute inset-2 border border-indigo-200/60 rounded-full rotate-45 animate-[spin_40s_linear_infinite]" />
              <div className="absolute inset-8 border border-dashed border-violet-200/50 rounded-full -rotate-12 animate-[spin_60s_linear_infinite_reverse]" />
              
              {/* 3D Geometric Crystal Prism "K" */}
              <svg 
                viewBox="0 0 320 320" 
                className="w-full h-full drop-shadow-[0_20px_35px_rgba(79,70,229,0.25)] relative z-10"
              >
                <defs>
                  {/* Gradients */}
                  <linearGradient id="prismStem" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#818CF8" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#4F46E5" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#312E81" stopOpacity="0.95" />
                  </linearGradient>
                  
                  <linearGradient id="prismTopArm" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.9" />
                    <stop offset="60%" stopColor="#6366F1" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#3730A3" stopOpacity="0.95" />
                  </linearGradient>
                  
                  <linearGradient id="prismBottomArm" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.85" />
                    <stop offset="50%" stopColor="#4338CA" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#1E1B4B" stopOpacity="0.95" />
                  </linearGradient>

                  <linearGradient id="sheen" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
                  </linearGradient>

                  <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Ambient Particles */}
                <circle cx="60" cy="80" r="3" fill="#818CF8" opacity="0.6" className="animate-ping" />
                <circle cx="270" cy="110" r="2.5" fill="#C084FC" opacity="0.8" />
                <circle cx="280" cy="240" r="4" fill="#60A5FA" opacity="0.5" />
                <circle cx="70" cy="250" r="3" fill="#A78BFA" opacity="0.7" />

                {/* Stem Front Face */}
                <polygon points="90,60 135,60 135,260 90,260" fill="url(#prismStem)" filter="url(#softGlow)" />
                {/* Stem Top Bevel */}
                <polygon points="90,60 115,40 160,40 135,60" fill="#C7D2FE" opacity="0.8" />
                {/* Stem Right Bevel */}
                <polygon points="135,60 160,40 160,240 135,260" fill="#3730A3" opacity="0.6" />
                
                {/* Top Diagonal Arm Face */}
                <polygon points="135,160 215,70 250,70 170,160" fill="url(#prismTopArm)" />
                {/* Top Diagonal Arm Sheen */}
                <polygon points="135,160 215,70 230,55 150,145" fill="url(#sheen)" />
                {/* Top Diagonal Right Facet */}
                <polygon points="215,70 250,70 265,55 230,55" fill="#DDD6FE" opacity="0.9" />

                {/* Bottom Diagonal Arm Face */}
                <polygon points="150,150 245,260 210,260 120,160" fill="url(#prismBottomArm)" />
                {/* Bottom Diagonal Arm Highlight */}
                <polygon points="150,150 245,260 260,245 165,135" fill="#1E1B4B" opacity="0.7" />
                {/* Center Core Intersection Glow */}
                <polygon points="135,130 170,160 135,190" fill="#EEF2FF" opacity="0.9" />
              </svg>

              {/* Floating Stat Card 1: Top-Left (Fraud Blocked) */}
              <div className="absolute -top-3 -left-4 sm:-left-8 bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-xl p-3 shadow-lg shadow-slate-200/50 flex items-center gap-3 z-20 hover:scale-105 transition-transform animate-[bounce_6s_ease-in-out_infinite]">
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Fraud Blocked</div>
                  <div className="text-sm font-bold text-slate-900 font-mono">₹8,17,000</div>
                </div>
              </div>

              {/* Floating Stat Card 2: Top-Right (RTO Losses Prevented) */}
              <div className="absolute top-8 -right-4 sm:-right-8 bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-xl p-3 shadow-lg shadow-slate-200/50 flex items-center gap-3 z-20 hover:scale-105 transition-transform animate-[bounce_7s_ease-in-out_infinite_1s]">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">RTO Losses Prevented</div>
                  <div className="text-sm font-bold text-slate-900 font-mono">₹49,690</div>
                </div>
              </div>

              {/* Floating Stat Card 3: Bottom-Right (Disputes Automated) */}
              <div className="absolute -bottom-4 right-0 sm:-right-4 bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-xl p-3 shadow-lg shadow-slate-200/50 flex items-center gap-3 z-20 hover:scale-105 transition-transform animate-[bounce_8s_ease-in-out_infinite_2s]">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Disputes Automated</div>
                  <div className="text-sm font-bold text-slate-900 font-mono">88.5% Win Rate</div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ─── Social Proof / Trusted By Bar ─── */}
      <section className="py-8 bg-white/60 border-y border-slate-200/80 px-6">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
            TRUSTED BY MODERN BUSINESSES
          </span>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 md:gap-20 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all">
            
            {/* Razorpay */}
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-lg tracking-tight">
              <span className="text-[#0C2340] font-extrabold text-xl">Razorpay</span>
            </div>

            {/* Mastercard */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-5 h-5 rounded-full bg-[#EB001B] opacity-90" />
                <div className="w-5 h-5 rounded-full bg-[#F79E1B] opacity-90" />
              </div>
              <span className="text-sm font-bold text-slate-700 tracking-tight">mastercard</span>
            </div>

            {/* UPI */}
            <div className="flex items-center gap-1 font-black text-lg text-slate-800 tracking-wider">
              <div className="w-5 h-5 bg-[#00703C] text-white rounded text-[10px] flex items-center justify-center font-extrabold italic">
                UPI
              </div>
              <span className="text-sm font-bold text-slate-800">UPI</span>
            </div>

            {/* Stripe */}
            <div className="font-bold text-xl text-[#635BFF] tracking-tighter">
              stripe
            </div>

          </div>
        </div>
      </section>

      {/* ─── Product Showcase Section: From Risk to Resilience ─── */}
      <section id="product" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column Text */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              From Risk to Resilience
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
              A complete risk intelligence platform for modern payments.
            </h2>
            
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Kryptic combines machine learning, real-time telemetry, and AI-driven automation to protect every transaction across the payment lifecycle.
            </p>

            <div className="pt-2">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="px-6 py-3 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-sm hover:shadow-md flex items-center gap-2 cursor-pointer group"
              >
                <span>Explore Product</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Column: Interactive Realistic Dashboard Mockup */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-300/40 overflow-hidden">
              
              {/* Dashboard Top Header Bar */}
              <div className="bg-slate-50/80 border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="h-4 w-[1px] bg-slate-200 mx-1" />
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Shield className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Kryptic</span>
                  </div>
                </div>

                {/* Mock Search & Live Pill */}
                <div className="flex items-center gap-2.5">
                  <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-md text-[11px] text-slate-400 w-48">
                    <Search className="w-3 h-3 text-slate-400" />
                    <span className="truncate">Search telemetry...</span>
                  </div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-semibold text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live Mode</span>
                  </div>
                </div>
              </div>

              {/* Dashboard Body Grid */}
              <div className="grid grid-cols-12 min-h-[360px]">
                
                {/* Left Mini Sidebar */}
                <div className="col-span-3 bg-slate-50/50 border-r border-slate-200/80 p-3 hidden sm:flex flex-col justify-between text-[11px]">
                  <div className="space-y-1">
                    <div 
                      onClick={() => setActiveTab('overview')}
                      className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-2 cursor-pointer transition-colors ${activeTab === 'overview' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>Overview</span>
                    </div>
                    <div 
                      onClick={() => setActiveTab('disputes')}
                      className={`px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-2 cursor-pointer transition-colors ${activeTab === 'disputes' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Disputes</span>
                    </div>
                    <div 
                      onClick={() => setActiveTab('detection')}
                      className={`px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-2 cursor-pointer transition-colors ${activeTab === 'detection' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Fraud Detection</span>
                    </div>
                    <div 
                      onClick={() => setActiveTab('twin')}
                      className={`px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-2 cursor-pointer transition-colors ${activeTab === 'twin' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Digital Twin Lab</span>
                    </div>
                    <div className="px-2.5 py-1.5 rounded-lg font-medium text-slate-400 flex items-center gap-2">
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>Reports</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200/80 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-[9px] flex items-center justify-center">
                      MS
                    </div>
                    <div className="truncate leading-tight">
                      <div className="font-semibold text-slate-800 text-[10px] truncate">Merchant Store</div>
                      <div className="text-slate-400 text-[9px] truncate">admin@kryptic.app</div>
                    </div>
                  </div>
                </div>

                {/* Right Main Dashboard Display */}
                <div className="col-span-12 sm:col-span-9 p-4 space-y-4">
                  
                  {/* Top Header Title */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Risk Overview</h3>
                      <p className="text-[11px] text-slate-500">Real-time payment risk across your business</p>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      Last 7 Days
                    </span>
                  </div>

                  {/* 4 Mini KPI Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-200/70">
                      <span className="text-[10px] text-slate-500 block font-medium">Total Transactions</span>
                      <div className="text-base font-bold text-slate-900 font-mono mt-0.5">1,247</div>
                      <span className="text-[9px] text-emerald-600 font-semibold">↑ 8.4% vs yday</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-rose-50/50 border border-rose-200/50">
                      <span className="text-[10px] text-rose-700 block font-medium">High Risk</span>
                      <div className="text-base font-bold text-rose-900 font-mono mt-0.5">23 (1.8%)</div>
                      <span className="text-[9px] text-emerald-600 font-semibold">↓ 22% vs yday</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-200/70">
                      <span className="text-[10px] text-slate-500 block font-medium">Disputes</span>
                      <div className="text-base font-bold text-slate-900 font-mono mt-0.5">7</div>
                      <span className="text-[9px] text-slate-500">Standard review</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-200/70">
                      <span className="text-[10px] text-slate-500 block font-medium">RTO Risk Orders</span>
                      <div className="text-base font-bold text-slate-900 font-mono mt-0.5">86</div>
                      <span className="text-[9px] text-amber-600 font-semibold">↑ 12% vs yday</span>
                    </div>
                  </div>

                  {/* Interactive Dynamic SVG Line Chart */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-800">Transaction Volume & Risk Trend</span>
                      <div className="flex items-center gap-3 text-[10px]">
                        <span className="flex items-center gap-1 text-blue-600 font-medium">
                          <span className="w-2 h-2 rounded-full bg-blue-600" /> Total
                        </span>
                        <span className="flex items-center gap-1 text-rose-600 font-medium">
                          <span className="w-2 h-2 rounded-full bg-rose-500" /> High-Risk
                        </span>
                        <span className="flex items-center gap-1 text-amber-600 font-medium">
                          <span className="w-2 h-2 rounded-full bg-amber-500" /> Disputes
                        </span>
                      </div>
                    </div>

                    {/* SVG Chart Graphic */}
                    <div className="h-28 w-full">
                      <svg viewBox="0 0 400 120" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Grid Lines */}
                        <line x1="0" y1="25" x2="400" y2="25" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                        <line x1="0" y1="65" x2="400" y2="65" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                        <line x1="0" y1="100" x2="400" y2="100" stroke="#F1F5F9" strokeWidth="1" />

                        {/* Volume Area Gradient Fill */}
                        <polygon 
                          points="0,90 60,78 120,60 180,68 240,40 300,32 360,28 400,22 400,105 0,105" 
                          fill="url(#chartGlow)" 
                        />

                        {/* Total Volume Line (Blue) */}
                        <polyline
                          fill="none"
                          stroke="#3B82F6"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points="0,90 60,78 120,60 180,68 240,40 300,32 360,28 400,22"
                        />

                        {/* High Risk Line (Rose) */}
                        <polyline
                          fill="none"
                          stroke="#EF4444"
                          strokeWidth="1.5"
                          strokeDasharray="4 3"
                          points="0,102 60,100 120,95 180,98 240,92 300,88 360,86 400,80"
                        />

                        {/* Nodes / Dots on Line */}
                        <circle cx="120" cy="60" r="3" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="1.5" />
                        <circle cx="240" cy="40" r="3" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="1.5" />
                        <circle cx="360" cy="28" r="3" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="1.5" />
                      </svg>
                    </div>

                    {/* X-Axis Labels */}
                    <div className="flex justify-between text-[9px] text-slate-400 font-mono pt-1">
                      <span>Aug 28</span>
                      <span>Aug 29</span>
                      <span>Aug 30</span>
                      <span>Sep 1</span>
                      <span>Sep 2</span>
                      <span>Sep 3</span>
                      <span>Sep 4</span>
                    </div>

                  </div>

                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ─── "How It Works" 5-Step Process Section ─── */}
      <section id="how-it-works" className="py-20 px-6 lg:px-12 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Section Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              How It Works
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              From alert to action in seconds
            </h2>
            <p className="text-sm text-slate-600">
              Kryptic turns complex payment data into clear, actionable intelligence.
            </p>
          </div>

          {/* 5-Step Flow Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative">
            
            {/* Step 1: Detect */}
            <div className="p-5 rounded-2xl bg-slate-50/60 border border-slate-200/80 space-y-3 hover:bg-white hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Detect</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  AI models analyze every transaction in real-time.
                </p>
              </div>
            </div>

            {/* Step 2: Investigate */}
            <div className="p-5 rounded-2xl bg-slate-50/60 border border-slate-200/80 space-y-3 hover:bg-white hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Investigate</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Deep customer and transaction insights in one click.
                </p>
              </div>
            </div>

            {/* Step 3: Localize */}
            <div className="p-5 rounded-2xl bg-slate-50/60 border border-slate-200/80 space-y-3 hover:bg-white hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Localize</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Digital Twin pinpoints the exact layer of failure.
                </p>
              </div>
            </div>

            {/* Step 4: Respond */}
            <div className="p-5 rounded-2xl bg-slate-50/60 border border-slate-200/80 space-y-3 hover:bg-white hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Respond</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Automate dispute defense and risk mitigation.
                </p>
              </div>
            </div>

            {/* Step 5: Audit */}
            <div className="p-5 rounded-2xl bg-slate-50/60 border border-slate-200/80 space-y-3 hover:bg-white hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Audit</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Complete logs, reports, and model explainability.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── Bottom CTA Card Banner: "Built For What's Next" ─── */}
      <section className="py-16 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 lg:p-16 overflow-hidden shadow-2xl">
          
          {/* Ambient Cosmic Radial Orbs */}
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 right-10 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-semibold text-indigo-200 uppercase tracking-wider">
                Built For What's Next
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                Let's make payments safer, together.
              </h2>

              <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                Join merchants and fintechs using Kryptic to stay ahead of fraud, reduce losses, and build more trusted payment experiences.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => navigate('/admin/dashboard')}
                  className="px-6 py-3 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => navigate('/connectors')}
                  className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-xs transition-all cursor-pointer"
                >
                  Talk to Us
                </button>
              </div>
            </div>

            {/* Right Sphere Artwork & Key Impact Pillars */}
            <div className="lg:col-span-5 flex flex-col sm:flex-row items-center justify-between gap-6">
              
              {/* Planetary Orb SVG */}
              <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-400 opacity-30 blur-lg animate-pulse" />
                <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-400 via-violet-300 to-white shadow-inner flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-radial from-white/40 via-transparent to-transparent opacity-80" />
                </div>
                {/* Orbit Rings */}
                <div className="absolute inset-0 border border-white/30 rounded-full rotate-45" />
                <div className="absolute -inset-2 border border-dashed border-indigo-400/40 rounded-full -rotate-12" />
              </div>

              {/* 3 Impact Pillars */}
              <div className="space-y-4 text-left sm:text-left w-full sm:w-auto">
                <div className="space-y-0.5">
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>More Revenue Protected</span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-400" />
                    <span>Fewer Fraud Losses</span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <Check className="w-4 h-4 text-violet-400" />
                    <span>A Safer Digital Economy</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-slate-200/80 py-10 px-6 lg:px-12 bg-white text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-slate-950 text-white flex items-center justify-center font-bold text-xs">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm">Kryptic</span>
              <p className="text-[11px] text-slate-400">AI Payment Risk & Fraud Intelligence</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 font-medium">
            <button onClick={() => navigate('/admin/dashboard')} className="hover:text-indigo-600 transition-colors cursor-pointer">
              Dashboard
            </button>
            <button onClick={() => navigate('/chargebacks')} className="hover:text-indigo-600 transition-colors cursor-pointer">
              Disputes
            </button>
            <button onClick={() => navigate('/returns')} className="hover:text-indigo-600 transition-colors cursor-pointer">
              Order Risk
            </button>
            <button onClick={() => navigate('/twin')} className="hover:text-indigo-600 transition-colors cursor-pointer">
              Digital Twin
            </button>
            <button onClick={() => navigate('/test-payment')} className="hover:text-indigo-600 transition-colors cursor-pointer text-indigo-600 font-semibold">
              Live Test Store
            </button>
          </div>

          <div className="text-[11px] text-slate-400">
            © {new Date().getFullYear()} Kryptic. Built for modern payment networks.
          </div>
        </div>
      </footer>

      {/* ─── Interactive Demo Modal ─── */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Play className="w-3.5 h-3.5 fill-indigo-600" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Kryptic Platform Walkthrough</h3>
              </div>
              <button 
                onClick={() => setShowDemoModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                Experience Kryptic's real-time risk scoring, automated chargeback defense generator, and live Razorpay transaction telemetry in the live console.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => { setShowDemoModal(false); navigate('/admin/dashboard'); }}
                  className="p-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-500 hover:shadow-xs text-left cursor-pointer transition-all"
                >
                  <div className="font-bold text-xs text-slate-900">1. Real-time Risk Overview</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Explore fraud metrics and live telemetry</div>
                </button>
                <button
                  onClick={() => { setShowDemoModal(false); navigate('/test-payment'); }}
                  className="p-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-500 hover:shadow-xs text-left cursor-pointer transition-all"
                >
                  <div className="font-bold text-xs text-slate-900">2. Live Razorpay Test Store</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Test real payments & instant risk evaluation</div>
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDemoModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => { setShowDemoModal(false); navigate('/admin/dashboard'); }}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5"
              >
                <span>Launch Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
