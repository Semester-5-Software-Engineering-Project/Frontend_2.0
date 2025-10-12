'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BookOpen, Calendar, Video, Clock, Star, TrendingUp, Loader2, Eye } from 'lucide-react'
import Link from 'next/link'
import { getEnrollments, upcomingSchedulesByStudent, api } from '@/services/api'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { UpcomingSessionResponse, UpcomingSessionsRequest, Module as ModuleType } from '@/types/api'
import { getCurrentDateTime } from '@/utils/dateUtils'
import { useStudentProfile } from '@/contexts/StudentProfileContex'
import { useAuth } from '@/contexts/AuthContext'
import { TutorProfileApi } from '@/apis/TutorProfile'
import { ModuleDescriptionApi } from '@/apis/ModuleDescriptionApi'


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

export default function StudentDashboard() {
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSessionResponse[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [showAllSchedules, setShowAllSchedules] = useState(false);
  const [courses, setCourses] = useState<ApiModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useStudentProfile();
  const { user } = useAuth();
  const displayName = profile?.firstName?.trim() || user?.name || 'there';
  const [tutorNames, setTutorNames] = useState<Record<string, string>>({});
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);
  const [recommended, setRecommended] = useState<ModuleType[]>([]);
  
  // Description dialog state
  const [descriptionDialog, setDescriptionDialog] = useState({
    isOpen: false,
    moduleId: '',
    moduleName: '',
    domain: '',
    fee: 0,
    description: '',
    loading: false
  });
  
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const enrollments = await getEnrollments();
        setCourses(enrollments || []); // Ensure we always have an array
      } catch (error: any) {
        console.error('Error fetching courses:', error);
        // Handle 401 gracefully for new students with no enrollments
        if (error.response?.status === 401) {
          console.log('No enrollments found for student (401) - this is normal for new students');
          setCourses([]); // Set empty array instead of showing error
          setError(null); // Don't show error message
        } else if (error.response?.status === 404) {
          console.log('No enrollments found for student (404) - this is normal for new students');
          setCourses([]);
          setError(null);
        } else {
          setError('Failed to load courses. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchCourses();
  }, [])

  // Fetch recommended modules from a random enrolled domain
  useEffect(() => {
    const run = async () => {
      if (!courses || courses.length === 0) {
        console.log('[Recommendations] No enrollments found; skipping recommendation fetch.');
        setRecommended([]);
        return;
      }
      setRecLoading(true);
      setRecError(null);
      try {
        const domains = Array.from(new Set(courses.map(c => c.domain).filter(Boolean)));
        if (domains.length === 0) {
          console.log('[Recommendations] No domains found in enrollments; skipping.');
          setRecommended([]);
          return;
        }
        const randomDomain = domains[Math.floor(Math.random() * domains.length)];
        console.log('[Recommendations] Selected domain:', randomDomain, 'from', domains);
        const rec = await api.modules.getRecommended(randomDomain);
        console.log('[Recommendations] API result:', rec);
        setRecommended(rec || []);
      } catch (e) {
        console.error('[Recommendations] Failed to load recommendations:', e);
        setRecError('Failed to load recommendations.');
        setRecommended([]);
      } finally {
        setRecLoading(false);
      }
    };
    run();
  }, [courses]);
  
  // Fetch tutor names for enrolled courses
  useEffect(() => {
    const fetchTutorNames = async () => {
      const uniqueTutorIds = Array.from(new Set(courses.map(c => c.tutorId).filter(Boolean)));
      if (uniqueTutorIds.length === 0) return;
      try {
        const entries = await Promise.all(uniqueTutorIds.map(async (id) => {
          try {
            const name = await TutorProfileApi.getTutorNameById(id);
            return [id, name] as const;
          } catch {
            return [id, 'Unknown Tutor'] as const;
          }
        }));
        setTutorNames(prev => ({ ...prev, ...Object.fromEntries(entries) }));
      } catch {
        // ignore batch error; individual fetches handled
      }
    };
    fetchTutorNames();
  }, [courses]);

  // Fetch tutor names for recommended modules as well
  useEffect(() => {
    const fetchTutorNamesForRecommended = async () => {
      const uniqueTutorIds = Array.from(new Set(recommended.map(c => c.tutorId).filter(Boolean))) as string[];
      const missing = uniqueTutorIds.filter((id) => !(id in tutorNames));
      if (missing.length === 0) return;
      try {
        const entries = await Promise.all(missing.map(async (id) => {
          try {
            const name = await TutorProfileApi.getTutorNameById(id);
            return [id, name] as const;
          } catch {
            return [id, 'Unknown Tutor'] as const;
          }
        }));
        setTutorNames(prev => ({ ...prev, ...Object.fromEntries(entries) }));
      } catch {
        // ignore batch error
      }
    };
    fetchTutorNamesForRecommended();
  }, [recommended, tutorNames]);
    useEffect(() => {
    const fetchUpcomingSessions = async () => {
      setSessionsLoading(true);
      setSessionsError(null);
      try {
        const { date, time } = getCurrentDateTime();
        const req: UpcomingSessionsRequest = {
          date,
          time,
        };
        const res = await upcomingSchedulesByStudent(req);
        setUpcomingSessions(Array.isArray(res) ? res : [res]);
      } catch (err) {
        setSessionsError('Failed to load upcoming sessions.');
      } finally {
        setSessionsLoading(false);
      }
    };
    fetchUpcomingSessions();
  }, []);
  const enrolledCourses = [
    {
      id: 1,
      title: 'Advanced Mathematics',
      tutor: 'Dr. Sarah Johnson',
      progress: 75,
      nextSession: '2024-01-15T10:00:00',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&h=200&fit=crop'
    },
    {
      id: 2,
      title: 'Physics Fundamentals',
      tutor: 'Prof. Michael Chen',
      progress: 60,
      nextSession: '2024-01-16T14:00:00',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=300&h=200&fit=crop'
    },
    {
      id: 3,
      title: 'Chemistry Lab Prep',
      tutor: 'Dr. Emily Davis',
      progress: 40,
      nextSession: '2024-01-17T16:00:00',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=300&h=200&fit=crop'
    }
  ]

  // recommended modules will be displayed from `recommended`

  const openDescription = async (moduleId: string, moduleName: string, domain: string, fee: number) => {
    setDescriptionDialog({
      isOpen: true,
      moduleId,
      moduleName,
      domain,
      fee,
      description: '',
      loading: true
    });

    try {
      const descriptionData = await ModuleDescriptionApi.getByModuleId(moduleId);
      const descriptionText = descriptionData?.descriptionPoints?.join('\n• ') || 'No description available for this module.';
      setDescriptionDialog(prev => ({
        ...prev,
        description: descriptionData?.descriptionPoints?.length ? `• ${descriptionText}` : 'No description available for this module.',
        loading: false
      }));
    } catch (error) {
      console.error('Error fetching description:', error);
      setDescriptionDialog(prev => ({
        ...prev,
        description: 'No description available for this module.',
        loading: false
      }));
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gray-800 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">👋 Welcome back, {displayName}!</h1>
            <p className="text-white/90 text-lg">Here&apos;s what&apos;s happening with your learning today.</p>
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
                    <p className="text-3xl font-bold text-gray-900">{courses.length}</p>
                    <p className="text-sm text-gray-500 font-medium">Enrolled Courses</p>
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
                <Video className="w-7 h-7 text-purple-600" />
              </div>
              <div>
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-12 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-gray-900">-</p>
                    <p className="text-sm text-gray-500 font-medium">Sessions Attended</p>
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
                <TrendingUp className="w-7 h-7 text-orange-600" />
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
                      {courses.length > 0 
                        ? Math.round(courses.reduce((total, course) => total + course.averageRatings, 0) / courses.length * 20) + '%'
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
        {/* Enrolled Courses */}
        <div className="xl:col-span-2">
          <Card className="border-none shadow-md">
            <CardHeader className="border-b bg-gray-50">
              <CardTitle className="text-xl text-gray-900">My Enrollments</CardTitle>
              <CardDescription className="text-gray-600">Continue learning with your current courses</CardDescription>
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
                              <div className="h-3 bg-gray-200 rounded w-24"></div>
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                                <div className="h-3 bg-gray-200 rounded w-8"></div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-3">
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
              ) : courses.length === 0 ? (
                // Empty state
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-10 h-10 text-[#FBBF24]" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Enrollments Yet</h3>
                  <p className="text-gray-500 mb-6">Start your learning journey by enrolling in courses.</p>
                  <Link href="/dashboard/courses">
                    <Button className="bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-semibold">Browse Courses</Button>
                  </Link>
                </div>
              ) : (
                // Actual courses
                courses.map((course) => (
                  <div key={course.moduleId} className="border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-[#FBBF24] transition-all bg-white">
                    <div className="flex items-start space-x-4">
                      <Image
                        src={course.domain ? getDomainImage(course.domain) : 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=200&fit=crop'}
                        alt={course.name}
                        width={150}
                        height={120}
                        className="w-48 h-36 rounded-lg object-cover shadow-sm"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{course.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">by {tutorNames[course.tutorId] || '...'}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Star className="w-4 h-4 text-[#FBBF24] fill-current" />
                              <span className="text-sm font-semibold text-gray-700">{course.averageRatings}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <Link href={`/dashboard/courses/${course.moduleId}`}>
                            <Button size="sm" className="bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-semibold">
                              Continue Learning
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
                      <h4 className="font-semibold text-sm text-gray-900">{session.course}</h4>
                      <p className="text-xs text-gray-600 mt-1">{session.tutor}</p>
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
                        <div key={session.schedule_id} className="border-l-4 border-green-500 pl-4 py-2">
                          <h4 className="font-medium text-sm">{session.course}</h4>
                          <p className="text-xs text-gray-500">{session.tutor}</p>
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

          {/* Recommended Courses (based on a random domain from your enrollments) */}
          <Card className="border-none shadow-md">
            <CardHeader className="border-b bg-gray-50">
              <CardTitle className="text-lg text-gray-900">Recommended Courses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-6">
              {recLoading ? (
                <div className="text-center py-4"><Loader2 className="animate-spin inline mr-2" />Loading...</div>
              ) : recError ? (
                <div className="text-red-500 text-center py-4">{recError}</div>
              ) : recommended.length === 0 ? (
                <div className="text-center py-4 text-gray-600">No recommendations yet.</div>
              ) : (
                recommended.filter((course) => !!course.moduleId).map((course) => (
                  <div key={course.moduleId} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-[#FBBF24] transition-all bg-white">
                    <div className="w-full h-28 relative mb-3">
                      <Image
                        src={getDomainImage(course.domain)}
                        alt={course.name}
                        fill
                        className="rounded-lg object-cover shadow-sm"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900">{course.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">by {(course.tutorId ? tutorNames[course.tutorId] : undefined) || '...'}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-[#FBBF24] fill-current" />
                        <span className="text-xs font-semibold text-gray-700">{course.averageRatings ?? '-'}</span>
                      </div>
                      <span className="text-sm font-bold text-[#FBBF24]">${course.fee}</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-gray-300 hover:bg-yellow-50 text-xs"
                        onClick={() => openDescription(course.moduleId, course.name, course.domain, course.fee)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        See Description
                      </Button>
                      <Link href={`/dashboard/courses/${course.moduleId}`} className="flex-1"> 
                        <Button size="sm" className="w-full bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-semibold text-xs">
                          Enroll Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Description Dialog */}
      <Dialog open={descriptionDialog.isOpen} onOpenChange={(open) => setDescriptionDialog(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] opacity-10 rounded-lg"></div>
              <div className="relative p-6 bg-gradient-to-r from-[#FBBF24]/5 to-[#F59E0B]/5 rounded-lg border border-[#FBBF24]/20">
                <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                  {descriptionDialog.moduleName}
                </DialogTitle>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center">
                    <span className="font-semibold text-[#FBBF24] mr-2">Domain:</span>
                    <span className="text-gray-700">{descriptionDialog.domain}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold text-[#FBBF24] mr-2">Price:</span>
                    <span className="text-gray-700 font-bold">${descriptionDialog.fee}</span>
                  </div>
                </div>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-1">
            <div className="bg-white rounded-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-[#FBBF24]" />
                Course Description
              </h3>
              
              {descriptionDialog.loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-[#FBBF24] mr-2" />
                  <span className="text-gray-600">Loading description...</span>
                </div>
              ) : (
                <div className="prose prose-gray max-w-none">
                  <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                    {descriptionDialog.description}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}