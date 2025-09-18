'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BookOpen, Calendar, Video, Clock, Star, TrendingUp, Loader2 } from 'lucide-react'
import Link from 'next/link'
import axiosInstance from '@/app/utils/axiosInstance'

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
  const [courses, setCourses] = useState<ApiModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axiosInstance.get('/api/enrollment/get-enrollments');
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError('Failed to load courses. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchCourses();
  }, [])
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

  const recommendedCourses = [
    {
      id: 4,
      title: 'Computer Science Basics',
      tutor: 'Dr. James Wilson',
      price: 50,
      rating: 4.9,
      students: 156,
      image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=300&h=200&fit=crop'
    },
    {
      id: 5,
      title: 'English Literature',
      tutor: 'Prof. Lisa Anderson',
      price: 40,
      rating: 4.8,
      students: 89,
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop'
    }
  ]

  const upcomingSessions = [
    {
      id: 1,
      course: 'Advanced Mathematics',
      tutor: 'Dr. Sarah Johnson',
      time: '2024-01-15T10:00:00',
      duration: 60
    },
    {
      id: 2,
      course: 'Physics Fundamentals',
      tutor: 'Prof. Michael Chen',
      time: '2024-01-16T14:00:00',
      duration: 90
    }
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-primary/90 rounded-xl p-6 text-primary-foreground">
        <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
        <p className="text-primary-foreground/70">Continue your learning journey with personalized courses and expert tutors.</p>
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
                    <p className="text-2xl font-bold">{courses.length}</p>
                    <p className="text-sm text-muted-foreground">Enrolled Courses</p>
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
                <Video className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-8 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold">-</p>
                    <p className="text-sm text-muted-foreground">Sessions Attended</p>
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
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-8 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold">
                      {courses.length > 0 
                        ? Math.round(courses.reduce((total, course) => total + course.averageRatings, 0) / courses.length * 20) + '%'
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
        {/* Enrolled Courses */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>My Enrollments</CardTitle>
              <CardDescription>Continue learning with your current courses</CardDescription>
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
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Enrollments Yet</h3>
                  <p className="text-gray-500 mb-4">Start your learning journey by enrolling in courses.</p>
                  <Link href="/dashboard/courses">
                    <Button>Browse Courses</Button>
                  </Link>
                </div>
              ) : (
                // Actual courses
                courses.map((course) => (
                  <div key={course.moduleId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      <img 
                        src={course.domain ? getDomainImage(course.domain) : 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=200&fit=crop'} 
                        alt={course.name}
                        className="w-20 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground">{course.name}</h3>
                            <p className="text-sm text-muted-foreground">by {course.tutorId}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-muted-foreground">{course.averageRatings}</span>
                            </div>
                          </div>
                          {/* <Badge variant="secondary" className="bg-primary/10 text-primary">
                            {course.progress}% Complete
                          </Badge> */}
                        </div>
                        {/* <div className="mt-3">
                          <Progress value={course.progress} className="h-2" />
                        </div> */}
                        <div className="flex items-center justify-between mt-3">
                          {/* <p className="text-xs text-muted-foreground">
                            Next session: {new Date(course.nextSession).toLocaleDateString()}
                          </p> */}
                          <Link href={`/dashboard/courses/${course.moduleId}`}>
                            <Button size="sm" className="bg-primary hover:bg-primary/90">
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
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="border-l-4 border-green-500 pl-4 py-2">
                  <h4 className="font-medium text-sm">{session.course}</h4>
                  <p className="text-xs text-gray-500">{session.tutor}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-600">
                      {new Date(session.time).toLocaleDateString()} at{' '}
                      {new Date(session.time).toLocaleTimeString()}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {session.duration}min
                    </Badge>
                  </div>
                </div>
              ))}
              <Link href="/dashboard/schedule">
                <Button variant="outline" size="sm" className="w-full">
                  View All Sessions
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recommended Courses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recommended Courses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendedCourses.map((course) => (
                <div key={course.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                  <img 
                    src={course.image} 
                    alt={course.title}
                    className="w-full h-24 rounded-lg object-cover mb-3"
                  />
                  <h4 className="font-medium text-sm">{course.title}</h4>
                  <p className="text-xs text-muted-foreground">by {course.tutor}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-xs">{course.rating}</span>
                      <span className="text-xs text-gray-400">({course.students})</span>
                    </div>
                    <span className="text-sm font-semibold text-primary">${course.price}</span>
                  </div>
                  <Button size="sm" className="w-full mt-2 bg-primary hover:bg-primary/90">
                    Enroll Now
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}