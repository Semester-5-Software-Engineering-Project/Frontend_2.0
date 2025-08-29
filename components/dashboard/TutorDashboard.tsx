'use client'

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
  Clock
} from 'lucide-react'
import Link from 'next/link'

export default function TutorDashboard() {
  const myCourses = [
    {
      id: 1,
      title: 'Advanced Mathematics',
      students: 24,
      rating: 4.8,
      revenue: 1200,
      status: 'active',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&h=200&fit=crop'
    },
    {
      id: 2,
      title: 'Calculus Fundamentals',
      students: 18,
      rating: 4.9,
      revenue: 900,
      status: 'active',
      image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=300&h=200&fit=crop'
    },
    {
      id: 3,
      title: 'Statistics & Probability',
      students: 12,
      rating: 4.7,
      revenue: 600,
      status: 'draft',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop'
    }
  ]

  const upcomingSessions = [
    {
      id: 1,
      student: 'Alex Smith',
      course: 'Advanced Mathematics',
      time: '2024-01-15T10:00:00',
      duration: 60,
      type: 'regular'
    },
    {
      id: 2,
      student: 'Emma Wilson',
      course: 'Calculus Fundamentals',
      time: '2024-01-15T14:00:00',
      duration: 90,
      type: 'premium'
    },
    {
      id: 3,
      student: 'John Davis',
      course: 'Advanced Mathematics',
      time: '2024-01-16T09:00:00',
      duration: 60,
      type: 'regular'
    }
  ]

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
      <div className="bg-gradient-to-r from-primary to-primary/90 rounded-xl p-6 text-primary-foreground">
        <h1 className="text-3xl font-bold mb-2">Tutor Dashboard</h1>
        <p className="text-primary-foreground/70">Manage your courses, students, and teaching schedule.</p>
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
                <p className="text-sm text-muted-foreground">Active Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">54</p>
                <p className="text-sm text-muted-foreground">Total Students</p>
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
                <p className="text-2xl font-bold">$2,700</p>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
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
                <p className="text-2xl font-bold">4.8</p>
                <p className="text-sm text-muted-foreground">Avg. Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* My Courses */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Courses</CardTitle>
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
              {myCourses.map((course) => (
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
                          <h3 className="font-semibold text-foreground">{course.title}</h3>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-muted-foreground">{course.students} students</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-muted-foreground">{course.rating}</span>
                            </div>
                          </div>
                        </div>
                        <Badge 
                          variant={course.status === 'active' ? 'default' : 'secondary'}
                          className={course.status === 'active' ? 'bg-primary/10 text-primary' : ''}
                        >
                          {course.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm font-semibold text-primary">
                          ${course.revenue} revenue
                        </span>
                        <Link href={`/dashboard/courses/${course.id}`}>
                          <Button size="sm" variant="outline">
                            Manage Course
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
              <CardTitle className="text-lg">Today's Sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="border-l-4 border-primary pl-4 py-2">
                  <h4 className="font-medium text-sm">{session.student}</h4>
                  <p className="text-xs text-gray-500">{session.course}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-600">
                      {new Date(session.time).toLocaleTimeString()}
                    </p>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${session.type === 'premium' ? 'border-purple-300 text-purple-600' : ''}`}
                    >
                      {session.duration}min
                    </Badge>
                  </div>
                  <Button size="sm" className="w-full mt-2 bg-primary hover:bg-primary/90">
                    <Video className="w-4 h-4 mr-2" />
                    Start Session
                  </Button>
                </div>
              ))}
              <Link href="/dashboard/schedule">
                <Button variant="outline" size="sm" className="w-full">
                  View All Sessions
                </Button>
              </Link>
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