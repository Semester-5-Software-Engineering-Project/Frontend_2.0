'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BookOpen, Calendar, Video, Clock, Star, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function StudentDashboard() {
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
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
        <p className="text-green-100">Continue your learning journey with personalized courses and expert tutors.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-gray-500">Enrolled Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">24</p>
                <p className="text-sm text-gray-500">Hours Completed</p>
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
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-gray-500">Sessions Attended</p>
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
                <p className="text-2xl font-bold">85%</p>
                <p className="text-sm text-gray-500">Avg. Progress</p>
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
              {enrolledCourses.map((course) => (
                <div key={course.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    <img 
                      src={course.image} 
                      alt={course.title}
                      className="w-20 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{course.title}</h3>
                          <p className="text-sm text-gray-500">by {course.tutor}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">{course.rating}</span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          {course.progress}% Complete
                        </Badge>
                      </div>
                      <div className="mt-3">
                        <Progress value={course.progress} className="h-2" />
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-xs text-gray-500">
                          Next session: {new Date(course.nextSession).toLocaleDateString()}
                        </p>
                        <Link href={`/dashboard/courses/${course.id}`}>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Continue Learning
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
                  <p className="text-xs text-gray-500">by {course.tutor}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-xs">{course.rating}</span>
                      <span className="text-xs text-gray-400">({course.students})</span>
                    </div>
                    <span className="text-sm font-semibold text-green-600">${course.price}</span>
                  </div>
                  <Button size="sm" className="w-full mt-2 bg-green-600 hover:bg-green-700">
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