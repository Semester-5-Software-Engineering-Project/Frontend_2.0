'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { MeetingRoom } from '../../components/MeetingRoom'

export default function MeetingPage() {
  const { user } = useAuth()

  const [roomInput, setRoomInput] = useState('')
  const [activeRoom, setActiveRoom] = useState<string | null>(null)
  const [showMeetingRoom, setShowMeetingRoom] = useState(false)

  // If a room is provided via query (?room=xyz) or hash (#xyz), use it initially
  useEffect(() => {
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
  }

  if (showMeetingRoom && activeRoom && user) {
    return (
      <MeetingRoom
        username={user.name || 'Guest'}
        roomName={activeRoom}
        role={user.role === 'TUTOR' ? 'teacher' : 'student'}
        email={user.email || undefined}
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
                Joining as: <span className="font-medium">{user.name}</span> ({user.role === 'TUTOR' ? 'Teacher' : 'Student'})
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


