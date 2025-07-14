import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Clock,
  User,
  Search,
  MoreVertical,
  Phone,
  Video
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner';
import VideoCall from './VideoCall';
import VoiceCall from './VoiceCall';

const ChatPage = () => {
  const [swapRequests, setSwapRequests] = useState([]);
  const [selectedSwap, setSelectedSwap] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showVoiceCall, setShowVoiceCall] = useState(false);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // Get current user ID
  const getCurrentUserId = () => {
    return localStorage.getItem('userId');
  };

  // API base URL
  const API_BASE = 'http://localhost:8091/api';

  // Fetch user's swap requests
  const fetchSwapRequests = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
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
        const currentUserId = getCurrentUserId();
        
        // Filter to show only swaps where user is involved and status allows chat
        const activeSwaps = (data.data || []).filter(swap => {
          const isInvolved = swap.requesterId === currentUserId || swap.requestedUserId === currentUserId;
          const canChat = swap.status === 'PENDING' || swap.status === 'ACCEPTED';
          return isInvolved && canChat;
        });
        
        setSwapRequests(activeSwaps);
        
        // Auto-select first swap if none selected
        if (!selectedSwap && activeSwaps.length > 0) {
          setSelectedSwap(activeSwaps[0]);
        }
      } else {
        toast.error('Failed to fetch swap requests');
      }
    } catch (error) {
      toast.error('Error fetching swap requests: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a swap
  const fetchMessages = async (swapId) => {
    if (!swapId) return;
    
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/chat/swap/${swapId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        const messages = await response.json();
        setMessages(messages);
      } else {
        toast.error('Failed to fetch messages');
      }
    } catch (error) {
      toast.error('Error fetching messages: ' + error.message);
    }
  };

  // Send a message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedSwap) return;

    try {
      const token = getAuthToken();
      const currentUserId = getCurrentUserId();
      
      // Determine receiver ID based on current user's role in the swap
      const receiverId = selectedSwap.requesterId === currentUserId 
        ? selectedSwap.requestedUserId 
        : selectedSwap.requesterId;

      const messageData = {
        swapRequestId: selectedSwap.id,
        receiverId: receiverId,
        content: newMessage.trim(),
        type: 'TEXT'
      };

      const response = await fetch(`${API_BASE}/chat/swap/${selectedSwap.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify(messageData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setNewMessage('');
          // Refresh messages
          fetchMessages(selectedSwap.id);
        } else {
          toast.error(result.message || 'Failed to send message');
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to send message');
      }
    } catch (error) {
      toast.error('Error sending message: ' + error.message);
    }
  };

  // Handle swap selection
  const handleSwapSelect = (swap) => {
    setSelectedSwap(swap);
    fetchMessages(swap.id);
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

  // Handle voice call
  const handleVoiceCall = () => {
    if (!selectedSwap) return;
    setShowVoiceCall(true);
  };

  // Handle video call
  const handleVideoCall = () => {
    if (!selectedSwap) return;
    setShowVideoCall(true);
  };

  // Filter swaps based on search
  const filteredSwaps = swapRequests.filter(swap => {
    const otherUser = getOtherUser(swap);
    const otherUserName = otherUser?.name || 'Unknown User';
    
    return !searchTerm || 
      otherUserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      swap.requesterSkill?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      swap.requestedSkill?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Load data on component mount
  useEffect(() => {
    fetchSwapRequests();
  }, []);

  // Fetch messages when selected swap changes
  useEffect(() => {
    if (selectedSwap) {
      fetchMessages(selectedSwap.id);
    }
  }, [selectedSwap]);

  // Auto-refresh messages every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedSwap) {
        fetchMessages(selectedSwap.id);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedSwap]);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#875A7B] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search swaps..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredSwaps.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No active swaps</h3>
                <p className="text-gray-600 text-sm">Start a swap to begin messaging!</p>
              </div>
            ) : (
              filteredSwaps.map((swap) => {
                const otherUser = getOtherUser(swap);
                const currentUserId = getCurrentUserId();
                const isRequester = swap.requesterId === currentUserId;
                
                return (
                  <Card
                    key={swap.id}
                    className={`mb-2 cursor-pointer transition-colors ${
                      selectedSwap?.id === swap.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleSwapSelect(swap)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={otherUser?.profilePhoto} />
                          <AvatarFallback>
                            {otherUser?.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900 truncate">
                              @{otherUser?.username || 'unknown'}
                            </h4>
                            <Badge className={`text-xs ${getStatusColor(swap.status)}`}>
                              {swap.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {isRequester ? `You offer: ${swap.requesterSkill}` : `You want: ${swap.requestedSkill}`}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedSwap ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={getOtherUser(selectedSwap)?.profilePhoto} 
                    />
                    <AvatarFallback>
                      {getOtherUser(selectedSwap)?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      @{getOtherUser(selectedSwap)?.username || 'unknown'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedSwap.requesterSkill} ↔ {selectedSwap.requestedSkill}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handleVoiceCall}
                    title="Voice Call"
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handleVideoCall}
                    title="Video Call"
                  >
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
                    <p className="text-gray-600 text-sm">Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const currentUserId = getCurrentUserId();
                    const isOwnMessage = message.sender?.id === currentUserId;
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                          <div
                            className={`rounded-lg px-4 py-2 ${
                              isOwnMessage
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                          </div>
                          <p className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                            {new Date(message.createdAt).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-600 text-sm">Choose a swap from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Video Call Modal */}
      {showVideoCall && selectedSwap && (
        <VideoCall
          isOpen={showVideoCall}
          onClose={() => setShowVideoCall(false)}
          otherUser={getOtherUser(selectedSwap)}
          swapId={selectedSwap.id}
        />
      )}

      {/* Voice Call Modal */}
      {showVoiceCall && selectedSwap && (
        <VoiceCall
          isOpen={showVoiceCall}
          onClose={() => setShowVoiceCall(false)}
          otherUser={getOtherUser(selectedSwap)}
          swapId={selectedSwap.id}
        />
      )}
    </div>
  );
};

export default ChatPage; 