'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Video, 
  Calendar, 
  Clock, 
  Users, 
  Search,
  Filter,
  Play,
  Phone,
  Mic,
  MicOff,
  VideoOff,
  ScreenShare,
  Settings
} from 'lucide-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'

export default function VideoSessions() {
  const { user } = useAuth()
  const [activeSession, setActiveSession] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const sessions = [
    {
      id: 1,
      title: 'Advanced Mathematics Session',
      participant: user?.role === 'STUDENT' ? 'Dr. Sarah Johnson' : 'Alex Smith',
      course: 'Advanced Mathematics',
      scheduledTime: '2024-01-15T10:00:00',
      duration: 60,
      status: 'scheduled',
      type: 'regular'
    },
    {
      id: 2,
      title: 'Physics Problem Solving',
      participant: user?.role === 'STUDENT' ? 'Prof. Michael Chen' : 'Emma Wilson',
      course: 'Physics Fundamentals',
      scheduledTime: '2024-01-15T14:00:00',
      duration: 90,
      status: 'live',
      type: 'premium'
    },
    {
      id: 3,
      title: 'Chemistry Lab Review',
      participant: user?.role === 'STUDENT' ? 'Dr. Emily Davis' : 'John Davis',
      course: 'Chemistry Lab Prep',
      scheduledTime: '2024-01-14T16:00:00',
      duration: 60,
      status: 'completed',
      type: 'regular'
    }
  ]

  const handleJoinSession = (sessionId: number) => {
    setActiveSession(sessionId)
    // In a real app, this would redirect to Jitsi Meet
    window.open(`https://meet.jit.si/tutorconnect-session-${sessionId}`, '_blank')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-red-100 text-red-700'
      case 'scheduled':
        return 'bg-blue-100 text-blue-700'
      case 'completed':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.participant.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Video Sessions</h1>
            <p className="text-gray-600">
              {user?.role === 'STUDENT' 
                ? 'Join your scheduled tutoring sessions' 
                : 'Manage your tutoring sessions with STUDENTs'
              }
            </p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            <Video className="w-4 h-4 mr-2" />
            Start New Session
          </Button>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Search sessions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sessions List */}
        <div className="grid gap-6">
          {filteredSessions.map((session) => (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold">{session.title}</h3>
                      <Badge className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                      {session.type === 'premium' && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                          Premium
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>
                          {user?.role === 'STUDENT' ? 'Tutor: ' : 'STUDENT: '}
                          {session.participant}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(session.scheduledTime).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>
                          {new Date(session.scheduledTime).toLocaleTimeString()} 
                          ({session.duration} min)
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-2">Course: {session.course}</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    {session.status === 'live' && (
                      <Button 
                        onClick={() => handleJoinSession(session.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Join Live
                      </Button>
                    )}
                    
                    {session.status === 'scheduled' && (
                      <Button 
                        onClick={() => handleJoinSession(session.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Session
                      </Button>
                    )}
                    
                    {session.status === 'completed' && (
                      <Button variant="outline">
                        <Calendar className="w-4 h-4 mr-2" />
                        Reschedule
                      </Button>
                    )}
                  </div>
                </div>

                {/* Jitsi Integration Preview */}
                {session.status === 'live' && activeSession === session.id && (
                  <div className="mt-6 border-t pt-6">
                    <div className="bg-gray-900 rounded-lg p-4 text-white">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold">Video Conference</h4>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="secondary">
                            <Mic className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="secondary">
                            <Video className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="secondary">
                            <ScreenShare className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="secondary">
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive">
                            <Phone className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="bg-gray-800 rounded-lg h-64 flex items-center justify-center">
                        <div className="text-center">
                          <Video className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                          <p className="text-gray-400">Video conference will load here</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Powered by Jitsi Meet
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSessions.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Video className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No sessions found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Schedule your first tutoring session to get started'
                }
              </p>
              <Button className="bg-green-600 hover:bg-green-700">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Session
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}