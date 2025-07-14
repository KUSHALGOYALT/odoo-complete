import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  Shield, 
  AlertTriangle,
  Users,
  MessageSquare,
  BarChart3,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Ban,
  Unlock,
  Flag,
  Send,
  FileText,
  TrendingUp,
  Activity,
  RefreshCw,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

interface DashboardStats {
  userStats: {
    totalUsers: number;
    activeUsers: number;
    bannedUsers: number;
  };
  swapStats: {
    totalSwaps: number;
    pendingSwaps: number;
    acceptedSwaps: number;
    cancelledSwaps: number;
    completedSwaps: number;
    completionRate: number;
  };
  pendingFlaggedSkills: number;
  activeAnnouncements: number;
}

interface FlaggedSkill {
  id: string;
  skillName: string;
  skillDescription: string;
  reason: string;
  status: string;
  flaggedAt: string;
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
  };
  reviewedBy?: {
    name: string;
  };
  reviewedAt?: string;
  reviewNotes?: string;
}

interface UserBan {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
  };
  bannedBy: {
    name: string;
  };
  reason: string;
  bannedAt: string;
  isActive: boolean;
  unbannedAt?: string;
  unbannedBy?: {
    name: string;
  };
  unbanReason?: string;
}

interface SwapRequest {
  id: string;
  requester: {
    name: string;
    username: string;
  };
  requestedUser: {
    name: string;
    username: string;
  };
  status: string;
  createdAt: string;
  offeredSkill: string;
  requestedSkill: string;
}

interface PlatformAnnouncement {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  isActive: boolean;
  createdBy: {
    name: string;
  };
}

