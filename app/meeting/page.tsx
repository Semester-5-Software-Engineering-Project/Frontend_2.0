'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth, userType } from '@/contexts/AuthContext'
import { MeetingRoom } from '../../components/MeetingRoom'
import { getCurrentDateTime } from '@/utils/dateUtils'
import { set } from 'date-fns'

export default function MeetingPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [roomInput, setRoomInput] = useState('')
  const [activeRoom, setActiveRoom] = useState<string | null>(null)
  const [showMeetingRoom, setShowMeetingRoom] = useState(false)
  const [meetingData, setMeetingData] = useState<{roomId: string, token: string, moduleId: string} | null>(null)
  const [courseName, setCourseName] = useState<string | null>(null)

  useEffect(() => {
    // If moduleId is present in query, call joinMeeting API
    const url = new URL(window.location.href)
    const moduleId = url.searchParams.get('module')
    if (moduleId) {
      // Prepare payload for joinMeeting
      const { date: requestedDate, time } = getCurrentDateTime();
      const requestedTime = time.slice(0, 5); // Convert HH:MM:SS to HH:MM
      const payload = {
        moduleId,
        requestedDate,
        requestedTime,
      };
      import('@/services/api').then(({ joinMeeting }) => {
        joinMeeting(payload as any).then((response: any) => {
          if (response.success && response.roomId && response.token) {
            setMeetingData({ roomId: response.roomId, token: response.token, moduleId });
            setActiveRoom(response.roomId);
            setShowMeetingRoom(true);
            setCourseName(response.courseName || null);
          } else {
            alert('Failed to join meeting: ' + (response.message || 'Unknown error'));
          }
        }).catch((err: any) => {
          alert('Failed to join meeting: ' + (err?.message || 'Unknown error'));
        });
      });
      return;
    }
    // Fallback: manual room join
    const fromQuery = url.searchParams.get('room')
    const fromHash = window.location.hash?.replace('#', '')
    const initial = fromQuery || fromHash || ''
    setRoomInput(initial)
    if (initial) {
      setActiveRoom(initial)
      setShowMeetingRoom(true)
    }
  }, [])

  const handleJoin = () => {
    if (roomInput.trim()) {
      setActiveRoom(roomInput.trim())
      setShowMeetingRoom(true)
    }
  }

  const handleLeave = () => {
    setShowMeetingRoom(false)
    setActiveRoom(null)
    
    if (meetingData?.moduleId) {
      localStorage.removeItem('meetingData')
      setMeetingData(null)
      
      // Redirect to the module page
      router.push(`/dashboard/courses/${meetingData.moduleId}`)
    } else {
      // If no moduleId, just clear state and stay on meeting page
      setMeetingData(null)
      localStorage.removeItem('meetingData')
    }
  }

  if (showMeetingRoom && activeRoom && user) {
    return (
      <MeetingRoom
        username={user.name || 'Guest'}
        roomName={activeRoom}
        role={user.role === userType.TUTOR ? 'teacher' : 'student'}
        email={user.email || undefined}
        jwtToken={meetingData?.token}
        onLeave={handleLeave}
        courseName={courseName || ''}
      />
    )
  }

  // return (
  //   <div className="container mx-auto px-4 py-8">
  //     <Card className="border-0 shadow-lg">
  //       <CardHeader>
  //         <CardTitle className="text-2xl">Start a video meeting</CardTitle>
  //       </CardHeader>
  //       <CardContent>
  //         <div className="grid gap-4 md:grid-cols-[1fr_auto] items-center">
  //           <Input
  //             placeholder="Enter room name (e.g., algebra-101)"
  //             value={roomInput}
  //             onChange={(e) => setRoomInput(e.target.value)}
  //             onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
  //           />
  //           <Button onClick={handleJoin} disabled={!roomInput.trim()}>
  //             Join Meeting
  //           </Button>
  //         </div>
          
  //         {user && (
  //           <div className="mt-4 p-4 bg-muted rounded-lg">
  //             <p className="text-sm text-muted-foreground">
  //               Joining as: <span className="font-medium">{user.name}</span> ({user.role === userType.TUTOR ? 'Teacher' : 'Student'})
  //             </p>
  //             <p className="text-sm text-muted-foreground">
  //               Email: <span className="font-medium">{user.email}</span>
  //             </p>
  //           </div>
  //         )}
  //       </CardContent>
  //     </Card>
  //   </div>
  // )
}


