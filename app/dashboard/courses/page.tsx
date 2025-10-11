'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
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
  MoreHorizontal,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import ModuleCreation from '@/components/ui/modulecreation'
import { getModulesForTutor, getEnrollments } from '@/services/api'
import { useToast } from '@/hooks/use-toast'

// TypeScript interfaces for API response
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

// Frontend interfaces for display
interface EnrolledCourse {
  id: string
  title: string
  tutor: string
  domain: string
  rating: number
  fee: number
  duration: number // Duration in minutes
  status: string
  image: string
}

interface TeachingCourse {
  id: string
  title: string
  domain: string
  rating: number
  fee: number
  duration: number // Duration in minutes
  status: string
  image: string
}

type Course = EnrolledCourse | TeachingCourse

export default function CoursesPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isModuleCreationOpen, setIsModuleCreationOpen] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Helper function to format duration from minutes to readable format
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`
    }
    
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    
    if (remainingMinutes === 0) {
      return `${hours}h`
    }
    return `${hours}h ${remainingMinutes}m`
  }

  // Helper function to get domain-based image
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

  // Convert API module to frontend course
  const convertApiModuleToCourse = (apiModule: ApiModule): Course => {
    const baseData = {
      id: apiModule.moduleId,
      title: apiModule.name,
      domain: apiModule.domain,
      rating: apiModule.averageRatings || 0,
      fee: apiModule.fee,
      duration: apiModule.duration, // Keep as integer (minutes)
      status: apiModule.status.toLowerCase(),
      image: getDomainImage(apiModule.domain),
    }

    if (user?.role === 'STUDENT') {
      return {
        ...baseData,
        tutor: 'Loading...', // We'll need to fetch tutor info separately if needed
      } as EnrolledCourse
    } else {
      return {
        ...baseData,
      } as TeachingCourse
    }
  }

  // Fetch modules for tutors
  const fetchTutorModules = async (): Promise<Course[]> => {
    try {
      const apiModules = await getModulesForTutor()
      // console.log('Tutor modules API response:', apiModules)
      return (apiModules as ApiModule[]).map(convertApiModuleToCourse)
    } catch (error: any) {
      console.error('Error fetching tutor modules:', error)
      throw new Error(error.response?.data || 'Failed to fetch tutor modules')
    }
  }

  // Fetch enrollments for students
  const fetchStudentEnrollments = async (): Promise<Course[]> => {
    try {
      console.log('Fetching student enrollments...')
      const enrollments = await getEnrollments()
      console.log('Enrollment API response:', enrollments)
      
      // Handle different possible response structures
      let apiModules: ApiModule[] = []
      
      if (Array.isArray(enrollments)) {
        // Extract modules from enrollments with flexible structure handling
        apiModules = enrollments
          .map((enrollment: any) => {
            // Try different possible structures
            return enrollment.module || enrollment
          })
          .filter(Boolean) // Remove any null/undefined values
        
        console.log('Extracted modules from enrollments:', apiModules)
      } else {
        console.error('Unexpected enrollment response format:', enrollments)
        throw new Error('Invalid enrollment data format received from server')
      }
      
      if (apiModules.length === 0) {
        console.log('No modules found in enrollments')
        return []
      }
      
      return apiModules.map(convertApiModuleToCourse)
    } catch (error: any) {
      console.error('Error fetching student enrollments:', error)
      // Handle 401/404 gracefully for new students with no enrollments
      if (error.response?.status === 401 || error.response?.status === 404) {
        console.log('No enrollments found for student - this is normal for new students')
        return [] // Return empty array instead of throwing error
      }
      throw new Error(error.response?.data || 'Failed to fetch enrollments')
    }
  }

  // Debug function to test enrollment API (for development)
  const debugEnrollmentAPI = async () => {
    try {
      console.log('=== DEBUGGING ENROLLMENT API ===')
      const enrollments = await getEnrollments()
      console.log('Raw API response:', enrollments)
      console.log('Response data type:', typeof enrollments)
      console.log('Is array:', Array.isArray(enrollments))
      console.log('Raw response data:', JSON.stringify(enrollments, null, 2))
      
      if (Array.isArray(enrollments)) {
        console.log('Array length:', enrollments.length)
        enrollments.forEach((item: any, index: number) => {
          console.log(`Item ${index}:`, JSON.stringify(item, null, 2))
          console.log(`Item ${index} keys:`, Object.keys(item))
        })
      }
      
      toast({
        title: "Debug Complete",
        description: "Check console for enrollment API debug info",
      })
    } catch (error: any) {
      console.error('Debug enrollment API error:', error)
      toast({
        title: "Debug Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  // Fetch courses based on user role
  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) return

      setLoading(true)
      setError(null)

      try {
        let fetchedCourses: Course[]
        if (user.role === 'TUTOR') {
          fetchedCourses = await fetchTutorModules()
        } else {
          fetchedCourses = await fetchStudentEnrollments()
        }
        
        setCourses(fetchedCourses)
        console.log('Fetched courses:', fetchedCourses)
      } catch (err: any) {
        setError(err.message)
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        })
        setCourses([]) // Set empty array on error
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [user, toast])

  // Type guard functions
  const isEnrolledCourse = (course: Course): course is EnrolledCourse => {
    return 'tutor' in course
  }

  const isTeachingCourse = (course: Course): course is TeachingCourse => {
    return !('tutor' in course)
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (isEnrolledCourse(course) ? course.tutor.toLowerCase().includes(searchTerm.toLowerCase()) : false)
    const matchesFilter = filterStatus === 'all' || course.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-300 font-semibold'
      case 'completed':
        return 'bg-blue-100 text-blue-700 border-blue-300 font-semibold'
      case 'draft':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300 font-semibold'
      case 'inactive':
        return 'bg-gray-100 text-gray-700 border-gray-300 font-semibold'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300 font-semibold'
    }
  }

  const handleModuleCreationSuccess = (module: any) => {
    console.log('Module created successfully:', module)
    // Don't close the dialog immediately - let the user choose via the success popup
    // setIsModuleCreationOpen(false)
    // You can add logic here to refresh the courses list or show a success message
  }

  const handleModuleCreationCancel = () => {
    setIsModuleCreationOpen(false)
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user?.role === 'STUDENT' ? 'My Modules' : 'Teaching Modules'}
              </h1>
              <p className="text-gray-600 mt-1">
                {user?.role === 'STUDENT' 
                  ? 'Track your learning progress and manage your enrollments'
                  : 'Manage your modules, materials, and student progress'
                }
              </p>
            </div>
            {user?.role === 'TUTOR' && (
              <Dialog open={isModuleCreationOpen} onOpenChange={setIsModuleCreationOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-semibold">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Module
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Create New Course Module</DialogTitle>
                  </DialogHeader>
                  <ModuleCreation 
                    onSuccess={handleModuleCreationSuccess}
                    onCancel={handleModuleCreationCancel}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{loading ? '...' : courses.length}</p>
                  <p className="text-sm text-gray-500 font-medium">
                    {user?.role === 'STUDENT' ? 'Enrolled Modules' : 'Created Modules'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center">
                  <Clock className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {loading ? '...' : courses.filter(c => c.status === 'active').length}
                  </p>
                  <p className="text-sm text-gray-500 font-medium">
                    Active Modules
                  </p>
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
                  <p className="text-3xl font-bold text-gray-900">
                    {loading ? '...' : courses.length > 0 
                      ? (courses.reduce((sum, c) => sum + c.rating, 0) / courses.length).toFixed(1)
                      : '0.0'
                    }
                  </p>
                  <p className="text-sm text-gray-500 font-medium">Average Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Calendar className="w-7 h-7 text-purple-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {loading ? '...' : user?.role === 'TUTOR' 
                      ? `$${courses.reduce((sum, c) => sum + c.fee, 0).toFixed(0)}`
                      : courses.length
                    }
                  </p>
                  <p className="text-sm text-gray-500 font-medium">
                    {user?.role === 'STUDENT' ? 'Total Modules' : 'Total Fees'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search modules by name, domain, or tutor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('all')}
                  size="sm"
                  className={filterStatus === 'all' ? 'bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-semibold' : 'border-gray-300 hover:bg-yellow-50'}
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === 'active' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('active')}
                  size="sm"
                  className={filterStatus === 'active' ? 'bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-semibold' : 'border-gray-300 hover:bg-yellow-50'}
                >
                  Active
                </Button>
                {user?.role === 'STUDENT' && (
                  <Button
                    variant={filterStatus === 'completed' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('completed')}
                    size="sm"
                    className={filterStatus === 'completed' ? 'bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-semibold' : 'border-gray-300 hover:bg-yellow-50'}
                  >
                    Completed
                  </Button>
                )}
                {user?.role === 'TUTOR' && (
                  <Button
                    variant={filterStatus === 'draft' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('draft')}
                    size="sm"
                    className={filterStatus === 'draft' ? 'bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-semibold' : 'border-gray-300 hover:bg-yellow-50'}
                  >
                    Draft
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card className="border-none shadow-md">
            <CardContent className="p-16 text-center">
              <Loader2 className="w-16 h-16 text-[#FBBF24] mx-auto mb-4 animate-spin" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Loading modules...</h3>
              <p className="text-gray-600">Please wait while we fetch your data</p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="border-none shadow-md border-red-200">
            <CardContent className="p-16 text-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-red-600">Error loading modules</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Courses Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="border-none shadow-md hover:shadow-xl hover:border-[#FBBF24] transition-all overflow-hidden group">
                <div className="relative overflow-hidden">
                  <img 
                    src={course.image} 
                    alt={course.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <Badge 
                    className={`absolute top-4 right-4 ${getStatusColor(course.status)} shadow-md`}
                  >
                    {course.status}
                  </Badge>
                </div>
                
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-lg mb-2 text-gray-900 line-clamp-1">{course.title}</h3>
                      <Badge variant="outline" className="text-xs mb-2 border-blue-300 text-blue-700 bg-blue-50">
                        {course.domain}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-2">
                        {isEnrolledCourse(course) ? `by ${course.tutor}` : `Fee: $${course.fee}`}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-[#FBBF24] fill-current" />
                        <span className="text-sm font-semibold text-gray-700">{course.rating || 'No rating'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-lg font-bold text-[#FBBF24]">${course.fee}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Link href={`/dashboard/courses/${course.id}`} className="flex-1">
                        <Button className="w-full bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-semibold">
                          {user?.role === 'STUDENT' ? 'Continue Learning' : 'Manage Module'}
                        </Button>
                      </Link>
                      {user?.role === 'TUTOR' && (
                        <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && !error && filteredCourses.length === 0 && (
          <Card className="border-none shadow-md">
            <CardContent className="p-16 text-center">
              <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-10 h-10 text-[#FBBF24]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No modules found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : user?.role === 'STUDENT'
                    ? 'You haven&apos;t enrolled in any courses yet'
                    : 'You haven&apos;t created any courses yet'
                }
              </p>
              {user?.role === 'TUTOR' && (
                <Button 
                  className="bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-semibold"
                  onClick={() => setIsModuleCreationOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Module
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}