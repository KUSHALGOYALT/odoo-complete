import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Clock,
  User
} from 'lucide-react';

interface VoiceCallProps {
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

const VoiceCall: React.FC<VoiceCallProps> = ({ isOpen, onClose, otherUser, swapId }) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  
  const durationIntervalRef = useRef<NodeJS.Timeout>();

  // Simulate voice call functionality
  useEffect(() => {
    if (isCallActive) {
      // Start call duration timer
      durationIntervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      // Simulate getting audio media
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            console.log('Audio stream obtained');
          })
          .catch(err => {
            console.log('Error accessing audio devices:', err);
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

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-green-600" />
            Voice Call with {otherUser.name}
            {isCallActive && (
              <Badge variant="secondary" className="ml-2">
                {formatDuration(callDuration)}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Call Status */}
          <div className="text-center">
            {!isCallActive ? (
              <div className="space-y-4">
                <Avatar className="w-20 h-20 mx-auto">
                  <AvatarImage src={otherUser.profilePhoto} />
                  <AvatarFallback className="bg-[#875A7B] text-white text-2xl">
                    {otherUser.name?.charAt(0) || otherUser.username?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{otherUser.name}</h3>
                  <p className="text-gray-600">Ready to start voice call</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <Avatar className="w-20 h-20 mx-auto">
                    <AvatarImage src={otherUser.profilePhoto} />
                    <AvatarFallback className="bg-[#875A7B] text-white text-2xl">
                      {otherUser.name?.charAt(0) || otherUser.username?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {/* Call indicator */}
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{otherUser.name}</h3>
                  <p className="text-green-600 font-medium">Connected</p>
                  {isMuted && (
                    <Badge variant="destructive" className="mt-2">
                      <MicOff className="h-3 w-3 mr-1" />
                      Muted
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Control Panel */}
          <div className="flex justify-center gap-4">
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
              </>
            )}
          </div>

          {/* Call Info */}
          {isCallActive && (
            <div className="text-center text-sm text-gray-600">
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Call duration: {formatDuration(callDuration)}</span>
              </div>
              <p className="mt-1">Voice call in progress</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceCall; 