// src/components/dashboard/CreditUsage.tsx
import React from 'react';

interface CreditUsageProps {
  totalCredits: number;
  usedCredits: number;
  onPurchase?: () => void;
}

export const CreditUsage: React.FC<CreditUsageProps> = ({
  totalCredits,
  usedCredits,
  onPurchase
}) => {
  // Calculate percentage used
  const percentageUsed = totalCredits > 0 ? (usedCredits / totalCredits) * 100 : 0;
  const remainingCredits = totalCredits - usedCredits;
  
  // Determine color based on usage
  const getProgressColor = () => {
    if (percentageUsed < 50) return '#2ecc71'; // Green
    if (percentageUsed < 80) return '#f39c12'; // Orange
    return '#e74c3c'; // Red
  };

  return (
    <div className="credit-usage-card" style={{
      padding: '20px',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
      marginBottom: '20px'
    }}>
      <h3 style={{ margin: '0 0 15px 0' }}>Credit Usage</h3>
      
      <div className="credit-stats" style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '10px'
      }}>
        <div>
          <span style={{ fontWeight: 'bold' }}>Remaining: </span>
          <span>{remainingCredits} credits</span>
        </div>
        <div>
          <span style={{ fontWeight: 'bold' }}>Total: </span>
          <span>{totalCredits} credits</span>
        </div>
      </div>
      
      <div className="progress-bar-container" style={{
        height: '10px',
        backgroundColor: '#f0f0f0',
        borderRadius: '5px',
        overflow: 'hidden',
        marginBottom: '15px'
      }}>
        <div className="progress-bar" style={{
          height: '100%',
          width: `${percentageUsed}%`,
          backgroundColor: getProgressColor(),
          transition: 'width 0.3s ease'
        }} />
      </div>
      
      {remainingCredits < 50 && (
        <div className="low-credit-warning" style={{
          color: '#e74c3c',
          marginBottom: '15px',
          fontSize: '14px'
        }}>
          <strong>Low credits!</strong> Purchase more to continue generating workflows.
        </div>
      )}
      
      {onPurchase && (
        <button
          onClick={onPurchase}
          style={{
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '10px 15px',
            cursor: 'pointer',
            width: '100%',
            fontWeight: 'bold'
          }}
        >
          Purchase Credits
        </button>
      )}
    </div>
  );
};
