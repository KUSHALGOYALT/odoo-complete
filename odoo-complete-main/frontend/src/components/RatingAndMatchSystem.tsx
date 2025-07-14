import React, { useState, useEffect } from 'react';
import { Star, Send, X, User, MessageSquare, TrendingUp, Target, Users, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { toast } from 'sonner';
import { 
  calculateMatchPercentage, 
  getMatchBreakdown, 
  getMatchDescription, 
  getMatchColor, 
  getMatchBadgeVariant 
} from '../utils/matchCalculator';

interface Skill {
  name: string;
  level: string;
}

interface User {
  id: string;
  name: string;
  username: string;
  profilePhoto?: string;
  offeredSkills: Skill[];
  wantedSkills: Skill[];
  stats?: {
    averageRating: number;
    totalRatings: number;
  };
}

interface Rating {
  id: string;
  rating: number;
  comment?: string;
  rater: {
    id: string;
    name: string;
    username: string;
    profilePhoto?: string;
  };
  rated: {
    id: string;
    name: string;
    username: string;
    profilePhoto?: string;
  };
  swapId: string;
  createdAt: string;
}

interface SwapRequest {
  id: string;
  requester: User;
  requestedUser: User;
  requesterSkill: string;
  requestedSkill: string;
  status: string;
  createdAt: string;
}

interface RatingAndMatchSystemProps {
  currentUser: User;
  targetUser: User;
  swapRequest?: SwapRequest;
  onRatingSubmitted?: () => void;
}

const RatingAndMatchSystem: React.FC<RatingAndMatchSystemProps> = ({ 
  currentUser, 
  targetUser, 
  swapRequest,
  onRatingSubmitted 
}) => {
  const [activeTab, setActiveTab] = useState('match');
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // API base URL
  const API_BASE = 'http://localhost:8091/api';

  // Calculate match percentage
  const matchPercentage = calculateMatchPercentage(currentUser, targetUser);
  const matchBreakdown = getMatchBreakdown(currentUser, targetUser);
  const matchDescription = getMatchDescription(matchPercentage);
  const matchColor = getMatchColor(matchPercentage);
  const matchBadgeVariant = getMatchBadgeVariant(matchPercentage);

  // Fetch user ratings
  const fetchRatings = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`${API_BASE}/ratings/user/${targetUser.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRatings(data.data || []);
      } else {
        toast.error('Failed to fetch ratings');
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
      toast.error('Error loading ratings');
    } finally {
      setLoading(false);
    }
  };

  // Submit rating
  const submitRating = async () => {
    if (!swapRequest) return;

    setSubmitting(true);
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const ratingData = {
        ratedUserId: targetUser.id,
        swapRequestId: swapRequest.id,
        rating: ratingValue,
        comment: ratingComment.trim() || undefined
      };

      const response = await fetch(`${API_BASE}/ratings/${currentUser.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ratingData)
      });

      if (response.ok) {
        toast.success('Rating submitted successfully!');
        setShowRatingModal(false);
        setRatingValue(5);
        setRatingComment('');
        fetchRatings(); // Refresh ratings
        onRatingSubmitted?.();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Error submitting rating');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate average rating
  const averageRating = ratings.length > 0 
    ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length 
    : 0;

  // Load ratings on mount
  useEffect(() => {
    fetchRatings();
  }, [targetUser.id]);

  // Check if user can rate (completed swap exists)
  const canRate = swapRequest && swapRequest.status === 'COMPLETED';

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="match" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Match Analysis
          </TabsTrigger>
          <TabsTrigger value="ratings" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Ratings & Reviews
          </TabsTrigger>
        </TabsList>

        <TabsContent value="match" className="space-y-6">
          {/* Match Percentage Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Skill Match Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-6xl font-bold mb-2" style={{ color: matchColor }}>
                  {matchPercentage}%
                </div>
                <Badge className={matchBadgeVariant}>
                  {matchDescription}
                </Badge>
                <Progress value={matchPercentage} className="mt-4" />
              </div>

              {/* Match Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Your Wants vs Their Offers */}
                <div>
                  <h4 className="font-semibold mb-3 text-sm text-gray-700">
                    Your Wants ↔ Their Offers
                  </h4>
                  <div className="space-y-2">
                    {matchBreakdown.user1Wants.map((match, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex-1">
                          <div className="text-sm font-medium">{match.wanted.name}</div>
                          <div className="text-xs text-gray-500">
                            {match.wanted.level} → {match.bestMatch.level}
                          </div>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {Math.round(match.score * 100)}%
                        </Badge>
                      </div>
                    ))}
                    {matchBreakdown.user1Wants.length === 0 && (
                      <p className="text-sm text-gray-500 italic">No matches found</p>
                    )}
                  </div>
                </div>

                {/* Their Wants vs Your Offers */}
                <div>
                  <h4 className="font-semibold mb-3 text-sm text-gray-700">
                    Their Wants ↔ Your Offers
                  </h4>
                  <div className="space-y-2">
                    {matchBreakdown.user2Wants.map((match, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex-1">
                          <div className="text-sm font-medium">{match.wanted.name}</div>
                          <div className="text-xs text-gray-500">
                            {match.wanted.level} → {match.bestMatch.level}
                          </div>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {Math.round(match.score * 100)}%
                        </Badge>
                      </div>
                    ))}
                    {matchBreakdown.user2Wants.length === 0 && (
                      <p className="text-sm text-gray-500 italic">No matches found</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Common Skills */}
              {matchBreakdown.commonSkills.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3 text-sm text-gray-700">
                    Common Skills (Bonus!)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {matchBreakdown.commonSkills.map((common, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {common.skill.name} ({common.user1Level} ↔ {common.user2Level})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Skills Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current User Skills */}
                <div>
                  <h4 className="font-semibold mb-3 text-sm text-gray-700">
                    Your Skills
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <h5 className="text-xs font-medium text-gray-600 mb-1">Offering:</h5>
                      <div className="flex flex-wrap gap-1">
                        {currentUser.offeredSkills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill.name} ({skill.level})
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-xs font-medium text-gray-600 mb-1">Wanting:</h5>
                      <div className="flex flex-wrap gap-1">
                        {currentUser.wantedSkills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill.name} ({skill.level})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Target User Skills */}
                <div>
                  <h4 className="font-semibold mb-3 text-sm text-gray-700">
                    {targetUser.name}'s Skills
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <h5 className="text-xs font-medium text-gray-600 mb-1">Offering:</h5>
                      <div className="flex flex-wrap gap-1">
                        {targetUser.offeredSkills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill.name} ({skill.level})
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-xs font-medium text-gray-600 mb-1">Wanting:</h5>
                      <div className="flex flex-wrap gap-1">
                        {targetUser.wantedSkills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill.name} ({skill.level})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ratings" className="space-y-6">
          {/* Rating Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Rating Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#875A7B]">
                    {averageRating.toFixed(1)}
                  </div>
                  <div className="flex justify-center mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= averageRating 
                            ? 'text-yellow-500 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Average Rating</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#875A7B]">
                    {ratings.length}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Total Ratings</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#875A7B]">
                    {ratings.filter(r => r.rating >= 4).length}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Positive Ratings</p>
                </div>
              </div>

              {/* Rate Button */}
              {canRate && (
                <div className="mt-4 text-center">
                  <Button 
                    onClick={() => setShowRatingModal(true)}
                    className="bg-[#875A7B] hover:bg-[#6B4A5F]"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Rate {targetUser.name}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Ratings */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Ratings</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#875A7B] mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Loading ratings...</p>
                </div>
              ) : ratings.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No ratings yet</h3>
                  <p className="text-gray-600 text-sm">Complete swaps to receive ratings!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ratings.slice(0, 5).map((rating) => (
                    <div key={rating.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={rating.rater.profilePhoto} />
                        <AvatarFallback>{rating.rater.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-sm">
                            {rating.rater.name || rating.rater.username}
                          </p>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${
                                  star <= rating.rating 
                                    ? 'text-yellow-500 fill-current' 
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {rating.comment && (
                          <p className="text-sm text-gray-600 mb-1">{rating.comment}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          {new Date(rating.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rating Modal */}
      <Dialog open={showRatingModal} onOpenChange={setShowRatingModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rate Your Experience with {targetUser.name}</DialogTitle>
          </DialogHeader>
          {swapRequest && (
            <div className="space-y-4">
              {/* Swap Info */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={targetUser.profilePhoto} />
                    <AvatarFallback>{targetUser.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{targetUser.name || targetUser.username}</p>
                    <p className="text-sm text-gray-600">
                      {swapRequest.requesterSkill} ↔ {swapRequest.requestedSkill}
                    </p>
                  </div>
                </div>
              </div>

              {/* Star Rating */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">How was your experience?</p>
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRatingValue(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= ratingValue 
                            ? 'text-yellow-500 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {ratingValue === 1 && 'Poor'}
                  {ratingValue === 2 && 'Fair'}
                  {ratingValue === 3 && 'Good'}
                  {ratingValue === 4 && 'Very Good'}
                  {ratingValue === 5 && 'Excellent'}
                </p>
              </div>

              {/* Comment */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Add a comment (optional)
                </label>
                <Textarea
                  placeholder="Share your experience..."
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {ratingComment.length}/500 characters
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowRatingModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitRating}
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? 'Submitting...' : 'Submit Rating'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RatingAndMatchSystem; 