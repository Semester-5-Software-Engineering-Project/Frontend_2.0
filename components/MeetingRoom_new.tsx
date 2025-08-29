'use client'

import { Button } from "@/components/ui/button";
import { ArrowLeft, Video, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react";
import axiosInstance from "@/app/utils/axiosInstance";

interface MeetingRoomProps {
  username: string;
  roomName: string;
  role: 'student' | 'teacher';
  email?: string;
  password?: string;
  onLeave: () => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export const MeetingRoom = ({ username, roomName, role, email, password, onLeave }: MeetingRoomProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isTeacher = role === 'teacher';

  // Function to get JWT token from API
  const getJWTToken = async () => {
    try {
      console.log('Making API call to /create/meet');

      // Your backend gets user info from JWT token in cookies, so we don't need to send user data
      const response = await axiosInstance.post('/create/meet', {}, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true, // Include credentials (cookies) for authentication
        timeout: 10000, // 10 second timeout
      });

      console.log('API Response:', response.data);

      // Your backend returns the token directly in the response body
      if (response.data) {
        return response.data; // The token is the response body itself
      } else {
        throw new Error('No token received from API');
      }
    } catch (error: any) {
      console.error('Error getting JWT token from API:', error);
      
      // Handle specific backend error responses
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        } else if (error.response.status === 403) {
          throw new Error('Access denied. You don\'t have permission to join meetings.');
        } else if (error.response.data) {
          // Your backend returns error messages directly in the response body
          throw new Error(error.response.data);
        } else {
          throw new Error(`Server error: ${error.response.status}`);
        }
      } else if (error.request) {
        throw new Error('Cannot connect to meeting server. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to get authentication token');
      }
    }
  };

  useEffect(() => {
    const loadJitsiScript = () => {
      return new Promise((resolve, reject) => {
        // Check if already loaded
        if (window.JitsiMeetExternalAPI) {
          console.log('Jitsi API already loaded');
          resolve({ api: window.JitsiMeetExternalAPI, domain: 'jit.shancloudservice.com' });
          return;
        }

        console.log('Loading Jitsi Meet API script from custom domain...');
        
        const script = document.createElement('script');
        script.src = 'https://jit.shancloudservice.com/external_api.js';
        script.async = true;
        
        const timeout = setTimeout(() => {
          script.remove();
          reject(new Error('Timeout loading script from jit.shancloudservice.com'));
        }, 15000); // Increased timeout to 15 seconds
        
        script.onload = () => {
          clearTimeout(timeout);
          console.log('Successfully loaded Jitsi API from jit.shancloudservice.com');
          resolve({ api: window.JitsiMeetExternalAPI, domain: 'jit.shancloudservice.com' });
        };
        
        script.onerror = () => {
          clearTimeout(timeout);
          script.remove();
          reject(new Error('Failed to load script from jit.shancloudservice.com'));
        };
        
        document.head.appendChild(script);
      });
    };

    const initializeJitsi = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load Jitsi script from custom domain
        const result = await loadJitsiScript() as { api: any, domain: string };
        const jitsiDomain = 'jit.shancloudservice.com'; // Always use custom domain
        console.log(`Using Jitsi domain: ${jitsiDomain}`);
        
        if (!jitsiContainerRef.current) return;

        // Clear the container before creating new instance
        jitsiContainerRef.current.innerHTML = '';

        // Check if we're on HTTPS or localhost
        const isSecureContext = window.location.protocol === 'https:' || 
                               window.location.hostname === 'localhost' || 
                               window.location.hostname === '127.0.0.1';

        if (!isSecureContext) {
          console.warn('Jitsi requires HTTPS for full functionality. Some features may not work over HTTP/IP.');
          toast({
            title: "Security Warning",
            description: "For full functionality, please use HTTPS or localhost",
            variant: "destructive",
          });
        }

        // Get JWT token from API - required for custom domain
        let jwt: string;
        try {
          jwt = await getJWTToken();
          console.log('Successfully obtained JWT token from API');
          console.log(`User: ${username}, Role: ${role}, isTeacher: ${isTeacher}`);
          
          toast({
            title: "Authentication Successful",
            description: `Successfully authenticated as ${isTeacher ? 'Moderator' : 'Guest'}`,
          });
        } catch (jwtError: any) {
          console.error('Failed to get JWT token from API:', jwtError);
          setError(`Authentication failed: ${jwtError.message}`);
          setIsLoading(false);
          toast({
            title: "Authentication Error",
            description: jwtError.message || "Failed to authenticate with meeting server",
            variant: "destructive",
          });
          return;
        }

        const options: any = {
          roomName: roomName,
          width: '100%',
          height: '600px',
          parentNode: jitsiContainerRef.current,
          jwt: jwt, // Always include JWT token from API
          userInfo: {
            displayName: username,
            email: email || `${username}@classroom.com`,
          },
          configOverwrite: {
            startWithAudioMuted: true,
            enableEmailInStats: false,
            enableWelcomePage: false,
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            analytics: {
              disabled: true,
            },
            disableThirdPartyRequests: true,
            useHostPageLocalStorage: true,
            enableNoAudioDetection: false,
            enableNoisyMicDetection: false,
            // Moderator settings - controlled by JWT token
            enableUserRolesBasedOnToken: true,
            
            // Audio/Video constraints
            constraints: {
              video: {
                height: {
                  ideal: 720,
                  max: 720,
                  min: 240
                }
              }
            },
            
            // Student-specific restrictions (if not teacher)
            ...((!isTeacher) && {
              disableInviteFunctions: true,
              doNotStoreRoom: true,
              disableModeratorIndicator: false, // Let JWT control this
            }),
            
            // Teacher-specific permissions (if teacher)
            ...(isTeacher && {
              disableModeratorIndicator: false,
            }),
          },
          interfaceConfigOverwrite: {
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            APP_NAME: "Virtual Classroom",
            DEFAULT_BACKGROUND: '#0F172A',
            DISABLE_DOMINANT_SPEAKER_INDICATOR: true,
            DISABLE_TRANSCRIPTION_SUBTITLES: true,
            DISABLE_RINGING: true,
            HIDE_INVITE_MORE_HEADER: true,
            TOOLBAR_BUTTONS: isTeacher ? [
              'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
              'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
              'settings', 'raisehand', 'videoquality', 'filmstrip', 'invite',
              'tileview', 'select-background', 'help', 'mute-everyone'
            ] : [
              'microphone', 'camera', 'closedcaptions', 'fullscreen',
              'fodeviceselection', 'hangup', 'profile', 'settings', 'raisehand',
              'videoquality', 'filmstrip', 'tileview', 'select-background'
            ],
          },
        };

        console.log(`Creating Jitsi API with domain: ${jitsiDomain}`);
        console.log('User role:', role, 'isTeacher:', isTeacher);
        console.log('JWT token present:', !!jwt);

        apiRef.current = new window.JitsiMeetExternalAPI(jitsiDomain, options);

        // Event listeners
        apiRef.current.addEventListener('ready', () => {
          console.log("Jitsi API is ready");
          setIsLoading(false);
          toast({
            title: "Meeting Joined",
            description: `Joined as ${isTeacher ? 'Moderator' : 'Guest'}`,
          });
        });

        apiRef.current.addEventListener('videoConferenceJoined', (conferenceInfo: any) => {
          console.log("Successfully joined the conference:", conferenceInfo);
          console.log("User permissions:", {
            isModerator: conferenceInfo?.isModerator,
            role: role,
            isTeacher: isTeacher
          });
        });

        apiRef.current.addEventListener('participantRoleChanged', (event: any) => {
          console.log("Participant role changed:", event);
          if (event.id === 'local') {
            console.log("Local user role changed to:", event.role);
          }
        });

        apiRef.current.addEventListener('videoConferenceLeft', () => {
          console.log("Left the meeting");
          onLeave();
        });

        apiRef.current.addEventListener('participantJoined', (participant: any) => {
          console.log("Participant joined:", participant);
          if (isTeacher) {
            toast({
              title: "Participant joined",
              description: `${participant.displayName} joined the meeting`,
            });
          }
        });

        // Handle connection failures
        apiRef.current.addEventListener('connectionFailed', () => {
          console.error("Connection failed");
          setError("Connection failed. Please check your internet connection and try again.");
          setIsLoading(false);
        });

        // Handle device errors
        apiRef.current.addEventListener('deviceListChanged', (devices: any) => {
          console.log("Available devices:", devices);
        });

      } catch (err: any) {
        console.error("Jitsi Meeting Error:", err);
        setError(`Meeting failed to load: ${err.message || 'Unknown error'}`);
        setIsLoading(false);
        toast({
          title: "Meeting Error",
          description: "Failed to load the meeting. Please try again.",
          variant: "destructive",
        });
      }
    };

    initializeJitsi();

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [username, roomName, role, email, password, onLeave, toast, isTeacher]);

  // Recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      // Reset recorded chunks
      recordedChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus',
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      });

      mediaRecorder.addEventListener('stop', () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: 'video/webm',
        });

        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${roomName}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "Recording Saved",
          description: "Meeting recording has been downloaded to your computer",
        });
      });

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      toast({
        title: "Recording Started",
        description: "Meeting recording has begun",
      });

      // Handle stream end (user stops screen sharing)
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        stopRecording();
      });

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Failed to start recording. Please try again.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }

    setIsRecording(false);
    setRecordingTime(0);

    toast({
      title: "Recording Stopped",
      description: "Recording has been stopped and will be downloaded shortly",
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const testJWTToken = async () => {
    try {
      console.log('Testing JWT token generation...');
      const token = await getJWTToken();
      console.log('Raw JWT token:', token);
      
      // Decode JWT payload (base64 decode the middle part)
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        console.log('Decoded JWT payload:', payload);
        console.log('Moderator flag:', payload.moderator);
        console.log('User context:', payload.context);
        
        toast({
          title: "JWT Token Test",
          description: `Token generated successfully. Moderator: ${payload.moderator}`,
        });
      }
    } catch (error: any) {
      console.error('JWT test failed:', error);
      toast({
        title: "JWT Test Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-meeting flex flex-col items-center justify-center p-4">
      <div className="bg-card border-b border-border p-4 w-full max-w-5xl flex items-center justify-between rounded-t-xl">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">Room: {roomName}</h1>
          <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${role}/10 text-${role}`}>{role.toUpperCase()}</span>
          {isRecording && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-red-100 text-red-700 rounded-full">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium">REC {formatTime(recordingTime)}</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {isTeacher && (
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              variant={isRecording ? "destructive" : "secondary"}
              size="sm"
              className="mr-2"
            >
              {isRecording ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Video className="w-4 h-4 mr-2" />
                  Start Recording
                </>
              )}
            </Button>
          )}
          <Button onClick={onLeave} variant="destructive" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Leave Meeting
          </Button>
        </div>
      </div>
      
      <div className="flex-1 w-full max-w-5xl mx-auto bg-card rounded-b-xl shadow-lg" style={{ minHeight: 600 }}>
        {error ? (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-600 mb-2">Meeting Error</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <div className="space-y-2">
                <Button onClick={() => window.location.reload()}>
                  Retry
                </Button>
                <Button onClick={testJWTToken} variant="outline">
                  Test JWT Token
                </Button>
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                <p>Debug Info:</p>
                <p>Room: {roomName}</p>
                <p>User: {username}</p>
                <p>Role: {role} ({isTeacher ? 'Teacher/Moderator' : 'Student/Guest'})</p>
                <p>Check console for more details</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p>Loading meeting...</p>
                </div>
              </div>
            )}
            <div 
              ref={jitsiContainerRef} 
              className="w-full h-full rounded-b-xl"
              style={{ minHeight: 600 }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default MeetingRoom;
