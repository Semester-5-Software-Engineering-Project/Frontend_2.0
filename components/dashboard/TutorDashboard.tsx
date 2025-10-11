'use client'

import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
  
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  Users, 
  DollarSign, 
  Star, 
  Calendar,
  Video,
  Upload,
  TrendingUp,
  Clock,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { getModulesForTutor, upcomingSchedulesByTutor } from '@/services/api'
import { UpcomingSessionResponse, UpcomingSessionsRequest } from '@/types/api'
import { getCurrentDateTime } from '@/utils/dateUtils'

interface ApiModule {
  moduleId: string
  tutorId: string
  name: string
  domain: string
  averageRatings: number
  fee: number
  duration: number // Duration in minutes
  status: string
}

const getDomainImage = (domain: string): string => {
  const domainImages: Record<string, string> = {
    'Mathematics': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&h=200&fit=crop',
    'Computer Science': 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=300&h=200&fit=crop',
    'Physics': 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=300&h=200&fit=crop',
    'Chemistry': 'https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=300&h=200&fit=crop',
    'Biology': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop',
  }
  return domainImages[domain] || 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=200&fit=crop'
}

export default function TutorDashboard() {
  const [modules, setModules] = useState<ApiModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSessionResponse[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);

  const [showAllSchedules, setShowAllSchedules] = useState(false);
  useEffect(() => {
    const fetchModules = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const modules = await getModulesForTutor();
        setModules(modules as ApiModule[]);
      } catch (error) {
        console.error('Error fetching modules:', error);
        setError('Failed to load modules. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchModules();
  }, []);

  useEffect(() => {
    const fetchUpcomingSessions = async () => {
      setSessionsLoading(true);
      setSessionsError(null);
      try {
        // Get current date and time in local timezone
        const { date, time } = getCurrentDateTime();
        const req: UpcomingSessionsRequest = {
          date,
          time,
        };
        const res = await upcomingSchedulesByTutor(req);
        console.log("response from api:", res);
        // If API returns array, set directly; if single object, wrap in array
        setUpcomingSessions(Array.isArray(res) ? res : [res]);
      } catch (err) {
        setSessionsError('Failed to load upcoming sessions.');
      } finally {
        setSessionsLoading(false);
        console.log('Upcoming sessions:', upcomingSessions);
        
      }
    };
    fetchUpcomingSessions();
  }, []);

  // upcomingSessions now comes from API
  
  const recentReviews = [
    {
      id: 1,
      student: 'Alex Smith',
      course: 'Advanced Mathematics',
      rating: 5,
      comment: 'Excellent explanation of complex topics. Very patient and knowledgeable.',
      date: '2024-01-10'
    },
    {
      id: 2,
      student: 'Emma Wilson',
      course: 'Calculus Fundamentals',
      rating: 5,
      comment: 'Great teaching style and very helpful materials.',
      date: '2024-01-08'
    }
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#1F2937] to-[#111827] rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">👨‍🏫 Tutor Dashboard</h1>
            <p className="text-gray-300 text-lg">Manage your courses, students, and teaching schedule.</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-12 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-gray-900">{modules.length}</p>
                    <p className="text-sm text-gray-500 font-medium">Active Modules</p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-purple-600" />
              </div>
              <div>
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-gray-900">
                      ${modules.reduce((total, module) => total + module.fee, 0)}
                    </p>
                    <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center">
                <Star className="w-7 h-7 text-orange-600" />
              </div>
              <div>
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-12 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-gray-900">
                      {modules.length > 0 
                        ? (modules.reduce((total, module) => total + module.averageRatings, 0) / modules.length).toFixed(1)
                        : '-'
                      }
                    </p>
                    <p className="text-sm text-gray-500 font-medium">Avg. Rating</p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* My Modules */}
        <div className="xl:col-span-2">
          <Card className="border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-gray-50">
              <div>
                <CardTitle className="text-xl text-gray-900">My Modules</CardTitle>
                <CardDescription className="text-gray-600">Manage your teaching content and materials</CardDescription>
              </div>
              <Link href="/dashboard/upload">
                <Button size="sm" className="bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-semibold">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Materials
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {isLoading ? (
                // Loading skeleton
                <div className="space-y-4">
                  {[1, 2, 3].map((index) => (
                    <div key={index} className="border rounded-lg p-4 animate-pulse">
                      <div className="flex items-start space-x-4">
                        <div className="w-20 h-16 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-32"></div>
                              <div className="flex space-x-4">
                                <div className="h-3 bg-gray-200 rounded w-20"></div>
                                <div className="h-3 bg-gray-200 rounded w-16"></div>
                              </div>
                            </div>
                            <div className="h-6 bg-gray-200 rounded w-16"></div>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                            <div className="h-8 bg-gray-200 rounded w-28"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                // Error state
                <div className="text-center py-8">
                  <div className="text-red-500 mb-2">⚠️ {error}</div>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </Button>
                </div>
              ) : modules.length === 0 ? (
                // Empty state
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-10 h-10 text-[#FBBF24]" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Modules Yet</h3>
                  <p className="text-gray-500 mb-6">Create your first module to start teaching.</p>
                  <Link href="/dashboard/courses">
                    <Button className="bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-semibold">Create Module</Button>
                  </Link>
                </div>
              ) : (
                // Actual modules
                modules.map((module) => (
                  <div key={module.moduleId} className="border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-[#FBBF24] transition-all bg-white">
                    <div className="flex items-start space-x-4">
                      <img 
                        src={module.domain ? getDomainImage(module.domain) : 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=200&fit=crop'} 
                        alt={module.name}
                        className="w-24 h-20 rounded-lg object-cover shadow-sm"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{module.name}</h3>
                            <div className="flex items-center space-x-3 mt-2">
                              <Badge variant="outline" className="text-xs border-blue-300 text-blue-700 bg-blue-50">
                                {module.domain}
                              </Badge>
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-[#FBBF24] fill-current" />
                                <span className="text-sm font-semibold text-gray-700">{module.averageRatings}</span>
                              </div>
                            </div>
                          </div>
                          <Badge 
                            variant={module.status === 'active' ? 'default' : 'secondary'}
                            className={module.status === 'active' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-gray-100 text-gray-700'}
                          >
                            {module.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-sm font-bold text-[#FBBF24]">
                            ${module.fee} fee
                          </span>
                          <Link href={`/dashboard/courses/${module.moduleId}`}>
                            <Button size="sm" variant="outline" className="border-gray-300 hover:bg-gray-50">
                              Manage Module
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* Upcoming Sessions */}
          <Card className="border-none shadow-md">
            <CardHeader className="border-b bg-gray-50">
              <CardTitle className="text-lg text-gray-900">Upcoming Sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-6">
              {sessionsLoading ? (
                <div className="text-center py-4"><Loader2 className="animate-spin inline mr-2" />Loading...</div>
              ) : sessionsError ? (
                <div className="text-red-500 text-center py-4">{sessionsError}</div>
              ) : (
                upcomingSessions
                  .filter((session) => session.active)
                  .map((session) => (
                    <div key={session.schedule_id} className="border-l-4 border-[#FBBF24] pl-4 py-3 bg-yellow-50 rounded-r-lg">
                      <h4 className="font-semibold text-sm text-gray-900">{session.tutor}</h4>
                      <p className="text-xs text-gray-600 mt-1">{session.course}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-700 font-medium">
                          {session.Date} {session.time}
                        </p>
                        <Badge variant="outline" className="text-xs border-[#FBBF24] text-gray-700">
                          {session.duration}min
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        className="w-full mt-3 bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-semibold"
                        disabled={!session.active}
                        onClick={() => {
                          if (session.active && session.module_id) {
                            window.location.href = `/meeting?module=${encodeURIComponent(session.module_id)}`;
                          }
                        }}
                      >
                        <Video className="w-4 h-4 mr-2" />
                        {session.active ? 'Join Now' : 'Inactive'}
                      </Button>
                    </div>
                  ))
              )}
              <Button variant="outline" size="sm" className="w-full border-[#FBBF24] text-gray-700 hover:bg-yellow-50" onClick={() => setShowAllSchedules(true)}>
                View All Sessions
              </Button>

              {/* Modal for all sessions */}
              <Dialog open={showAllSchedules} onOpenChange={setShowAllSchedules}>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>All Sessions</DialogTitle>
                    <DialogDescription>All upcoming and past sessions</DialogDescription>
                  </DialogHeader>
                  {sessionsLoading ? (
                    <div className="text-center py-4"><Loader2 className="animate-spin inline mr-2" />Loading...</div>
                  ) : sessionsError ? (
                    <div className="text-red-500 text-center py-4">{sessionsError}</div>
                  ) : upcomingSessions.length === 0 ? (
                    <div className="text-center py-4">No sessions found.</div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {upcomingSessions.map((session) => (
                        <div key={session.schedule_id} className="border-l-4 border-primary pl-4 py-2">
                          <h4 className="font-medium text-sm">{session.tutor}</h4>
                          <p className="text-xs text-gray-500">{session.course}</p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-600">{session.Date} {session.time}</p>
                            <Badge variant="outline" className="text-xs">{session.duration}min</Badge>
                          </div>
                          <Button
                            size="sm"
                            className="w-full mt-2 bg-primary hover:bg-primary/90"
                            disabled={!session.active}
                            onClick={() => {
                              if (session.active && session.module_id) {
                                window.location.href = `/meeting?module=${encodeURIComponent(session.module_id)}`;
                              }
                            }}
                          >
                            <Video className="w-4 h-4 mr-2" />
                            {session.active ? 'Join Now' : 'Inactive'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          <Card className="border-none shadow-md">
            <CardHeader className="border-b bg-gray-50">
              <CardTitle className="text-lg text-gray-900">Recent Reviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-6">
              {recentReviews.map((review) => (
                <div key={review.id} className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-sm text-gray-900">{review.student}</p>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3 h-3 ${i < review.rating ? 'text-[#FBBF24] fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-2 leading-relaxed">{review.comment}</p>
                  <p className="text-xs text-gray-400 font-medium">{review.course}</p>
                </div>
              ))}
              <Link href="/dashboard/reviews">
                <Button variant="outline" size="sm" className="w-full border-[#FBBF24] text-gray-700 hover:bg-yellow-50">
                  View All Reviews
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}