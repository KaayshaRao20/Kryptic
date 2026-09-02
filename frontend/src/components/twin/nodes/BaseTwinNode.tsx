import React from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Loader2, ShieldAlert } from 'lucide-react';
import type { TwinNode, NodeStatus } from '../../../types';
import { cn } from '../../../lib/utils';

interface BaseTwinNodeProps extends NodeProps {
  data: TwinNode;
}

const statusConfig: Record<NodeStatus, { color: string, bg: string, icon: React.ElementType, pulse?: boolean }> = {
  HEALTHY: { color: 'text-healthGreen', bg: 'bg-healthGreen/10 border-healthGreen/30', icon: CheckCircle2 },
  PROCESSING: { color: 'text-techBlue', bg: 'bg-techBlue/10 border-techBlue/30', icon: Loader2, pulse: true },
  ANOMALOUS: { color: 'text-riskRed', bg: 'bg-riskRed/10 border-riskRed/50', icon: ShieldAlert, pulse: true },
  CRITICAL: { color: 'text-riskRed', bg: 'bg-riskRed border-riskRed text-white', icon: AlertTriangle, pulse: true },
};

export const BaseTwinNode: React.FC<BaseTwinNodeProps> = ({ data, selected }) => {
  const config = statusConfig[data.status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "relative rounded-xl border-2 p-4 shadow-sm transition-all duration-300 w-48 bg-surface backdrop-blur-md",
        config.bg,
        selected ? 'ring-2 ring-techBlue ring-offset-2' : ''
      )}
    >
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-textSecondary border-none" />
      
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold tracking-wider text-textPrimary uppercase">
            {data.name}
          </span>
          <Icon className={cn("w-4 h-4", config.color, config.pulse && data.status === 'PROCESSING' && "animate-spin")} />
        </div>
        
        <div className="flex flex-col gap-1 mt-2">
          {data.metrics?.tps !== undefined && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-textSecondary">TPS</span>
              <span className="font-mono font-medium">{data.metrics.tps.toLocaleString()}</span>
            </div>
          )}
          {data.metrics?.riskScore !== undefined && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-textSecondary">Risk</span>
              <span className={cn("font-mono font-medium", data.metrics.riskScore > 50 ? 'text-riskRed' : 'text-healthGreen')}>
                {data.metrics.riskScore.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>
      
      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-textSecondary border-none" />
      
      {/* Pulse effect for anomalous/critical nodes */}
      {config.pulse && data.status !== 'PROCESSING' && (
        <div className={cn("absolute -inset-1 rounded-xl opacity-20 animate-ping", 
          data.status === 'CRITICAL' ? 'bg-riskRed' : 'bg-riskRed/50'
        )} />
      )}
    </motion.div>
  );
};
