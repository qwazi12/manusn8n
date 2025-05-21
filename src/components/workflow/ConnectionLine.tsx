// src/components/workflow/ConnectionLine.tsx
import React from 'react';
import { WorkflowNode } from './types';

interface ConnectionLineProps {
  sourceNode: WorkflowNode;
  targetNode: WorkflowNode;
  sourceHandle: string;
  targetHandle: string;
}

export const ConnectionLine: React.FC<ConnectionLineProps> = ({
  sourceNode,
  targetNode,
  sourceHandle,
  targetHandle
}) => {
  // Calculate source and target positions
  const sourcePosition = {
    x: sourceNode.position[0] + 200, // Right side of source node
    y: sourceNode.position[1] + 50,  // Middle of source node
  };
  
  const targetPosition = {
    x: targetNode.position[0],       // Left side of target node
    y: targetNode.position[1] + 50,  // Middle of target node
  };
  
  // Calculate control points for the bezier curve
  const sourceControlX = sourcePosition.x + Math.min(80, (targetPosition.x - sourcePosition.x) * 0.4);
  const targetControlX = targetPosition.x - Math.min(80, (targetPosition.x - sourcePosition.x) * 0.4);
  
  // Create SVG path
  const path = `
    M ${sourcePosition.x},${sourcePosition.y}
    C ${sourceControlX},${sourcePosition.y} ${targetControlX},${targetPosition.y} ${targetPosition.x},${targetPosition.y}
  `;
  
  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <path
        d={path}
        stroke="#888"
        strokeWidth={2}
        fill="none"
        strokeDasharray={sourceHandle === 'error' || targetHandle === 'error' ? '5,5' : 'none'}
        markerEnd="url(#arrowhead)"
      />
      
      {/* Arrow marker definition */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#888" />
        </marker>
      </defs>
    </svg>
  );
};
