import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import MainDashboard from "@/components/MainDashboard";
import SwapPage from "@/components/SwapPage";
import ChatPage from "@/components/ChatPage";
import AdminPanel from "@/components/AdminPanel";
import Login from "@/components/Login";
import SettingsPage from "@/pages/Settings";
import NotificationSystem from '@/components/NotificationSystem';
import {
  User,
  MapPin,
  Mail,
  Camera,
  Save,
  Edit,
  X,
  Plus,
  Star,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // API base URL
  const API_BASE = 'http://localhost:8091/api';

  // Fetch real-time notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        console.log('No auth token found');
        return;
      }

      // Fetch admin messages
      const adminResponse = await fetch(`${API_BASE}/admin/announcements`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      // Fetch swap requests
      const swapsResponse = await fetch(`${API_BASE}/swaps/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      // Fetch chat messages
      const chatResponse = await fetch(`${API_BASE}/chat/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      // Fetch ratings
      const ratingsResponse = await fetch(`${API_BASE}/ratings/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      const allNotifications = [];

      // Process admin messages
      if (adminResponse.ok) {
        const adminMessages = await adminResponse.json();
        adminMessages.forEach((message) => {
          allNotifications.push({
            id: `admin-${message.id}`,
            type: 'admin',
            title: message.title,
            message: message.content,
            timestamp: new Date(message.createdAt),
            read: false,
            priority: message.priority || 'medium',
            data: message,
            icon: '⚠️'
          });
        });
      }

      // Process swap requests
      if (swapsResponse.ok) {
        const swapsData = await swapsResponse.json();
        const swaps = swapsData.data || [];

        // Add pending swap notifications
        swaps.filter((swap) => swap.status === 'PENDING').forEach((swap) => {
          const isRequester = swap.requesterId === localStorage.getItem('userId');
          const otherUser = isRequester ? swap.requestedUser : swap.requester;
          
          allNotifications.push({
            id: `swap-${swap.id}`,
            type: 'swap',
            title: isRequester ? 'Swap Request Pending' : 'New Swap Request',
            message: isRequester 
              ? `Your swap request to ${otherUser?.name || otherUser?.username || 'Unknown User'} is pending`
              : `${swap.requester?.name || swap.requester?.username || 'Unknown User'} wants to swap ${swap.requesterSkill} for ${swap.requestedSkill}`,
            timestamp: new Date(swap.createdAt),
            read: false,
            data: swap,
            priority: 'medium',
            icon: '🔄'
          });
        });

        // Add deadline notifications
        swaps.filter((swap) => swap.status === 'ACCEPTED' && swap.deadline).forEach((swap) => {
          const deadline = new Date(swap.deadline);
          const now = new Date();
          const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilDeadline <= 3 && daysUntilDeadline >= 0) {
            allNotifications.push({
              id: `deadline-${swap.id}`,
              type: 'deadline',
              title: 'Swap Deadline Approaching',
              message: `Swap deadline is ${daysUntilDeadline === 0 ? 'today' : `in ${daysUntilDeadline} day${daysUntilDeadline > 1 ? 's' : ''}`}`,
              timestamp: new Date(),
              read: false,
              data: swap,
              priority: daysUntilDeadline === 0 ? 'high' : 'medium',
              icon: '⏰'
            });
          }
        });
      }

      // Process chat messages
      if (chatResponse.ok) {
        const chatData = await chatResponse.json();
        const messages = chatData.data || [];
        
        // Group messages by sender and get latest unread
        const unreadMessages = messages.filter((msg) => !msg.read && msg.sender?.id !== localStorage.getItem('userId'));
        const latestUnread = unreadMessages.reduce((acc, msg) => {
          if (!acc[msg.sender?.id] || new Date(msg.createdAt) > new Date(acc[msg.sender?.id].createdAt)) {
            acc[msg.sender?.id] = msg;
          }
          return acc;
        }, {} as Record<string, any>);

        (Object.values(latestUnread) as any[]).forEach((msg) => {
          allNotifications.push({
            id: `message-${msg.id}`,
            type: 'message',
            title: 'New Message',
            message: `New message from ${msg.sender?.name || msg.sender?.username || 'Unknown User'}`,
            timestamp: new Date(msg.createdAt),
            read: false,
            data: msg,
            priority: 'low',
            icon: '💬'
          });
        });
      }

      // Process ratings
      if (ratingsResponse.ok) {
        const ratingsData = await ratingsResponse.json();
        const ratings = ratingsData.data || [];
        
        // Add new rating notifications
        ratings.filter((rating) => new Date(rating.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)).forEach((rating) => {
          allNotifications.push({
            id: `rating-${rating.id}`,
            type: 'rating',
            title: 'New Rating Received',
            message: `You received a ${rating.rating}-star rating from ${rating.rater?.name || rating.rater?.username || 'Unknown User'}`,
            timestamp: new Date(rating.createdAt),
            read: false,
            data: rating,
            priority: 'medium',
            icon: '⭐'
          });
        });
      }

      // Sort by timestamp (newest first)
      allNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      setNotifications(allNotifications);

    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  // Auto-refresh notifications
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
        <p className="text-gray-600 text-sm md:text-base">Stay updated with your latest activities</p>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#875A7B] mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔔</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h3>
          <p className="text-gray-600 text-sm md:text-base">No new notifications at the moment.</p>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className="p-3 md:p-4 bg-white rounded-lg border hover:shadow-md transition-all duration-200 cursor-pointer group">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                  {notification.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm md:text-base leading-relaxed group-hover:text-[#875A7B] transition-colors">
                    {notification.message}
                  </p>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">{formatTimestamp(notification.timestamp)}</p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ProfilePage = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    location: '',
    tagline: '',
    profilePhoto: '',
    isPublic: true,
    offeredSkills: [],
    wantedSkills: [],
    availability: 'FLEXIBLE'
  });

  // Temporary skill inputs
  const [newOfferedSkill, setNewOfferedSkill] = useState({ name: '', level: 'BEGINNER' });
  const [newWantedSkill, setNewWantedSkill] = useState('');

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
        setFormData({
          name: data.name || '',
          username: data.username || '',
          email: data.email || '',
          password: '',
          location: data.location || '',
          tagline: data.tagline || '',
          profilePhoto: data.profilePhoto || '',
          isPublic: data.isPublic !== false,
          offeredSkills: data.offeredSkills || [],
          wantedSkills: data.wantedSkills || [],
          availability: data.availability || 'FLEXIBLE'
        });
      } else {
        toast.error('Failed to fetch profile');
      }
    } catch (error) {
      toast.error('Error fetching profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async () => {
    setSaving(true);
    try {
      const token = getAuthToken();
      const updateData = { ...formData };
      
      // Remove password if empty
      if (!updateData.password) {
        delete updateData.password;
      }

      const response = await fetch(`${API_BASE}/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
        setIsEditing(false);
        toast.success('Profile updated successfully!');
        fetchUserProfile(); // Refresh data
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Error updating profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        setFormData({ ...formData, profilePhoto: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  // Add offered skill
  const addOfferedSkill = () => {
    if (newOfferedSkill.name.trim()) {
      setFormData({
        ...formData,
        offeredSkills: [...formData.offeredSkills, {
          name: newOfferedSkill.name.trim(),
          level: newOfferedSkill.level
        }]
      });
      setNewOfferedSkill({ name: '', level: 'BEGINNER' });
    }
  };

  // Remove offered skill
  const removeOfferedSkill = (index) => {
    setFormData({
      ...formData,
      offeredSkills: formData.offeredSkills.filter((_, i) => i !== index)
    });
  };

  // Add wanted skill
  const addWantedSkill = () => {
    if (newWantedSkill.trim()) {
      setFormData({
        ...formData,
        wantedSkills: [...formData.wantedSkills, newWantedSkill.trim()]
      });
      setNewWantedSkill('');
    }
  };

  // Remove wanted skill
  const removeWantedSkill = (index) => {
    setFormData({
      ...formData,
      wantedSkills: formData.wantedSkills.filter((_, i) => i !== index)
    });
  };

  // Load profile on mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#875A7B] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 lg:mb-0">Profile Settings</h1>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false);
                  fetchUserProfile(); // Reset form
                }}
                disabled={saving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={updateProfile}
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Photo & Basic Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="h-5 w-5 mr-2" />
                Profile Photo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-[#C7B1C2]">
                    <AvatarImage src={formData.profilePhoto} />
                    <AvatarFallback className="bg-[#875A7B] text-white text-2xl">
                      {formData.name ? formData.name.split(' ').map(n => n[0]).join('') : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <label className="absolute -bottom-2 -right-2 bg-[#F06EAA] hover:bg-[#E85D9A] text-white rounded-full p-2 cursor-pointer transition-colors">
                      <Camera size={16} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                {isEditing && (
                  <p className="text-sm text-gray-600 text-center">
                    Click the camera icon to change your photo
                  </p>
                )}
              </div>

              {/* Basic Stats */}
              {userProfile?.stats && (
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Swaps</span>
                    <span className="font-medium">{userProfile.stats.totalSwaps}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Completed</span>
                    <span className="font-medium">{userProfile.stats.completedSwaps}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Average Rating</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="font-medium">{userProfile.stats.averageRating?.toFixed(1) || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Choose a unique username"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                      placeholder="your.email@example.com"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="password">New Password (optional)</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Leave blank to keep current"
                    />
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      disabled={!isEditing}
                      placeholder="City, State/Country"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="availability">Availability</Label>
                  <Select
                    value={formData.availability}
                    onValueChange={(value) => setFormData({ ...formData, availability: value })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FLEXIBLE">Flexible</SelectItem>
                      <SelectItem value="WEEKDAYS">Weekdays</SelectItem>
                      <SelectItem value="WEEKENDS">Weekends</SelectItem>
                      <SelectItem value="EVENINGS">Evenings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="tagline">Tagline</Label>
                <Textarea
                  id="tagline"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  disabled={!isEditing}
                  placeholder="A short description about yourself..."
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="font-medium">Make Profile Public</Label>
                  <p className="text-sm text-gray-600">Allow others to discover your profile</p>
                </div>
                <Switch
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Offered Skills */}
              <div>
                <Label className="text-base font-medium">Skills You Offer</Label>
                <div className="mt-2 space-y-3">
                  {formData.offeredSkills.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{skill.name}</span>
                        <Badge variant="outline">{skill.level}</Badge>
                      </div>
                      {isEditing && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOfferedSkill(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  {isEditing && (
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Skill name"
                        value={newOfferedSkill.name}
                        onChange={(e) => setNewOfferedSkill({ ...newOfferedSkill, name: e.target.value })}
                        className="flex-1"
                      />
                      <Select
                        value={newOfferedSkill.level}
                        onValueChange={(value) => setNewOfferedSkill({ ...newOfferedSkill, level: value })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BEGINNER">Beginner</SelectItem>
                          <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                          <SelectItem value="EXPERT">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={addOfferedSkill} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Wanted Skills */}
              <div>
                <Label className="text-base font-medium">Skills You Want to Learn</Label>
                <div className="mt-2 space-y-3">
                  {formData.wantedSkills.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">{skill}</span>
                      {isEditing && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeWantedSkill(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  {isEditing && (
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Skill you want to learn"
                        value={newWantedSkill}
                        onChange={(e) => setNewWantedSkill(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={addWantedSkill} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authData, setAuthData] = useState({ token: "", userId: "" });

  useEffect(() => {
    // Check authentication status from localStorage
    const checkAuth = () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        setIsAuthenticated(true);
        setAuthData({ token, userId: "" });
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (token?: string, userId?: string) => {
    setIsAuthenticated(true);
    if (token && userId) {
      setAuthData({ token, userId });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthData({ token: "", userId: "" });
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#875A7B] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {!isAuthenticated ? (
        <Route path="/*" element={<Login onLogin={handleLogin} />} />
      ) : (
        <Route path="/" element={<Layout onLogout={handleLogout} />}>
          <Route index element={<MainDashboard />} />
          <Route path="swap" element={<SwapPage />} />
          <Route path="chats" element={<ChatPage />} />
          <Route path="notifications" element={<NotificationSystem forceOpen />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="admin" element={<AdminPanel />} />
        </Route>
      )}
    </Routes>
  );
};

export default Index;