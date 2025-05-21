// src/components/workflow/NodeComponent.tsx
import React, { useState } from 'react';
import { WorkflowNode } from './types';

interface NodeComponentProps {
  node: WorkflowNode;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (position: [number, number]) => void;
  readOnly: boolean;
}

export const NodeComponent: React.FC<NodeComponentProps> = ({
  node,
  isSelected,
  onSelect,
  onMove,
  readOnly
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Get node type information
  const getNodeTypeInfo = (type: string) => {
    // PLACEHOLDER: Replace with actual node type information
    // INTEGRATION: This should fetch node type information from a registry
    
    // Default node type info
    return {
      name: type.split('.').pop() || type,
      color: '#3498db',
      icon: '⚙️'
    };
  };

  const nodeTypeInfo = getNodeTypeInfo(node.type);

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (readOnly) return;
    
    e.stopPropagation();
    onSelect();
    
    // Only start drag with left mouse button
    if (e.button !== 0) return;
    
    setIsDragging(true);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const x = e.clientX - dragOffset.x;
    const y = e.clientY - dragOffset.y;
    
    // Convert to workflow coordinates (accounting for parent transform)
    const parent = (e.target as HTMLElement).closest('.workflow-transform');
    const scale = parent ? parseFloat(parent.style.transform.match(/scale\(([^)]+)\)/)?.[1] || '1') : 1;
    
    onMove([
      (x - (parent?.offsetLeft || 0)) / scale,
      (y - (parent?.offsetTop || 0)) / scale
    ]);
  };

  // Handle mouse up for dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add event listeners for dragging
  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      className={`workflow-node ${isSelected ? 'selected' : ''}`}
      style={{
        position: 'absolute',
        left: `${node.position[0]}px`,
        top: `${node.position[1]}px`,
        width: '200px',
        padding: '10px',
        backgroundColor: 'white',
        border: `2px solid ${isSelected ? '#2ecc71' : nodeTypeInfo.color}`,
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        cursor: readOnly ? 'default' : 'move',
        zIndex: isSelected ? 10 : 1,
        userSelect: 'none'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="node-header" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '8px',
        borderBottom: `1px solid ${nodeTypeInfo.color}`,
        paddingBottom: '8px'
      }}>
        <div className="node-icon" style={{ 
          marginRight: '8px',
          fontSize: '18px'
        }}>
          {nodeTypeInfo.icon}
        </div>
        <div className="node-title" style={{ 
          fontWeight: 'bold',
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {node.name || nodeTypeInfo.name}
        </div>
      </div>
      
      <div className="node-content" style={{ fontSize: '12px' }}>
        {/* Display node parameters */}
        {Object.entries(node.parameters).length > 0 ? (
          <div className="node-parameters">
            {Object.entries(node.parameters).map(([key, value]) => (
              <div key={key} className="parameter-row" style={{ 
                display: 'flex',
                marginBottom: '4px'
              }}>
                <div className="parameter-name" style={{ 
                  fontWeight: 'bold',
                  marginRight: '8px',
                  flex: '0 0 40%'
                }}>
                  {key}:
                </div>
                <div className="parameter-value" style={{ 
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {typeof value === 'object' 
                    ? JSON.stringify(value).substring(0, 20) + '...'
                    : String(value).substring(0, 20) + (String(value).length > 20 ? '...' : '')
                  }
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-parameters" style={{ 
            fontStyle: 'italic',
            color: '#999'
          }}>
            No parameters
          </div>
        )}
      </div>
      
      {/* Input and output handles */}
      <div className="input-handle" style={{
        position: 'absolute',
        left: '-10px',
        top: '50%',
        width: '20px',
        height: '20px',
        backgroundColor: nodeTypeInfo.color,
        borderRadius: '50%',
        transform: 'translateY(-50%)',
        border: '2px solid white',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)'
      }} />
      
      <div className="output-handle" style={{
        position: 'absolute',
        right: '-10px',
        top: '50%',
        width: '20px',
        height: '20px',
        backgroundColor: nodeTypeInfo.color,
        borderRadius: '50%',
        transform: 'translateY(-50%)',
        border: '2px solid white',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)'
      }} />
    </div>
  );
};
