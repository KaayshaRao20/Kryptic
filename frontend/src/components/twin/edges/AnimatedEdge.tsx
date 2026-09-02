import React from 'react';
import { BaseEdge, getBezierPath } from 'reactflow';
import type { EdgeProps } from 'reactflow';

export const AnimatedEdge: React.FC<EdgeProps> = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const status = data?.status || 'ACTIVE';

  let strokeColor = '#687276'; // textSecondary
  let animate = false;
  let dasharray = '';

  if (status === 'ACTIVE') {
    strokeColor = '#557CFF'; // techBlue
    animate = true;
    dasharray = '5 5';
  } else if (status === 'WARNING') {
    strokeColor = '#B95D63'; // riskRed
    animate = true;
    dasharray = '5 5';
  } else if (status === 'INACTIVE') {
    strokeColor = '#F0F3F2'; // secondary
  }

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: 2,
          stroke: strokeColor,
          strokeDasharray: dasharray,
          animation: animate ? 'dash 1.5s linear infinite' : undefined,
        }}
      />
      {/* We need to define animate-dash in tailwind config or index.css */}
    </>
  );
};
