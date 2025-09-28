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
        // You may want to set from_date/from_time to now, or allow filtering by module
        const now = new Date();
        const req: UpcomingSessionsRequest = {
          from_date: now.toISOString().slice(0, 10),
          from_time: now.toTimeString().slice(0, 8),
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
      <div className="bg-[#3b372f] rounded-xl p-6 text-primary-foreground">
        <h1 className="text-3xl font-bold ">Tutor Dashboard</h1>
        <p className="text-primary-foreground/70">Manage your courses, students, and teaching schedule.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-8 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold">{modules.length}</p>
                    <p className="text-sm text-muted-foreground">Active Modules</p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold">
                      ${modules.reduce((total, module) => total + module.fee, 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-12 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold">
                      {modules.length > 0 
                        ? (modules.reduce((total, module) => total + module.averageRatings, 0) / modules.length).toFixed(1)
                        : '-'
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">Avg. Rating</p>
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Modules</CardTitle>
                <CardDescription>Manage your teaching content and materials</CardDescription>
              </div>
              <Link href="/dashboard/upload">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Materials
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Modules Yet</h3>
                  <p className="text-gray-500 mb-4">Create your first module to start teaching.</p>
                  <Link href="/dashboard/courses">
                    <Button>Create Module</Button>
                  </Link>
                </div>
              ) : (
                // Actual modules
                modules.map((module) => (
                  <div key={module.moduleId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      <img 
                        src={module.domain ? getDomainImage(module.domain) : 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=200&fit=crop'} 
                        alt={module.name}
                        className="w-20 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground">{module.name}</h3>
                            <div className="flex items-center space-x-4 mt-1">
                              <div className="flex items-center space-x-1">
                                <Badge variant="outline" className="text-xs">
                                  {module.domain}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-sm text-muted-foreground">{module.averageRatings}</span>
                              </div>
                            </div>
                          </div>
                          <Badge 
                            variant={module.status === 'active' ? 'default' : 'secondary'}
                            className={module.status === 'active' ? 'bg-primary/10 text-primary' : ''}
                          >
                            {module.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-sm font-semibold text-primary">
                            ${module.fee} fee
                          </span>
                          <Link href={`/dashboard/courses/${module.moduleId}`}>
                            <Button size="sm" variant="outline">
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
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sessionsLoading ? (
                <div className="text-center py-4"><Loader2 className="animate-spin inline mr-2" />Loading...</div>
              ) : sessionsError ? (
                <div className="text-red-500 text-center py-4">{sessionsError}</div>
              ) : (
                upcomingSessions
                  .filter((session) => session.active)
                  .map((session) => (
                    <div key={session.schedule_id} className="border-l-4 border-primary pl-4 py-2">
                      <h4 className="font-medium text-sm">{session.tutor}</h4>
                      <p className="text-xs text-gray-500">{session.course}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-600">
                          {session.Date} {session.time}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {session.duration}min
                        </Badge>
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
                  ))
              )}
              <Button variant="outline" size="sm" className="w-full" onClick={() => setShowAllSchedules(true)}>
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
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Reviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentReviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm">{review.student}</p>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3 h-3 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{review.comment}</p>
                  <p className="text-xs text-gray-400">{review.course}</p>
                </div>
              ))}
              <Link href="/dashboard/reviews">
                <Button variant="outline" size="sm" className="w-full">
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