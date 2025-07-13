import React, { useState, useEffect } from 'react';
import {
  Users,
  MessageSquare,
  RefreshCw,
  UserX,
  UserCheck,
  Trash2,
  Shield,
  ShieldOff,
  BarChart3,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Send,
  Calendar,
  TrendingUp
} from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // State for dashboard data
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalSwaps: 0,
    pendingSwaps: 0,
    completedSwaps: 0,
    totalMessages: 0
  });

  const [users, setUsers] = useState([]);
  const [swapRequests, setSwapRequests] = useState([]);
  const [adminMessages, setAdminMessages] = useState([]);
  const [newMessage, setNewMessage] = useState({ title: '', content: '', type: 'INFO' });

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // API base URL - use full URL to prevent 304 errors
  const API_BASE = 'http://localhost:8091/api';

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/admin/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        const stats = await response.json();
        setDashboardStats(stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUsers(userData);
      } else {
        setError('Failed to fetch users');
      }
    } catch (error) {
      setError('Error fetching users: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all swap requests
  const fetchSwapRequests = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/admin/swaps`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        const swapData = await response.json();
        setSwapRequests(swapData);
      } else {
        setError('Failed to fetch swap requests');
      }
    } catch (error) {
      setError('Error fetching swap requests: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch admin messages
  const fetchAdminMessages = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/admin/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        const messageData = await response.json();
        setAdminMessages(messageData);
      } else {
        setError('Failed to fetch admin messages');
      }
    } catch (error) {
      setError('Error fetching admin messages: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Ban user
  const banUser = async (userId) => {
    if (!window.confirm('Are you sure you want to ban this user?')) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/admin/users/${userId}/ban`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        setSuccess('User banned successfully');
        fetchUsers();
      } else {
        setError('Failed to ban user');
      }
    } catch (error) {
      setError('Error banning user: ' + error.message);
    }
  };

  // Unban user
  const unbanUser = async (userId) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/admin/users/${userId}/unban`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        setSuccess('User unbanned successfully');
        fetchUsers();
      } else {
        setError('Failed to unban user');
      }
    } catch (error) {
      setError('Error unbanning user: ' + error.message);
    }
  };

  // Make user admin
  const makeUserAdmin = async (userId) => {
    if (!window.confirm('Are you sure you want to make this user an admin?')) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/admin/users/${userId}/make-admin`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        setSuccess('User promoted to admin successfully');
        fetchUsers();
      } else {
        setError('Failed to promote user');
      }
    } catch (error) {
      setError('Error promoting user: ' + error.message);
    }
  };

  // Remove admin role
  const removeAdminRole = async (userId) => {
    if (!window.confirm('Are you sure you want to remove admin role from this user?')) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/admin/users/${userId}/remove-admin`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        setSuccess('Admin role removed successfully');
        fetchUsers();
      } else {
        setError('Failed to remove admin role');
      }
    } catch (error) {
      setError('Error removing admin role: ' + error.message);
    }
  };

  // Delete swap request
  const deleteSwapRequest = async (swapId) => {
    if (!window.confirm('Are you sure you want to delete this swap request?')) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/admin/swaps/${swapId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        setSuccess('Swap request deleted successfully');
        fetchSwapRequests();
        fetchDashboardStats();
      } else {
        setError('Failed to delete swap request');
      }
    } catch (error) {
      setError('Error deleting swap request: ' + error.message);
    }
  };

  // Send platform message
  const sendPlatformMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.title || !newMessage.content) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/admin/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify(newMessage)
      });

      if (response.ok) {
        setSuccess('Message sent successfully');
        setNewMessage({ title: '', content: '', type: 'INFO' });
        fetchAdminMessages();
      } else {
        setError('Failed to send message');
      }
    } catch (error) {
      setError('Error sending message: ' + error.message);
    }
  };

  // Reject skill
  const rejectSkill = async (userId, skillName) => {
    if (!window.confirm(`Are you sure you want to reject the skill "${skillName}"?`)) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/admin/users/${userId}/skills/${skillName}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        setSuccess('Skill rejected successfully');
        fetchUsers();
      } else {
        setError('Failed to reject skill');
      }
    } catch (error) {
      setError('Error rejecting skill: ' + error.message);
    }
  };

  // Load data on component mount and tab change
  useEffect(() => {
    fetchDashboardStats();

    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'swaps') {
      fetchSwapRequests();
    } else if (activeTab === 'messages') {
      fetchAdminMessages();
    }
  }, [activeTab]);

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

  const StatCard = ({ icon: Icon, title, value, color = "blue" }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <Icon className={`h-8 w-8 text-${color}-500`} />
      </div>
    </div>
  );

  const TabButton = ({ id, icon: Icon, label, count }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
        activeTab === id
          ? 'bg-blue-500 text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
      {count !== undefined && (
        <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, swaps, and platform messages</p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-green-700">{success}</span>
          </div>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon={Users} title="Total Users" value={dashboardStats.totalUsers} />
          <StatCard icon={TrendingUp} title="Active Users" value={dashboardStats.activeUsers} />
          <StatCard icon={RefreshCw} title="Total Swaps" value={dashboardStats.totalSwaps} />
          <StatCard icon={MessageSquare} title="Total Messages" value={dashboardStats.totalMessages} />
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-6 bg-white p-4 rounded-lg shadow-sm">
          <TabButton id="overview" icon={BarChart3} label="Overview" />
          <TabButton id="users" icon={Users} label="Users" count={users.length} />
          <TabButton id="swaps" icon={RefreshCw} label="Swaps" count={swapRequests.length} />
          <TabButton id="messages" icon={MessageSquare} label="Messages" count={adminMessages.length} />
          <TabButton id="projects" icon={Eye} label="Projects" count={0} />
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-sm">
          {activeTab === 'overview' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Platform Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Swap Statistics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pending Swaps:</span>
                      <span className="font-medium">{dashboardStats.pendingSwaps}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completed Swaps:</span>
                      <span className="font-medium">{dashboardStats.completedSwaps}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Success Rate:</span>
                      <span className="font-medium">
                        {dashboardStats.totalSwaps > 0
                          ? Math.round((dashboardStats.completedSwaps / dashboardStats.totalSwaps) * 100)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">User Activity</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Users:</span>
                      <span className="font-medium">{dashboardStats.activeUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Messages:</span>
                      <span className="font-medium">{dashboardStats.totalMessages}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg. Messages/User:</span>
                      <span className="font-medium">
                        {dashboardStats.totalUsers > 0
                          ? Math.round(dashboardStats.totalMessages / dashboardStats.totalUsers)
                          : 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">User Management</h2>
                <button
                  onClick={fetchUsers}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <img
                                  className="h-10 w-10 rounded-full"
                                  src={user.profilePhoto || '/api/placeholder/40/40'}
                                  alt=""
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.roles && user.roles.includes('ADMIN')
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.roles && user.roles.includes('ADMIN') ? 'ADMIN' : 'USER'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.banned
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {user.banned ? 'Banned' : 'Active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {user.banned ? (
                                <button
                                  onClick={() => unbanUser(user.id)}
                                  className="text-green-600 hover:text-green-900"
                                  title="Unban user"
                                >
                                  <UserCheck className="h-4 w-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => banUser(user.id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Ban user"
                                >
                                  <UserX className="h-4 w-4" />
                                </button>
                              )}

                              {user.roles && user.roles.includes('ADMIN') ? (
                                <button
                                  onClick={() => removeAdminRole(user.id)}
                                  className="text-orange-600 hover:text-orange-900"
                                  title="Remove admin role"
                                >
                                  <ShieldOff className="h-4 w-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => makeUserAdmin(user.id)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Make admin"
                                >
                                  <Shield className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'swaps' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Swap Management</h2>
                <button
                  onClick={fetchSwapRequests}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Requester
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Requested From
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Skills
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {swapRequests.map((swap) => (
                        <tr key={swap.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {swap.requester?.name || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {swap.requester?.email || 'Unknown'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {swap.requestedFrom?.name || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {swap.requestedFrom?.email || 'Unknown'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <div><strong>Offered:</strong> {swap.offeredSkill || 'N/A'}</div>
                              <div><strong>Wanted:</strong> {swap.wantedSkill || 'N/A'}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              swap.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800'
                                : swap.status === 'ACCEPTED'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {swap.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(swap.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => deleteSwapRequest(swap.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete swap request"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Platform Messages</h2>
                <button
                  onClick={fetchAdminMessages}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {/* Send Message Form */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-medium mb-4">Send Platform Message</h3>
                <form onSubmit={sendPlatformMessage} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={newMessage.title}
                      onChange={(e) => setNewMessage({...newMessage, title: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Message title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content
                    </label>
                    <textarea
                      value={newMessage.content}
                      onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                      rows={4}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Message content"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={newMessage.type}
                      onChange={(e) => setNewMessage({...newMessage, type: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="INFO">Info</option>
                      <option value="WARNING">Warning</option>
                      <option value="ANNOUNCEMENT">Announcement</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    <Send className="h-4 w-4" />
                    <span>Send Message</span>
                  </button>
                </form>
              </div>

              {/* Messages List */}
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <div className="space-y-4">
                  {adminMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 rounded-lg border-l-4 ${
                        message.type === 'WARNING'
                          ? 'bg-yellow-50 border-yellow-400'
                          : message.type === 'ANNOUNCEMENT'
                          ? 'bg-blue-50 border-blue-400'
                          : 'bg-gray-50 border-gray-400'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{message.title}</h4>
                          <p className="text-gray-600 mt-1">{message.content}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>Type: {message.type}</span>
                            <span>•</span>
                            <span>
                              {new Date(message.createdAt).toLocaleDateString()} at{' '}
                              {new Date(message.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          message.type === 'WARNING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : message.type === 'ANNOUNCEMENT'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {message.type}
                        </span>
                      </div>
                    </div>
                  ))}
                  {adminMessages.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No messages found. Send your first platform message above.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Project Management</h2>
                <button
                  disabled={true}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
                >
                  <Eye className="h-4 w-4" />
                  <span>Coming Soon</span>
                </button>
              </div>

              <div className="bg-gray-50 p-8 rounded-lg text-center">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Project Management Coming Soon
                </h3>
                <p className="text-gray-600 mb-4">
                  This feature is not yet implemented in the backend. It will allow you to:
                </p>
                <ul className="text-left text-gray-600 space-y-2 max-w-md mx-auto">
                  <li>• View and manage user projects</li>
                  <li>• Approve or reject project submissions</li>
                  <li>• Monitor project completion rates</li>
                  <li>• Generate project analytics</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;