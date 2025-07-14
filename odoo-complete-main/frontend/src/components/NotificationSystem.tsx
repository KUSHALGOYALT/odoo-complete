import React, { useState, useEffect } from 'react';
import { Bell, X, MessageSquare, Users, Clock, Star, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'swap' | 'message' | 'deadline' | 'rating' | 'admin' | 'match';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  data?: any;
}

interface NotificationSystemProps {
  isAdmin?: boolean;
  forceOpen?: boolean;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ isAdmin, forceOpen }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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
      let adminResponse;
      if (isAdmin) {
        adminResponse = await fetch(`${API_BASE}/admin/announcements`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
      } else {
        adminResponse = await fetch(`${API_BASE}/admin/announcements/public`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
      }

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

      const allNotifications: Notification[] = [];

      // Process admin messages
      if (adminResponse.ok) {
        const adminMessages = await adminResponse.json();
        adminMessages.forEach((message: any) => {
          allNotifications.push({
            id: `admin-${message.id}`,
            type: 'admin',
            title: message.title,
            message: message.content,
            timestamp: new Date(message.createdAt),
            read: false,
            priority: message.priority || 'medium',
            data: message
          });
        });
      }

      // Process swap requests
      if (swapsResponse.ok) {
        const swapsData = await swapsResponse.json();
        const swaps = swapsData.data || [];

        // Add pending swap notifications
        swaps.filter((swap: any) => swap.status === 'PENDING').forEach((swap: any) => {
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
            priority: 'medium'
          });
        });

        // Add deadline notifications
        swaps.filter((swap: any) => swap.status === 'ACCEPTED' && swap.deadline).forEach((swap: any) => {
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
              priority: daysUntilDeadline === 0 ? 'high' : 'medium'
            });
          }
        });
      }

      // Process chat messages
      if (chatResponse.ok) {
        const chatData = await chatResponse.json();
        const messages = chatData.data || [];
        // Show all recent messages (not just unread)
        const recentMessages = messages.filter((msg: any) => msg.sender?.id !== localStorage.getItem('userId'));
        const latestBySender = recentMessages.reduce((acc: any, msg: any) => {
          if (!acc[msg.sender?.id] || new Date(msg.createdAt) > new Date(acc[msg.sender?.id].createdAt)) {
            acc[msg.sender?.id] = msg;
          }
          return acc;
        }, {});
        Object.values(latestBySender).forEach((msg: any) => {
          allNotifications.push({
            id: `message-${msg.id}`,
            type: 'message',
            title: 'New Message',
            message: `Message from ${msg.sender?.name || msg.sender?.username || 'Unknown User'}`,
            timestamp: new Date(msg.createdAt),
            read: msg.read,
            data: msg,
            priority: 'low'
          });
        });
      }

      // Process ratings
      if (ratingsResponse.ok) {
        const ratingsData = await ratingsResponse.json();
        const ratings = ratingsData.data || [];
        
        // Add new rating notifications
        ratings.filter((rating: any) => new Date(rating.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)).forEach((rating: any) => {
          allNotifications.push({
            id: `rating-${rating.id}`,
            type: 'rating',
            title: 'New Rating Received',
            message: `You received a ${rating.rating}-star rating from ${rating.rater?.name || rating.rater?.username || 'Unknown User'}`,
            timestamp: new Date(rating.createdAt),
            read: false,
            data: rating,
            priority: 'medium'
          });
        });
      }

      // Sort by timestamp (newest first)
      allNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(n => !n.read).length);

    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );

      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Send to backend if needed
      const notification = notifications.find(n => n.id === notificationId);
      if (notification?.type === 'message') {
        await fetch(`${API_BASE}/chat/messages/${notification.data.id}/read`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
      }

    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    switch (notification.type) {
      case 'swap':
        window.location.href = '/swap';
        break;
      case 'message':
        window.location.href = '/chats';
        break;
      case 'deadline':
        window.location.href = '/swap';
        break;
      case 'rating':
        window.location.href = '/profile';
        break;
      default:
        break;
    }
  };

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'swap':
        return <Users className="h-4 w-4" />;
      case 'message':
        return <MessageSquare className="h-4 w-4" />;
      case 'deadline':
        return <Clock className="h-4 w-4" />;
      case 'rating':
        return <Star className="h-4 w-4" />;
      case 'admin':
        return <AlertTriangle className="h-4 w-4" />;
      case 'match':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  // Get notification color
  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'high') return 'text-red-600 bg-red-50 border-red-200';
    if (priority === 'medium') return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  // Format timestamp
  const formatTimestamp = (timestamp: Date) => {
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

  // Use forceOpen to control panel visibility
  const showPanel = forceOpen || isOpen;

  return (
    <div className={forceOpen ? 'flex flex-col items-center justify-start min-h-[80vh] bg-gray-50 py-8' : 'relative'}>
      {/* Only show bell icon if not forceOpen */}
      {!forceOpen && (
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      )}

      {/* Notification Panel */}
      {showPanel && (
        <div className={forceOpen
          ? 'w-full max-w-2xl bg-white border border-gray-200 rounded-xl shadow-lg p-0'
          : 'absolute right-0 top-12 w-80 md:w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden'}>
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl">
            <h2 className="text-2xl font-bold text-[#875A7B] mb-1">Alerts</h2>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
          {/* Notifications List */}
          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#875A7B] mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                <p className="text-gray-600 text-sm">No new notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`mb-2 cursor-pointer transition-all hover:shadow-md ${
                    !notification.read ? 'border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-4 flex gap-3 items-start">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      getNotificationColor(notification.type, notification.priority).split(' ')[0]
                    }`}>{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-gray-900 truncate">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTimestamp(notification.timestamp)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSystem; 