import React, { useState, useEffect } from 'react';
import {
  User,
  MessageSquare,
  RefreshCw,
  Calendar,
  TrendingUp,
  Star,
  MapPin,
  Clock,
  Users,
  Settings as SettingsIcon,
  LogOut,
  Plus,
  Search,
  Filter,
  Menu,
  X,
  Phone,
  CheckCircle,
  XCircle,
  Send,
  Heart,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import RatingSystem from './RatingSystem';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from 'sonner';
import ProfileCard from './ProfileCard';
import Settings from './Settings';
import VideoCall from './VideoCall';
import RatingAndMatchSystem from './RatingAndMatchSystem';
import BadgeSystem from './BadgeSystem';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // State for user data
  const [userProfile, setUserProfile] = useState(null);
  const [userStats, setUserStats] = useState({
    totalSwaps: 0,
    completedSwaps: 0,
    pendingSwaps: 0,
    averageRating: 0,
    totalMessages: 0
  });
  const [swapRequests, setSwapRequests] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [ratings, setRatings] = useState([]);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedSwapForRating, setSelectedSwapForRating] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [selectedUserForCall, setSelectedUserForCall] = useState(null);

  // Add state for swap modal form
  const [swapForm, setSwapForm] = useState({
    requesterSkill: '',
    requestedSkill: '',
    message: '',
    deadline: '',
    isSuperSwap: false
  });
  const [swapLoading, setSwapLoading] = useState(false);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // API base URL
  const API_BASE = 'http://localhost:8091/api';

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Fetch user's swap requests
  const fetchUserSwaps = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/swaps/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const swaps = data.data || [];
        setSwapRequests(swaps);
        
        // Calculate stats - ensure userProfile is loaded first
        if (userProfile) {
          const stats = {
            totalSwaps: swaps.length,
            completedSwaps: swaps.filter(s => s.status === 'COMPLETED').length,
            pendingSwaps: swaps.filter(s => s.status === 'PENDING').length,
            averageRating: userProfile.stats?.averageRating || 0,
            totalMessages: 0 // Will be calculated separately
          };
          setUserStats(stats);
          
          // Fetch message counts for each swap
          await fetchMessageCounts(swaps);
        }
      }
    } catch (error) {
      setError('Error fetching swap requests: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update stats when userProfile changes
  useEffect(() => {
    if (userProfile && swapRequests.length > 0) {
      const stats = {
        totalSwaps: swapRequests.length,
        completedSwaps: swapRequests.filter(s => s.status === 'COMPLETED').length,
        pendingSwaps: swapRequests.filter(s => s.status === 'PENDING').length,
        averageRating: userProfile.stats?.averageRating || 0,
        totalMessages: userStats.totalMessages // Keep existing message count
      };
      setUserStats(stats);
    }
  }, [userProfile, swapRequests]);

  // Fetch message counts for swaps
  const fetchMessageCounts = async (swaps) => {
    try {
      const token = getAuthToken();
      let totalMessages = 0;
      
      for (const swap of swaps) {
        if (swap.status === 'PENDING' || swap.status === 'ACCEPTED') {
          const response = await fetch(`${API_BASE}/chat/swap/${swap.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          
          if (response.ok) {
            const messages = await response.json();
            totalMessages += messages.length || 0;
          }
        }
      }
      
      setUserStats(prev => ({
        ...prev,
        totalMessages: totalMessages
      }));
    } catch (error) {
      console.error('Error fetching message counts:', error);
    }
  };

  // Get current user ID
  const getCurrentUserId = () => {
    return localStorage.getItem('userId');
  };

  // Get other user in the swap
  const getOtherUser = (swap) => {
    const currentUserId = getCurrentUserId();
    if (swap.requesterId === currentUserId) {
      return swap.requestedUser;
    } else {
      return swap.requester;
    }
  };

  // Filter swaps to show only others' requests (for swaps tab)
  const getOthersSwapRequests = () => {
    const currentUserId = getCurrentUserId();
    return swapRequests.filter(swap => {
      // Show swaps where current user is the requested user (others sent to us)
      return swap.requestedUserId === currentUserId;
    });
  };

  // Get user's own swap requests
  const getOwnSwapRequests = () => {
    const currentUserId = getCurrentUserId();
    return swapRequests.filter(swap => {
      // Show swaps where current user is the requester (we sent to others)
      return swap.requesterId === currentUserId;
    });
  };

  // Fetch available users for swapping
  const fetchAvailableUsers = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/users/available`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const users = data.data || [];
        setAvailableUsers(users);
      }
    } catch (error) {
      setError('Error fetching users: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Create swap request
  const createSwapRequest = async (targetUserId, offeredSkill, wantedSkill) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/swaps`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({
          requestedUserId: targetUserId,
          offeredSkill: offeredSkill,
          requestedSkill: wantedSkill
        })
      });

      if (response.ok) {
        setSuccess('Swap request sent successfully!');
        fetchUserSwaps();
        fetchAvailableUsers();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to send swap request');
      }
    } catch (error) {
      setError('Error sending swap request: ' + error.message);
    }
  };

  // Accept swap request
  const acceptSwap = async (swapId) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/swaps/${swapId}/accept`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        setSuccess('Swap accepted successfully!');
        fetchUserSwaps();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to accept swap');
      }
    } catch (error) {
      setError('Error accepting swap: ' + error.message);
    }
  };

  // Reject swap request
  const rejectSwap = async (swapId) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/swaps/${swapId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        setSuccess('Swap rejected successfully!');
        fetchUserSwaps();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to reject swap');
      }
    } catch (error) {
      setError('Error rejecting swap: ' + error.message);
    }
  };

  // Complete swap request
  const completeSwap = async (swapId) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/swaps/${swapId}/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        setSuccess('Swap completed successfully! You can now rate your experience.');
        fetchUserSwaps();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to complete swap');
      }
    } catch (error) {
      setError('Error completing swap: ' + error.message);
    }
  };

  // Fetch user's ratings
  const fetchRatings = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/ratings/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRatings(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  // Submit a rating
  const submitRating = async () => {
    if (!selectedSwapForRating) return;

    try {
      const token = getAuthToken();
      const currentUserId = getCurrentUserId();
      const otherUser = getOtherUser(selectedSwapForRating);

      const ratingData = {
        ratedUserId: otherUser.id,
        swapRequestId: selectedSwapForRating.id,
        rating: ratingValue,
        comment: ratingComment
      };

      const response = await fetch(`${API_BASE}/ratings/${currentUserId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify(ratingData)
      });

      if (response.ok) {
        setSuccess('Rating submitted successfully!');
        setShowRatingModal(false);
        setSelectedSwapForRating(null);
        setRatingValue(5);
        setRatingComment('');
        fetchRatings();
        fetchUserSwaps(); // Refresh stats
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to submit rating');
      }
    } catch (error) {
      setError('Error submitting rating: ' + error.message);
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    window.location.href = '/';
  };

  // Add swap request function
  const handleSendSwapRequest = async () => {
    if (!selectedUserForCall || !swapForm.requesterSkill || !swapForm.requestedSkill || !swapForm.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSwapLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/swaps`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({
          requestedUserId: selectedUserForCall.id,
          requesterSkill: swapForm.requesterSkill,
          requestedSkill: swapForm.requestedSkill,
          message: swapForm.message,
          deadline: swapForm.deadline ? `${swapForm.deadline}T00:00:00.000Z` : undefined,
          isSuperSwap: swapForm.isSuperSwap
        })
      });
      if (response.ok) {
        toast.success('Swap request sent!');
        setSelectedUserForCall(null);
        setSwapForm({ requesterSkill: '', requestedSkill: '', message: '', deadline: '', isSuperSwap: false });
        fetchUserSwaps();
        fetchAvailableUsers();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to send swap request');
      }
    } catch (error) {
      toast.error('Error sending swap request: ' + error.message);
    } finally {
      setSwapLoading(false);
    }
  };

  // Load data on component mount and tab change
  useEffect(() => {
    fetchUserProfile();
    fetchUserSwaps();
  }, []);

  useEffect(() => {
    if (activeTab === 'discover') {
      fetchAvailableUsers();
    } else if (activeTab === 'ratings') {
      fetchRatings();
    }
  }, [activeTab]);

  // Search users when search term changes
  useEffect(() => {
    if (searchTerm && activeTab === 'discover') {
      const timeoutId = setTimeout(() => {
        fetchAvailableUsers();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, activeTab]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Add a helper to check if a swap request is already sent to a user
  const hasPendingSwapRequest = (userId) => {
    const currentUserId = getCurrentUserId();
    return swapRequests.some(
      swap => swap.requesterId === currentUserId && swap.requestedUserId === userId && swap.status === 'PENDING'
    );
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}-500`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </CardContent>
    </Card>
  );

  const TabButton = ({ id, icon: Icon, label, count }) => (
    <Button
      variant={activeTab === id ? "default" : "outline"}
      onClick={() => {
        setActiveTab(id);
        setMobileMenuOpen(false);
      }}
      className="flex items-center space-x-2 w-full sm:w-auto"
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
      {count !== undefined && count > 0 && (
        <Badge variant="secondary" className="ml-2">
          {count}
        </Badge>
      )}
    </Button>
  );

  if (!userProfile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Desktop Header */}
        <div className="hidden lg:block mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {userProfile.name}!</h1>
              <p className="text-gray-600">Manage your skills, swaps, and connections</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
                <SettingsIcon className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowVideoCall(true)}>
                <Phone className="h-4 w-4 mr-2" />
                Video Call
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <span className="text-green-700">{success}</span>
          </div>
        )}

        {/* User Profile Summary */}
        <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6 mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={userProfile.profilePhoto} />
              <AvatarFallback>{userProfile.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold truncate">{userProfile.name}</h2>
              <p className="text-gray-600">@{userProfile.username}</p>
              {userProfile.location && (
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {userProfile.location}
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">{userStats.averageRating.toFixed(1)}</span>
              </div>
              <p className="text-sm text-gray-500">Average Rating</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <StatCard 
            icon={RefreshCw} 
            title="Total Swaps" 
            value={userStats.totalSwaps}
            subtitle="All time swaps"
          />
          <StatCard 
            icon={TrendingUp} 
            title="Completed" 
            value={userStats.completedSwaps}
            subtitle="Successful swaps"
            color="green"
          />
          <StatCard 
            icon={Clock} 
            title="Pending" 
            value={userStats.pendingSwaps}
            subtitle="Awaiting response"
            color="yellow"
          />
          <StatCard 
            icon={MessageSquare} 
            title="Messages" 
            value={userStats.totalMessages}
            subtitle="Total conversations"
            color="blue"
          />
        </div>

        {/* Navigation Tabs - Mobile */}
        {mobileMenuOpen && (
          <div className="lg:hidden mb-6 bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-col space-y-2">
              <TabButton id="overview" icon={User} label="Overview" count={0} />
              <TabButton id="swaps" icon={RefreshCw} label="My Swaps" count={getOthersSwapRequests().length} />
              <TabButton id="discover" icon={Search} label="Discover" count={availableUsers.length} />
              <TabButton id="ratings" icon={Star} label="Ratings" count={ratings.length} />
            </div>
          </div>
        )}

        {/* Navigation Tabs - Desktop */}
        <div className="hidden lg:flex space-x-2 mb-6">
          <TabButton id="overview" icon={User} label="Overview" count={0} />
          <TabButton id="swaps" icon={RefreshCw} label="My Swaps" count={getOthersSwapRequests().length} />
          <TabButton id="discover" icon={Search} label="Discover" count={availableUsers.length} />
          <TabButton id="ratings" icon={Star} label="Ratings" count={ratings.length} />
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-sm">
          {activeTab === 'overview' && (
            <div className="p-4 lg:p-6 space-y-6">
              {userProfile ? (
                <>
                  <ProfileCard 
                    user={userProfile} 
                    isOwnProfile={true}
                  />
                  
                  {/* Badge System */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Achievements & Badges</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <BadgeSystem 
                        userStats={{
                          averageRating: userStats.averageRating,
                          totalRatings: userProfile.stats?.totalRatings || 0,
                          totalSwaps: userStats.totalSwaps,
                          completedSwaps: userStats.completedSwaps,
                          profileViews: userProfile.stats?.profileViews || 0,
                          totalMessages: userStats.totalMessages,
                          daysActive: userProfile.stats?.daysActive || 0
                        }}
                      />
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#875A7B] mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading profile...</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'swaps' && (
            <div className="p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
                <h2 className="text-xl font-semibold">Swap Requests (From Others)</h2>
                <Button onClick={fetchUserSwaps} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {getOthersSwapRequests().map((swap) => (
                    <Card key={swap.id}>
                      <CardContent className="p-4 lg:p-6">
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-4 lg:space-y-0">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-4 mb-2">
                              <Avatar className="h-10 w-10 flex-shrink-0">
                                <AvatarImage src={swap.requester?.profilePhoto} />
                                <AvatarFallback>
                                  {swap.requester?.name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{swap.requester?.name || swap.requester?.username || 'Unknown User'}</p>
                                <p className="text-sm text-gray-600 truncate">@{swap.requester?.username}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">They offer:</span>
                                <p className="text-gray-600">{swap.requesterSkill}</p>
                              </div>
                              <div>
                                <span className="font-medium">They want:</span>
                                <p className="text-gray-600">{swap.requestedSkill}</p>
                              </div>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mt-2">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(swap.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <Badge variant={
                              swap.status === 'PENDING' ? 'secondary' :
                              swap.status === 'ACCEPTED' ? 'default' :
                              swap.status === 'REJECTED' ? 'destructive' : 'outline'
                            }>
                              {swap.status}
                            </Badge>
                            {swap.status === 'PENDING' && (
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => acceptSwap(swap.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Accept
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => rejectSwap(swap.id)}
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                            {swap.status === 'COMPLETED' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedSwapForRating(swap);
                                  setShowRatingModal(true);
                                }}
                              >
                                Rate
                              </Button>
                            )}
                            {swap.status === 'ACCEPTED' && (
                              <Button 
                                size="sm" 
                                onClick={() => completeSwap(swap.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Complete
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {getOthersSwapRequests().length === 0 && (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No swap requests yet</h3>
                      <p className="text-gray-600 mb-4">Start by discovering users with matching skills</p>
                      <Button onClick={() => setActiveTab('discover')}>
                        <Search className="h-4 w-4 mr-2" />
                        Discover Users
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'discover' && (
            <div className="p-4 lg:p-6">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4 space-y-4 lg:space-y-0">
                <h2 className="text-xl font-semibold">Discover Users</h2>
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64"
                />
                <Select value={skillFilter} onValueChange={setSkillFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by skill" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All skills</SelectItem>
                    {userProfile.wantedSkills
                      ?.filter(skill =>
                        (typeof skill === 'string' && skill.trim() !== '') ||
                        (typeof skill === 'object' && skill && skill.name && skill.name.trim() !== '')
                      )
                      .map(skill => {
                        const skillName = typeof skill === 'string' ? skill : skill.name;
                        return (
                          <SelectItem key={skillName} value={skillName}>{skillName}</SelectItem>
                        );
                      })}
                  </SelectContent>
                </Select>
              </div>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-100 animate-pulse rounded-lg h-48" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                  {availableUsers
                    .filter(user => !skillFilter || user.offeredSkills?.some(skill => skill.name === skillFilter))
                    .map((user) => (
                      <Card key={user.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 lg:p-6">
                          <div className="flex items-center space-x-4 mb-4">
                            <Avatar className="h-12 w-12 flex-shrink-0">
                              <AvatarImage src={user.profilePhoto} />
                              <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate">{user.name}</h3>
                              <p className="text-sm text-gray-600 truncate">@{user.username}</p>
                              {user.location && (
                                <p className="text-xs text-gray-500 flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {user.location}
                                </p>
                              )}
                            </div>
                          </div>
                          {/* Badges */}
                          {user.badges && user.badges.length > 0 && (
                            <div className="mb-2 flex flex-wrap gap-1">
                              {user.badges.map((badge, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">{badge}</Badge>
                              ))}
                            </div>
                          )}
                          {/* Offered Skills */}
                          {user.offeredSkills && user.offeredSkills.length > 0 && (
                            <div className="mb-2">
                              <p className="text-sm font-medium text-gray-700 mb-1">Offers:</p>
                              <div className="flex flex-wrap gap-1">
                                {user.offeredSkills.slice(0, 3).map((skill, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
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
                          {/* Match Percentage */}
                          {user.stats?.matchPercentage !== undefined && (
                            <div className="mb-2 flex items-center gap-2">
                              <Zap className="h-4 w-4 text-green-500" />
                              <span className="text-xs font-medium text-green-700">{user.stats.matchPercentage}% match</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center mt-2">
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm font-medium">
                                {user.stats?.averageRating?.toFixed(1) || 'N/A'}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => setSelectedUserForCall(user)}
                              disabled={hasPendingSwapRequest(user.id)}
                            >
                              {hasPendingSwapRequest(user.id) ? (
                                <span className="flex items-center"><CheckCircle className="h-4 w-4 mr-1 text-green-500" /> Request Sent</span>
                              ) : (
                                <span className="flex items-center"><Plus className="h-4 w-4 mr-1" /> Swap</span>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  {availableUsers.length === 0 && (
                    <div className="col-span-full text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                      <p className="text-gray-600 mb-4">Try adjusting your search or filters.</p>
                    </div>
                  )}
                </div>
              )}
              {/* Swap Modal */}
              {selectedUserForCall && (
                <Dialog open={!!selectedUserForCall} onOpenChange={() => setSelectedUserForCall(null)}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request a Swap with {selectedUserForCall.name}</DialogTitle>
                    </DialogHeader>
                    <div className="mb-4 space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Your Skill to Offer</label>
                        <Select value={swapForm.requesterSkill} onValueChange={val => setSwapForm(f => ({ ...f, requesterSkill: val }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your skill" />
                          </SelectTrigger>
                          <SelectContent>
                            {userProfile.offeredSkills?.map(skill => (
                              <SelectItem key={skill.name} value={skill.name}>{skill.name} ({skill.level})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Skill You Want</label>
                        <Select value={swapForm.requestedSkill} onValueChange={val => setSwapForm(f => ({ ...f, requestedSkill: val }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select their skill" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedUserForCall.offeredSkills?.map(skill => (
                              <SelectItem key={skill.name} value={skill.name}>{skill.name} ({skill.level})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Message</label>
                        <textarea
                          value={swapForm.message}
                          onChange={e => setSwapForm(f => ({ ...f, message: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          rows={3}
                          placeholder="Introduce yourself and explain what you want to learn..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Deadline (Optional)</label>
                        <Input
                          type="date"
                          value={swapForm.deadline}
                          onChange={e => setSwapForm(f => ({ ...f, deadline: e.target.value }))}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="superSwap"
                          checked={swapForm.isSuperSwap}
                          onChange={e => setSwapForm(f => ({ ...f, isSuperSwap: e.target.checked }))}
                        />
                        <label htmlFor="superSwap" className="text-sm">Super Swap (priority request)</label>
                      </div>
                    </div>
                    <Button onClick={handleSendSwapRequest} className="w-full" disabled={swapLoading}>
                      {swapLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                      Send Swap Request
                    </Button>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          )}

          {activeTab === 'ratings' && userProfile && (
            <div className="p-4 lg:p-6">
              <RatingSystem 
                userId={userProfile.id} 
                userProfile={userProfile}
                onRatingSubmitted={() => {
                  fetchRatings();
                  fetchUserSwaps();
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && selectedSwapForRating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Rate Your Experience</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRatingValue(star)}
                      className="text-2xl"
                    >
                      <Star 
                        className={`h-8 w-8 ${star <= ratingValue ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Comment (optional)</label>
                <textarea
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Share your experience..."
                />
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => {
                    setShowRatingModal(false);
                    setSelectedSwapForRating(null);
                    setRatingValue(5);
                    setRatingComment('');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={submitRating}
                  className="flex-1"
                >
                  Submit Rating
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Settings</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <Settings />
          </div>
        </div>
      )}

      {/* Video Call Modal */}
      {showVideoCall && (
        <VideoCall
          isOpen={showVideoCall}
          onClose={() => setShowVideoCall(false)}
          otherUser={selectedUserForCall || {
            id: 'demo',
            name: 'Demo User',
            username: 'demo_user',
            profilePhoto: ''
          }}
          swapId="demo-swap"
        />
      )}
    </div>
  );
};

export default UserDashboard;