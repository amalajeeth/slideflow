import React from 'react';
import { Handle, Position } from '@xyflow/react';

// Custom Node Component with Handles
const CustomNode: React.FC<{ data: { label: string } }> = ({ data }) => {
  return (
    <div
      style={{
        padding: '16px',
        border: '1px solid #ddd',
        borderRadius: '10px',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '150px',
        textAlign: 'center',
        fontSize: '10px',
        fontWeight: '500',
        color: '#333',
        position: 'relative',
        transition: 'transform 0.2s, box-shadow 0.2s', // Add transition
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      }}
    >
      {/* Target Handle (Left) */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          backgroundColor: '#10b981', // Green color for target handle
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          border: '2px solid #fff',
        }}
      />

      {/* Node Label */}
      <div>{data.label}</div>

      {/* Source Handle (Right) */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          backgroundColor: '#3b82f6', // Blue color for source handle
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          border: '2px solid #fff',
        }}
      />
    </div>
  );
};

export default CustomNode;