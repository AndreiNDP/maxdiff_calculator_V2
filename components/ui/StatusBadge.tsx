import React from 'react';
import { DesignStatus } from '../../types';

interface StatusBadgeProps {
  status: DesignStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getColors = () => {
    switch (status) {
      case DesignStatus.CRITICAL:
        return 'bg-red-100 text-red-700 border-red-200';
      case DesignStatus.POOR:
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case DesignStatus.ACCEPTABLE:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case DesignStatus.EXCELLENT:
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getColors()}`}>
      {status.toUpperCase()}
    </span>
  );
};
