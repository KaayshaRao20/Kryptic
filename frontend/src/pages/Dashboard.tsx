import React from 'react';
import { useTwinEngine } from '../features/twin/TwinContext';
import { TwinCanvas } from '../components/twin/TwinCanvas';
import { Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';

export const Dashboard: React.FC = () => {
  const { topology } = useTwinEngine();

  const metrics = React.useMemo(() => {
    if (!topology) return { total: 0, critical: 0, warning: 0, healthy: 0, processing: 0 };
    
    return topology.nodes.reduce((acc, node) => {
      acc.total++;
      if (node.status === 'CRITICAL') acc.critical++;
      else if (node.status === 'ANOMALOUS') acc.warning++;
      else if (node.status === 'HEALTHY') acc.healthy++;
      else if (node.status === 'PROCESSING') acc.processing++;
      return acc;
    }, { total: 0, critical: 0, warning: 0, healthy: 0, processing: 0 });
  }, [topology]);

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary tracking-tight">System Overview</h1>
          <p className="text-sm text-textSecondary mt-1">Payment Flow Digital Twin - Real-time monitoring</p>
        </div>
        <div className="flex items-center gap-6 bg-surface px-4 py-2 rounded-lg border border-secondary shadow-sm">
          <div className="flex flex-col items-end">
            <span className="text-xs text-textSecondary uppercase font-semibold">Active Anomalies</span>
            <span className={cn("text-lg font-bold font-mono", metrics.critical > 0 || metrics.warning > 0 ? "text-riskRed" : "text-textPrimary")}>
              {metrics.critical + metrics.warning}
            </span>
          </div>
          <div className="w-px h-8 bg-secondary" />
          <div className="flex flex-col items-end">
            <span className="text-xs text-textSecondary uppercase font-semibold">System Health</span>
            <div className="flex items-center gap-2 mt-0.5">
              <div className={cn("h-2 w-2 rounded-full animate-pulse", metrics.critical > 0 ? "bg-riskRed" : "bg-healthGreen")} />
              <span className={cn("text-sm font-medium", metrics.critical > 0 ? "text-riskRed" : "text-healthGreen")}>
                {metrics.critical > 0 ? 'Degraded' : 'Online'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[500px]">
        <TwinCanvas />
      </div>
      
      <div className="grid grid-cols-4 gap-4 h-32">
         {/* Placeholder for small metric cards below the twin */}
         <MetricCard title="Transactions Processed" value="1.2M" subvalue="+12% today" icon={<Activity className="text-techBlue w-5 h-5" />} />
         <MetricCard title="Avg Detection Latency" value="215 ms" subvalue="-15ms vs yesterday" icon={<Activity className="text-techBlue w-5 h-5" />} />
         <MetricCard title="Threat Interceptions" value="8,432" subvalue="99.8% precision" icon={<ShieldCheck className="text-healthGreen w-5 h-5" />} />
         <MetricCard title="High Risk Events" value="12" subvalue="Requires review" icon={<AlertTriangle className="text-riskRed w-5 h-5" />} />
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, subvalue, icon }: { title: string, value: string, subvalue: string, icon: React.ReactNode }) => (
  <div className="bg-surface rounded-xl border border-secondary p-4 flex flex-col justify-between shadow-sm">
    <div className="flex justify-between items-start">
      <span className="text-xs font-semibold text-textSecondary uppercase">{title}</span>
      {icon}
    </div>
    <div>
      <div className="text-2xl font-bold font-mono text-textPrimary">{value}</div>
      <div className="text-xs font-medium text-textSecondary mt-1">{subvalue}</div>
    </div>
  </div>
)
