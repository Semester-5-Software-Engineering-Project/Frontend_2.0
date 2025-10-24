'use client'

import { Button } from "@/components/ui/button";
import { ArrowLeft, Video, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react";
import { createMeet } from "@/services/api";

interface MeetingRoomProps {
  username: string;
  roomName: string;
  courseName: string;
  role: 'student' | 'teacher';
  email?: string;
  password?: string;
  jwtToken?: string;
  onLeave: () => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export const MeetingRoom = ({ username, roomName, courseName, role, email, password, jwtToken, onLeave }: MeetingRoomProps) => {
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
  const recordingStartedInSession = useRef<boolean>(false);
  const isTeacher = role === 'teacher';

  // Function to get JWT token from API or use provided token
  const getJWTToken = async () => {
    // If we have a JWT token provided (from the new meeting flow), use it
    if (jwtToken) {
      return jwtToken;
    }

    // Fallback to the old API call for backward compatibility
    try {
      const response = await createMeet();

      if (response.meetingUrl) {
        return response.meetingUrl;
      } else {
        throw new Error('No token received from API');
      }
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        } else if (error.response.status === 403) {
          throw new Error('Access denied. You don\'t have permission to join meetings.');
        } else if (error.response.data) {
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
          resolve(window.JitsiMeetExternalAPI);
          return;
        }

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
              if (window.JitsiMeetExternalAPI) {
                resolveScript({ api: window.JitsiMeetExternalAPI, domain });
              } else {
                rejectScript(new Error('Jitsi API not available after script load'));
              }
            };
            
            script.onerror = (error) => {
              clearTimeout(timeout);
              rejectScript(new Error(`Failed to load from ${domain}`));
            };
            
            document.head.appendChild(script);
          });
        };

        // Get domains from environment variables
        const customDomain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'jit.shancloudservice.com';
        const fallbackDomain = process.env.NEXT_PUBLIC_JITSI_FALLBACK_DOMAIN || 'meet.jit.si';
        
        // Try custom domain first
        tryLoadScript(`https://${customDomain}/external_api.js`, customDomain)
          .then(resolve)
          .catch((error) => {
            toast({
              title: "Trying Fallback Server",
              description: "Custom meeting server unavailable, using public server",
              variant: "default",
            });
            
            // Fallback to public Jitsi
            tryLoadScript(`https://${fallbackDomain}/external_api.js`, fallbackDomain)
              .then(resolve)
              .catch(reject);
          });
      });
    };

    const initializeJitsi = async () => {
      try {
        // Check if component is still mounted and not already initialized
        if (!isMounted || isInitialized || apiRef.current) {
          return;
        }

        setIsLoading(true);
        setError(null);
        
        // Get default domain from environment variable
        const customDomain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'jit.shancloudservice.com';
        
        // Try to load Jitsi script
        let jitsiDomain = customDomain; // default
        try {
          const scriptResult = await loadJitsiScript() as any;
          if (scriptResult && scriptResult.domain) {
            jitsiDomain = scriptResult.domain;
          }
        } catch (scriptError: any) {
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
          toast({
            title: "Security Warning",
            description: "For full functionality, please use HTTPS or localhost",
            variant: "destructive",
          });
        }

        // Get JWT token from API (only required for custom domain)
        const fallbackDomain = process.env.NEXT_PUBLIC_JITSI_FALLBACK_DOMAIN || 'meet.jit.si';
        let jwt: string | undefined;
        if (jitsiDomain === customDomain) {
          try {
            jwt = await getJWTToken();
            
            toast({
              title: "Authentication Successful",
              description: "Successfully authenticated with meeting server",
            });
          } catch (jwtError: any) {
            // If JWT fails for custom domain, fall back to public Jitsi
            jitsiDomain = fallbackDomain;
            
            toast({
              title: "Using Public Server",
              description: "Custom authentication failed, using public meeting server",
              variant: "default",
            });
          }
        } else {
          toast({
            title: "Using Public Server",
            description: "Connected to public meeting server",
          });
        }

        const options = {
          roomName: roomName,
          width: '100%',
          height: '100%',
          parentNode: jitsiContainerRef.current,
          ...(jwt && { jwt: jwt }), // Only include JWT if available
          userInfo: {
            displayName: username,
            email: email || `${username}@classroom.com`,
          },
          configOverwrite: {
            startWithAudioMuted: true,
            startWithVideoMuted: true,
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
            DEFAULT_LOGO_URL: '/gfx/mylogo.svg',
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            JITSI_WATERMARK_LINK: '',
            BRAND_WATERMARK_LINK: '',
            SHOW_POWERED_BY: false,
            HIDE_INVITE_MORE_HEADER: true,
            HIDE_DEEP_LINKING_LOGO: true,
            HIDE_LOGO: true,
            DISABLE_DEEP_LINKING: true,
            DISABLE_LOGO_CLICK: true,
            APP_NAME: "Virtual Classroom",
            NATIVE_APP_NAME: "Virtual Classroom",
            DEFAULT_BACKGROUND: '#0F172A',
            DISABLE_DOMINANT_SPEAKER_INDICATOR: true,
            DISABLE_TRANSCRIPTION_SUBTITLES: true,
            DISABLE_RINGING: true,
            
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
          return;
        }

        // Clear the container of any existing content
        jitsiContainerRef.current.innerHTML = '';

        // Dispose any existing instance
        if (apiRef.current) {
          try {
            apiRef.current.dispose();
          } catch (e) {
            // Ignore disposal errors
          }
          apiRef.current = null;
        }

        apiRef.current = new window.JitsiMeetExternalAPI(jitsiDomain, options);
        
        // Mark as initialized
        setIsInitialized(true);

        // Event listeners
        apiRef.current.addEventListener('ready', () => {
          if (!isMounted) return;
          
          // Hide Jitsi logos with CSS injection
          setTimeout(() => {
            try {
              const iframe = apiRef.current.getIFrame();
              if (iframe && iframe.contentDocument) {
                const style = iframe.contentDocument.createElement('style');
                style.innerHTML = `
                  /* Hide all Jitsi logos and branding */
                  .leftwatermark, .rightwatermark, 
                  .watermark, .jitsi-watermark, 
                  .brand-watermark, .poweredby,
                  .jitsi-icon, .icon-jitsi,
                  [class*="watermark"], [class*="logo"],
                  .header-logo, .brand-logo,
                  .jitsi-meet-logo, .welcome-page-logo,
                  .toolbox-button[aria-label*="Jitsi"],
                  a[href*="jitsi.org"], a[href*="jitsi.com"] {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    width: 0 !important;
                    height: 0 !important;
                    pointer-events: none !important;
                  }
                  
                  /* Prevent clicking on any remaining logos */
                  .header a, .watermark a {
                    pointer-events: none !important;
                  }
                `;
                iframe.contentDocument.head.appendChild(style);
              }
            } catch (e) {
              // Ignore iframe access errors due to CORS
            }
          }, 2000);
          
          setIsLoading(false);
          toast({
            title: "Meeting Joined",
            description: `Joined as ${role}`,
          });
        });

        // Add event listener for when conference is joined
        apiRef.current.addEventListener('videoConferenceJoined', (event: any) => {
          if (!isMounted) return;
        });

        // Add event listener for moderator status
        apiRef.current.addEventListener('participantRoleChanged', (event: any) => {
          if (!isMounted) return;
        });

        apiRef.current.addEventListener('videoConferenceLeft', () => {
          if (!isMounted) return;
          onLeave();
        });

        apiRef.current.addEventListener('participantJoined', (participant: any) => {
          if (!isMounted) return;
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
          setError("Connection failed. Please check your internet connection and try again.");
          setIsLoading(false);
        });

        // Handle device errors
        apiRef.current.addEventListener('deviceListChanged', (devices: any) => {
          // Device list changed - can be used for device management
        });

        // Handle moderator actions and permissions
        apiRef.current.addEventListener('participantKicked', (event: any) => {
          if (!isMounted) return;
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
        });

        apiRef.current.addEventListener('videoMuteStatusChanged', (event: any) => {
          if (!isMounted) return;
        });

        // Handle recording events
        apiRef.current.addEventListener('recordingStatusChanged', (event: any) => {
          if (!isMounted) return;
          if (event.on && isTeacher) {
            recordingStartedInSession.current = true;
            toast({
              title: "Recording Started",
              description: "Meeting recording has begun",
            });
          } else if (!event.on && isTeacher && recordingStartedInSession.current) {
            toast({
              title: "Recording Stopped",
              description: "Meeting recording has ended",
            });
          }
        });

        // Handle screen sharing
        apiRef.current.addEventListener('screenSharingStatusChanged', (event: any) => {
          if (!isMounted) return;
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
            toast({
              title: "Participant Waiting",
              description: `${event.participant?.name || 'Someone'} is waiting to join`,
            });
          });
        }

      } catch (err: any) {
        if (!isMounted) return;
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
      isMounted = false;
      
      if (apiRef.current) {
        try {
          apiRef.current.dispose();
        } catch (e) {
          // Ignore disposal errors
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
          // Ignore recorder stop errors
        }
      }
      
      setIsInitialized(false);
    };
  }, [username, courseName, roomName]); // Reduced dependencies to prevent frequent re-runs

  // Recording functions (local screen recording)
  const startRecording = async () => {
    try {
      // Check if browser supports screen recording
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        toast({
          title: "Recording Not Supported",
          description: "Your browser doesn't support screen recording",
          variant: "destructive",
        });
        return;
      }

      // Check if we're on HTTPS (required for screen capture)
      if (window.location.protocol !== 'https:' && 
          window.location.hostname !== 'localhost' && 
          window.location.hostname !== '127.0.0.1') {
        toast({
          title: "HTTPS Required",
          description: "Screen recording requires HTTPS or localhost",
          variant: "destructive",
        });
        return;
      }

      // Get display media stream with fallback options
      let stream;
      try {
        // Try with audio first (simplest approach)
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
      } catch (audioError) {
        console.warn('Failed to get audio, trying video only:', audioError);
        try {
          // Fallback to video only if audio fails
          stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: false
          });
          
          toast({
            title: "Recording Started (Video Only)",
            description: "Audio recording failed, capturing video only",
            variant: "default",
          });
        } catch (videoError) {
          console.error('Failed to get video stream:', videoError);
          // Try with more detailed constraints as last resort
          stream = await navigator.mediaDevices.getDisplayMedia({
            video: {
              width: { ideal: 1920 },
              height: { ideal: 1080 },
              frameRate: { ideal: 30 }
            },
            audio: false
          });
        }
      }

      // Reset recorded chunks
      recordedChunksRef.current = [];

      // Try different MIME types for better browser compatibility
      let mimeType = '';
      const supportedTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=h264,opus',
        'video/webm',
        'video/mp4;codecs=h264,aac',
        'video/mp4'
      ];

      for (const type of supportedTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }

      if (!mimeType) {
        throw new Error('No supported recording format found');
      }

      console.log('Using MIME type:', mimeType);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
        videoBitsPerSecond: 2500000, // 2.5 Mbps for good quality
        audioBitsPerSecond: 128000   // 128 kbps for audio
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.addEventListener('dataavailable', (event) => {
        console.log('Data available:', event.data.size, 'bytes');
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      });

      mediaRecorder.addEventListener('stop', () => {
        console.log('Recording stopped, total chunks:', recordedChunksRef.current.length);
        
        if (recordedChunksRef.current.length === 0) {
          toast({
            title: "Recording Error",
            description: "No data was recorded",
            variant: "destructive",
          });
          return;
        }

        const blob = new Blob(recordedChunksRef.current, {
          type: mimeType
        });

        console.log('Created blob:', blob.size, 'bytes, type:', blob.type);

        // Create download link with better filename
        const url = URL.createObjectURL(blob);
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
        const filename = `${courseName.replace(/[^a-zA-Z0-9]/g, '_')}-${timestamp}.${extension}`;
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        
        // Add a small delay to ensure the link is ready
        setTimeout(() => {
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);

        toast({
          title: "Recording Saved",
          description: `Recording downloaded as ${filename}`,
        });
      });

      mediaRecorder.addEventListener('error', (event: any) => {
        console.error('MediaRecorder error:', event?.error ?? event);
        toast({
          title: "Recording Error",
          description: `Recording failed: ${event?.error?.message || event?.message || 'Unknown error'}`,
          variant: "destructive",
        });
        setIsRecording(false);
        setRecordingTime(0);
      });

      mediaRecorder.addEventListener('start', () => {
        console.log('Recording started');
        toast({
          title: "Recording Started",
          description: "Screen recording has begun",
        });
      });

      // Start recording with shorter intervals for more frequent data collection
      mediaRecorder.start(100); // Collect data every 100ms for smoother recording
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // Handle all stream tracks ending (user stops screen sharing)
      stream.getTracks().forEach(track => {
        track.addEventListener('ended', () => {
          console.log(`${track.kind} track ended`);
          // Only stop recording if video track ends (audio ending is less critical)
          if (track.kind === 'video') {
            stopRecording();
          }
        });
      });

    } catch (error: any) {
      console.error('Recording start error:', error);
      
      let errorMessage = "Failed to start recording. Please try again.";
      
      if (error.name === 'NotAllowedError') {
        errorMessage = "Permission denied. Please allow screen sharing.";
      } else if (error.name === 'NotSupportedError') {
        errorMessage = "Screen recording not supported in this browser.";
      } else if (error.name === 'NotFoundError') {
        errorMessage = "No screen source available for recording.";
      } else if (error.name === 'AbortError') {
        errorMessage = "Recording was cancelled by user.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Recording Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      setIsRecording(false);
      setRecordingTime(0);
    }
  };

  const stopRecording = () => {
    try {
      console.log('Stopping recording...');
      
      // Stop the MediaRecorder
      if (mediaRecorderRef.current) {
        const state = mediaRecorderRef.current.state;
        console.log('MediaRecorder state:', state);
        
        if (state === 'recording') {
          mediaRecorderRef.current.stop();
        } else if (state === 'paused') {
          mediaRecorderRef.current.resume();
          setTimeout(() => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
              mediaRecorderRef.current.stop();
            }
          }, 100);
        }
        
        // Stop all tracks to release the screen capture
        if (mediaRecorderRef.current.stream) {
          mediaRecorderRef.current.stream.getTracks().forEach(track => {
            track.stop();
          });
        }
      }
      
      // Clear the timer
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }

      // Update UI state
      setIsRecording(false);
      setRecordingTime(0);

      toast({
        title: "Recording Stopped",
        description: "Recording has been stopped and will be downloaded shortly",
      });
      
    } catch (error: any) {
      console.error('Error stopping recording:', error);
      
      // Force cleanup even if there's an error
      setIsRecording(false);
      setRecordingTime(0);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      
      toast({
        title: "Recording Stopped",
        description: "Recording stopped with errors. Check browser console.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen w-screen bg-meeting flex flex-col">
      <div className="bg-card border-b border-border p-4 w-full flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">Room: {courseName}</h1>
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
      
      <div className="flex-1 w-full bg-card" style={{ height: '100%' }}>
        {error ? (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-600 mb-2">Meeting Error</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <div className="space-y-2">
                <Button onClick={() => window.location.reload()}>
                  Retry
                </Button>
                <div className="text-xs text-muted-foreground mt-4">
                  <p>Debug Info:</p>
                  <p>Course: {courseName}</p>
                  <p>Room ID: {roomName}</p>
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
                    Connecting to {courseName}...
                  </p>
                </div>
              </div>
            )}
            <div 
              ref={jitsiContainerRef} 
              className="w-full h-full"
              style={{ 
                width: '100%',
                height: '100%',
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
