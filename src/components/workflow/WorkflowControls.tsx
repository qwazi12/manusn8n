// src/components/workflow/WorkflowControls.tsx
import React from 'react';

interface WorkflowControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onSave?: () => void;
  onExport?: () => void;
  scale: number;
  readOnly: boolean;
}

export const WorkflowControls: React.FC<WorkflowControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onReset,
  onSave,
  onExport,
  scale,
  readOnly
}) => {
  return (
    <div className="workflow-controls" style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '10px',
      backgroundColor: '#f0f0f0',
      borderRadius: '0 0 8px 8px',
      borderTop: '1px solid #ddd'
    }}>
      <div className="zoom-controls" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <button
          onClick={onZoomOut}
          style={{
            padding: '5px 10px',
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          -
        </button>
        
        <span style={{ fontWeight: 'bold' }}>
          {Math.round(scale * 100)}%
        </span>
        
        <button
          onClick={onZoomIn}
          style={{
            padding: '5px 10px',
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          +
        </button>
        
        <button
          onClick={onReset}
          style={{
            padding: '5px 10px',
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
            marginLeft: '10px'
          }}
        >
          Reset View
        </button>
      </div>
      
      {!readOnly && (
        <div className="action-controls" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {onSave && (
            <button
              onClick={onSave}
              style={{
                padding: '5px 15px',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Save
            </button>
          )}
          
          {onExport && (
            <button
              onClick={onExport}
              style={{
                padding: '5px 15px',
                backgroundColor: '#2ecc71',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Export
            </button>
          )}
        </div>
      )}
    </div>
  );
};
