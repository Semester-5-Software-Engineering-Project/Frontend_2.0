'use client'

import { useEffect, useMemo, useState } from 'react'
import { JitsiMeeting } from '@jitsi/react-sdk'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'

export default function MeetingPage() {
  const { user } = useAuth()

  const [roomInput, setRoomInput] = useState('')
  const [activeRoom, setActiveRoom] = useState<string | null>(null)

  const jitsiDomain = useMemo(() => {
    if (typeof window === 'undefined') return 'meet.jit.si'
    return process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'meet.jit.si'
  }, [])

  // If a room is provided via query (?room=xyz) or hash (#xyz), use it initially
  useEffect(() => {
    const url = new URL(window.location.href)
    const fromQuery = url.searchParams.get('room')
    const fromHash = window.location.hash?.replace('#', '')
    const initial = fromQuery || fromHash || ''
    setRoomInput(initial)
    if (initial) setActiveRoom(initial)
  }, [])

  const handleJoin = () => {
    if (roomInput.trim()) setActiveRoom(roomInput.trim())
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Start a video meeting</CardTitle>
        </CardHeader>
        <CardContent>
          {!activeRoom && (
            <div className="grid gap-4 md:grid-cols-[1fr_auto] items-center">
              <Input
                placeholder="Enter room name (e.g., algebra-101)"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
              />
              <Button onClick={handleJoin} disabled={!roomInput.trim()}>Join</Button>
            </div>
          )}

          {activeRoom && (
            <div className="mt-4">
              <div className="rounded-lg overflow-hidden bg-black">
                <JitsiMeeting
                  domain={jitsiDomain}
                  roomName={activeRoom}
                  configOverwrite={{
                    prejoinConfig: {
                      enabled: true,
                    },
                  }}
                  interfaceConfigOverwrite={{
                    DEFAULT_REMOTE_DISPLAY_NAME: 'Participant',
                  }}
                  userInfo={{
                    displayName: user?.name || 'Guest',
                    email: user?.email || '',
                  }}
                  getIFrameRef={(iframeRef) => {
                    iframeRef.style.height = '70vh'
                    iframeRef.style.width = '100%'
                    iframeRef.style.border = '0'
                  }}
                />
              </div>

              <div className="flex items-center justify-between mt-3">
                <p className="text-sm text-muted-foreground">
                  Connected to {jitsiDomain} • Room: <span className="font-medium">{activeRoom}</span>
                </p>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setActiveRoom(null)}>Leave room</Button>
                  <Button onClick={() => {
                    const newRoom = `${activeRoom}-${Math.floor(Math.random() * 1000)}`
                    setRoomInput(newRoom)
                    setActiveRoom(newRoom)
                  }}>New room</Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


