import React, { useState, useEffect } from 'react';
import { Star, Send, X, User, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from 'sonner';

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

interface RatingSystemProps {
  userId: string;
  userProfile?: {
    name: string;
    username: string;
    profilePhoto?: string;
    stats?: {
      averageRating: number;
      totalRatings: number;
    };
  };
  onRatingSubmitted?: () => void;
}

const RatingSystem: React.FC<RatingSystemProps> = ({ 
  userId, 
  userProfile, 
  onRatingSubmitted 
}) => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedSwap, setSelectedSwap] = useState<any>(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // API base URL
  const API_BASE = 'http://localhost:8091/api';

  // Fetch user ratings
  const fetchRatings = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`${API_BASE}/ratings/user/${userId}`, {
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
    if (!selectedSwap) return;

    setSubmitting(true);
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const ratingData = {
        ratedUserId: selectedSwap.requester?.id === userId ? selectedSwap.requestedUser?.id : selectedSwap.requester?.id,
        swapId: selectedSwap.id,
        rating: ratingValue,
        comment: ratingComment.trim() || undefined
      };

      const response = await fetch(`${API_BASE}/ratings`, {
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
        setSelectedSwap(null);
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

  // Get completed swaps for rating
  const fetchCompletedSwaps = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${API_BASE}/swaps/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        const completedSwaps = (data.data || []).filter((swap: any) => 
          swap.status === 'COMPLETED' && 
          !swap.rated && 
          (swap.requester?.id === userId || swap.requestedUser?.id === userId)
        );
        return completedSwaps;
      }
    } catch (error) {
      console.error('Error fetching completed swaps:', error);
    }
    return [];
  };

  // Open rating modal
  const openRatingModal = async (swap: any) => {
    setSelectedSwap(swap);
    setShowRatingModal(true);
  };

  // Calculate average rating
  const averageRating = ratings.length > 0 
    ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length 
    : 0;

  // Load ratings on mount
  useEffect(() => {
    fetchRatings();
  }, [userId]);

  return (
    <div className="space-y-6">
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
        </CardContent>
      </Card>

      {/* Rating Modal */}
      <Dialog open={showRatingModal} onOpenChange={setShowRatingModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rate Your Experience</DialogTitle>
          </DialogHeader>
          {selectedSwap && (
            <div className="space-y-4">
              {/* Swap Info */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={selectedSwap.requester?.id === userId 
                        ? selectedSwap.requestedUser?.profilePhoto 
                        : selectedSwap.requester?.profilePhoto
                      } 
                    />
                    <AvatarFallback>
                      {selectedSwap.requester?.id === userId 
                        ? selectedSwap.requestedUser?.name?.charAt(0)
                        : selectedSwap.requester?.name?.charAt(0)
                      }
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {selectedSwap.requester?.id === userId 
                        ? selectedSwap.requestedUser?.name || selectedSwap.requestedUser?.username
                        : selectedSwap.requester?.name || selectedSwap.requester?.username
                      }
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedSwap.requesterSkill} ↔ {selectedSwap.requestedSkill}
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
    </div>
  );
};

export default RatingSystem; 