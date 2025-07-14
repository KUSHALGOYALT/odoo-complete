import React from 'react';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { 
  Crown, 
  Star, 
  Trophy, 
  Medal, 
  Award, 
  Zap, 
  Heart, 
  Shield, 
  Sword, 
  Target,
  Users,
  MessageSquare,
  Clock
} from 'lucide-react';

interface BadgeSystemProps {
  userStats: {
    averageRating: number;
    totalRatings: number;
    totalSwaps: number;
    completedSwaps: number;
    profileViews: number;
    totalMessages?: number;
    daysActive?: number;
  };
  showAll?: boolean;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  condition: (stats: any) => boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const BadgeSystem: React.FC<BadgeSystemProps> = ({ userStats, showAll = false }) => {
  const badges: Badge[] = [
    // Rating-based badges
    {
      id: 'first-rating',
      name: 'First Steps',
      description: 'Received your first rating',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      condition: (stats) => stats.totalRatings >= 1,
      rarity: 'common'
    },
    {
      id: 'rating-3',
      name: 'Rising Star',
      description: 'Maintain a 3+ star average rating',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      condition: (stats) => stats.averageRating >= 3 && stats.totalRatings >= 3,
      rarity: 'common'
    },
    {
      id: 'rating-4',
      name: 'Trusted Partner',
      description: 'Maintain a 4+ star average rating',
      icon: Medal,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      condition: (stats) => stats.averageRating >= 4 && stats.totalRatings >= 5,
      rarity: 'rare'
    },
    {
      id: 'rating-5',
      name: 'Perfect Knight',
      description: 'Maintain a 5-star average rating',
      icon: Crown,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      condition: (stats) => stats.averageRating >= 4.8 && stats.totalRatings >= 10,
      rarity: 'legendary'
    },
    {
      id: 'rating-10',
      name: 'Veteran',
      description: 'Received 10+ ratings',
      icon: Trophy,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      condition: (stats) => stats.totalRatings >= 10,
      rarity: 'rare'
    },
    {
      id: 'rating-25',
      name: 'Elite',
      description: 'Received 25+ ratings',
      icon: Award,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      condition: (stats) => stats.totalRatings >= 25,
      rarity: 'epic'
    },

    // Swap-based badges
    {
      id: 'first-swap',
      name: 'Skill Swapper',
      description: 'Completed your first skill swap',
      icon: Zap,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      condition: (stats) => stats.completedSwaps >= 1,
      rarity: 'common'
    },
    {
      id: 'swap-5',
      name: 'Dedicated Learner',
      description: 'Completed 5+ skill swaps',
      icon: Heart,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
      condition: (stats) => stats.completedSwaps >= 5,
      rarity: 'rare'
    },
    {
      id: 'swap-10',
      name: 'Skill Master',
      description: 'Completed 10+ skill swaps',
      icon: Shield,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      condition: (stats) => stats.completedSwaps >= 10,
      rarity: 'epic'
    },
    {
      id: 'swap-25',
      name: 'Grand Master',
      description: 'Completed 25+ skill swaps',
      icon: Sword,
      color: 'text-gray-800',
      bgColor: 'bg-gray-100',
      condition: (stats) => stats.completedSwaps >= 25,
      rarity: 'legendary'
    },

    // Activity-based badges
    {
      id: 'views-100',
      name: 'Popular',
      description: 'Profile viewed 100+ times',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      condition: (stats) => stats.profileViews >= 100,
      rarity: 'rare'
    },
    {
      id: 'messages-50',
      name: 'Communicator',
      description: 'Sent 50+ messages',
      icon: MessageSquare,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
      condition: (stats) => (stats.totalMessages || 0) >= 50,
      rarity: 'common'
    },
    {
      id: 'active-30',
      name: 'Consistent',
      description: 'Active for 30+ days',
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      condition: (stats) => (stats.daysActive || 0) >= 30,
      rarity: 'rare'
    },

    // Special combination badges
    {
      id: 'perfect-achiever',
      name: 'Perfect Achiever',
      description: '5-star rating with 10+ completed swaps',
      icon: Crown,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      condition: (stats) => stats.averageRating >= 4.8 && stats.completedSwaps >= 10,
      rarity: 'legendary'
    },
    {
      id: 'community-pillar',
      name: 'Community Pillar',
      description: '25+ ratings and 10+ completed swaps',
      icon: Trophy,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      condition: (stats) => stats.totalRatings >= 25 && stats.completedSwaps >= 10,
      rarity: 'epic'
    }
  ];

  const earnedBadges = badges.filter(badge => badge.condition(userStats));
  const displayedBadges = showAll ? badges : earnedBadges;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'border-yellow-400 shadow-yellow-200';
      case 'epic': return 'border-purple-400 shadow-purple-200';
      case 'rare': return 'border-blue-400 shadow-blue-200';
      default: return 'border-gray-400 shadow-gray-200';
    }
  };

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'Legendary';
      case 'epic': return 'Epic';
      case 'rare': return 'Rare';
      default: return 'Common';
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Badges & Achievements</h3>
          <Badge variant="outline" className="text-sm">
            {earnedBadges.length}/{badges.length} Earned
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {displayedBadges.map((badge) => {
            const Icon = badge.icon;
            const isEarned = badge.condition(userStats);
            
            return (
              <Tooltip key={badge.id}>
                <TooltipTrigger asChild>
                  <div className={`
                    relative p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer
                    ${isEarned 
                      ? `${badge.bgColor} ${badge.color} ${getRarityColor(badge.rarity)} shadow-lg` 
                      : 'bg-gray-100 border-gray-200 opacity-50'
                    }
                    hover:scale-105
                  `}>
                    <div className="flex flex-col items-center text-center space-y-2">
                      <Icon className={`h-6 w-6 ${isEarned ? badge.color : 'text-gray-400'}`} />
                      <div>
                        <p className={`text-xs font-medium ${isEarned ? badge.color : 'text-gray-500'}`}>
                          {badge.name}
                        </p>
                        {isEarned && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getRarityColor(badge.rarity).replace('border-', 'border-').replace('shadow-', '')}`}
                          >
                            {getRarityLabel(badge.rarity)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Earned indicator */}
                    {isEarned && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <div className="space-y-1">
                    <p className="font-semibold">{badge.name}</p>
                    <p className="text-sm text-gray-600">{badge.description}</p>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">
                        {getRarityLabel(badge.rarity)}
                      </Badge>
                      {isEarned && (
                        <Badge variant="default" className="text-xs bg-green-600">
                          Earned
                        </Badge>
                      )}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Progress Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Progress Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{earnedBadges.length}</div>
              <div className="text-gray-600">Badges Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {earnedBadges.filter(b => b.rarity === 'legendary').length}
              </div>
              <div className="text-gray-600">Legendary</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {earnedBadges.filter(b => b.rarity === 'epic').length}
              </div>
              <div className="text-gray-600">Epic</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {earnedBadges.filter(b => b.rarity === 'rare').length}
              </div>
              <div className="text-gray-600">Rare</div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default BadgeSystem; 