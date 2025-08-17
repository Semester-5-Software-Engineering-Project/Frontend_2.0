'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar as CalendarIcon, Clock, Users, Video, Plus, Filter } from 'lucide-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'

export default function Schedule() {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week')

  const sessions = [
    {
      id: 1,
      title: 'Advanced Mathematics',
      participant: user?.role === 'student' ? 'Dr. Sarah Johnson' : 'Alex Smith',
      time: '10:00 AM',
      duration: 60,
      status: 'confirmed',
      type: 'regular'
    },
    {
      id: 2,
      title: 'Physics Fundamentals',
      participant: user?.role === 'student' ? 'Prof. Michael Chen' : 'Emma Wilson',
      time: '2:00 PM',
      duration: 90,
      status: 'pending',
      type: 'premium'
    },
    {
      id: 3,
      title: 'Chemistry Lab Prep',
      participant: user?.role === 'student' ? 'Dr. Emily Davis' : 'John Davis',
      time: '4:00 PM',
      duration: 60,
      status: 'confirmed',
      type: 'regular'
    }
  ]

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ]

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'cancelled':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Schedule</h1>
            <p className="text-gray-600">
              {user?.role === 'student' 
                ? 'Manage your tutoring sessions and book new ones'
                : 'Manage your teaching schedule and availability'
              }
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center border rounded-lg">
              <Button 
                variant={viewMode === 'day' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('day')}
                className={viewMode === 'day' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                Day
              </Button>
              <Button 
                variant={viewMode === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('week')}
                className={viewMode === 'week' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                Week
              </Button>
              <Button 
                variant={viewMode === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('month')}
                className={viewMode === 'month' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                Month
              </Button>
            </div>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              {user?.role === 'student' ? 'Book Session' : 'Add Availability'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Calendar View */}
          <div className="xl:col-span-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Weekly Schedule</CardTitle>
                  <CardDescription>January 15-21, 2024</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </CardHeader>
              <CardContent>
                {/* Calendar Grid */}
                <div className="overflow-x-auto">
                  <div className="min-w-full">
                    {/* Header */}
                    <div className="grid grid-cols-8 gap-2 mb-4">
                      <div className="p-2"></div>
                      {weekDays.map((day, index) => (
                        <div key={day} className="p-2 text-center font-medium text-gray-600">
                          <div>{day}</div>
                          <div className="text-lg font-bold text-gray-900">{15 + index}</div>
                        </div>
                      ))}
                    </div>

                    {/* Time Slots */}
                    <div className="space-y-2">
                      {timeSlots.map((time) => (
                        <div key={time} className="grid grid-cols-8 gap-2">
                          <div className="p-2 text-sm text-gray-500 font-medium">
                            {time}
                          </div>
                          {weekDays.map((day, dayIndex) => {
                            const session = dayIndex === 0 && time === '10:00 AM' ? sessions[0] :
                                           dayIndex === 0 && time === '2:00 PM' ? sessions[1] :
                                           dayIndex === 1 && time === '4:00 PM' ? sessions[2] : null
                            
                            return (
                              <div key={`${day}-${time}`} className="p-1">
                                {session ? (
                                  <div className={`
                                    p-2 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-shadow
                                    ${session.status === 'confirmed' 
                                      ? 'bg-green-50 border-green-500' 
                                      : 'bg-yellow-50 border-yellow-500'
                                    }
                                  `}>
                                    <div className="text-xs font-medium">{session.title}</div>
                                    <div className="text-xs text-gray-600">{session.participant}</div>
                                    <div className="flex items-center space-x-1 mt-1">
                                      <Clock className="w-3 h-3 text-gray-400" />
                                      <span className="text-xs text-gray-500">{session.duration}min</span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="h-16 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center hover:border-green-300 transition-colors cursor-pointer">
                                    <Plus className="w-4 h-4 text-gray-400" />
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Today&apos;s Sessions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {sessions.map((session) => (
                  <div key={session.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{session.title}</h4>
                      <Badge className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{session.participant}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <Clock className="w-3 h-3" />
                        <span>{session.time} ({session.duration}min)</span>
                      </div>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <Video className="w-3 h-3 mr-1" />
                        Join
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">This Week</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Sessions</span>
                  <span className="font-semibold">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Hours Scheduled</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Availability</span>
                  <span className="font-semibold text-green-600">85%</span>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Reminders */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reminders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Session with Alex in 30 min</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Upload materials for tomorrow</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Review pending bookings</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}