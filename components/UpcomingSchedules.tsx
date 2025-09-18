'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Video, User } from 'lucide-react'
import { scheduleApi, ScheduleDto } from '@/apis/ScheduleApi'
import { useToast } from '@/hooks/use-toast'

interface UpcomingSchedulesProps {
  moduleId: string
  onJoinMeeting?: (schedule: ScheduleDto) => void
}

export default function UpcomingSchedules({ moduleId, onJoinMeeting }: UpcomingSchedulesProps) {
  const [schedules, setSchedules] = useState<ScheduleDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Refresh schedules every minute to update join button states
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true)
        setError(null)
        const allSchedules = await scheduleApi.getMySchedules()
        const moduleSchedules = allSchedules.filter(schedule => schedule.moduleId === moduleId)
        const upcomingSchedules = scheduleApi.getUpcomingSchedules(moduleSchedules)
        setSchedules(upcomingSchedules)
      } catch (err: any) {
        console.error('Error fetching schedules:', err)
        setError(err.message || 'Failed to fetch schedules')
      } finally {
        setLoading(false)
      }
    }

    fetchSchedules()

    // Refresh every minute to update join button states
    const interval = setInterval(fetchSchedules, 60000)
    return () => clearInterval(interval)
  }, [moduleId])

  const formatDateTime = (date: string, time: string) => {
    const scheduleDate = new Date(`${date}T${time}`)
    const now = new Date()
    const isToday = scheduleDate.toDateString() === now.toDateString()
    const isTomorrow = scheduleDate.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString()
    
    const timeString = scheduleDate.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
    
    if (isToday) {
      return `Today at ${timeString}`
    } else if (isTomorrow) {
      return `Tomorrow at ${timeString}`
    } else {
      return `${scheduleDate.toLocaleDateString()} at ${timeString}`
    }
  }

  const getTimeUntilSchedule = (date: string, time: string) => {
    const scheduleDateTime = new Date(`${date}T${time}`)
    const now = new Date()
    const timeDiff = scheduleDateTime.getTime() - now.getTime()
    
    if (timeDiff <= 0) return 'Now'
    
    const hours = Math.floor(timeDiff / (1000 * 60 * 60))
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `in ${hours}h ${minutes}m`
    } else {
      return `in ${minutes}m`
    }
  }

  const handleJoinMeeting = (schedule: ScheduleDto) => {
    if (onJoinMeeting) {
      onJoinMeeting(schedule)
    } else {
      toast({
        title: "Join Meeting",
        description: `Joining meeting for ${schedule.moduleName}`,
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Upcoming Sessions</span>
          </CardTitle>
          <CardDescription>Loading scheduled sessions...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Upcoming Sessions</span>
          </CardTitle>
          <CardDescription>Error loading scheduled sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (schedules.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Upcoming Sessions</span>
          </CardTitle>
          <CardDescription>Scheduled learning sessions for this module</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Upcoming Sessions</h3>
            <p className="text-sm">
              No sessions are scheduled for this module. Check back later or contact your tutor.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="w-5 h-5" />
          <span>Upcoming Sessions</span>
        </CardTitle>
        <CardDescription>
          {schedules.length} scheduled session{schedules.length !== 1 ? 's' : ''} for this module
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {schedules.map((schedule) => {
            const isJoinable = scheduleApi.isScheduleJoinable(schedule)
            const timeUntil = getTimeUntilSchedule(schedule.date, schedule.time)
            
            return (
              <div
                key={schedule.scheduleId}
                className={`p-4 border rounded-lg transition-all ${
                  isJoinable 
                    ? 'border-green-200 bg-green-50 shadow-md' 
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-semibold text-lg">{schedule.moduleName}</h4>
                      {isJoinable && (
                        <Badge variant="default" className="bg-green-600">
                          Ready to Join
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {schedule.scheduleType}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDateTime(schedule.date, schedule.time)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{schedule.duration} minutes</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{schedule.tutorName}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {schedule.recurrentType}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {timeUntil}
                      </span>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <Button
                      onClick={() => handleJoinMeeting(schedule)}
                      disabled={!isJoinable}
                      variant={isJoinable ? "default" : "outline"}
                      className={`flex items-center space-x-2 ${
                        isJoinable 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : ''
                      }`}
                    >
                      <Video className="w-4 h-4" />
                      <span>
                        {isJoinable ? 'Join Now' : 'Join Meeting'}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}