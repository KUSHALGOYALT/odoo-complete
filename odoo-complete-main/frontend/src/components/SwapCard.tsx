
import React from 'react';
import { Heart, X, Zap, MapPin, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import SkillChip from '@/components/ui/skill-chip';

interface SwapCardProps {
  user: {
    id: string;
    name: string;
    avatar: string;
    location: string;
    tagline: string;
    offeredSkills: Array<{ name: string; level: 'beginner' | 'intermediate' | 'expert' }>;
    wantedSkills: string[];
    rating: number;
    matchPercentage: number;
  };
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSuperSwipe: () => void;
}

const SwapCard: React.FC<SwapCardProps> = ({ user, onSwipeLeft, onSwipeRight, onSuperSwipe }) => {
  return (
    <Card className="w-full max-w-sm mx-auto bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-3xl overflow-hidden">
      <CardContent className="p-0">
        {/* User Avatar and Basic Info */}
        <div className="relative p-6 bg-gradient-to-br from-[#875A7B] to-[#F06EAA] text-white">
          <div className="absolute top-4 right-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="text-sm font-medium">{user.matchPercentage}% match</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-16 h-16 border-3 border-white">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-white text-[#875A7B] text-lg font-bold">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-bold">{user.name}</h3>
              <div className="flex items-center gap-1 text-white/80">
                <MapPin size={14} />
                <span className="text-sm">{user.location}</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Star size={14} fill="currentColor" />
                <span className="text-sm">{user.rating}</span>
              </div>
            </div>
          </div>
          
          <p className="text-white/90 text-sm">{user.tagline}</p>
        </div>

        {/* Skills Section */}
        <div className="p-6 space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Skills Offered</h4>
            <div className="flex flex-wrap gap-2">
              {user.offeredSkills.map((skill) => (
                <SkillChip
                  key={skill.name}
                  skill={skill.name}
                  level={skill.level}
                  type="offered"
                  size="sm"
                />
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Skills Wanted</h4>
            <div className="flex flex-wrap gap-2">
              {user.wantedSkills.map((skill) => (
                <SkillChip
                  key={skill}
                  skill={skill}
                  type="wanted"
                  size="sm"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 p-6 pt-0">
          <Button
            variant="outline"
            size="lg"
            className="w-14 h-14 rounded-full border-red-200 hover:bg-red-50 hover:border-red-300 group"
            onClick={onSwipeLeft}
          >
            <X className="text-red-500 group-hover:text-red-600" size={24} />
          </Button>

          <Button
            size="lg"
            className="w-14 h-14 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 shadow-lg"
            onClick={onSuperSwipe}
          >
            <Zap className="text-white" size={24} />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-14 h-14 rounded-full border-green-200 hover:bg-green-50 hover:border-green-300 group"
            onClick={onSwipeRight}
          >
            <Heart className="text-green-500 group-hover:text-green-600" size={24} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SwapCard;
