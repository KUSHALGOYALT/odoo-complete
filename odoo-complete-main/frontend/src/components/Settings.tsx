import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { 
  User, 
  Shield, 
  Bell, 
  Camera, 
  Save, 
  Eye, 
  EyeOff,
  MapPin,
  MessageSquare,
  Star,
  Settings as SettingsIcon,
  LogOut,
  Trash2
} from 'lucide-react';

interface Skill {
  name: string;
  level: string;
}

interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  location: string;
  tagline: string;
  profilePhoto?: string;
  isPublic: boolean;
  offeredSkills: Skill[];
  wantedSkills: string[];
  availability: string;
  stats?: {
    averageRating: number;
    totalRatings: number;
    totalSwaps: number;
    completedSwaps: number;
  };
}

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
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
    offeredSkills: [] as Skill[],
    wantedSkills: [] as string[],
    availability: 'FLEXIBLE'
  });

  // Temporary skill inputs
  const [newOfferedSkill, setNewOfferedSkill] = useState({ name: '', level: 'BEGINNER' });
  const [newWantedSkill, setNewWantedSkill] = useState('');

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    swapRequests: true,
    messages: true,
    ratings: true,
    adminMessages: true
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    showProfile: true,
    showSkills: true,
    showStats: true,
    showLocation: true,
    allowMessages: true,
    allowSwapRequests: true
  });

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // API base URL
  const API_BASE = 'http://localhost:8091/api';

  // Fetch user profile
  const fetchUserProfile = async () => {
    setLoading(true);
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

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userId');
    window.location.href = '/';
  };

  // Handle account deletion
  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Implement account deletion logic
      toast.error('Account deletion not implemented yet');
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#875A7B]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account, privacy, and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Profile Photo */}
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={formData.profilePhoto} />
                  <AvatarFallback className="text-lg">
                    {formData.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Label htmlFor="profile-photo" className="cursor-pointer">
                    <Button variant="outline" size="sm">
                      <Camera className="h-4 w-4 mr-2" />
                      Change Photo
                    </Button>
                  </Label>
                  <input
                    id="profile-photo"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Username"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Email address"
                  />
                </div>
                <div>
                  <Label htmlFor="password">New Password (optional)</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Leave blank to keep current"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, Country"
                  />
                </div>
                <div>
                  <Label htmlFor="availability">Availability</Label>
                  <Select
                    value={formData.availability}
                    onValueChange={(value) => setFormData({ ...formData, availability: value })}
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
                <Label htmlFor="tagline">Bio/Tagline</Label>
                <Textarea
                  id="tagline"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="Tell others about yourself..."
                  rows={3}
                />
              </div>

              {/* Skills Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Skills</h3>
                
                {/* Offered Skills */}
                <div>
                  <Label>Skills You Offer</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Skill name"
                      value={newOfferedSkill.name}
                      onChange={(e) => setNewOfferedSkill({ ...newOfferedSkill, name: e.target.value })}
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
                        <SelectItem value="ADVANCED">Advanced</SelectItem>
                        <SelectItem value="EXPERT">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={addOfferedSkill} size="sm">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.offeredSkills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {skill.name} ({skill.level})
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={() => removeOfferedSkill(index)}
                        >
                          ×
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Wanted Skills */}
                <div>
                  <Label>Skills You Want</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Skill name"
                      value={newWantedSkill}
                      onChange={(e) => setNewWantedSkill(e.target.value)}
                    />
                    <Button onClick={addWantedSkill} size="sm">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.wantedSkills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {skill}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={() => removeWantedSkill(index)}
                        >
                          ×
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Button onClick={updateProfile} disabled={saving} className="w-full">
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Public Profile</Label>
                  <p className="text-sm text-gray-600">Allow others to see your profile</p>
                </div>
                <Switch
                  checked={privacySettings.showProfile}
                  onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, showProfile: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Skills</Label>
                  <p className="text-sm text-gray-600">Display your offered and wanted skills</p>
                </div>
                <Switch
                  checked={privacySettings.showSkills}
                  onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, showSkills: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Statistics</Label>
                  <p className="text-sm text-gray-600">Display your swap and rating statistics</p>
                </div>
                <Switch
                  checked={privacySettings.showStats}
                  onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, showStats: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Location</Label>
                  <p className="text-sm text-gray-600">Display your location to other users</p>
                </div>
                <Switch
                  checked={privacySettings.showLocation}
                  onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, showLocation: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Messages</Label>
                  <p className="text-sm text-gray-600">Let other users send you messages</p>
                </div>
                <Switch
                  checked={privacySettings.allowMessages}
                  onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, allowMessages: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Swap Requests</Label>
                  <p className="text-sm text-gray-600">Let other users send you swap requests</p>
                </div>
                <Switch
                  checked={privacySettings.allowSwapRequests}
                  onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, allowSwapRequests: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-600">Receive notifications via email</p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailNotifications: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-gray-600">Receive browser push notifications</p>
                </div>
                <Switch
                  checked={notificationSettings.pushNotifications}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, pushNotifications: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Swap Requests</Label>
                  <p className="text-sm text-gray-600">Notify when someone sends a swap request</p>
                </div>
                <Switch
                  checked={notificationSettings.swapRequests}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, swapRequests: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Messages</Label>
                  <p className="text-sm text-gray-600">Notify when you receive new messages</p>
                </div>
                <Switch
                  checked={notificationSettings.messages}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, messages: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Ratings</Label>
                  <p className="text-sm text-gray-600">Notify when someone rates you</p>
                </div>
                <Switch
                  checked={notificationSettings.ratings}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, ratings: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Admin Messages</Label>
                  <p className="text-sm text-gray-600">Notify when admins send platform messages</p>
                </div>
                <Switch
                  checked={notificationSettings.adminMessages}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, adminMessages: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">Account Statistics</h3>
                  <p className="text-sm text-gray-600">
                    Total Swaps: {userProfile?.stats?.totalSwaps || 0} | 
                    Completed: {userProfile?.stats?.completedSwaps || 0} | 
                    Rating: {userProfile?.stats?.averageRating?.toFixed(1) || '0.0'} ⭐
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleLogout} className="flex-1">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
                <Button variant="destructive" onClick={handleDeleteAccount} className="flex-1">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings; 