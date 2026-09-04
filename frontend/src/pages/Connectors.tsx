import React, { useState, useEffect } from 'react';
import {
  Key,
  Shield,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Lock,
  Globe,
  FileText
} from 'lucide-react';
import { settingsService, type KeyStatusResponse, type ConnectionTestResult } from '../services/SettingsService';
import { useEnvironment } from '../context/EnvironmentContext';
import { cn } from '../lib/utils';

export const Connectors: React.FC = () => {
  const { isLive } = useEnvironment();
  const [keyStatus, setKeyStatus] = useState<KeyStatusResponse | null>(null);
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  const [razorpayKeySecret, setRazorpayKeySecret] = useState('');
  const [razorpayWebhookSecret, setRazorpayWebhookSecret] = useState('');
  const [showSecrets, setShowSecrets] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Dynamic production webhook URL
  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/v1/razorpay/webhook`
    : 'https://kryptic-sooty.vercel.app/api/v1/razorpay/webhook';

  useEffect(() => {
    loadKeyStatus();
  }, []);

  const loadKeyStatus = async () => {
    setLoading(true);
    try {
      const status = await settingsService.getKeyStatus();
      setKeyStatus(status);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage(null);
    try {
      await settingsService.updateKeys({
        razorpay_key_id: razorpayKeyId || undefined,
        razorpay_key_secret: razorpayKeySecret || undefined,
        razorpay_webhook_secret: razorpayWebhookSecret || undefined
      });
      setSaveMessage('Razorpay credentials updated and saved successfully.');
      await loadKeyStatus();
      handleTestConnection();
    } catch (err: any) {
      alert(`Failed to save credentials: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const res = await settingsService.testConnection();
      setTestResult(res);
    } catch (err: any) {
      alert(`Connection test failed: ${err.message}`);
    } finally {
      setTesting(false);
    }
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 font-sans text-slate-800">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Razorpay Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your Razorpay API credentials and webhook integrations for payment fraud screening and dispute defense.
          </p>
        </div>

        <button
          onClick={handleTestConnection}
          disabled={testing}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", testing && "animate-spin")} />
          {testing ? 'Verifying Credentials...' : 'Test Connection'}
        </button>
      </div>

      {/* ─── Status Cards ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Razorpay Gateway Status */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Razorpay Gateway</h3>
                <span className="text-[11px] text-slate-400">Payment & Dispute Feed</span>
              </div>
            </div>
            <span className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border",
              keyStatus?.razorpay_configured ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-sky-50 text-sky-700 border-sky-200"
            )}>
              {keyStatus?.razorpay_configured ? 'Live Connected' : 'Sandbox Mode'}
            </span>
          </div>

          <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-mono">
            Active Key: {keyStatus?.razorpay_key_id_masked || 'rzp_test_TWpQ...rD9'}
          </div>

          {testResult?.razorpay && (
            <div className={cn(
              "p-2.5 rounded-lg text-xs flex items-center gap-2",
              testResult.razorpay.success ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"
            )}>
              {testResult.razorpay.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
              <span>{testResult.razorpay.message}</span>
            </div>
          )}
        </div>

        {/* Dispute Evidence Engine Status */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Dispute Evidence Engine</h3>
                <span className="text-[11px] text-slate-400">Automated Rebuttal Synthesis</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active
            </span>
          </div>

          <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            Automated courier e-POD matching and 3DS2 liability shift verification enabled.
          </div>
        </div>
      </div>

      {/* ─── Credentials Input Form (Razorpay Keys Only) ─── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600" />
              Razorpay API Credentials
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter test or live keys from your Razorpay Merchant Dashboard.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowSecrets(!showSecrets)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
          >
            {showSecrets ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-blue-600" />}
            {showSecrets ? 'Hide' : 'Reveal'}
          </button>
        </div>

        {saveMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveMessage}</span>
          </div>
        )}

        <form onSubmit={handleSaveKeys} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Razorpay Key ID</label>
              <input
                type={showSecrets ? "text" : "password"}
                placeholder="rzp_test_TWpQWcihNk3rD9"
                value={razorpayKeyId}
                onChange={e => setRazorpayKeyId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-1 focus:ring-slate-400 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Razorpay Key Secret</label>
              <input
                type={showSecrets ? "text" : "password"}
                placeholder="••••••••••••••••••••••••"
                value={razorpayKeySecret}
                onChange={e => setRazorpayKeySecret(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-1 focus:ring-slate-400 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Razorpay Webhook Secret (Optional)</label>
            <input
              type={showSecrets ? "text" : "password"}
              placeholder="Secret for verifying incoming webhook signatures"
              value={razorpayWebhookSecret}
              onChange={e => setRazorpayWebhookSecret(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-1 focus:ring-slate-400 focus:outline-none font-mono"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Razorpay Keys'}
            </button>
          </div>
        </form>
      </div>

      {/* ─── Webhook Endpoint Card (Dynamic Clean URL) ─── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Razorpay Webhook Listener</h3>
        <p className="text-xs text-slate-500">
          Paste this endpoint URL into your <span className="font-semibold text-slate-700">Razorpay Dashboard → Settings → Webhooks</span> to stream live chargeback & payment events:
        </p>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2 rounded-lg font-mono text-xs text-slate-800">
          <span className="flex-1 truncate">{webhookUrl}</span>
          <button
            onClick={handleCopyWebhook}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded-md text-slate-700 font-semibold text-xs cursor-pointer shadow-2xs"
          >
            <Copy className="w-3.5 h-3.5" />
            {copiedWebhook ? 'Copied' : 'Copy'}
          </button>
        </div>

        <div className="text-[11px] text-slate-400">
          Supported Events: <code className="text-slate-600 font-semibold">payment.captured</code>, <code className="text-slate-600 font-semibold">payment.failed</code>, <code className="text-slate-600 font-semibold">dispute.created</code>, <code className="text-slate-600 font-semibold">dispute.won</code>
        </div>
      </div>
    </div>
  );
};
