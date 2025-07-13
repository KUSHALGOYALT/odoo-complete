
import React from 'react';
import { cn } from '@/lib/utils';

interface SkillChipProps {
  skill: string;
  level?: 'beginner' | 'intermediate' | 'expert';
  type?: 'offered' | 'wanted';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SkillChip: React.FC<SkillChipProps> = ({ 
  skill, 
  level, 
  type = 'offered', 
  size = 'md',
  className 
}) => {
  const levelColors = {
    beginner: 'bg-green-100 text-green-800 border-green-200',
    intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    expert: 'bg-purple-100 text-purple-800 border-purple-200'
  };

  const typeColors = {
    offered: 'bg-[#875A7B] text-white border-[#875A7B]',
    wanted: 'bg-[#F06EAA] text-white border-[#F06EAA]'
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const baseClasses = cn(
    'inline-flex items-center rounded-full font-medium border transition-all duration-200 hover:shadow-md',
    sizeClasses[size],
    level ? levelColors[level] : typeColors[type],
    className
  );

  return (
    <span className={baseClasses}>
      {skill}
      {level && (
        <span className="ml-1 text-xs opacity-75">
          ({level})
        </span>
      )}
    </span>
  );
};

export default SkillChip;