const AdminPanel = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [flaggedSkills, setFlaggedSkills] = useState<FlaggedSkill[]>([]);
  const [userBans, setUserBans] = useState<UserBan[]>([]);
  const [swaps, setSwaps] = useState<SwapRequest[]>([]);
  const [announcements, setAnnouncements] = useState<PlatformAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [swapStatusFilter, setSwapStatusFilter] = useState('all');
  
  // Form states
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    type: 'INFO'
  });
  const [banForm, setBanForm] = useState({
    userId: '',
    reason: ''
  });
  const [reviewNotes, setReviewNotes] = useState('');

  const API_BASE = 'http://localhost:8091/api';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch dashboard stats
      const statsResponse = await fetch(`${API_BASE}/admin/dashboard/stats`, { headers });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch flagged skills
      const flaggedResponse = await fetch(`${API_BASE}/admin/flagged-skills`, { headers });
      if (flaggedResponse.ok) {
        const flaggedData = await flaggedResponse.json();
        setFlaggedSkills(flaggedData);
      }

      // Fetch active bans
      const bansResponse = await fetch(`${API_BASE}/admin/users/bans/active`, { headers });
      if (bansResponse.ok) {
        const bansData = await bansResponse.json();
        setUserBans(bansData);
      }

      // Fetch swaps
      const swapsResponse = await fetch(`${API_BASE}/admin/swaps`, { headers });
      if (swapsResponse.ok) {
        const swapsData = await swapsResponse.json();
        setSwaps(swapsData);
      }

      // Fetch announcements
      const announcementsResponse = await fetch(`${API_BASE}/admin/announcements`, { headers });
      if (announcementsResponse.ok) {
        const announcementsData = await announcementsResponse.json();
        setAnnouncements(announcementsData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const approveSkill = async (flaggedSkillId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/flagged-skills/${flaggedSkillId}/approve?reviewNotes=${encodeURIComponent(reviewNotes)}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Skill approved successfully');
        setReviewNotes('');
        fetchDashboardData();
      } else {
        toast.error('Failed to approve skill');
      }
    } catch (error) {
      toast.error('Error approving skill');
    }
  };

  const rejectSkill = async (flaggedSkillId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/flagged-skills/${flaggedSkillId}/reject?reviewNotes=${encodeURIComponent(reviewNotes)}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Skill rejected successfully');
        setReviewNotes('');
        fetchDashboardData();
      } else {
        toast.error('Failed to reject skill');
      }
    } catch (error) {
      toast.error('Error rejecting skill');
    }
  };

  const banUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/users/ban`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(banForm)
      });

      if (response.ok) {
        toast.success('User banned successfully');
        setBanForm({ userId: '', reason: '' });
        fetchDashboardData();
      } else {
        toast.error('Failed to ban user');
      }
    } catch (error) {
      toast.error('Error banning user');
    }
  };

  const unbanUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/users/${userId}/unban`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('User unbanned successfully');
        fetchDashboardData();
      } else {
        toast.error('Failed to unban user');
      }
    } catch (error) {
      toast.error('Error unbanning user');
    }
  };

  const createAnnouncement = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/announcements`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(announcementForm)
      });

      if (response.ok) {
        toast.success('Announcement created successfully');
        setAnnouncementForm({ title: '', message: '', type: 'INFO' });
        fetchDashboardData();
      } else {
        toast.error('Failed to create announcement');
      }
    } catch (error) {
      toast.error('Error creating announcement');
    }
  };

  const deactivateAnnouncement = async (announcementId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/announcements/${announcementId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Announcement deactivated');
        fetchDashboardData();
      } else {
        toast.error('Failed to deactivate announcement');
      }
    } catch (error) {
      toast.error('Error deactivating announcement');
    }
  };

  const downloadReport = async (reportType: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/reports/${reportType}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(`${reportType} report downloaded`);
      } else {
        toast.error('Failed to download report');
      }
    } catch (error) {
      toast.error('Error downloading report');
    }
  };

  const filteredSwaps = swapStatusFilter === 'all' 
    ? swaps 
    : swaps.filter(swap => swap.status.toLowerCase() === swapStatusFilter.toLowerCase());

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                  <p className="text-sm text-gray-600">Platform administration and moderation</p>
                </div>
              </div>
              <Button variant="outline" onClick={fetchDashboardData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-6">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-white">
              <TabsTrigger value="dashboard" className="flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="flagged-skills" className="flex items-center space-x-2">
                <Flag className="h-4 w-4" />
                <span>Flagged Skills</span>
              </TabsTrigger>
              <TabsTrigger value="user-bans" className="flex items-center space-x-2">
                <Ban className="h-4 w-4" />
                <span>User Bans</span>
              </TabsTrigger>
              <TabsTrigger value="swaps" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Swap Monitoring</span>
              </TabsTrigger>
              <TabsTrigger value="announcements" className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>Announcements</span>
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium opacity-90">Total Users</CardTitle>
                    <Users className="h-4 w-4 opacity-75" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats?.userStats.totalUsers || 0}</div>
                    <p className="text-xs opacity-75 mt-1">
                      {stats?.userStats.activeUsers || 0} active • {stats?.userStats.bannedUsers || 0} banned
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium opacity-90">Total Swaps</CardTitle>
                    <BarChart3 className="h-4 w-4 opacity-75" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats?.swapStats.totalSwaps || 0}</div>
                    <p className="text-xs opacity-75 mt-1">
                      {stats?.swapStats.completedSwaps || 0} completed • {stats?.swapStats.pendingSwaps || 0} pending
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium opacity-90">Flagged Skills</CardTitle>
                    <AlertTriangle className="h-4 w-4 opacity-75" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats?.pendingFlaggedSkills || 0}</div>
                    <p className="text-xs opacity-75 mt-1">
                      Pending review
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium opacity-90">Announcements</CardTitle>
                    <MessageSquare className="h-4 w-4 opacity-75" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats?.activeAnnouncements || 0}</div>
                    <p className="text-xs opacity-75 mt-1">
                      Active announcements
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Reports Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Download className="h-5 w-5" />
                    <span>Reports & Analytics</span>
                  </CardTitle>
                  <CardDescription>
                    Download comprehensive platform reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col"
                      onClick={() => downloadReport('user-activity')}
                    >
                      <FileText className="h-6 w-6 mb-2" />
                      User Activity Report
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col"
                      onClick={() => downloadReport('swap-stats')}
                    >
                      <BarChart3 className="h-6 w-6 mb-2" />
                      Swap Statistics Report
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col"
                      onClick={() => downloadReport('feedback')}
                    >
                      <TrendingUp className="h-6 w-6 mb-2" />
                      Feedback Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Flagged Skills Tab */}
            <TabsContent value="flagged-skills" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Flag className="h-5 w-5" />
                    <span>Flagged Skills Review</span>
                  </CardTitle>
                  <CardDescription>
                    Review and approve/reject flagged skills
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Skill</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {flaggedSkills.map((skill) => (
                        <TableRow key={skill.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{skill.user.name}</div>
                              <div className="text-sm text-gray-500">@{skill.user.username}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{skill.skillName}</div>
                              <div className="text-sm text-gray-500">{skill.skillDescription}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{skill.reason}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={skill.status === 'PENDING' ? 'secondary' : skill.status === 'APPROVED' ? 'default' : 'destructive'}>
                              {skill.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {skill.status === 'PENDING' && (
                              <div className="flex items-center space-x-1">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="outline">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Approve
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Approve Skill</DialogTitle>
                                      <DialogDescription>
                                        Add review notes (optional)
                                      </DialogDescription>
                                    </DialogHeader>
                                    <Textarea
                                      placeholder="Review notes..."
                                      value={reviewNotes}
                                      onChange={(e) => setReviewNotes(e.target.value)}
                                    />
                                    <DialogFooter>
                                      <Button onClick={() => approveSkill(skill.id)}>
                                        Approve Skill
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>

                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="destructive">
                                      <XCircle className="h-3 w-3 mr-1" />
                                      Reject
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Reject Skill</DialogTitle>
                                      <DialogDescription>
                                        Add review notes (optional)
                                      </DialogDescription>
                                    </DialogHeader>
                                    <Textarea
                                      placeholder="Review notes..."
                                      value={reviewNotes}
                                      onChange={(e) => setReviewNotes(e.target.value)}
                                    />
                                    <DialogFooter>
                                      <Button variant="destructive" onClick={() => rejectSkill(skill.id)}>
                                        Reject Skill
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {flaggedSkills.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Flag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No flagged skills to review</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* User Bans Tab */}
            <TabsContent value="user-bans" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Ban className="h-5 w-5" />
                    <span>User Ban Management</span>
                  </CardTitle>
                  <CardDescription>
                    Manage user bans and view ban history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Banned By</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userBans.map((ban) => (
                        <TableRow key={ban.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{ban.user.name}</div>
                              <div className="text-sm text-gray-500">@{ban.user.username}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{ban.reason}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{ban.bannedBy.name}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{new Date(ban.bannedAt).toLocaleDateString()}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={ban.isActive ? "destructive" : "secondary"}>
                              {ban.isActive ? "ACTIVE" : "INACTIVE"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {ban.isActive && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => unbanUser(ban.user.id)}
                              >
                                <Unlock className="h-3 w-3 mr-1" />
                                Unban
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {userBans.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Ban className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No active user bans</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Swap Monitoring Tab */}
            <TabsContent value="swaps" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <BarChart3 className="h-5 w-5" />
                        <span>Swap Monitoring</span>
                      </CardTitle>
                      <CardDescription>
                        Monitor all platform swaps and their status
                      </CardDescription>
                    </div>
                    <Select value={swapStatusFilter} onValueChange={setSwapStatusFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Swaps</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Requester</TableHead>
                        <TableHead>Requested User</TableHead>
                        <TableHead>Offered Skill</TableHead>
                        <TableHead>Requested Skill</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSwaps.map((swap) => (
                        <TableRow key={swap.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{swap.requester?.name || "Unknown"}</div>
                              <div className="text-sm text-gray-500">@{swap.requester?.username || "Unknown"}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{swap.requestedUser?.name || "Unknown"}</div>
                              <div className="text-sm text-gray-500">@{swap.requestedUser?.username || "Unknown"}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{swap.offeredSkill}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{swap.requestedSkill}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              swap.status === 'PENDING' ? 'secondary' :
                              swap.status === 'ACCEPTED' ? 'default' :
                              swap.status === 'COMPLETED' ? 'default' :
                              'destructive'
                            }>
                              {swap.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{new Date(swap.createdAt).toLocaleDateString()}</div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {filteredSwaps.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No swaps found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Announcements Tab */}
            <TabsContent value="announcements" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Create Announcement */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Plus className="h-5 w-5" />
                      <span>Create Announcement</span>
                    </CardTitle>
                    <CardDescription>
                      Send a new platform-wide announcement
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={announcementForm.title}
                        onChange={(e) => setAnnouncementForm({...announcementForm, title: e.target.value})}
                        placeholder="Enter announcement title"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={announcementForm.type}
                        onValueChange={(value) => setAnnouncementForm({...announcementForm, type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INFO">Information</SelectItem>
                          <SelectItem value="WARNING">Warning</SelectItem>
                          <SelectItem value="ANNOUNCEMENT">Announcement</SelectItem>
                          <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        value={announcementForm.message}
                        onChange={(e) => setAnnouncementForm({...announcementForm, message: e.target.value})}
                        placeholder="Enter announcement message"
                        rows={4}
                      />
                    </div>
                    
                    <Button onClick={createAnnouncement} className="w-full">
                      <Send className="h-4 w-4 mr-2" />
                      Send Announcement
                    </Button>
                  </CardContent>
                </Card>

                {/* Active Announcements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MessageSquare className="h-5 w-5" />
                      <span>Active Announcements</span>
                    </CardTitle>
                    <CardDescription>
                      Currently active platform announcements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {announcements.filter(a => a.isActive).map((announcement) => (
                        <div key={announcement.id} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-semibold">{announcement.title}</h3>
                                <Badge variant="outline" className="text-xs">
                                  {announcement.type}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{announcement.message}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(announcement.createdAt).toLocaleString()} • By {announcement.createdBy.name}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deactivateAnnouncement(announcement.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Deactivate
                            </Button>
                          </div>
                        </div>
                      ))}
                      {announcements.filter(a => a.isActive).length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No active announcements</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel; 