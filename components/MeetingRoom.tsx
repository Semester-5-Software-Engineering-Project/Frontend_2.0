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

  // Debug logging
  console.log('MeetingRoom Props:', { username, roomName, role, email, isTeacher });

  // Function to get JWT token from API
  const getJWTToken = async () => {
    try {
      console.log('Making API call to /create/meet');
      console.log('Current cookies:', document.cookie);
      
      // Check if we have authentication cookies
      const cookies = document.cookie.split(';').map(cookie => cookie.trim());
      console.log('Parsed cookies:', cookies);

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

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Prevent multiple initializations
    if (isInitialized || !jitsiContainerRef.current) {
      return;
    }

    let isMounted = true; // Flag to prevent state updates after unmount

    const loadJitsiScript = () => {
      return new Promise((resolve, reject) => {
        // Check if already loaded
        if (window.JitsiMeetExternalAPI) {
          console.log('Jitsi API already loaded');
          resolve(window.JitsiMeetExternalAPI);
          return;
        }

        console.log('Loading Jitsi Meet API script...');
        
        // Try custom domain first, then fallback to public Jitsi
        const tryLoadScript = (scriptUrl: string, domain: string) => {
          return new Promise<any>((resolveScript, rejectScript) => {
            const script = document.createElement('script');
            script.src = scriptUrl;
            script.async = true;
            
            // Set a timeout for script loading
            const timeout = setTimeout(() => {
              rejectScript(new Error(`Script loading timeout for ${domain}`));
            }, 10000); // 10 second timeout
            
            script.onload = () => {
              clearTimeout(timeout);
              console.log(`Jitsi API script loaded successfully from ${domain}`);
              if (window.JitsiMeetExternalAPI) {
                resolveScript({ api: window.JitsiMeetExternalAPI, domain });
              } else {
                rejectScript(new Error('Jitsi API not available after script load'));
              }
            };
            
            script.onerror = (error) => {
              clearTimeout(timeout);
              console.error(`Failed to load Jitsi script from ${domain}:`, error);
              rejectScript(new Error(`Failed to load from ${domain}`));
            };
            
            document.head.appendChild(script);
          });
        };

        // Try custom domain first
        tryLoadScript('https://jit.shancloudservice.com/external_api.js', 'jit.shancloudservice.com')
          .then(resolve)
          .catch((error) => {
            console.warn('Custom Jitsi server failed, trying public server:', error.message);
            toast({
              title: "Trying Fallback Server",
              description: "Custom meeting server unavailable, using public server",
              variant: "default",
            });
            
            // Fallback to public Jitsi
            tryLoadScript('https://meet.jit.si/external_api.js', 'meet.jit.si')
              .then(resolve)
              .catch(reject);
          });
      });
    };

    const initializeJitsi = async () => {
      try {
        // Check if component is still mounted and not already initialized
        if (!isMounted || isInitialized || apiRef.current) {
          console.log('Skipping initialization - component unmounted or already initialized');
          return;
        }

        setIsLoading(true);
        setError(null);
        
        console.log('Initializing Jitsi meeting...');
        
        // Try to load Jitsi script
        let jitsiDomain = 'jit.shancloudservice.com'; // default
        try {
          const scriptResult = await loadJitsiScript() as any;
          if (scriptResult && scriptResult.domain) {
            jitsiDomain = scriptResult.domain;
            console.log('Using Jitsi domain:', jitsiDomain);
          }
        } catch (scriptError: any) {
          console.error('Script loading failed:', scriptError);
          throw new Error(`Failed to load meeting interface: ${scriptError.message || 'Unknown script error'}`);
        }
        
        if (!jitsiContainerRef.current) {
          throw new Error('Meeting container not found');
        }

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

        // Get JWT token from API (only required for custom domain)
        let jwt: string | undefined;
        if (jitsiDomain === 'jit.shancloudservice.com') {
          try {
            console.log('Getting JWT token from API for custom domain...');
            jwt = await getJWTToken();
            console.log('Successfully obtained JWT token from API');
            
            // Debug: Try to decode JWT to see its contents (for debugging only)
            if (jwt) {
              try {
                const base64Url = jwt.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                  return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const decoded = JSON.parse(jsonPayload);
                console.log('JWT payload:', decoded);
                console.log('Is moderator in JWT:', decoded.moderator);
                console.log('User role in JWT:', decoded.context?.user);
              } catch (decodeError) {
                console.log('Could not decode JWT for debugging:', decodeError);
              }
            }
            
            toast({
              title: "Authentication Successful",
              description: "Successfully authenticated with meeting server",
            });
          } catch (jwtError: any) {
            console.error('Failed to get JWT token from API:', jwtError);
            
            // If JWT fails for custom domain, fall back to public Jitsi
            console.warn('JWT failed for custom domain, falling back to public Jitsi server');
            jitsiDomain = 'meet.jit.si';
            
            toast({
              title: "Using Public Server",
              description: "Custom authentication failed, using public meeting server",
              variant: "default",
            });
          }
        } else {
          console.log('Using public Jitsi server, no JWT required');
          toast({
            title: "Using Public Server",
            description: "Connected to public meeting server",
          });
        }

        const options = {
          roomName: roomName,
          width: '100%',
          height: '600px',
          parentNode: jitsiContainerRef.current,
          ...(jwt && { jwt: jwt }), // Only include JWT if available
          userInfo: {
            displayName: username,
            email: email || `${username}@classroom.com`,
          },
          configOverwrite: {
            startWithAudioMuted: true,
            startWithVideoMuted: false,
            disableModeratorIndicator: false, // Show moderator indicator
            enableEmailInStats: false,
            enableWelcomePage: false,
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            analytics: {
              disabled: true,
            },
            disableThirdPartyRequests: true,
            useHostPageLocalStorage: true,
            enableNoAudioDetection: true,
            enableNoisyMicDetection: true,
            // Audio settings to prevent feedback and echo
            enableAudioProcessor: true,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            // Prevent multiple video streams
            enableLayerSuspension: true,
            disableAEC: false,
            disableAGC: false,
            disableAP: false,
            disableHPF: false,
            disableNS: false,
            constraints: {
              video: {
                height: {
                  ideal: 720,
                  max: 720,
                  min: 240
                }
              },
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
              }
            },
            
            // Role-based permissions
            enableUserRolesBasedOnToken: true,
            enableFeaturesBasedOnToken: true,
            
            // Teacher-specific permissions
            ...(isTeacher && {
              disableInviteFunctions: false,
              doNotStoreRoom: false,
              enableRequireDisplayName: false,
              // Enable all moderator features for teachers
              enableLobbyMode: true,
              enableRecording: true,
              enableScreenSharing: true,
              enableKickParticipants: false,
              enableMuteAll: true,
              enableVideoMuteAll: true,
              enableLiveStreaming: true,
              enableDialOut: true,
              // Security features
              enablePasswordProtection: true,
              enableWaitingRoom: true,
            }),
            
            // Student-specific restrictions
            ...((!isTeacher) && {
              disableInviteFunctions: true,
              doNotStoreRoom: true,
              // Disable moderator features for students
              enableLobbyMode: false,
              enableRecording: false,
              enableKickParticipants: false,
              enableMuteAll: false,
              enableVideoMuteAll: false,
              enableLiveStreaming: false,
              enableDialOut: false,
              // Allow basic screen sharing but not recording
              enableScreenSharing: true,
              // Security restrictions
              enablePasswordProtection: false,
              enableWaitingRoom: false,
              // Prevent students from changing room settings
              disableDeepLinking: true,
              disableThirdPartyRequests: true,
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
            HIDE_INVITE_MORE_HEADER: !isTeacher, // Only hide for students
            
            // Teacher (Moderator) gets full control
            TOOLBAR_BUTTONS: isTeacher ? [
              'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
              'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
              'livestreaming', 'settings', 'raisehand', 'videoquality', 
              'filmstrip', 'invite', 'tileview', 'select-background', 'help',
              'mute-everyone', 'mute-video-everyone', 'security', 'lobby-mode',
              'participants-pane', 'toggle-camera'
            ] : [
              // Student (Guest) gets limited controls - no moderator functions
              'microphone', 'camera', 'closedcaptions', 'fullscreen',
              'fodeviceselection', 'hangup', 'profile', 'chat', 'settings', 
              'raisehand', 'videoquality', 'filmstrip', 'tileview', 
              'select-background'
              // Removed: 'invite', 'mute-everyone', 'recording', 'desktop', 'help'
            ],
            
            // Additional restrictions for students
            ...((!isTeacher) && {
              DISABLE_INVITE: true,
              DISABLE_RECORDING: true,
              DISABLE_SCREEN_SHARING: false, // Allow students to share screen but not record
              DISABLE_KICK: true, // Students cannot kick others
              DISABLE_LOBBY: true, // Students cannot control lobby
              DISABLE_FOCUS_INDICATOR: true,
              HIDE_DEEP_LINKING_LOGO: true,
              DISABLE_TRANSCRIPTION_SUBTITLES: true,
            }),
            
            // Teacher-specific enhancements
            ...(isTeacher && {
              DISABLE_INVITE: false,
              DISABLE_RECORDING: false,
              DISABLE_SCREEN_SHARING: false,
              DISABLE_KICK: false, // Teachers can kick participants
              DISABLE_LOBBY: false, // Teachers can control lobby
              SHOW_PROMOTIONAL_CLOSE_PAGE: false,
              ENABLE_DIAL_OUT: true, // Teachers can dial out
            }),
          },
        };

        // Final check before creating Jitsi instance
        if (!isMounted || !jitsiContainerRef.current) {
          console.log('Component unmounted or container not available, aborting Jitsi creation');
          return;
        }

        // Clear the container of any existing content
        jitsiContainerRef.current.innerHTML = '';

        // Dispose any existing instance
        if (apiRef.current) {
          console.log('Disposing existing Jitsi instance');
          try {
            apiRef.current.dispose();
          } catch (e) {
            console.warn('Error disposing existing instance:', e);
          }
          apiRef.current = null;
        }

        console.log('Creating new Jitsi instance with domain:', jitsiDomain);
        apiRef.current = new window.JitsiMeetExternalAPI(jitsiDomain, options);
        
        // Mark as initialized
        setIsInitialized(true);

        // Event listeners
        apiRef.current.addEventListener('ready', () => {
          if (!isMounted) return;
          console.log("Jitsi API is ready");
          console.log("User role:", role, "Is teacher:", isTeacher);
          
          // Check if user is moderator
          setTimeout(() => {
            try {
              const iframe = apiRef.current.getIFrame();
              console.log("Jitsi iframe ready");
            } catch (e) {
              console.log("Could not access iframe:", e);
            }
          }, 1000);
          
          setIsLoading(false);
          toast({
            title: "Meeting Joined",
            description: `Joined as ${role}`,
          });
        });

        // Add event listener for when conference is joined
        apiRef.current.addEventListener('videoConferenceJoined', (event: any) => {
          if (!isMounted) return;
          console.log("Video conference joined:", event);
          console.log("Conference joined successfully - checking moderator status");
        });

        // Add event listener for moderator status
        apiRef.current.addEventListener('participantRoleChanged', (event: any) => {
          if (!isMounted) return;
          console.log("Participant role changed:", event);
        });

        apiRef.current.addEventListener('videoConferenceLeft', () => {
          if (!isMounted) return;
          console.log("Left the meeting");
          onLeave();
        });

        apiRef.current.addEventListener('participantJoined', (participant: any) => {
          if (!isMounted) return;
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
          if (!isMounted) return;
          console.error("Connection failed");
          setError("Connection failed. Please check your internet connection and try again.");
          setIsLoading(false);
        });

        // Handle device errors
        apiRef.current.addEventListener('deviceListChanged', (devices: any) => {
          console.log("Available devices:", devices);
        });

        // Handle moderator actions and permissions
        apiRef.current.addEventListener('participantKicked', (event: any) => {
          if (!isMounted) return;
          console.log("Participant kicked:", event);
          if (isTeacher) {
            toast({
              title: "Participant Removed",
              description: `${event.kicked} was removed from the meeting`,
            });
          }
        });

        // Handle mute actions
        apiRef.current.addEventListener('audioMuteStatusChanged', (event: any) => {
          if (!isMounted) return;
          console.log("Audio mute status changed:", event);
        });

        apiRef.current.addEventListener('videoMuteStatusChanged', (event: any) => {
          if (!isMounted) return;
          console.log("Video mute status changed:", event);
        });

        // Handle recording events
        apiRef.current.addEventListener('recordingStatusChanged', (event: any) => {
          if (!isMounted) return;
          console.log("Recording status changed:", event);
          if (event.on && isTeacher) {
            toast({
              title: "Recording Started",
              description: "Meeting recording has begun",
            });
          } else if (!event.on && isTeacher) {
            toast({
              title: "Recording Stopped",
              description: "Meeting recording has ended",
            });
          }
        });

        // Handle screen sharing
        apiRef.current.addEventListener('screenSharingStatusChanged', (event: any) => {
          if (!isMounted) return;
          console.log("Screen sharing status changed:", event);
          if (event.on) {
            toast({
              title: "Screen Sharing",
              description: `${event.details?.displayName || 'Someone'} started sharing their screen`,
            });
          }
        });

        // Handle errors and restrictions
        apiRef.current.addEventListener('errorOccurred', (event: any) => {
          if (!isMounted) return;
          console.log("Jitsi error occurred:", event);
          
          // Handle permission denied errors for students
          if (!isTeacher && (
            event.error?.includes('PERMISSION_DENIED') || 
            event.error?.includes('MODERATOR_REQUIRED')
          )) {
            toast({
              title: "Permission Denied",
              description: "This action requires teacher privileges",
              variant: "destructive",
            });
          }
        });

        // Handle lobby mode events (teacher only)
        if (isTeacher) {
          apiRef.current.addEventListener('knockingParticipant', (event: any) => {
            if (!isMounted) return;
            console.log("Participant knocking:", event);
            toast({
              title: "Participant Waiting",
              description: `${event.participant?.name || 'Someone'} is waiting to join`,
            });
            
            // You can add a separate UI component to handle admitting participants
            // For now, just log it
            console.log("Participant waiting to be admitted:", event.participant);
          });
        }

      } catch (err: any) {
        if (!isMounted) return;
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
      console.log('Cleaning up MeetingRoom component...');
      isMounted = false;
      
      if (apiRef.current) {
        try {
          apiRef.current.dispose();
        } catch (e) {
          console.warn('Error disposing Jitsi API:', e);
        }
        apiRef.current = null;
      }
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {
          console.warn('Error stopping media recorder:', e);
        }
      }
      
      setIsInitialized(false);
    };
  }, [username, roomName]); // Reduced dependencies to prevent frequent re-runs

  // Teacher control functions
  const muteAllParticipants = () => {
    if (!isTeacher || !apiRef.current) return;
    
    try {
      apiRef.current.executeCommand('muteEveryone');
      toast({
        title: "All Participants Muted",
        description: "You have muted all participants",
      });
    } catch (error) {
      console.error('Error muting all participants:', error);
      toast({
        title: "Error",
        description: "Failed to mute all participants",
        variant: "destructive",
      });
    }
  };

  const muteAllVideo = () => {
    if (!isTeacher || !apiRef.current) return;
    
    try {
      apiRef.current.executeCommand('muteVideoEveryone');
      toast({
        title: "All Video Disabled",
        description: "You have disabled video for all participants",
      });
    } catch (error) {
      console.error('Error disabling all video:', error);
      toast({
        title: "Error",
        description: "Failed to disable video for all participants",
        variant: "destructive",
      });
    }
  };

  const toggleLobbyMode = () => {
    if (!isTeacher || !apiRef.current) return;
    
    try {
      apiRef.current.executeCommand('toggleLobby');
      toast({
        title: "Lobby Mode Toggled",
        description: "Lobby mode has been enabled/disabled",
      });
    } catch (error) {
      console.error('Error toggling lobby mode:', error);
      toast({
        title: "Error",
        description: "Failed to toggle lobby mode",
        variant: "destructive",
      });
    }
  };

  const startJitsiRecording = () => {
    if (!isTeacher || !apiRef.current) return;
    
    try {
      apiRef.current.executeCommand('startRecording', {
        mode: 'stream'
      });
      toast({
        title: "Recording Started",
        description: "Jitsi recording has been started",
      });
    } catch (error) {
      console.error('Error starting Jitsi recording:', error);
      toast({
        title: "Error",
        description: "Failed to start recording",
        variant: "destructive",
      });
    }
  };

  const stopJitsiRecording = () => {
    if (!isTeacher || !apiRef.current) return;
    
    try {
      apiRef.current.executeCommand('stopRecording');
      toast({
        title: "Recording Stopped",
        description: "Jitsi recording has been stopped",
      });
    } catch (error) {
      console.error('Error stopping Jitsi recording:', error);
      toast({
        title: "Error",
        description: "Failed to stop recording",
        variant: "destructive",
      });
    }
  };

  // Recording functions (local screen recording)
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

  const testApiConnection = async () => {
    try {
      console.log('Testing API connection...');
      console.log('Current cookies:', document.cookie);
      console.log('Axios base URL:', axiosInstance.defaults.baseURL);
      console.log('With credentials:', axiosInstance.defaults.withCredentials);
      
      const token = await getJWTToken();
      console.log('API test successful! Token received:', token.substring(0, 50) + '...');
      toast({
        title: "API Test Successful",
        description: "Successfully connected to backend and received token",
      });
    } catch (error: any) {
      console.error('API test failed:', error);
      console.log('Full error object:', error);
      console.log('Response status:', error.response?.status);
      console.log('Response headers:', error.response?.headers);
      console.log('Response data:', error.response?.data);
      toast({
        title: "API Test Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const testAuth = async () => {
    try {
      console.log('Testing authentication status...');
      console.log('Current cookies:', document.cookie);
      
      // Test if we can access a protected endpoint
      const response = await axiosInstance.get('/api/user/profile', {
        withCredentials: true,
        timeout: 5000,
      });
      
      console.log('Auth test successful! User data:', response.data);
      toast({
        title: "Authentication Test Successful",
        description: "User is properly authenticated",
      });
    } catch (error: any) {
      console.error('Auth test failed:', error);
      let message = 'Authentication failed';
      if (error.response?.status === 401) {
        message = 'User not authenticated - please login again';
      } else if (error.response?.status === 404) {
        message = 'Profile endpoint not found - trying alternative check';
      }
      
      toast({
        title: "Authentication Test Failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-meeting flex flex-col items-center justify-center p-4">
      <div className="bg-card border-b border-border p-4 w-full max-w-5xl flex items-center justify-between rounded-t-xl">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">Room: {roomName}</h1>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            isTeacher 
              ? 'bg-green-100 text-green-700' 
              : 'bg-blue-100 text-blue-700'
          }`}>
            {isTeacher ? '👨‍🏫 MODERATOR' : '👨‍🎓 STUDENT'}
          </span>
          {!isTeacher && (
            <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-700">
              ⚠️ Limited permissions
            </span>
          )}
          {isRecording && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-red-100 text-red-700 rounded-full">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium">REC {formatTime(recordingTime)}</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {isTeacher && (
            <>
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
              
              {/* Teacher Control Buttons */}
              <Button
                onClick={muteAllParticipants}
                variant="outline"
                size="sm"
                title="Mute all participants"
              >
                🔇 Mute All
              </Button>
              
              <Button
                onClick={muteAllVideo}
                variant="outline"
                size="sm"
                title="Disable video for all participants"
              >
                📹 Video Off
              </Button>
              
              <Button
                onClick={toggleLobbyMode}
                variant="outline"
                size="sm"
                title="Toggle lobby/waiting room"
              >
                🚪 Lobby
              </Button>
              
              <Button
                onClick={startJitsiRecording}
                variant="outline"
                size="sm"
                title="Start Jitsi cloud recording"
              >
                ☁️ Record
              </Button>
            </>
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
                <Button onClick={testApiConnection} variant="outline">
                  Test API Connection
                </Button>
                <Button onClick={testAuth} variant="outline">
                  Test Authentication
                </Button>
                <div className="text-xs text-muted-foreground mt-4">
                  <p>Debug Info:</p>
                  <p>Room: {roomName}</p>
                  <p>User: {username}</p>
                  <p>Role: {role}</p>
                  <p>Check console for more details</p>
                </div>
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
                  <p className="text-xs text-muted-foreground mt-2">
                    Connecting to {roomName}...
                  </p>
                </div>
              </div>
            )}
            <div 
              ref={jitsiContainerRef} 
              className="w-full h-full rounded-b-xl"
              style={{ 
                minHeight: 600,
                maxHeight: 600,
                overflow: 'hidden',
                position: 'relative',
                backgroundColor: '#000'
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};
