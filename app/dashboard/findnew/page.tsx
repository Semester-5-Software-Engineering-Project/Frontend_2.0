'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Clock, DollarSign, BookOpen, Star, Eye, ArrowLeft, UserPlus, Loader2 } from 'lucide-react'
import { ModuleApi, ModuleDto } from '@/apis/ModuleApi'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { enrollInModule } from '@/services/api'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import axiosInstance from '@/app/utils/axiosInstance'

export default function FindNewModulesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [modules, setModules] = useState<ModuleDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enrollingModules, setEnrollingModules] = useState<Set<string>>(new Set())
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Function to search modules
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setModules([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const results = await ModuleApi.searchModules(query)
      setModules(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search modules')
      setModules([])
    } finally {
      setLoading(false)
    }
  }

  // Handle search input change with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery)
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Format duration from minutes to readable format
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  // Format fee to currency
  const formatFee = (fee: number) => {
    return `$${fee.toFixed(2)}`
  }

  // Handle view course
  const handleViewCourse = (moduleId: string) => {
    router.push(`/dashboard/courses/${moduleId}`)
  }

  // Handle enrollment
  const handleEnrollment = async (moduleId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to enroll in modules",
        variant: "destructive",
      })
      return
    }

    setEnrollingModules(prev => new Set(prev).add(moduleId))

    try {
      // Make enrollment request using cookies for authentication

      const response = await axiosInstance.post(
        '/api/enrollment/enroll',
        { moduleId },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      )
      router.push(`/dashboard/courses/${moduleId}`)

      toast({
        title: "Enrollment Successful!",
        description: `You have successfully enrolled in the module.`,
      })

      // Remove the module from the search results since the student is now enrolled
      setModules(prev => prev.filter(module => getModuleId(module) !== moduleId))
      
    } catch (error: any) {
      console.error('Enrollment error:', error)
      
      let errorMessage = 'Failed to enroll in the module. Please try again.'
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data?.message || 'You may already be enrolled in this module.'
        } else if (error.response.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.'
        } else if (error.response.status === 403) {
          errorMessage = 'You do not have permission to enroll in this module.'
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message
        }
      }
      
      toast({
        title: "Enrollment Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setEnrollingModules(prev => {
        const newSet = new Set(prev)
        newSet.delete(moduleId)
        return newSet
      })
    }
  }

  // Get module ID (handle both moduleId and id fields)
  const getModuleId = (module: ModuleDto) => {
    return module.moduleId || module.id || ''
  }

  // Render star rating
  const renderStarRating = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400/50 text-yellow-400" />)
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-gray-300" />)
      }
    }

    return (
      <div className="flex items-center space-x-1">
        {stars}
        <span className="text-sm text-muted-foreground ml-1">({rating.toFixed(1)})</span>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Find New Modules</h1>
            <p className="text-gray-600">
              Discover and explore available learning modules to enhance your skills
            </p>
          </div>
          <Button
            onClick={() => router.push('/dashboard')}
            className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold border border-gray-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-2xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Search modules by name, domain, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 py-3 text-lg border-gray-200 focus:ring-[#FBBF24] focus:border-[#FBBF24] rounded-xl shadow-sm"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FBBF24]"></div>
          <span className="ml-3 text-gray-600 font-medium">Searching modules...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 shadow-sm">
          <p className="text-red-800 font-semibold">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && searchQuery && modules.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-md border border-gray-200">
          <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No modules found</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Try adjusting your search terms or browse different categories. Make sure to check your spelling.
          </p>
        </div>
      )}

      {/* Search Results */}
      {!loading && modules.length > 0 && (
        <div>
          <div className="mb-6">
            <p className="text-gray-600 text-lg">
              Found <span className="font-bold text-gray-900">{modules.length}</span> module{modules.length !== 1 ? 's' : ''} matching &ldquo;{searchQuery}&rdquo;
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => (
              <Card key={getModuleId(module)} className="border-none shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <Badge 
                      className={`${
                        module.status === 'Active' 
                          ? 'bg-green-100 text-green-700 border-green-200' 
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      } font-semibold`}
                    >
                      {module.status}
                    </Badge>
                  </div>
                  
                  <CardTitle className="text-xl font-bold text-gray-900 leading-tight">
                    {module.name}
                  </CardTitle>
                  
                  <CardDescription className="text-base text-[#FBBF24] font-semibold">
                    {module.domain}
                  </CardDescription>

                  {/* Rating */}
                  {module.averageRatings !== undefined && (
                    <div className="mt-2">
                      {renderStarRating(module.averageRatings)}
                    </div>
                  )}
                </CardHeader>

                <CardContent className="pt-4">
                  <div className="space-y-4">
                    {/* Module Description */}
                    {module.status && (
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {module.status}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 mr-2 text-[#FBBF24]" />
                        <span className="font-bold text-lg text-[#FBBF24]">{formatFee(module.fee)}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-gray-500" />
                        <span className="font-semibold text-gray-600">{formatDuration(module.duration)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-4 border-t border-gray-100">
                  {user?.role === 'STUDENT' ? (
                    <Button 
                      className="w-full font-semibold py-2 px-4 rounded-xl bg-[#FBBF24] hover:bg-[#F59E0B] text-black shadow-md transition-all"
                      disabled={module.status !== 'Active' || enrollingModules.has(getModuleId(module))}
                      onClick={() => handleEnrollment(getModuleId(module))}
                    >
                      {enrollingModules.has(getModuleId(module)) ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Enrolling...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          {module.status === 'Active' ? 'Enroll Now' : 'Coming Soon'}
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      className="w-full font-semibold py-2 px-4 rounded-xl bg-[#FBBF24] hover:bg-[#F59E0B] text-black shadow-md transition-all"
                      disabled={module.status !== 'Active'}
                      onClick={() => handleViewCourse(getModuleId(module))}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {module.status === 'Active' ? 'View Course' : 'Coming Soon'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Initial State */}
      {!loading && !searchQuery && (
        <div className="text-center py-16 bg-white rounded-xl shadow-md border border-gray-200">
          <div className="bg-[#FBBF24]/10 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <Search className="h-12 w-12 text-[#FBBF24]" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Start Your Learning Journey</h3>
          <p className="text-gray-600 max-w-md mx-auto text-lg leading-relaxed">
            Enter keywords, module names, or domains to discover amazing learning content crafted by expert instructors
          </p>
        </div>
      )}
      </div>
    </DashboardLayout>
  )
}