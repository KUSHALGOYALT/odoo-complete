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
  Settings,
  LogOut,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
        const profile = await response.json();
        setUserProfile(profile);
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
      const response = await fetch(`${API_BASE}/swaps`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        const swaps = await response.json();
        setSwapRequests(swaps);
        
        // Calculate stats
        const stats = {
          totalSwaps: swaps.length,
          completedSwaps: swaps.filter(s => s.status === 'COMPLETED').length,
          pendingSwaps: swaps.filter(s => s.status === 'PENDING').length,
          averageRating: userProfile?.stats?.averageRating || 0,
          totalMessages: userProfile?.stats?.totalMessages || 0
        };
        setUserStats(stats);
      }
    } catch (error) {
      setError('Error fetching swap requests: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available users for swapping
  const fetchAvailableUsers = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/users/search?q=${searchTerm}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        const users = await response.json();
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
          requestedFromId: targetUserId,
          offeredSkill: offeredSkill,
          wantedSkill: wantedSkill
        })
      });

      if (response.ok) {
        setSuccess('Swap request sent successfully!');
        fetchUserSwaps();
      } else {
        setError('Failed to send swap request');
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
        setError('Failed to accept swap');
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
        setError('Failed to reject swap');
      }
    } catch (error) {
      setError('Error rejecting swap: ' + error.message);
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    window.location.href = '/';
  };

  // Load data on component mount and tab change
  useEffect(() => {
    fetchUserProfile();

    if (activeTab === 'swaps') {
      fetchUserSwaps();
    } else if (activeTab === 'discover') {
      fetchAvailableUsers();
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

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => (
    <Card>
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
      onClick={() => setActiveTab(id)}
      className="flex items-center space-x-2"
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
      {count !== undefined && (
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {userProfile.name}!</h1>
              <p className="text-gray-600">Manage your skills, swaps, and connections</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
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
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={userProfile.profilePhoto} />
              <AvatarFallback>{userProfile.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{userProfile.name}</h2>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-6">
          <TabButton id="overview" icon={User} label="Overview" />
          <TabButton id="swaps" icon={RefreshCw} label="My Swaps" count={swapRequests.length} />
          <TabButton id="discover" icon={Search} label="Discover" count={availableUsers.length} />
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-sm">
          {activeTab === 'overview' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Your Activity Overview</h2>
              
              {/* Skills Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Offered Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {userProfile.offeredSkills?.map((skill, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="font-medium">{skill.name}</span>
                          <Badge variant="outline">{skill.level}</Badge>
                        </div>
                      ))}
                      {(!userProfile.offeredSkills || userProfile.offeredSkills.length === 0) && (
                        <p className="text-gray-500 text-sm">No skills offered yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Wanted Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {userProfile.wantedSkills?.map((skill, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="font-medium">{skill}</span>
                          <Badge variant="secondary">Wanted</Badge>
                        </div>
                      ))}
                      {(!userProfile.wantedSkills || userProfile.wantedSkills.length === 0) && (
                        <p className="text-gray-500 text-sm">No skills wanted yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {swapRequests.slice(0, 5).map((swap) => (
                      <div key={swap.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">
                            {swap.status === 'PENDING' ? 'Pending swap request' : 
                             swap.status === 'ACCEPTED' ? 'Swap accepted' : 'Swap completed'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {swap.offeredSkill} ↔ {swap.wantedSkill}
                          </p>
                        </div>
                        <Badge variant={
                          swap.status === 'PENDING' ? 'secondary' :
                          swap.status === 'ACCEPTED' ? 'default' : 'outline'
                        }>
                          {swap.status}
                        </Badge>
                      </div>
                    ))}
                    {swapRequests.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No recent activity</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'swaps' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">My Swap Requests</h2>
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
                  {swapRequests.map((swap) => (
                    <Card key={swap.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-2">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={swap.requestedFrom?.profilePhoto} />
                                <AvatarFallback>
                                  {swap.requestedFrom?.name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{swap.requestedFrom?.name}</p>
                                <p className="text-sm text-gray-600">@{swap.requestedFrom?.username}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">You offer:</span>
                                <p className="text-gray-600">{swap.offeredSkill}</p>
                              </div>
                              <div>
                                <span className="font-medium">You want:</span>
                                <p className="text-gray-600">{swap.wantedSkill}</p>
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
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {swapRequests.length === 0 && (
                    <div className="text-center py-8">
                      <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Discover Users</h2>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                  <Select value={skillFilter} onValueChange={setSkillFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by skill" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All skills</SelectItem>
                      {userProfile.wantedSkills?.map((skill) => (
                        <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableUsers
                    .filter(user => !skillFilter || user.offeredSkills?.some(skill => skill.name === skillFilter))
                    .map((user) => (
                    <Card key={user.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user.profilePhoto} />
                            <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold">{user.name}</h3>
                            <p className="text-sm text-gray-600">@{user.username}</p>
                            {user.location && (
                              <p className="text-xs text-gray-500 flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {user.location}
                              </p>
                            )}
                          </div>
                        </div>

                        {user.offeredSkills && user.offeredSkills.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Offers:</p>
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

                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium">
                              {user.stats?.averageRating?.toFixed(1) || 'N/A'}
                            </span>
                          </div>
                          <Button size="sm" onClick={() => {
                            // This would open a modal to create swap request
                            console.log('Create swap with:', user.id);
                          }}>
                            <Plus className="h-4 w-4 mr-1" />
                            Swap
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {availableUsers.length === 0 && (
                    <div className="col-span-full text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                      <p className="text-gray-600">Try adjusting your search terms</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 