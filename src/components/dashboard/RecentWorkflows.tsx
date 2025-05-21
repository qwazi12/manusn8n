// src/components/dashboard/RecentWorkflows.tsx
import React from 'react';

interface Workflow {
  id: string;
  name: string;
  createdAt: string;
  status: 'completed' | 'failed' | 'in_progress';
  creditsUsed: number;
}

interface RecentWorkflowsProps {
  workflows: Workflow[];
  onViewWorkflow: (id: string) => void;
}

export const RecentWorkflows: React.FC<RecentWorkflowsProps> = ({
  workflows,
  onViewWorkflow
}) => {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Get status badge color
  const getStatusColor = (status: Workflow['status']) => {
    switch (status) {
      case 'completed': return '#2ecc71'; // Green
      case 'failed': return '#e74c3c'; // Red
      case 'in_progress': return '#f39c12'; // Orange
      default: return '#95a5a6'; // Gray
    }
  };

  return (
    <div className="recent-workflows-card" style={{
      padding: '20px',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
    }}>
      <h3 style={{ margin: '0 0 15px 0' }}>Recent Workflows</h3>
      
      {workflows.length === 0 ? (
        <div className="empty-state" style={{
          textAlign: 'center',
          padding: '30px 0',
          color: '#95a5a6'
        }}>
          <p>No workflows generated yet</p>
          <p style={{ fontSize: '14px' }}>
            Start by describing the workflow you want to create
          </p>
        </div>
      ) : (
        <div className="workflow-list">
          {workflows.map(workflow => (
            <div 
              key={workflow.id}
              className="workflow-item"
              style={{
                padding: '12px 0',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div className="workflow-info">
                <div className="workflow-name" style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  {workflow.name}
                </div>
                <div className="workflow-meta" style={{ fontSize: '12px', color: '#95a5a6' }}>
                  {formatDate(workflow.createdAt)} • {workflow.creditsUsed} credits
                </div>
              </div>
              
              <div className="workflow-actions" style={{ display: 'flex', alignItems: 'center' }}>
                <div 
                  className="status-badge"
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: getStatusColor(workflow.status),
                    color: 'white',
                    fontSize: '12px',
                    marginRight: '10px'
                  }}
                >
                  {workflow.status === 'completed' ? 'Completed' : 
                   workflow.status === 'failed' ? 'Failed' : 'In Progress'}
                </div>
                
                <button
                  onClick={() => onViewWorkflow(workflow.id)}
                  style={{
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {workflows.length > 0 && (
        <div className="view-all" style={{ marginTop: '15px', textAlign: 'center' }}>
          <a 
            href="/workflows"
            style={{
              color: '#3498db',
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            View All Workflows
          </a>
        </div>
      )}
    </div>
  );
};
