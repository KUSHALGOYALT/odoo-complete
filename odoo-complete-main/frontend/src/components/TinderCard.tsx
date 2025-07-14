import React, { useState, useRef, useEffect } from 'react';
import { Heart, X, Zap, MapPin, Star, Users, Clock } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { calculateMatchPercentage, getMatchDescription, getMatchColor } from '../utils/matchCalculator';

interface TinderCardProps {
  user: {
    id: string;
    name: string;
    username: string;
    profilePhoto?: string;
    location?: string;
    bio?: string;
    offeredSkills: Array<{ name: string; level: string }>;
    wantedSkills: Array<{ name: string; level: string }>;
    stats?: {
      averageRating: number;
      totalRatings: number;
      completedSwaps: number;
    };
  };
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSuperSwipe: () => void;
  isActive: boolean;
}

const TinderCard: React.FC<TinderCardProps> = ({ 
  user, 
  onSwipeLeft, 
  onSwipeRight, 
  onSuperSwipe, 
  isActive 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [matchPercentage, setMatchPercentage] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isActive) return;
    const touch = e.touches[0];
    setStartPos({ x: touch.clientX, y: touch.clientY });
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isActive || !isDragging) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPos.x;
    const deltaY = touch.clientY - startPos.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleTouchEnd = () => {
    if (!isActive || !isDragging) return;
    setIsDragging(false);
    
    const threshold = 100;
    if (Math.abs(dragOffset.x) > threshold) {
      if (dragOffset.x > 0) {
        onSwipeRight();
      } else {
        onSwipeLeft();
      }
    }
    setDragOffset({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isActive) return;
    setStartPos({ x: e.clientX, y: e.clientY });
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isActive || !isDragging) return;
    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleMouseUp = () => {
    if (!isActive || !isDragging) return;
    setIsDragging(false);
    
    const threshold = 100;
    if (Math.abs(dragOffset.x) > threshold) {
      if (dragOffset.x > 0) {
        onSwipeRight();
      } else {
        onSwipeLeft();
      }
    }
    setDragOffset({ x: 0, y: 0 });
  };

  const getRotation = () => {
    return (dragOffset.x / 10) * (dragOffset.x > 0 ? 1 : -1);
  };

  const getOpacity = () => {
    return 1 - Math.abs(dragOffset.x) / 200;
  };

  // Fetch current user and calculate match percentage
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:8091/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const currentUserData = await response.json();
          setCurrentUser(currentUserData);
          
          // Calculate match percentage
          const percentage = calculateMatchPercentage(currentUserData, user);
          setMatchPercentage(percentage);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();
  }, [user]);

  return (
    <div
      ref={cardRef}
      className={`w-full h-full max-w-sm mx-auto transition-all duration-200 ease-out ${
        isActive ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'
      }`}
      style={{
        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${getRotation()}deg)`,
        opacity: getOpacity(),
        zIndex: isActive ? 10 : 1
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <Card className="w-full h-full bg-white shadow-xl rounded-3xl overflow-hidden border-0">
        <CardContent className="p-0 h-full flex flex-col">
          {/* Header with gradient background */}
          <div className="relative flex-1 bg-gradient-to-br from-[#875A7B] to-[#F06EAA] text-white p-4 md:p-6">
            {/* Match percentage badge */}
            <div className="absolute top-4 right-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                <span className={`text-sm font-medium ${getMatchColor(matchPercentage)}`}>
                  {matchPercentage}% match
                </span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 mt-1">
                <span className="text-xs text-white/90">
                  {getMatchDescription(matchPercentage)}
                </span>
              </div>
            </div>
            
            {/* User info */}
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="w-16 h-16 border-3 border-white shadow-lg">
                <AvatarImage src={user.profilePhoto} alt={user.name} />
                <AvatarFallback className="bg-white text-[#875A7B] text-lg font-bold">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold">{user.name}</h3>
                <div className="flex items-center gap-1 text-white/80">
                  <MapPin size={14} />
                  <span className="text-sm">{user.location || 'Location not set'}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Star size={14} fill="currentColor" />
                  <span className="text-sm">
                    {user.stats?.averageRating?.toFixed(1) || 'N/A'} ({user.stats?.totalRatings || 0})
                  </span>
                </div>
              </div>
            </div>
            
            {/* Bio */}
            {user.bio && (
              <p className="text-white/90 text-sm mb-4">{user.bio}</p>
            )}
            
            {/* Stats */}
            <div className="flex items-center gap-4 text-white/80">
              <div className="flex items-center gap-1">
                <Users size={14} />
                <span className="text-sm">{user.stats?.completedSwaps || 0} swaps</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span className="text-sm">Active now</span>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="p-4 md:p-6 flex-shrink-0">
            {/* Offered Skills */}
            {user.offeredSkills && user.offeredSkills.length > 0 && (
              <div className="mb-3 md:mb-4">
                <h4 className="text-xs md:text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Offers
                </h4>
                <div className="flex flex-wrap gap-1">
                  {user.offeredSkills.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                      {skill.name} ({skill.level})
                    </Badge>
                  ))}
                  {user.offeredSkills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{user.offeredSkills.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Wanted Skills */}
            {user.wantedSkills && user.wantedSkills.length > 0 && (
              <div className="mb-3 md:mb-4">
                <h4 className="text-xs md:text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Wants
                </h4>
                <div className="flex flex-wrap gap-1">
                  {user.wantedSkills.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                      {skill.name} ({skill.level})
                    </Badge>
                  ))}
                  {user.wantedSkills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{user.wantedSkills.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center gap-3 md:gap-4 mt-4 md:mt-6">
              <Button
                size="lg"
                variant="outline"
                className="w-12 h-12 rounded-full border-2 border-gray-300 hover:border-red-400 hover:bg-red-50"
                onClick={onSwipeLeft}
              >
                <X className="h-6 w-6 text-gray-600" />
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="w-12 h-12 rounded-full border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                onClick={onSuperSwipe}
              >
                <Zap className="h-6 w-6 text-gray-600" />
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="w-12 h-12 rounded-full border-2 border-gray-300 hover:border-green-400 hover:bg-green-50"
                onClick={onSwipeRight}
              >
                <Heart className="h-6 w-6 text-gray-600" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TinderCard; 