
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import SwapCard from './SwapCard';
import TinderCard from './TinderCard';
import { Clock, CheckCircle, XCircle, RotateCcw, Search, Filter, Send, User, MapPin, Star } from 'lucide-react';
import { toast } from 'sonner';

const SwapPage = () => {
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [swapRequests, setSwapRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('all');
  const [showSwapDialog, setShowSwapDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [swapForm, setSwapForm] = useState({
    requesterSkill: '',
    requestedSkill: '',
    message: '',
    deadline: '',
    isSuperSwap: false
  });
  const [currentUserProfile, setCurrentUserProfile] = useState(null);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // API base URL
  const API_BASE = 'http://localhost:8091/api';

  // Fetch available users
  const fetchAvailableUsers = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      console.log('Available users - Token:', token ? 'Present' : 'Missing');
      
      if (!token) {
        toast.error('Authentication token not found. Please login again.');
        return;
      }

      const response = await fetch(`${API_BASE}/users/available`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        const users = await response.json();
        // Filter out current user and ensure proper data structure
        const currentUserId = localStorage.getItem('userId');
        const filteredUsers = users.filter(user => user.id !== currentUserId).map(user => ({
          ...user,
          // Ensure wantedSkills is always an array of objects { name, level }
          wantedSkills: Array.isArray(user.wantedSkills)
            ? user.wantedSkills.map(skill =>
                typeof skill === 'string'
                  ? { name: skill, level: 'BEGINNER' }
                  : { name: skill.name || skill, level: skill.level || 'BEGINNER' }
              )
            : [],
          // Ensure offeredSkills is always an array of objects { name, level }
          offeredSkills: Array.isArray(user.offeredSkills)
            ? user.offeredSkills.map(skill =>
                typeof skill === 'string'
                  ? { name: skill, level: 'BEGINNER' }
                  : { name: skill.name || skill, level: skill.level || 'BEGINNER' }
              )
            : []
        }));
        setAvailableUsers(filteredUsers);
      } else {
        toast.error('Failed to fetch available users');
      }
    } catch (error) {
      toast.error('Error fetching users: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch current user profile
  const fetchCurrentUserProfile = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Authentication token not found. Please login again.');
        return;
      }

      const response = await fetch(`${API_BASE}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        const profile = await response.json();
        setCurrentUserProfile(profile);
      } else {
        toast.error('Failed to fetch user profile');
      }
    } catch (error) {
      toast.error('Error fetching user profile: ' + error.message);
    }
  };

  // Fetch user's swap requests
  const fetchSwapRequests = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      console.log('Swap requests - Token:', token ? 'Present' : 'Missing');
      
      if (!token) {
        toast.error('Authentication token not found. Please login again.');
        return;
      }

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
        setSwapRequests(data.data || []);
      } else {
        toast.error('Failed to fetch swap requests');
      }
    } catch (error) {
      toast.error('Error fetching swap requests: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Create swap request
  const createSwapRequest = async () => {
    console.log('createSwapRequest called');
    console.log('selectedUser:', selectedUser);
    console.log('swapForm:', swapForm);
    console.log('currentUserProfile:', currentUserProfile);
    
    if (!selectedUser || !swapForm.requesterSkill || !swapForm.requestedSkill || !swapForm.message) {
      console.log('Validation failed:', {
        selectedUser: !!selectedUser,
        requesterSkill: !!swapForm.requesterSkill,
        requestedSkill: !!swapForm.requestedSkill,
        message: !!swapForm.message
      });
      toast.error('Please fill in all required fields');
      return;
    }

    if (!currentUserProfile) {
      console.log('Current user profile not loaded');
      toast.error('User profile not loaded. Please refresh the page.');
      return;
    }

    try {
      const token = getAuthToken();
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('Token length:', token ? token.length : 0);
      
      if (!token) {
        toast.error('Authentication token not found. Please login again.');
        return;
      }

      const requestBody: any = {
        requestedUserId: selectedUser.id,
        requesterSkill: swapForm.requesterSkill,
        requestedSkill: swapForm.requestedSkill,
        message: swapForm.message,
        isSuperSwap: swapForm.isSuperSwap
      };
      
      // Only add deadline if it's provided
      if (swapForm.deadline) {
        requestBody.deadline = `${swapForm.deadline}T00:00:00.000Z`;
      }
      
      console.log('Sending swap request:', requestBody);
      console.log('Selected user skills:', selectedUser.offeredSkills);
      
      const response = await fetch(`${API_BASE}/swaps`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Success response:', data);
        toast.success('Swap request sent successfully!');
        setShowSwapDialog(false);
        setSelectedUser(null);
        setSwapForm({
          requesterSkill: '',
          requestedSkill: '',
          message: '',
          deadline: '',
          isSuperSwap: false
        });
        fetchSwapRequests();
      } else {
        console.log('Error response status:', response.status);
        const errorData = await response.json();
        console.error('Swap request error:', errorData);
        
        // Handle different error response formats
        if (errorData.message) {
          // ApiResponse format
          toast.error(errorData.message);
        } else if (typeof errorData === 'object') {
          // Validation error format (Map<String, String>)
          const errorMessages = Object.values(errorData).join(', ');
          toast.error(`Validation error: ${errorMessages}`);
        } else {
          toast.error('Failed to send swap request');
        }
      }
    } catch (error) {
      toast.error('Error sending swap request: ' + error.message);
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
        toast.success('Swap accepted successfully!');
        fetchSwapRequests();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to accept swap');
      }
    } catch (error) {
      toast.error('Error accepting swap: ' + error.message);
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
        toast.success('Swap completed successfully! You can now rate your experience.');
        fetchSwapRequests();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to complete swap');
      }
    } catch (error) {
      toast.error('Error completing swap: ' + error.message);
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
        toast.success('Swap rejected successfully!');
        fetchSwapRequests();
      } else {
        toast.error('Failed to reject swap');
      }
    } catch (error) {
      toast.error('Error rejecting swap: ' + error.message);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchCurrentUserProfile();
    fetchAvailableUsers();
    fetchSwapRequests();
  }, []);

  // Filter users based on search and skill filter
  const filteredUsers = availableUsers.filter(user => {
    const matchesSearch = !searchTerm || 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSkill = !skillFilter || skillFilter === 'all' || 
      user.offeredSkills?.some(skill => skill.name.toLowerCase().includes(skillFilter.toLowerCase()));

    return matchesSearch && matchesSkill;
  });

  const handleSwipeLeft = () => {
    if (currentUserIndex < filteredUsers.length - 1) {
      setCurrentUserIndex(currentUserIndex + 1);
    } else {
      setCurrentUserIndex(filteredUsers.length);
    }
  };

  const handleSwipeRight = (user) => {
    setSelectedUser(user);
    setSwapForm({
      requesterSkill: '',
      requestedSkill: '',
      message: '',
      deadline: '',
      isSuperSwap: false
    });
    setShowSwapDialog(true);
  };

  const handleSuperSwipe = (user) => {
    setSelectedUser(user);
    setSwapForm({
      requesterSkill: '',
      requestedSkill: '',
      message: '',
      deadline: '',
      isSuperSwap: true
    });
    setShowSwapDialog(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'ACCEPTED':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const pendingSwaps = swapRequests.filter(swap => swap.status === 'PENDING');
  const ongoingSwaps = swapRequests.filter(swap => swap.status === 'ACCEPTED');
  const completedSwaps = swapRequests.filter(swap => swap.status === 'COMPLETED' || swap.status === 'REJECTED');

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Skill Swap</h1>
        <p className="text-gray-600">Find your perfect skill exchange partner</p>
      </div>

      <Tabs defaultValue="discover" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-6">
          <TabsTrigger value="discover" className="text-xs md:text-sm">Discover</TabsTrigger>
          <TabsTrigger value="ongoing" className="text-xs md:text-sm">Ongoing</TabsTrigger>
          <TabsTrigger value="pending" className="text-xs md:text-sm">Pending</TabsTrigger>
          <TabsTrigger value="history" className="text-xs md:text-sm">History</TabsTrigger>
          <TabsTrigger value="ratings" className="text-xs md:text-sm">Ratings</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={skillFilter} onValueChange={setSkillFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by skill" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All skills</SelectItem>
                  <SelectItem value="React">React</SelectItem>
                  <SelectItem value="Python">Python</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="JavaScript">JavaScript</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={fetchAvailableUsers} disabled={loading} className="w-full sm:w-auto">
              <RotateCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* User Cards */}
          <div className="flex justify-center items-center min-h-[500px] md:min-h-[600px]">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <RotateCcw className="h-8 w-8 animate-spin" />
              </div>
            ) : currentUserIndex < filteredUsers.length ? (
              <div className="relative w-full max-w-sm mx-auto h-[500px] md:h-[600px] flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <TinderCard
                    user={filteredUsers[currentUserIndex]}
                    onSwipeLeft={handleSwipeLeft}
                    onSwipeRight={() => handleSwipeRight(filteredUsers[currentUserIndex])}
                    onSuperSwipe={() => handleSuperSwipe(filteredUsers[currentUserIndex])}
                    isActive={true}
                  />
                </div>
              </div>
            ) : (
              <Card className="w-full max-w-sm mx-auto">
                <CardContent className="p-8 text-center">
                  <RotateCcw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No more profiles</h3>
                  <p className="text-gray-600 text-sm">Check back later for new skill swappers!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="ongoing" className="space-y-4">
          {ongoingSwaps.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No ongoing swaps</h3>
                <p className="text-gray-600 text-sm">Start by discovering users and sending swap requests!</p>
              </CardContent>
            </Card>
          ) : (
            ongoingSwaps.map((swap) => (
              <Card key={swap.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarImage src={swap.requester?.profilePhoto} />
                        <AvatarFallback>
                          {swap.requester?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {swap.requester?.name || swap.requester?.username || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {swap.requesterSkill} ↔ {swap.requestedSkill}
                        </p>
                        <p className="text-xs text-gray-500">
                          {swap.deadline ? `Deadline: ${new Date(swap.deadline).toLocaleDateString()}` : 'No deadline'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getStatusIcon(swap.status)}
                      <Badge className={getStatusColor(swap.status)}>
                        {swap.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingSwaps.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending swaps</h3>
                <p className="text-gray-600 text-sm">No swap requests waiting for your response.</p>
              </CardContent>
            </Card>
          ) : (
            pendingSwaps.map((swap) => (
              <Card key={swap.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarImage src={swap.requester?.profilePhoto} />
                        <AvatarFallback>
                          {swap.requester?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {swap.requester?.name || swap.requester?.username || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {swap.requesterSkill} ↔ {swap.requestedSkill}
                        </p>
                        <p className="text-xs text-gray-500">
                          {swap.message}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-shrink-0">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(swap.status)}
                        <Badge className={getStatusColor(swap.status)}>
                          {swap.status}
                        </Badge>
                      </div>
                      {swap.status === 'PENDING' && swap.requestedUserId === currentUserProfile?.id && (
                        <Button 
                          size="sm" 
                          onClick={() => acceptSwap(swap.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Accept
                        </Button>
                      )}
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => rejectSwap(swap.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {completedSwaps.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No swap history</h3>
                <p className="text-gray-600 text-sm">Complete your first swap to see it here!</p>
              </CardContent>
            </Card>
          ) : (
            completedSwaps.map((swap) => (
              <Card key={swap.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarImage src={swap.requester?.profilePhoto} />
                        <AvatarFallback>
                          {swap.requester?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {swap.requester?.name || swap.requester?.username || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {swap.requesterSkill} ↔ {swap.requestedSkill}
                        </p>
                        <p className="text-xs text-gray-500">
                          {swap.updatedAt ? `Completed: ${new Date(swap.updatedAt).toLocaleDateString()}` : 'Unknown date'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-shrink-0">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(swap.status)}
                        <Badge className={getStatusColor(swap.status)}>
                          {swap.status}
                        </Badge>
                      </div>
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
            ))
          )}
        </TabsContent>

        <TabsContent value="ratings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Ratings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="text-center sm:text-left">
                  <p className="text-base md:text-lg font-semibold text-gray-700">Average Rating:</p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="text-2xl font-bold text-[#875A7B]">{currentUserProfile?.stats?.averageRating?.toFixed(1) || 'N/A'}</span>
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-base md:text-lg font-semibold text-gray-700">Total Ratings:</p>
                  <span className="text-2xl font-bold text-[#875A7B]">{currentUserProfile?.stats?.totalRatings || 0}</span>
                </div>
              </div>
              {/* You can add a list of received/given ratings here if available */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Swap Request Dialog */}
      <Dialog open={showSwapDialog} onOpenChange={setShowSwapDialog}>
        <DialogContent className="max-w-lg w-full max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Send Swap Request</DialogTitle>
            <DialogDescription>
              Select the skills you want to exchange and send a message to start the swap.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedUser.profilePhoto} />
                  <AvatarFallback>{selectedUser.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{selectedUser.name}</h4>
                  <p className="text-sm text-gray-600">@{selectedUser.username}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Your Skill (You Offer)</label>
                  <Select value={swapForm.requesterSkill} onValueChange={(value) => setSwapForm({...swapForm, requesterSkill: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your skill" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentUserProfile?.offeredSkills?.filter(skill => skill && skill.name && skill.name.trim() !== '').map((skill) => (
                        <SelectItem key={skill.name} value={skill.name}>{skill.name} ({skill.level})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {currentUserProfile?.offeredSkills && (
                    <p className="text-xs text-gray-500 mt-1">
                      Available: {currentUserProfile.offeredSkills.filter(skill => skill && skill.name && skill.name.trim() !== '').map(s => s.name).join(', ')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Their Skill (You Want)</label>
                  <Select value={swapForm.requestedSkill} onValueChange={(value) => setSwapForm({...swapForm, requestedSkill: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select their skill" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedUser.offeredSkills?.filter(skill => 
                        skill && skill.name && skill.name.trim() !== ''
                      ).map((skill) => (
                        <SelectItem key={skill.name} value={skill.name}>{skill.name} ({skill.level})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedUser?.offeredSkills && (
                    <p className="text-xs text-gray-500 mt-1">
                      Available: {selectedUser.offeredSkills.filter(skill => 
                        skill && skill.name && skill.name.trim() !== ''
                      ).map(s => s.name).join(', ')}
                    </p>
                  )}
                  {currentUserProfile?.wantedSkills && (
                    <p className="text-xs text-gray-500">
                      You want: {currentUserProfile.wantedSkills.join(', ')}
                    </p>
                  )}
                  {selectedUser?.offeredSkills && (
                    <p className="text-xs text-gray-500">
                      They offer: {selectedUser.offeredSkills.filter(skill => skill && skill.name && skill.name.trim() !== '').map(s => s.name).join(', ')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Message</label>
                  <Textarea
                    value={swapForm.message}
                    onChange={(e) => setSwapForm({...swapForm, message: e.target.value})}
                    placeholder="Introduce yourself and explain what you want to learn..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Deadline (Optional)</label>
                  <Input
                    type="date"
                    value={swapForm.deadline}
                    onChange={(e) => setSwapForm({...swapForm, deadline: e.target.value})}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="superSwap"
                    checked={swapForm.isSuperSwap}
                    onChange={(e) => setSwapForm({...swapForm, isSuperSwap: e.target.checked})}
                  />
                  <label htmlFor="superSwap" className="text-sm">Super Swap (Priority)</label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowSwapDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={createSwapRequest} className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Send Request
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SwapPage;
