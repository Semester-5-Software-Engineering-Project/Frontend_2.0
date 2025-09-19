'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth, userType } from '@/contexts/AuthContext'
import { MeetingRoom } from '../../components/MeetingRoom'

export default function MeetingPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [roomInput, setRoomInput] = useState('')
  const [activeRoom, setActiveRoom] = useState<string | null>(null)
  const [showMeetingRoom, setShowMeetingRoom] = useState(false)
  const [meetingData, setMeetingData] = useState<{roomId: string, token: string, moduleId: string} | null>(null)

  useEffect(() => {
    
    const storedMeetingData = localStorage.getItem('meetingData')
    if (storedMeetingData) {
      try {
        const parsedData = JSON.parse(storedMeetingData)
        if (parsedData.roomId && parsedData.token) {
          setMeetingData(parsedData)
          setActiveRoom(parsedData.roomId)
          setShowMeetingRoom(true)
          // Clear the stored data after using it
          localStorage.removeItem('meetingData')
          return
        }
      } catch (error) {
        console.error('Error parsing stored meeting data:', error)
        localStorage.removeItem('meetingData')
      }
    }

    // Fallback to URL-based room joining
    const url = new URL(window.location.href)
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
      />
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Start a video meeting</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-[1fr_auto] items-center">
            <Input
              placeholder="Enter room name (e.g., algebra-101)"
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
            />
            <Button onClick={handleJoin} disabled={!roomInput.trim()}>
              Join Meeting
            </Button>
          </div>
          
          {user && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Joining as: <span className="font-medium">{user.name}</span> ({user.role === userType.TUTOR ? 'Teacher' : 'Student'})
              </p>
              <p className="text-sm text-muted-foreground">
                Email: <span className="font-medium">{user.email}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


