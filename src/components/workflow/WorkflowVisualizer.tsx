// src/components/workflow/WorkflowVisualizer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { NodeComponent } from './NodeComponent';
import { ConnectionLine } from './ConnectionLine';
import { WorkflowControls } from './WorkflowControls';
import { NodeControls } from './NodeControls';
import { WorkflowNode, WorkflowConnection } from './types';

interface WorkflowVisualizerProps {
  workflow: {
    nodes: WorkflowNode[];
    connections: WorkflowConnection[];
  };
  onSave?: () => void;
  onExport?: () => void;
  readOnly?: boolean;
}

export const WorkflowVisualizer: React.FC<WorkflowVisualizerProps> = ({
  workflow,
  onSave,
  onExport,
  readOnly = true
}) => {
  const [nodes, setNodes] = useState<WorkflowNode[]>(workflow.nodes);
  const [connections, setConnections] = useState<WorkflowConnection[]>(workflow.connections);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastPosition = useRef({ x: 0, y: 0 });

  // Update nodes and connections when workflow changes
  useEffect(() => {
    setNodes(workflow.nodes);
    setConnections(workflow.connections);
  }, [workflow]);

  // Handle node selection
  const handleNodeSelect = (nodeId: string) => {
    if (readOnly) return;
    setSelectedNode(nodeId === selectedNode ? null : nodeId);
  };

  // Handle node movement
  const handleNodeMove = (nodeId: string, position: [number, number]) => {
    if (readOnly) return;
    setNodes(nodes.map(node => 
      node.id === nodeId ? { ...node, position } : node
    ));
  };

  // Handle zoom
  const handleZoom = (delta: number) => {
    setScale(prevScale => {
      const newScale = Math.max(0.5, Math.min(2, prevScale + delta * 0.1));
      return newScale;
    });
  };

  // Handle pan start
  const handlePanStart = (e: React.MouseEvent) => {
    if (e.button !== 1 && e.button !== 0) return; // Middle mouse or left mouse with alt
    if (e.button === 0 && !e.altKey) return;
    
    isDragging.current = true;
    lastPosition.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  };

  // Handle pan move
  const handlePanMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    
    const dx = e.clientX - lastPosition.current.x;
    const dy = e.clientY - lastPosition.current.y;
    
    setPosition(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));
    
    lastPosition.current = { x: e.clientX, y: e.clientY };
  };

  // Handle pan end
  const handlePanEnd = () => {
    isDragging.current = false;
  };

  // Reset view
  const handleResetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="workflow-visualizer-container">
      <div 
        ref={containerRef}
        className="workflow-canvas"
        style={{ 
          position: 'relative', 
          overflow: 'hidden',
          height: '600px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9'
        }}
        onMouseDown={handlePanStart}
        onMouseMove={handlePanMove}
        onMouseUp={handlePanEnd}
        onMouseLeave={handlePanEnd}
        onWheel={(e) => handleZoom(e.deltaY > 0 ? -1 : 1)}
      >
        <div 
          className="workflow-transform"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            position: 'absolute',
            transition: isDragging.current ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          {/* Render connections */}
          {connections.map(connection => {
            const sourceNode = nodes.find(n => n.id === connection.source);
            const targetNode = nodes.find(n => n.id === connection.target);
            
            if (!sourceNode || !targetNode) return null;
            
            return (
              <ConnectionLine
                key={`${connection.source}-${connection.target}`}
                sourceNode={sourceNode}
                targetNode={targetNode}
                sourceHandle={connection.sourceHandle}
                targetHandle={connection.targetHandle}
              />
            );
          })}
          
          {/* Render nodes */}
          {nodes.map(node => (
            <NodeComponent
              key={node.id}
              node={node}
              isSelected={node.id === selectedNode}
              onSelect={() => handleNodeSelect(node.id)}
              onMove={(position) => handleNodeMove(node.id, position)}
              readOnly={readOnly}
            />
          ))}
        </div>
      </div>
      
      {/* Controls */}
      <WorkflowControls
        onZoomIn={() => handleZoom(1)}
        onZoomOut={() => handleZoom(-1)}
        onReset={handleResetView}
        onSave={onSave}
        onExport={onExport}
        scale={scale}
        readOnly={readOnly}
      />
      
      {/* Node controls (when a node is selected) */}
      {selectedNode && !readOnly && (
        <NodeControls
          node={nodes.find(n => n.id === selectedNode)!}
          onUpdate={(updatedNode) => {
            setNodes(nodes.map(n => 
              n.id === selectedNode ? { ...n, ...updatedNode } : n
            ));
          }}
          onDelete={() => {
            setNodes(nodes.filter(n => n.id !== selectedNode));
            setConnections(connections.filter(c => 
              c.source !== selectedNode && c.target !== selectedNode
            ));
            setSelectedNode(null);
          }}
        />
      )}
    </div>
  );
};
