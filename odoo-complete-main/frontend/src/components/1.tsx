import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import MainDashboard from "@/components/MainDashboard";
import SwapPage from "@/components/SwapPage";
import Login from "@/components/Login";
import { Routes, Route } from "react-router-dom";
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
        }, {});

        Object.values(latestUnread).forEach((msg) => {
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
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      
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
          <p className="text-gray-600 text-sm">No new notifications at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                  {notification.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{notification.message}</p>
                  <p className="text-sm text-gray-500 mt-1">{formatTimestamp(notification.timestamp)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ChatsPage = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // API base URL
  const API_BASE = 'http://localhost:8091/api';

  // Fetch real-time chats
  const fetchChats = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        console.log('No auth token found');
        return;
      }

      // Fetch chat messages
      const response = await fetch(`${API_BASE}/chat/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const chatData = await response.json();
        const messages = chatData.data || [];
        
        // Group messages by conversation partner
        const chatGroups = messages.reduce((acc, msg) => {
          const otherUserId = msg.sender?.id === localStorage.getItem('userId') 
            ? msg.receiver?.id 
            : msg.sender?.id;
          
          if (!acc[otherUserId]) {
            acc[otherUserId] = {
              id: otherUserId,
              user: msg.sender?.id === localStorage.getItem('userId') ? msg.receiver : msg.sender,
              lastMessage: msg,
              unreadCount: 0
            };
          }
          
          // Update last message if this one is newer
          if (new Date(msg.createdAt) > new Date(acc[otherUserId].lastMessage.createdAt)) {
            acc[otherUserId].lastMessage = msg;
          }
          
          // Count unread messages
          if (!msg.read && msg.sender?.id !== localStorage.getItem('userId')) {
            acc[otherUserId].unreadCount++;
          }
          
          return acc;
        }, {});

        // Convert to array and sort by latest message
        const chatList = Object.values(chatGroups).sort((a, b) => 
          new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
        );
        
        setChats(chatList);
      } else {
        console.error('Failed to fetch chats');
        toast.error('Failed to load chats');
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Auto-refresh chats
  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Chats</h1>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#875A7B] mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading chats...</p>
        </div>
      ) : chats.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💬</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations yet</h3>
          <p className="text-gray-600 text-sm">Start a swap to begin chatting with other users.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {chats.map((chat) => (
            <div key={chat.id} className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-[#875A7B] rounded-full flex items-center justify-center text-white font-semibold">
                      {(chat.user?.name || chat.user?.username || 'U').split(" ").map((n) => n[0]).join("")}
                    </div>
                    {chat.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-semibold">
                          {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {chat.user?.name || chat.user?.username || 'Unknown User'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {chat.lastMessage.content}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {formatTimestamp(chat.lastMessage.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ProfilePage = () => (
  <div className="p-4 md:p-6 max-w-4xl mx-auto">
    <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
    <div className="bg-white rounded-lg border p-6">
      <p className="text-gray-600">Profile customization options coming soon...</p>
    </div>
  </div>
);

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout onLogout={handleLogout} />}>
        <Route index element={<MainDashboard />} />
        <Route path="swap" element={<SwapPage />} />
        <Route path="chats" element={<ChatsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
};

export default Index;