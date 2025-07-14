import React from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { MapPin, Star, MessageSquare, Users, Clock, Crown, Trophy, Medal } from 'lucide-react';

interface Skill {
  name: string;
  level: string;
}

interface ProfileStats {
  averageRating: number;
  totalRatings: number;
  totalSwaps: number;
  completedSwaps: number;
  profileViews: number;
}

interface ProfileCardProps {
  user: {
    id: string;
    name: string;
    username: string;
    profilePhoto?: string;
    location?: string;
    tagline?: string;
    offeredSkills: Skill[];
    wantedSkills: string[];
    availability: string;
    stats?: ProfileStats;
  };
  isOwnProfile?: boolean;
  onSendMessage?: () => void;
  onSendSwapRequest?: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ 
  user, 
  isOwnProfile = false, 
  onSendMessage, 
  onSendSwapRequest 
}) => {
  // Function to get top badges based on user stats
  const getTopBadges = (stats) => {
    const badges = [];
    
    if (stats.averageRating >= 4.8 && stats.totalRatings >= 10) {
      badges.push({ name: 'Perfect Knight', icon: Crown, color: 'text-purple-600', rarity: 'legendary' });
    } else if (stats.averageRating >= 4 && stats.totalRatings >= 5) {
      badges.push({ name: 'Trusted Partner', icon: Medal, color: 'text-blue-600', rarity: 'rare' });
    } else if (stats.totalRatings >= 1) {
      badges.push({ name: 'First Steps', icon: Star, color: 'text-yellow-600', rarity: 'common' });
    }
    
    if (stats.completedSwaps >= 25) {
      badges.push({ name: 'Grand Master', icon: Trophy, color: 'text-gray-800', rarity: 'legendary' });
    } else if (stats.completedSwaps >= 10) {
      badges.push({ name: 'Skill Master', icon: Trophy, color: 'text-indigo-600', rarity: 'epic' });
    } else if (stats.completedSwaps >= 5) {
      badges.push({ name: 'Dedicated Learner', icon: Trophy, color: 'text-pink-600', rarity: 'rare' });
    } else if (stats.completedSwaps >= 1) {
      badges.push({ name: 'Skill Swapper', icon: Trophy, color: 'text-green-600', rarity: 'common' });
    }
    
    return badges.slice(0, 3); // Return top 3 badges
  };
  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'FLEXIBLE': return 'Flexible';
      case 'WEEKDAYS': return 'Weekdays';
      case 'WEEKENDS': return 'Weekends';
      case 'EVENINGS': return 'Evenings';
      default: return 'Flexible';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER': return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE': return 'bg-blue-100 text-blue-800';
      case 'ADVANCED': return 'bg-purple-100 text-purple-800';
      case 'EXPERT': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-4">
        {/* Header with Avatar and Basic Info */}
        <div className="flex items-start gap-6">
          <Avatar className="w-24 h-24 border-4 border-[#875A7B]/20">
            <AvatarImage src={user.profilePhoto} />
            <AvatarFallback className="bg-[#875A7B] text-white text-2xl font-bold">
              {user.name?.charAt(0) || user.username?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 truncate">
                {user.name || user.username}
              </h1>
              {!isOwnProfile && (
                <Badge variant="outline" className="text-xs">
                  @{user.username}
                </Badge>
              )}
            </div>
            
            {user.location && (
              <div className="flex items-center gap-1 text-gray-600 mb-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{user.location}</span>
              </div>
            )}
            
            {user.availability && (
              <div className="flex items-center gap-1 text-gray-600 mb-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Available: {getAvailabilityText(user.availability)}</span>
              </div>
            )}
            
            {user.stats && (
              <div className="space-y-2">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{user.stats.averageRating.toFixed(1)} ({user.stats.totalRatings} ratings)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span>{user.stats.totalSwaps} swaps</span>
                  </div>
                  {user.stats.profileViews > 0 && (
                    <div className="flex items-center gap-1">
                      <span>👁️ {user.stats.profileViews} views</span>
                    </div>
                  )}
                </div>
                
                {/* Top Badges */}
                {getTopBadges(user.stats).length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Top Badges:</span>
                    {getTopBadges(user.stats).map((badge, index) => {
                      const Icon = badge.icon;
                      return (
                        <div key={index} className="flex items-center gap-1">
                          <Icon className={`h-4 w-4 ${badge.color}`} />
                          <span className="text-xs font-medium text-gray-700">{badge.name}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          {!isOwnProfile && (
            <div className="flex flex-col gap-2">
              <Button 
                onClick={onSendMessage}
                size="sm"
                className="bg-[#875A7B] hover:bg-[#6B4A5F]"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
              <Button 
                onClick={onSendSwapRequest}
                variant="outline"
                size="sm"
              >
                <Users className="h-4 w-4 mr-2" />
                Swap Request
              </Button>
            </div>
          )}
        </div>
        
        {/* Tagline */}
        {user.tagline && (
          <p className="text-gray-700 italic text-sm mt-2">
            "{user.tagline}"
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Skills Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Offered Skills */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Skills Offered
            </h3>
            {user.offeredSkills && user.offeredSkills.length > 0 ? (
              <div className="space-y-2">
                {user.offeredSkills.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{skill.name}</span>
                    <Badge className={getLevelColor(skill.level)}>
                      {skill.level}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">No skills offered yet</p>
            )}
          </div>
          
          {/* Wanted Skills */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Skills Wanted
            </h3>
            {user.wantedSkills && user.wantedSkills.length > 0 ? (
              <div className="space-y-2">
                {user.wantedSkills.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{skill}</span>
                    <Badge variant="outline" className="text-blue-600 border-blue-300">
                      Wanted
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">No skills wanted yet</p>
            )}
          </div>
        </div>
        
        {/* Stats Section (if own profile) */}
        {isOwnProfile && user.stats && (
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-[#875A7B]">{user.stats.totalSwaps}</div>
                <div className="text-sm text-gray-600">Total Swaps</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{user.stats.completedSwaps}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{user.stats.averageRating.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Avg Rating</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{user.stats.totalRatings}</div>
                <div className="text-sm text-gray-600">Reviews</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Profile Preview Note */}
        {isOwnProfile && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 This is how your profile appears to other users. 
              You can customize your visibility in the Settings tab.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileCard; 