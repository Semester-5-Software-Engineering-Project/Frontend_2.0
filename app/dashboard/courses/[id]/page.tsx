'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { 
  BookOpen, 
  Video, 
  FileText, 
  Link as LinkIcon, 
  Download,
  Star,
  Clock,
  Users,
  Play,
  ChevronRight,
  Calendar,
  ChevronLeft,
  VideoIcon,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import axiosInstance from '@/app/utils/axiosInstance'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'

// TypeScript interfaces for module data
interface ModuleDetails {
  moduleId: string
  tutorId: string
  name: string
  domain: string
  averageRatings: number
  fee: number
  duration: string // ISO 8601 duration format like "PT2H30M"
  status: string
  description?: string
  image?: string
}

export default function CoursePage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  
  // Debug: Log the params
  useEffect(() => {
    console.log('=== CoursePage Debug Info ===')
    console.log('URL params:', params)
    console.log('Module ID from params:', params.id)
    console.log('params.id type:', typeof params.id)
    console.log('params.id length:', params.id?.length)
    console.log('params.id as string:', String(params.id))
    console.log('Current user:', user)
    console.log('Current pathname:', window.location.pathname)
    console.log('Current full URL:', window.location.href)
    console.log('============================')
  }, [params, user])

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isJoiningMeeting, setIsJoiningMeeting] = useState(false)
  const [moduleDetails, setModuleDetails] = useState<ModuleDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const materialRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Helper function to convert ISO 8601 duration to readable format
  // const formatDuration = (isoDuration: string): string => {
  //   // Parse PT2H30M format
  //   const regex = /PT(?:(\d+)H)?(?:(\d+)M)?/
  //   const match = isoDuration.match(regex)
  //   if (!match) return isoDuration

  //   const hours = parseInt(match[1] || '0')
  //   const minutes = parseInt(match[2] || '0')
    
  //   if (hours && minutes) {
  //     return `${hours}h ${minutes}m`
  //   } else if (hours) {
  //     return `${hours}h`
  //   } else if (minutes) {
  //     return `${minutes}m`
  //   }
  //   return isoDuration
  // }

  // Helper function to get domain-based image
  const getDomainImage = (domain: string): string => {
    const domainImages: Record<string, string> = {
      'Mathematics': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=400&fit=crop',
      'Computer Science': 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=400&fit=crop',
      'Physics': 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&h=400&fit=crop',
      'Chemistry': 'https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=800&h=400&fit=crop',
      'Biology': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop',
    }
    return domainImages[domain] || 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=400&fit=crop'
  }

  // Fetch module details by moduleId
  const fetchModuleDetails = async (moduleId: string): Promise<ModuleDetails> => {
    try {
      console.log('Fetching module details for moduleId:', moduleId)
      console.log('Current user:', user)
      
      // Try different endpoints based on user role
      let response
      if (user?.role === 'TUTOR') {
        // For tutors, get modules they teach
        console.log('Fetching modules for tutor...')
        response = await axiosInstance.get('/api/modules/get-modulesfortutor')
        console.log('Tutor modules response:', response.data)
        const modules = response.data
        const module = modules.find((m: any) => m.moduleId === moduleId)
        console.log('Found module for tutor:', module)
        if (!module) {
          throw new Error(`Module ${moduleId} not found in tutor's modules`)
        }
        return module
      } else {
        // For students, first try enrolled modules
        console.log('Fetching enrollments for student...')
        try {
          response = await axiosInstance.get('/api/enrollment/get-enrollments')
          console.log('Student enrollments response:', response.data)
          console.log('Response status:', response.status)
          console.log('Response type:', typeof response.data)
          console.log('Is array:', Array.isArray(response.data))
          
          const enrollments = response.data
          
          // Log the structure of each enrollment for debugging
          if (Array.isArray(enrollments) && enrollments.length > 0) {
            console.log('First enrollment structure:', enrollments[0])
            console.log('All enrollment keys:', enrollments.map((e: any, index: number) => 
              `Enrollment ${index}: ${Object.keys(e)}`
            ))
          }
          
          // Try to find the enrollment with more flexible matching
          let enrollment = enrollments.find((e: any) => e.moduleDetails?.moduleId === moduleId)
          
          // If not found, try alternative structures
          if (!enrollment) {
            // Maybe the structure is different - try direct moduleId
            enrollment = enrollments.find((e: any) => e.moduleId === moduleId)
            console.log('Trying direct moduleId match:', enrollment)
          }
          
          if (!enrollment) {
            // Maybe it's nested differently
            enrollment = enrollments.find((e: any) => e.module?.moduleId === moduleId)
            console.log('Trying e.module.moduleId match:', enrollment)
          }
          
          console.log('Found enrollment for student:', enrollment)
          
          if (enrollment) {
            // Return the module details with flexible structure handling
            return enrollment.moduleDetails || enrollment.module || enrollment
          }
          
          // If not found in enrollments, log available modules and try fallback
          const availableModuleIds = enrollments
            .map((e: any) => {
              // Try multiple possible structures
              return e.moduleDetails?.moduleId || e.moduleId || e.module?.moduleId || e.id
            })
            .filter(Boolean)
          console.log('Module not found in enrollments. Available module IDs:', availableModuleIds)
          
          // Fallback: Try to fetch all modules and find the one we need
          console.log('Enrollment not found, trying fallback: fetching all modules...')
          
        } catch (enrollmentError: any) {
          console.error('Error fetching enrollments:', enrollmentError)
          console.log('Trying fallback: fetching all modules...')
        }
        
        // Fallback: Try to get all modules (this might work for viewing module details)
        try {
          console.log('Fetching all modules as fallback...')
          const allModulesResponse = await axiosInstance.get('/api/modules/getAll')
          console.log('All modules response:', allModulesResponse.data)
          const allModules = allModulesResponse.data
          const module = allModules.find((m: any) => m.moduleId === moduleId)
          console.log('Found module in all modules:', module)
          
          if (module) {
            console.log('Using module from all modules API as fallback')
            return module
          }
        } catch (allModulesError: any) {
          console.error('Fallback all modules API also failed:', allModulesError)
        }
        
        // If all attempts failed
        throw new Error(`Module ${moduleId} not found. Please ensure you are enrolled in this module or contact support.`)
      }
    } catch (error: any) {
      console.error('Error fetching module details:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      
      // Provide more detailed error messages
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please login again.')
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. You may not have permission to view this module.')
      } else if (error.response?.status === 404) {
        throw new Error('API endpoint not found. Please check your backend configuration.')
      } else if (error.message.includes('Module') && error.message.includes('not found')) {
        // This is our custom error message, pass it through
        throw error
      } else {
        throw new Error(error.response?.data || error.message || 'Failed to fetch module details')
      }
    }
  }

  // Auto-collapse sidebar on mobile when clicking a material
  const handleMaterialClick = (materialId: string) => {
    scrollToMaterial(materialId)
    if (window.innerWidth < 1024) {
      setSidebarCollapsed(true)
    }
  }

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true)
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize() // Initial check

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Fetch module details on component mount
  useEffect(() => {
    const loadModuleDetails = async () => {
      // Wait for both params and user to be available
      if (!params.id || !user) {
        console.log('Waiting for params.id and user:', { paramsId: params.id, user: !!user })
        return
      }
      
      setLoading(true)
      setError(null)
      
      try {
        console.log('Loading module details for:', params.id, 'User role:', user.role)
        const details = await fetchModuleDetails(params.id as string)
        console.log('Successfully loaded module details:', details)
        setModuleDetails(details)
        console.log('Course object for rendering:========================', moduleDetails)
      } catch (err: any) {
        console.error('Failed to load module details:', err)
        setError(err.message)
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadModuleDetails()
  }, [params.id, user, toast]) // Added toast to dependencies

  // Create display object from module details
  const course = moduleDetails ? {
    id: moduleDetails.moduleId,
    title: moduleDetails.name,
    tutor: 'Loading...', // We can fetch tutor info later if needed
    description: moduleDetails.description || `Learn ${moduleDetails.name} in the ${moduleDetails.domain} domain.`,
    rating: moduleDetails.averageRatings || 0,
    students: 0, // We don't have this data yet
    // duration: formatDuration(moduleDetails.duration),
    progress: 0, // We don't have progress data yet
    image: getDomainImage(moduleDetails.domain),
    domain: moduleDetails.domain,
    fee: moduleDetails.fee,
    status: moduleDetails.status
  } : null
  console.log('Courseii object for rendering:========================', course)
  console.log('couser eded : ',moduleDetails?.moduleId )


  // Fetch materials for a module
  const fetchMaterials = async (moduleId: string) => {
    try {
      console.log('Fetching materials for moduleId:', moduleId)
      const response = await axiosInstance.get(`/api/materials/fetchAll?module_id=${moduleId}`)
      console.log('Materials API response:', response.data)
      console.log('Materials count:', Array.isArray(response.data) ? response.data.length : 'Not an array')
      
      // Ensure we return an array
      const materials = Array.isArray(response.data) ? response.data : []
      return materials
    } catch (error: any) {
      console.error('Error fetching materials:', error)
      console.error('Materials error response:', error.response?.data)
      console.error('Materials error status:', error.response?.status)
      
      // For materials, we don't want to break the page if they fail to load
      // Just return an empty array and log the error
      if (error.response?.status === 404) {
        console.log('Materials API endpoint not found, returning empty array')
        return []
      }
      
      console.warn('Failed to fetch materials, returning empty array:', error.message)
      return []
    }
  }



  // State for fetched materials
  const [lectureMaterials, setLectureMaterials] = useState<any[]>([]);

  // Fetch materials for the module
  useEffect(() => {
    const loadMaterials = async () => {
      if (!params.id) {
        console.log('No module ID available for materials')
        return
      }
      
      console.log('Loading materials for module:', params.id)
      try {
        const materials = await fetchMaterials(params.id as string)
        console.log('Successfully loaded materials:', materials.length, 'items')
        setLectureMaterials(materials)
      } catch (err) {
        console.error('Error fetching materials:', err)
        setLectureMaterials([])
      }
    }

    loadMaterials()
  }, [params.id])

  const scrollToMaterial = (materialId: string) => {
    const materialElement = materialRefs.current[materialId]
    if (materialElement) {
      materialElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  const getIconForMaterial = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="w-4 h-4 text-red-500" />
      case 'video':
        return <Video className="w-4 h-4 text-blue-500" />
      case 'link':
        return <LinkIcon className="w-4 h-4 text-green-500" />
      default:
        return <FileText className="w-4 h-4 text-gray-500" />
    }
  }

  async function handleDownload(materialId: string) {
    try {
      // Find the material by id
      const material = lectureMaterials.find(
        (m) => (m.id || m.material_id) === materialId
      );
      if (!material || !material.url) {
        alert('Download link not available.');
        return;
      }

      // Start download
      const response = await fetch(material.url);
      if (!response.ok) {
        alert('Failed to download file.');
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link to trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = material.title || 'document';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('An error occurred while downloading.');
    }
  }
  const handleJoinMeeting = async () => {
    if (!params.id) {
      toast({
        title: "Error",
        description: "Module ID not found",
        variant: "destructive",
      })
      return
    }

    setIsJoiningMeeting(true)

    try {
      const now = new Date();
      const requestedDate = now.toISOString().slice(0, 10);
      const requestedTime = now.toTimeString().slice(0, 8);

      console.log('Joining meeting with fixed date/time:', { requestedDate, requestedTime, moduleId: params.id })

      const payload = {
        moduleId: params.id,
        requestedDate,
        requestedTime,
      }
      
      console.log('Request payload:', payload)
      console.log('Request payload JSON:', JSON.stringify(payload))
      console.log('Current cookies:', document.cookie)
      console.log('Axios baseURL:', axiosInstance.defaults.baseURL)
      console.log('User Agent:', navigator.userAgent)

      // Extract JWT token from cookies for Bearer authentication
      const extractJWTFromCookies = () => {
        const cookies = document.cookie.split(';')
        for (let cookie of cookies) {
          const [name, value] = cookie.trim().split('=')
          if (name === 'jwt_token') {
            return value
          }
        }
        return null
      }

      const jwtToken = extractJWTFromCookies()
      console.log('Extracted JWT token:', jwtToken ? `${jwtToken.substring(0, 50)}...` : 'No JWT token found')

      // Prepare headers - include Bearer token if JWT is available
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      }

    
      if (jwtToken) {
        headers['Authorization'] = `Bearer ${jwtToken}`
        console.log('Added Authorization header with Bearer token')
      } else {
        console.log('No JWT token found in cookies - relying on withCredentials only')
      }

    
      const response = await axiosInstance.post('/api/meeting/join', payload, {
        headers,
        withCredentials: true,
        timeout: 10000,
      })

      if (response.data && response.data.roomId && response.data.token) {
        const { roomId, token } = response.data
        
        localStorage.setItem('meetingData', JSON.stringify({
          roomId,
          token,
          moduleId: params.id,
        }))
        
        router.push('/meeting')
        
        toast({
          title: "Joining Meeting",
          description: "Redirecting to meeting room...",
        })
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (error: any) {
      console.error('Error joining meeting:', error)
      console.error('Error response data:', error.response?.data)
      console.error('Error response status:', error.response?.status)
      console.error('Error response headers:', error.response?.headers)
      
      let errorMessage = 'Failed to join meeting'
      if (error.response) {
        // Log the full response for debugging
        console.log('Full error response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        })
        
        if (error.response.status === 400) {
          // Handle 400 Bad Request specifically
          if (error.response.data && typeof error.response.data === 'string') {
            errorMessage = `Bad Request: ${error.response.data}`
          } else if (error.response.data && error.response.data.message) {
            errorMessage = `Bad Request: ${error.response.data.message}`
          } else if (error.response.data && error.response.data.error) {
            errorMessage = `Bad Request: ${error.response.data.error}`
          } else {
            errorMessage = 'Bad Request: Invalid request format or data'
          }
        } else if (error.response.status === 401) {
          errorMessage = 'Authentication failed. Please login again.'
        } else if (error.response.status === 403) {
          errorMessage = 'Access denied. You don\'t have permission to join this meeting.'
        } else if (error.response.status === 404) {
          errorMessage = 'Meeting not found for this module.'
        } else if (error.response.data && typeof error.response.data === 'string') {
          errorMessage = error.response.data
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message
        }
      } else if (error.request) {
        errorMessage = 'Cannot connect to server. Please check your internet connection.'
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsJoiningMeeting(false)
    }
  }

  // Debug function to test the meeting API
  // const debugMeetingAPI = async () => {
  //   console.log('=== DEBUG: Testing Meeting API ===')
  //   console.log('Module ID:', params.id)
  //   console.log('User from auth context:', user)
  //   console.log('Axios base URL:', axiosInstance.defaults.baseURL)
  //   console.log('Cookies:', document.cookie)
    
  //   // Extract JWT token from cookies
  //   const extractJWTFromCookies = () => {
  //     const cookies = document.cookie.split(';')
  //     for (let cookie of cookies) {
  //       const [name, value] = cookie.trim().split('=')
  //       if (name === 'jwt_token') {
  //         return value
  //       }
  //     }
  //     return null
  //   }

  //   const jwtToken = extractJWTFromCookies()
  //   console.log('JWT Token found:', !!jwtToken)
  //   if (jwtToken) {
  //     console.log('JWT Token preview:', jwtToken.substring(0, 50) + '...')
  //   }
    
  //   const payload = {
  //     moduleId: params.id,
  //     requestedDate: "2025-09-16",
  //     requestedTime: "17:59:00",
  //   }
    
  //   // Test 1: With Bearer token (like Postman)
  //   if (jwtToken) {
  //     try {
  //       console.log('TEST 1: Using Bearer token authentication (like Postman)')
        
  //       const response = await axiosInstance.post('/api/meeting/join', payload, {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'Authorization': `Bearer ${jwtToken}`,
  //         },
  //         withCredentials: false, // Don't send cookies when using Bearer token
  //       })
        
  //       console.log('TEST 1 SUCCESS! Response:', response)
  //       console.log('Response data:', response.data)
  //       console.log('Response status:', response.status)
  //       return // If this works, we're done
        
  //     } catch (error: any) {
  //       console.error('TEST 1 FAILED:', error.response?.status, error.response?.data)
  //     }
  //   }
    
  //   // Test 2: With cookies only (original method)
  //   try {
  //     console.log('TEST 2: Using cookie authentication only')
      
  //     const response = await axiosInstance.post('/api/meeting/join', payload, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       withCredentials: true,
  //     })
      
  //     console.log('TEST 2 SUCCESS! Response:', response)
  //     console.log('Response data:', response.data)
  //     console.log('Response status:', response.status)
      
  //   } catch (error: any) {
  //     console.error('TEST 2 FAILED:', error.response?.status, error.response?.data)
      
  //     // Try to get more details about the error
  //     if (error.response?.data) {
  //       try {
  //         const errorData = typeof error.response.data === 'string' 
  //           ? error.response.data 
  //           : JSON.stringify(error.response.data, null, 2)
  //         console.error('Formatted error data:', errorData)
  //       } catch (e) {
  //         console.error('Could not format error data:', e)
  //       }
  //     }
  //   }
    
  //   console.log('=== END DEBUG ===')
  // }

  // // Debug function to test different request variations
  // const testDifferentRequestFormats = async () => {
  //   if (!params.id) {
  //     console.error('No module ID available')
  //     return
  //   }

  //   const basePayload = {
  //     moduleId: params.id,
  //     requestedDate: "2025-09-16",
  //     requestedTime: "17:59:00",
  //   }

  //   console.log('=== TESTING DIFFERENT REQUEST FORMATS ===')

  //   // Test 1: Exactly as current
  //   try {
  //     console.log('Test 1: Current format')
  //     const response1 = await axiosInstance.post('/api/meeting/join', basePayload, {
  //       headers: { 'Content-Type': 'application/json' },
  //       withCredentials: true,
  //     })
  //     console.log('Test 1 SUCCESS:', response1.data)
  //   } catch (error: any) {
  //     console.log('Test 1 FAILED:', error.response?.status, error.response?.data)
  //   }

  //   // Test 2: Try with snake_case
  //   try {
  //     console.log('Test 2: Snake case format')
  //     const snakeCasePayload = {
  //       module_id: params.id,
  //       requested_date: "2025-09-16",
  //       requested_time: "17:59:00",
  //     }
  //     const response2 = await axiosInstance.post('/api/meeting/join', snakeCasePayload, {
  //       headers: { 'Content-Type': 'application/json' },
  //       withCredentials: true,
  //     })
  //     console.log('Test 2 SUCCESS:', response2.data)
  //   } catch (error: any) {
  //     console.log('Test 2 FAILED:', error.response?.status, error.response?.data)
  //   }

  //   // Test 3: Try without explicit headers
  //   try {
  //     console.log('Test 3: No explicit headers')
  //     const response3 = await axiosInstance.post('/api/meeting/join', basePayload)
  //     console.log('Test 3 SUCCESS:', response3.data)
  //   } catch (error: any) {
  //     console.log('Test 3 FAILED:', error.response?.status, error.response?.data)
  //   }

  //   // Test 4: Try with raw fetch instead of axios
  //   try {
  //     console.log('Test 4: Raw fetch instead of axios')
  //     const response4 = await fetch('http://localhost:8080/api/meeting/join', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Accept': 'application/json',
  //       },
  //       credentials: 'include',
  //       body: JSON.stringify(basePayload)
  //     })
      
  //     if (response4.ok) {
  //       const data = await response4.json()
  //       console.log('Test 4 SUCCESS:', data)
  //     } else {
  //       const errorText = await response4.text()
  //       console.log('Test 4 FAILED:', response4.status, errorText)
  //     }
  //   } catch (error: any) {
  //     console.log('Test 4 ERROR:', error)
  //   }

  //   // Test 5: Try with different date format
  //   try {
  //     console.log('Test 5: ISO date format')
  //     const isoPayload = {
  //       moduleId: params.id,
  //       requestedDate: "2025-09-16T17:59:00.000Z",
  //     }
  //     const response5 = await axiosInstance.post('/api/meeting/join', isoPayload, {
  //       headers: { 'Content-Type': 'application/json' },
  //       withCredentials: true,
  //     })
  //     console.log('Test 5 SUCCESS:', response5.data)
  //   } catch (error: any) {
  //     console.log('Test 5 FAILED:', error.response?.status, error.response?.data)
  //   }

  //   console.log('=== END TESTING ===')
  // }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading module details...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Module</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                
                {/* Debug Info */}
                <div className="text-left bg-gray-100 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold mb-2">Debug Information:</h4>
                  <p className="text-sm"><strong>Module ID:</strong> {params.id}</p>
                  <p className="text-sm"><strong>User Role:</strong> {user?.role}</p>
                  <p className="text-sm"><strong>User ID:</strong> {user?.id}</p>
                  <p className="text-sm"><strong>Pathname:</strong> {typeof window !== 'undefined' ? window.location.pathname : 'N/A'}</p>
                </div>
                
                {/* Helpful suggestions for students */}
                {user?.role === 'STUDENT' && error.includes('not found in student\'s enrollments') && (
                  <div className="text-left bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold mb-2 text-blue-800">💡 Possible Solutions:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• You might not be enrolled in this module yet</li>
                      <li>• The module ID in the URL might be incorrect</li>
                      <li>• Try going back to the main courses page and clicking the module from there</li>
                      <li>• Contact your tutor or administrator for enrollment assistance</li>
                    </ul>
                  </div>
                )}
                
                <div className="flex space-x-2 justify-center">
                  <Button 
                    onClick={() => window.location.reload()} 
                    className="mt-4"
                  >
                    Try Again
                  </Button>
                  <Button 
                    onClick={() => router.push('/dashboard/courses')}
                    variant="outline"
                    className="mt-4"
                  >
                    Back to Modules
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content - Only show when course data is loaded */}
        {!loading && !error && course && (
          <>
            {/* Backdrop Overlay for Mobile */}
            {!sidebarCollapsed && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                onClick={() => setSidebarCollapsed(true)}
              />
            )}

            {/* Toggle Button for Collapsed Sidebar */}
            <div className={`fixed top-4 left-4 z-100 transition-all duration-300 ease-in-out ${
              sidebarCollapsed ? 'translate-x-0' : '-translate-x-full'
            }`}>
              <Button
                variant="default"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="rounded-full w-12 h-12 -pr-20 shadow-lg absolute top-12 -left-9 bg-green-500 opacity-50"
              >
                <ChevronRight className="w-6 h-6"/>
              </Button>
            </div>

            {/* Top Actions */}
            <div className={`flex justify-between items-center space-x-4 ${sidebarCollapsed ? 'ml-0' : 'ml-0 lg:ml-80 md:ml-72 sm:ml-64'}`}>
              <Button 
                onClick={() => router.push('/dashboard/courses')}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Modules</span>
              </Button>
              
              <div className="flex items-center space-x-2">
                {user?.role === 'TUTOR' && (
                  <Button 
                    onClick={() => {
                      console.log('=== SCHEDULE BUTTON CLICKED ===')
                      console.log('Original params.id:', params.id)
                      console.log('params.id type:', typeof params.id)
                      console.log('params.id length:', params.id?.length)
                      console.log('Converting to string:', String(params.id))
                      
                      const moduleIdToStore = String(params.id)
                      console.log('About to store in localStorage:', moduleIdToStore)
                      localStorage.setItem('scheduleModuleId', moduleIdToStore)
                      
                      // Verify what was actually stored
                      const storedValue = localStorage.getItem('scheduleModuleId')
                      console.log('Verified stored value:', storedValue)
                      console.log('Stored value type:', typeof storedValue)
                      console.log('Stored value length:', storedValue?.length)
                      
                      const urlToNavigate = `/dashboard/schedul?moduleId=${moduleDetails?.moduleId}`
                      console.log('Navigating to URL:', urlToNavigate)
                      console.log('=== END SCHEDULE BUTTON DEBUG ===')
                      
                      router.push(urlToNavigate)
                    }}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Schedule Meeting</span>
                  </Button>
                )}
                
                <Button 
                  onClick={handleJoinMeeting}
                  disabled={isJoiningMeeting}
                  className="flex items-center space-x-2"
                >
                  <VideoIcon className="w-4 h-4" />
                  <span>{isJoiningMeeting ? 'Joining...' : 'Join Meeting'}</span>
                </Button>
              </div>
            </div>

            {/* All Content */}
            <div className={`space-y-6 transition-all duration-300 ease-in-out ${
              sidebarCollapsed ? 'ml-0' : 'ml-0 lg:ml-80 md:ml-72 sm:ml-64'
            }`}>

              {/* Course Header */}
              <div className="relative">
                <img 
                  src={course.image} 
                  alt={course.title}
                  className="w-full h-64 object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 rounded-xl flex items-end">
                  <div className="p-6 text-white">
                    <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
                    <p className="text-xl text-gray-200 mb-4">{course.description}</p>
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span>{course.rating.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-white border-white">
                          {course.domain}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-5 h-5" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-semibold">${course.fee}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Module Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Module Information</CardTitle>
                  <CardDescription>Details about this learning module</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-500">Status</h4>
                      <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
                        {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-500">Domain</h4>
                      <p className="font-medium">{course.domain}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-500">Duration</h4>
                      <p className="font-medium">{course.duration}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                {/* Materials Sidebar */}
                <div className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 ease-in-out ${
                  sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'
                }`}>
                  <Card className="h-full w-80 lg:w-80 md:w-72 sm:w-64 rounded-none border-r border-b border-l-0 border-t-0 shadow-lg">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Module Materials</CardTitle>
                        <Button
                          variant="ghost"
                          size="lg"
                          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                          className="p-1 h-6 w-6"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="overflow-y-auto h-[calc(100vh-80px)] p-0">
                      {lectureMaterials.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No materials available yet</p>
                        </div>
                      ) : (
                        lectureMaterials.map((material) => (
                          <button
                            key={material.id || material.material_id}
                            onClick={() => handleMaterialClick(material.id || material.material_id)}
                            className="w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-3">
                              {material.type === 'Document' && (
                                <FileText className="w-4 h-4 text-red-500" />
                              )}
                              {material.type === 'Link' && (
                                <LinkIcon className="w-4 h-4 text-green-500" />
                              )}
                              {material.type === 'Video' && (
                                <Video className="w-4 h-4 text-blue-500" />
                              )}
                              {material.type !== 'Document' && material.type !== 'Link' && material.type !== 'Video' && (
                                <FileText className="w-4 h-4 text-gray-500" />
                              )}
                              <div>
                                <h4 className="font-medium text-sm">{material.title}</h4>
                                <p className="text-xs text-gray-500">
                                  {material.type === 'Document' && 'PDF'}
                                  {material.type === 'Link' && 'External Resource'}
                                  {material.type === 'Video' && 'Video'}
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </button>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Main Content Area for Materials */}
                <div className="space-y-4">
                  {lectureMaterials.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold mb-2">No Materials Yet</h3>
                        <p className="text-gray-600">
                          Materials for this module will appear here when they become available.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    lectureMaterials.map((material) => (
                      <div
                        key={material.id || material.material_id}
                        ref={(el) => (materialRefs.current[material.id || material.material_id] = el)}
                        id={`material-${material.id || material.material_id}`}
                        className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {material.type === 'Document' && getIconForMaterial('document')}
                        {material.type === 'Link' && getIconForMaterial('link')}
                        {material.type === 'Video' && getIconForMaterial('video')}
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{material.title}</h4>
                          <p className="text-xs text-gray-500">
                            {material.type === 'Document' && 'PDF'}
                            {material.type === 'Link' && 'External Resource'}
                            {material.type === 'Video' && 'Video Content'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {material.type === 'Video' && (
                            <Button size="sm" variant="outline">
                              <Play className="w-4 h-4 mr-1" />
                              Watch
                            </Button>
                          )}
                          {material.type === 'Link' && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={material.url} target="_blank" rel="noopener noreferrer">
                                <LinkIcon className="w-4 h-4 mr-1" />
                                Open
                              </a>
                            </Button>
                          )}
                          {material.type === 'Document' && (
                            <Button size="sm" variant="outline" onClick={() => handleDownload(material.id || material.material_id)}>
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}