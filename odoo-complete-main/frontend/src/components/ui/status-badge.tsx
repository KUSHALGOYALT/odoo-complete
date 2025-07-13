
import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'available' | 'limited' | 'unavailable';
  availability?: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, availability, className }) => {
  const statusConfig = {
    available: {
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      label: 'Available'
    },
    limited: {
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      label: 'Limited'
    },
    unavailable: {
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      label: 'Unavailable'
    }
  };

  const config = statusConfig[status];

  return (
    <div className={cn(
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
      config.bgColor,
      config.textColor,
      className
    )}>
      <div className={cn('w-2 h-2 rounded-full', config.color)} />
      <span>{config.label}</span>
      {availability && (
        <span className="text-xs opacity-75">• {availability}</span>
      )}
    </div>
  );
};

export default StatusBadge;
