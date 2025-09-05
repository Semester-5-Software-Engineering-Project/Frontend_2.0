'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { 
  BookOpen, 
  Users, 
  Star, 
  Clock, 
  Calendar,
  Video,
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  Play,
  Download,
  MoreHorizontal
} from 'lucide-react'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

// TypeScript interfaces for course types
interface EnrolledCourse {
  id: number
  title: string
  tutor: string
  progress: number
  nextSession: string | null
  rating: number
  students: number
  duration: string
  status: string
  image: string
  description: string
}

interface TeachingCourse {
  id: number
  title: string
  students: number
  rating: number
  revenue: number
  status: string
  duration: string
  image: string
  description: string
}

type Course = EnrolledCourse | TeachingCourse

export default function CoursesPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Mock data for enrolled courses (students)
  const enrolledCourses = [
    {
      id: 1,
      title: 'Advanced Mathematics',
      tutor: 'Dr. Sarah Johnson',
      progress: 75,
      nextSession: '2024-01-15T10:00:00',
      rating: 4.8,
      students: 24,
      duration: '12 weeks',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&h=200&fit=crop',
      description: 'Master advanced mathematical concepts including calculus, linear algebra, and differential equations.'
    },
    {
      id: 2,
      title: 'Physics Fundamentals',
      tutor: 'Prof. Michael Chen',
      progress: 60,
      nextSession: '2024-01-16T14:00:00',
      rating: 4.9,
      students: 18,
      duration: '10 weeks',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=300&h=200&fit=crop',
      description: 'Learn the fundamental principles of physics through interactive experiments and real-world applications.'
    },
    {
      id: 3,
      title: 'Chemistry Lab Prep',
      tutor: 'Dr. Emily Davis',
      progress: 40,
      nextSession: '2024-01-17T16:00:00',
      rating: 4.7,
      students: 15,
      duration: '8 weeks',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=300&h=200&fit=crop',
      description: 'Prepare for laboratory work with hands-on chemistry experiments and safety protocols.'
    },
    {
      id: 4,
      title: 'Computer Science Basics',
      tutor: 'Dr. James Wilson',
      progress: 90,
      nextSession: null,
      rating: 4.9,
      students: 156,
      duration: '6 weeks',
      status: 'completed',
      image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=300&h=200&fit=crop',
      description: 'Introduction to programming concepts, algorithms, and software development fundamentals.'
    }
  ]

  // Mock data for teaching courses (tutors)
  const teachingCourses = [
    {
      id: 1,
      title: 'Advanced Mathematics',
      students: 24,
      rating: 4.8,
      revenue: 1200,
      status: 'active',
      duration: '12 weeks',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&h=200&fit=crop',
      description: 'Master advanced mathematical concepts including calculus, linear algebra, and differential equations.'
    },
    {
      id: 2,
      title: 'Calculus Fundamentals',
      students: 18,
      rating: 4.9,
      revenue: 900,
      status: 'active',
      duration: '10 weeks',
      image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=300&h=200&fit=crop',
      description: 'Comprehensive introduction to calculus concepts with practical applications and problem-solving techniques.'
    },
    {
      id: 3,
      title: 'Statistics & Probability',
      students: 12,
      rating: 4.7,
      revenue: 600,
      status: 'draft',
      duration: '8 weeks',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop',
      description: 'Learn statistical analysis, probability theory, and data interpretation methods.'
    },
    {
      id: 4,
      title: 'Linear Algebra',
      students: 8,
      rating: 4.6,
      revenue: 400,
      status: 'active',
      duration: '6 weeks',
      image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=300&h=200&fit=crop',
      description: 'Explore vector spaces, matrices, eigenvalues, and their applications in various fields.'
    }
  ]

  const courses = user?.role === 'STUDENT' ? enrolledCourses : teachingCourses

  // Type guard functions
  const isEnrolledCourse = (course: Course): course is EnrolledCourse => {
    return 'tutor' in course && 'progress' in course && 'nextSession' in course
  }

  const isTeachingCourse = (course: Course): course is TeachingCourse => {
    return 'revenue' in course && !('tutor' in course)
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (isEnrolledCourse(course) ? course.tutor.toLowerCase().includes(searchTerm.toLowerCase()) : false)
    const matchesFilter = filterStatus === 'all' || course.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-primary/10 text-primary'
      case 'completed':
        return 'bg-muted text-foreground'
      case 'draft':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {user?.role === 'STUDENT' ? 'My Courses' : 'Teaching Courses'}
            </h1>
            <p className="text-muted-foreground">
              {user?.role === 'STUDENT' 
                ? 'Track your learning progress and manage your enrollments'
                : 'Manage your courses, materials, and student progress'
              }
            </p>
          </div>
          {user?.role === 'TUTOR' && (
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create New Course
            </Button>
          )}
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
                  <p className="text-2xl font-bold">{courses.length}</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.role === 'STUDENT' ? 'Enrolled Courses' : 'Active Courses'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {user?.role === 'student' ? '24' : '156'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {user?.role === 'STUDENT' ? 'Hours Completed' : 'Total Students'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">4.8</p>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {user?.role === 'student' ? '3' : '12'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {user?.role === 'STUDENT' ? 'Upcoming Sessions' : 'This Week'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('all')}
                  size="sm"
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === 'active' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('active')}
                  size="sm"
                >
                  Active
                </Button>
                {user?.role === 'STUDENT' && (
                  <Button
                    variant={filterStatus === 'completed' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('completed')}
                    size="sm"
                  >
                    Completed
                  </Button>
                )}
                {user?.role === 'TUTOR' && (
                  <Button
                    variant={filterStatus === 'draft' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('draft')}
                    size="sm"
                  >
                    Draft
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <div className="relative">
                <img 
                  src={course.image} 
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <Badge 
                  className={`absolute top-4 right-4 ${getStatusColor(course.status)}`}
                >
                  {course.status}
                </Badge>
                                 {user?.role === 'student' && isEnrolledCourse(course) && course.progress && (
                   <div className="absolute bottom-4 left-4 right-4">
                     <Progress value={course.progress} className="h-2" />
                     <p className="text-xs text-white mt-1">{course.progress}% Complete</p>
                   </div>
                 )}
              </div>
              
              <CardContent className="p-6">
                <div className="space-y-4">
                                     <div>
                     <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
                     <p className="text-sm text-gray-600 mb-2">{course.description}</p>
                     <p className="text-sm text-gray-500">
                       {isEnrolledCourse(course) ? `by ${course.tutor}` : `${course.students} students enrolled`}
                     </p>
                   </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span>{course.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{course.students}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration}</span>
                    </div>
                  </div>

                                     {user?.role === 'tutor' && isTeachingCourse(course) && (
                     <div className="text-sm font-semibold text-green-600">
                       ${course.revenue} revenue
                     </div>
                   )}

                  <div className="flex gap-2">
                    <Link href={`/dashboard/courses/${course.id}`} className="flex-1">
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        {user?.role === 'student' ? 'Continue Learning' : 'Manage Course'}
                      </Button>
                    </Link>
                    {user?.role === 'tutor' && (
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                                     {user?.role === 'student' && isEnrolledCourse(course) && course.nextSession && (
                     <div className="text-xs text-gray-500 text-center">
                       Next session: {new Date(course.nextSession).toLocaleDateString()}
                     </div>
                   )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No courses found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : user?.role === 'student'
                    ? 'You haven\'t enrolled in any courses yet'
                    : 'You haven\'t created any courses yet'
                }
              </p>
              {user?.role === 'tutor' && (
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Course
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
} 