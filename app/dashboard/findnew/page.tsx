'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Clock, DollarSign, BookOpen, Star, Eye, ArrowLeft, UserPlus, Loader2 } from 'lucide-react'
import { ModuleApi, ModuleDto } from '@/apis/ModuleApi'
import { TutorProfileApi } from '@/apis/TutorProfile'
import ModuleDescriptionApi, { ModuleDescriptionDto } from '@/apis/ModuleDescriptionApi'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { enrollInModule } from '@/services/api'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import axiosInstance from '@/app/utils/axiosInstance'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Image from 'next/image'

export default function FindNewModulesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [modules, setModules] = useState<ModuleDto[]>([])
  const [recommended, setRecommended] = useState<ModuleDto[]>([])
  const [tutorNames, setTutorNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [recLoading, setRecLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recError, setRecError] = useState<string | null>(null)
  const [enrollingModules, setEnrollingModules] = useState<Set<string>>(new Set())
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  
  // Description dialog state
  const [descOpen, setDescOpen] = useState(false)
  const [descLoading, setDescLoading] = useState(false)
  const [descError, setDescError] = useState<string | null>(null)
  const [descPoints, setDescPoints] = useState<string[]>([])
  const [descTitle, setDescTitle] = useState<string>('Module Description')
  const [descTutor, setDescTutor] = useState<string>('')
  const [descDomain, setDescDomain] = useState<string>('')
  const [descPrice, setDescPrice] = useState<number>(0)

  // Auto-scroll carousel every 3 seconds
  useEffect(() => {
    if (!carouselApi) return

    const interval = setInterval(() => {
      carouselApi.scrollNext()
    }, 3000)

    return () => clearInterval(interval)
  }, [carouselApi])

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

  // Fetch random recommended modules when no search query
  useEffect(() => {
    const loadRecommended = async () => {
      if (searchQuery.trim()) return; // don't show recommendations while searching
      setRecLoading(true)
      setRecError(null)
      try {
        const res = await ModuleApi.getRandomRecommendedModules()
        setRecommended(Array.isArray(res) ? res : [])
      } catch (e: any) {
        console.error('Failed to load recommendations:', e)
        setRecError(e?.message || 'Failed to load recommendations')
        setRecommended([])
      } finally {
        setRecLoading(false)
      }
    }
    loadRecommended()
  }, [searchQuery])

  // Fetch tutor names for recommended modules
  useEffect(() => {
    if (!recommended || recommended.length === 0) return
    const ids = Array.from(new Set(recommended.map((m) => m.tutorId).filter(Boolean))) as string[]
    const missing = ids.filter((id) => !(id in tutorNames))
    if (missing.length === 0) return
    Promise.all(
      missing.map(async (id) => {
        try {
          const name = await TutorProfileApi.getTutorNameById(id)
          return [id, name] as const
        } catch {
          return [id, 'Unknown Tutor'] as const
        }
      })
    ).then((entries) => {
      setTutorNames((prev) => ({ ...prev, ...Object.fromEntries(entries) }))
    })
  }, [recommended, tutorNames])

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
    return `Rs. ${fee.toFixed(2)}`
  }

  // Handle view course
  const handleViewCourse = (moduleId: string) => {
    router.push(`/dashboard/courses/${moduleId}`)
  }

  // Open description dialog and fetch points
  const openDescription = async (moduleId: string, title: string, domain: string, price: number) => {
    setDescTitle(title)
    setDescDomain(domain)
    setDescPrice(price)
    setDescOpen(true)
    setDescLoading(true)
    setDescError(null)
    setDescPoints([])
    try {
      const exists = await ModuleDescriptionApi.exists(moduleId)
      if (!exists) {
        setDescPoints([])
        return
      }
      const dto: ModuleDescriptionDto = await ModuleDescriptionApi.getByModuleId(moduleId)
      setDescPoints(dto.descriptionPoints || [])
      setDescTutor(dto.tutorName || '')
    } catch (e: any) {
      setDescError(e.message || 'Failed to load description')
    } finally {
      setDescLoading(false)
    }
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {modules.map((module) => (
              <Card key={getModuleId(module)} className="border border-gray-200 shadow-sm hover:shadow-lg transition-all overflow-hidden group h-full bg-white rounded-lg">
                <div className="relative overflow-hidden">
                  <div className="relative h-48">
                    <Image
                      src={getDomainImage(module.domain)}
                      alt={module.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      priority={false}
                    />
                  </div>
                  <Badge 
                    className={`absolute top-3 right-3 ${module.status === 'Active' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'} border-0 shadow-md`}
                  >
                    {module.status}
                  </Badge>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-2 text-gray-900 line-clamp-2 min-h-[3.5rem]">{module.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {module.domain}
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    {(module.tutorId && tutorNames[module.tutorId]) || 'Loading tutor...'}
                  </p>
                  
                  {/* Rating */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm text-gray-700">{module.averageRatings?.toFixed(1) ?? 'N/A'}</span>
                    </div>
                    <span className="text-lg font-bold text-[#FBBF24]">Rs. {module.fee}</span>
                  </div>

                  <div className="flex items-center text-gray-500 mb-4">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="text-sm">{formatDuration(module.duration)}</span>
                  </div>

                  <div className="flex gap-2 w-full">
                    <Button
                      variant="outline"
                      className="flex-1 border-gray-300 hover:bg-yellow-50 text-sm py-2"
                      onClick={() => openDescription(getModuleId(module), module.name, module.domain, module.fee)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      See Description
                    </Button>
                    {user?.role === 'STUDENT' ? (
                      <Button
                        className="flex-1 bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-medium text-sm py-2"
                        disabled={module.status !== 'Active' || enrollingModules.has(getModuleId(module))}
                        onClick={() => handleEnrollment(getModuleId(module))}
                      >
                        {enrollingModules.has(getModuleId(module)) ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            Enrolling...
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-1" />
                            {module.status === 'Active' ? 'Enroll' : 'Soon'}
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        className="flex-1 bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-medium text-sm py-2"
                        disabled={module.status !== 'Active'}
                        onClick={() => handleViewCourse(getModuleId(module))}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {module.status === 'Active' ? 'View' : 'Soon'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations carousel (only when not searching) */}
      {!loading && !searchQuery && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Recommended for you</h2>
          </div>
          {recLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-6 w-6 mr-2 animate-spin" />
              <span className="text-gray-600">Loading recommendations...</span>
            </div>
          ) : recError ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 shadow-sm text-yellow-800">
              {recError}
            </div>
          ) : recommended.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-md border border-gray-200">
              <div className="bg-[#FBBF24]/10 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Search className="h-12 w-12 text-[#FBBF24]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No recommendations yet</h3>
              <p className="text-gray-600 max-w-md mx-auto text-lg leading-relaxed">
                Enroll in modules to help us personalize your recommendations.
              </p>
            </div>
          ) : (
            <div className="relative px-12 py-4">
              <Carousel 
                className="w-full"
                setApi={setCarouselApi}
                opts={{ 
                  align: 'start', 
                  loop: true,
                }}
              >
                <CarouselContent className="-ml-4">
                  {recommended.map((module) => (
                    <CarouselItem key={getModuleId(module)} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 xl:basis-1/4">
                      <div className="p-2">
                        <Card className="border border-gray-200 shadow-sm hover:shadow-lg transition-all overflow-hidden group h-full bg-white rounded-lg">
                          <div className="relative overflow-hidden">
                            <div className="relative h-32">
                              <Image
                                src={getDomainImage(module.domain)}
                                alt={module.name}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                priority={false}
                              />
                            </div>
                            <Badge 
                              className={`absolute top-2 right-2 text-xs ${module.status === 'Active' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'} border-0`}
                            >
                              {module.status}
                            </Badge>
                          </div>
                          <CardContent className="p-3">
                            <h3 className="font-semibold text-sm mb-1 text-gray-900 line-clamp-2 min-h-[2.5rem]">{module.name}</h3>
                            <p className="text-xs text-gray-500 mb-2">
                              {module.domain}
                            </p>
                            <p className="text-xs text-gray-600 mb-2">
                              {(module.tutorId && tutorNames[module.tutorId]) || '...'}
                            </p>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                <span className="text-xs text-gray-700">{module.averageRatings?.toFixed(1) ?? 'N/A'}</span>
                              </div>
                              <span className="text-sm font-bold text-[#FBBF24]">Rs. {module.fee}</span>
                            </div>
                            <div className="flex gap-1 w-full">
                              <Button
                                variant="outline"
                                className="flex-1 border-gray-300 hover:bg-yellow-50 text-xs py-1.5 h-8 px-2"
                                onClick={() => openDescription(getModuleId(module), module.name, module.domain, module.fee)}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button
                                className="flex-[2] bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-medium text-xs py-1.5 h-8"
                                disabled={module.status !== 'Active' || enrollingModules.has(getModuleId(module))}
                                onClick={() => handleEnrollment(getModuleId(module))}
                              >
                                {enrollingModules.has(getModuleId(module)) ? (
                                  <>
                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                    Enrolling...
                                  </>
                                ) : (
                                  module.status === 'Active' ? 'Enroll Now' : 'Coming Soon'
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-0 bg-white/90 backdrop-blur border border-gray-300 hover:bg-white shadow-md" />
                <CarouselNext className="right-0 bg-white/90 backdrop-blur border border-gray-300 hover:bg-white shadow-md" />
              </Carousel>
            </div>
          )}
        </div>
      )}

      {/* Description Dialog */}
      <Dialog open={descOpen} onOpenChange={setDescOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto border-none shadow-2xl">
          <DialogHeader className="pb-0">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] p-6 text-black">
              <div className="absolute inset-0 bg-black/5 rounded-xl"></div>
              <div className="relative z-10">
                <DialogTitle className="text-2xl font-bold mb-2">{descTitle}</DialogTitle>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="bg-black/10 text-black font-semibold border-black/20 hover:bg-black/15">
                    {descDomain}
                  </Badge>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-black/30 rounded-full"></div>
                    <span className="text-lg font-bold">Rs. {descPrice}</span>
                  </div>
                  {descTutor && (
                    <>
                      <div className="w-2 h-2 bg-black/30 rounded-full"></div>
                      <span className="font-medium">By {descTutor}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>
          {descLoading ? (
            <div className="py-16 text-center">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Loader2 className="w-8 h-8 animate-spin text-black" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Description</h3>
              <p className="text-gray-600">Please wait while we fetch the module details...</p>
            </div>
          ) : descError ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Description</h3>
              <p className="text-red-500">{descError}</p>
            </div>
          ) : ( 
            <div className="space-y-6 pt-4">
              {descPoints.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-10 h-10 text-[#FBBF24]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Description Available</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    This module doesn&apos;t have a detailed description yet. Check back later or contact the tutor for more information.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border-l-4 border-[#FBBF24] pl-4 mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Module Overview</h3>
                    <p className="text-gray-600 text-sm">
                      Detailed breakdown of what you&apos;ll learn in this module
                    </p>
                  </div>
                  <div className="space-y-3">
                    {descPoints.map((p, idx) => (
                      <div key={idx} className="group flex items-start space-x-4 p-4 bg-gradient-to-r from-white to-yellow-50 border border-gray-200 rounded-xl hover:shadow-md hover:border-[#FBBF24] transition-all">
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] rounded-full flex items-center justify-center text-black font-bold text-sm shadow-md">
                          {idx + 1}
                        </div>
                        <div className="flex-1 pt-1">
                          <p className="text-gray-800 leading-relaxed break-words whitespace-pre-wrap group-hover:text-gray-900 transition-colors">
                            {p}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-900">Ready to Start Learning?</h4>
                    </div>
                    <p className="text-blue-700 text-sm">
                      This module contains {descPoints.length} key learning point{descPoints.length !== 1 ? 's' : ''} designed to help you master the subject.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </DashboardLayout>
  )
}