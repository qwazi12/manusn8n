// src/components/workflow/NodeControls.tsx
import React from 'react';
import { WorkflowNode } from './types';

interface NodeControlsProps {
  node: WorkflowNode;
  onUpdate: (updatedNode: Partial<WorkflowNode>) => void;
  onDelete: () => void;
}

export const NodeControls: React.FC<NodeControlsProps> = ({
  node,
  onUpdate,
  onDelete
}) => {
  // Handle parameter change
  const handleParameterChange = (name: string, value: any) => {
    const updatedParameters = {
      ...node.parameters,
      [name]: value
    };
    
    onUpdate({ parameters: updatedParameters });
  };

  // Handle node name change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ name: e.target.value });
  };

  return (
    <div className="node-controls" style={{
      marginTop: '10px',
      padding: '15px',
      backgroundColor: '#f9f9f9',
      border: '1px solid #ddd',
      borderRadius: '8px'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Node Settings</h3>
      
      <div className="control-group" style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Node Name
        </label>
        <input
          type="text"
          value={node.name || ''}
          onChange={handleNameChange}
          placeholder="Node Name"
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        />
      </div>
      
      <div className="control-group" style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Node Type
        </label>
        <div style={{
          padding: '8px',
          backgroundColor: '#eee',
          borderRadius: '4px',
          fontFamily: 'monospace'
        }}>
          {node.type}
        </div>
      </div>
      
      <div className="control-group">
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Parameters
        </label>
        
        {Object.entries(node.parameters).map(([key, value]) => (
          <div key={key} style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '3px' }}>
              {key}
            </label>
            
            {typeof value === 'boolean' ? (
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => handleParameterChange(key, e.target.checked)}
                style={{ marginRight: '5px' }}
              />
            ) : typeof value === 'number' ? (
              <input
                type="number"
                value={value}
                onChange={(e) => handleParameterChange(key, Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            ) : typeof value === 'string' ? (
              <input
                type="text"
                value={value}
                onChange={(e) => handleParameterChange(key, e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            ) : (
              <textarea
                value={JSON.stringify(value, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    handleParameterChange(key, parsed);
                  } catch (error) {
                    // Invalid JSON, don't update
                  }
                }}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  minHeight: '100px'
                }}
              />
            )}
          </div>
        ))}
      </div>
      
      <div className="control-actions" style={{ marginTop: '20px' }}>
        <button
          onClick={onDelete}
          style={{
            padding: '8px 15px',
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Delete Node
        </button>
      </div>
    </div>
  );
};
