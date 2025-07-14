import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  MessageSquare, 
  Settings,
  Users,
  Maximize,
  Minimize,
  Volume2,
  VolumeX
} from 'lucide-react';

interface VideoCallProps {
  isOpen: boolean;
  onClose: () => void;
  otherUser: {
    id: string;
    name: string;
    username: string;
    profilePhoto?: string;
  };
  swapId?: string;
}

const VideoCall: React.FC<VideoCallProps> = ({ isOpen, onClose, otherUser, swapId }) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout>();

  // Simulate video call functionality
  useEffect(() => {
    if (isCallActive) {
      // Start call duration timer
      durationIntervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      // Simulate getting user media
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          .then(stream => {
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
          })
          .catch(err => {
            console.log('Error accessing media devices:', err);
          });
      }
    } else {
      // Clear interval when call ends
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      setCallDuration(0);
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [isCallActive]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartCall = () => {
    setIsCallActive(true);
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    onClose();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toggleChat = () => {
    setShowChat(!showChat);
  };

  const toggleParticipants = () => {
    setShowParticipants(!showParticipants);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-6xl ${isFullscreen ? 'w-screen h-screen' : 'max-h-[90vh]'}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-green-600" />
            Video Call with {otherUser.name}
            {isCallActive && (
              <Badge variant="secondary" className="ml-2">
                {formatDuration(callDuration)}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Main Video Area */}
          <div className="flex-1 relative bg-gray-900 rounded-lg overflow-hidden mb-4">
            {/* Remote Video (Main) */}
            <div className="w-full h-full flex items-center justify-center">
              {isCallActive ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-white">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage src={otherUser.profilePhoto} />
                    <AvatarFallback className="bg-[#875A7B] text-white text-2xl">
                      {otherUser.name?.charAt(0) || otherUser.username?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold mb-2">{otherUser.name}</h3>
                  <p className="text-gray-300">Waiting to start call...</p>
                </div>
              )}
            </div>

            {/* Local Video (Picture-in-Picture) */}
            {isCallActive && (
              <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${!isVideoOn ? 'hidden' : ''}`}
                />
                {!isVideoOn && (
                  <div className="w-full h-full flex items-center justify-center bg-gray-700">
                    <VideoOff className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
            )}

            {/* Call Status Overlay */}
            {isCallActive && (
              <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {isMuted && <MicOff className="h-4 w-4 inline mr-1" />}
                {!isVideoOn && <VideoOff className="h-4 w-4 inline mr-1" />}
                {!isSpeakerOn && <VolumeX className="h-4 w-4 inline mr-1" />}
                Live
              </div>
            )}
          </div>

          {/* Control Panel */}
          <div className="flex items-center justify-center gap-4 mb-4">
            {!isCallActive ? (
              <Button
                onClick={handleStartCall}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-8"
              >
                <Phone className="h-5 w-5 mr-2" />
                Start Call
              </Button>
            ) : (
              <>
                <Button
                  onClick={toggleMute}
                  variant={isMuted ? "destructive" : "outline"}
                  size="lg"
                  className="w-12 h-12 rounded-full"
                >
                  {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>

                <Button
                  onClick={toggleVideo}
                  variant={!isVideoOn ? "destructive" : "outline"}
                  size="lg"
                  className="w-12 h-12 rounded-full"
                >
                  {!isVideoOn ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                </Button>

                <Button
                  onClick={handleEndCall}
                  variant="destructive"
                  size="lg"
                  className="w-12 h-12 rounded-full"
                >
                  <PhoneOff className="h-5 w-5" />
                </Button>

                <Button
                  onClick={toggleSpeaker}
                  variant={!isSpeakerOn ? "destructive" : "outline"}
                  size="lg"
                  className="w-12 h-12 rounded-full"
                >
                  {!isSpeakerOn ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>

                <Button
                  onClick={toggleChat}
                  variant={showChat ? "default" : "outline"}
                  size="lg"
                  className="w-12 h-12 rounded-full"
                >
                  <MessageSquare className="h-5 w-5" />
                </Button>

                <Button
                  onClick={toggleParticipants}
                  variant={showParticipants ? "default" : "outline"}
                  size="lg"
                  className="w-12 h-12 rounded-full"
                >
                  <Users className="h-5 w-5" />
                </Button>

                <Button
                  onClick={toggleFullscreen}
                  variant="outline"
                  size="lg"
                  className="w-12 h-12 rounded-full"
                >
                  {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                </Button>
              </>
            )}
          </div>

          {/* Side Panels */}
          <div className="flex gap-4">
            {/* Chat Panel */}
            {showChat && (
              <Card className="w-80">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Chat</CardTitle>
                </CardHeader>
                <CardContent className="h-48 overflow-y-auto">
                  <div className="space-y-2 text-sm">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <p className="font-medium text-blue-900">You</p>
                      <p className="text-blue-800">Hi! Ready to start our skill swap?</p>
                    </div>
                    <div className="bg-gray-100 p-2 rounded-lg">
                      <p className="font-medium text-gray-900">{otherUser.name}</p>
                      <p className="text-gray-800">Absolutely! Let's begin.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Participants Panel */}
            {showParticipants && (
              <Card className="w-80">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Participants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={otherUser.profilePhoto} />
                        <AvatarFallback className="text-xs">
                          {otherUser.name?.charAt(0) || otherUser.username?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{otherUser.name}</span>
                      <Badge variant="secondary" className="ml-auto text-xs">Host</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs bg-[#875A7B] text-white">
                          You
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">You</span>
                      <Badge variant="outline" className="ml-auto text-xs">Participant</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoCall; 