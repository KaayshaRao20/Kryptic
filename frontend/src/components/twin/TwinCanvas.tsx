import React, { useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import type { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { useTwinEngine } from '../../features/twin/TwinContext';
import { BaseTwinNode } from './nodes/BaseTwinNode';
import { AnimatedEdge } from './edges/AnimatedEdge';
import type { TwinTopology } from '../../types';

const nodeTypes = {
  twinNode: BaseTwinNode,
};

const edgeTypes = {
  animatedEdge: AnimatedEdge,
};

// Auto-layout logic will go here eventually.
// For Phase 3, we'll manually position nodes since we don't have a complex auto-layout engine yet, 
// or use a simple heuristic.
const calculateLayout = (topology: TwinTopology): { nodes: Node[], edges: Edge[] } => {
  const rfNodes: Node[] = topology.nodes.map((n, i) => ({
    id: n.id,
    type: 'twinNode',
    data: n,
    position: { x: 100 + (i * 250), y: 250 + (i % 2 === 0 ? -50 : 50) },
  }));

  const rfEdges: Edge[] = topology.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: 'animatedEdge',
    data: { status: e.status },
  }));

  return { nodes: rfNodes, edges: rfEdges };
};

export const TwinCanvas: React.FC = () => {
  const { topology, isLoading } = useTwinEngine();

  const layoutData = useMemo(() => {
    if (!topology) return { nodes: [] as Node[], edges: [] as Edge[] };
    return calculateLayout(topology);
  }, [topology]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutData.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutData.edges);

  // Update local state when topology changes
  React.useEffect(() => {
    if (topology) {
      const { nodes: n, edges: e } = calculateLayout(topology);
      setNodes(n);
      setEdges(e);
    }
  }, [topology, setNodes, setEdges]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm rounded-xl">
        <div className="w-8 h-8 border-4 border-techBlue border-t-transparent rounded-full animate-spin" />
        <span className="mt-4 text-textSecondary font-medium">Initializing Twin Engine...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-background rounded-xl overflow-hidden relative border border-secondary">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="bottom-right"
        className="bg-background"
      >
        <Background color="#687276" gap={16} size={1} />
        <Controls className="bg-surface border-secondary shadow-sm" />
        <MiniMap 
          nodeColor={(n) => {
            if (n.data?.status === 'CRITICAL') return '#B95D63';
            if (n.data?.status === 'ANOMALOUS') return '#B95D63';
            if (n.data?.status === 'PROCESSING') return '#557CFF';
            return '#4E9B78';
          }}
          maskColor="rgba(247, 248, 247, 0.6)"
          className="bg-surface border border-secondary rounded-lg shadow-sm"
        />
      </ReactFlow>
    </div>
  );
};
