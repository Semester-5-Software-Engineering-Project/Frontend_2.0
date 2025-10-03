'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Module as ApiModule, Module, UpcomingSessionsRequest } from '@/types/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X } from "lucide-react"
import Cookies from "js-cookie";

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
import { getModulesForTutor, getEnrollments, getAllModulesPublic, getMaterials, joinMeeting, upcomingSchedulesByModule } from '@/services/api'
// Schedules section state
import { UpcomingSessionResponse } from '@/types/api'
  // Schedules state

import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import axiosInstance from '@/app/utils/axiosInstance'

// TypeScript interfaces for module data
interface LocalModule extends ApiModule {
  moduleId: string; // Make it required
  description?: string; // Add description
}

interface EnrollmentDetails {
  enrollmentId: string
  moduleDetails: LocalModule
  isPaid: boolean
  enrollmentDate: string
}

interface UserProfile {
  firstName: string
  lastName: string
  address: string
  city: string
  country: string
  phoneNumber: string
}

export default function CoursePage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  
  
  // Debug: Log the params
  const [schedules, setSchedules] = useState<UpcomingSessionResponse[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [schedulesError, setSchedulesError] = useState<string | null>(null);

  // Fetch schedules for this module
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!params.id) return;
      setSchedulesLoading(true);
      setSchedulesError(null);
      try {
        const now = new Date();
        const req: UpcomingSessionsRequest = {
          date: now.toISOString().slice(0, 10),
          time: now.toTimeString().slice(0, 8),
          moduleId: String(params.id),
        };
        // API expects { moduleId, date, time }
        const res = await upcomingSchedulesByModule(req);
        console.log("Schedules for module", params.id, ":", res);
        setSchedules(Array.isArray(res) ? res : [res]);
      } catch (err) {
        setSchedulesError('Failed to load schedules.' + (err instanceof Error ? ` ${err.message}` : ''));
      } finally {
        setSchedulesLoading(false);
      }
    };
    fetchSchedules();
  }, []);
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
  const [moduleDetails, setModuleDetails] = useState<LocalModule | null>(null)
  const [enrollment, setEnrollment] = useState<EnrollmentDetails | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [module, setModule] = useState<LocalModule | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [editableProfile, setEditableProfile] = useState<UserProfile | null>(null)
  const materialRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Helper function to convert ISO 8601 duration to readable format
  const formatDuration = (isoDuration: string): string => {
    // Parse PT2H30M format
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?/
    const match = isoDuration.match(regex)
    if (!match) return isoDuration

    const hours = parseInt(match[1] || '0')
    const minutes = parseInt(match[2] || '0')
    
    if (hours && minutes) {
      return `${hours}h ${minutes}m`
    } else if (hours) {
      return `${hours}h`
    } else if (minutes) {
      return `${minutes}m`
    }
    return isoDuration
  }

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

  // Fetch enrollment payment status using the new endpoint
  const getEnrollmentDetails = async (moduleId: string): Promise<{ isPaid: boolean } | null> => {
  try {
    // Call the API with moduleId as a path variable
    const response = await axiosInstance.get(`/api/enrollment/get-enrollment-details/${moduleId}`);
    
    console.log('Enrollment details response:', response.data);

    // Backend returns a boolean (true/false)
    return {
      isPaid: response.data === true
    };
  } catch (error) {
    console.error('Error fetching enrollment details:', error);
    return null;
  }
};


  // Fetch module details by moduleId
  const fetchModule = async (moduleId: string): Promise<LocalModule> => {
    try {
      console.log('Fetching module details for moduleId:', moduleId)
      console.log('Current user:', user)
      
      // Try different endpoints based on user role
      let response
      if (user?.role === 'TUTOR') {
        // For tutors, get modules they teach
        console.log('Fetching modules for tutor...')
        const modules = await getModulesForTutor()
        console.log('Tutor modules response:', modules)
        const module = modules.find((m: any) => m.moduleId === moduleId)
        console.log('Found module for tutor:', module)
        // if (!module) {
        // response = await axiosInstance.get('/api/modules/get-modulesfortutor')
        // console.log('Tutor modules response:', response.data)
        // const modules = response.data
        // const foundModule = modules.find((m: any) => m.moduleId === moduleId)
        // console.log('Found module for tutor:', foundModule)
        if (!module) {
          throw new Error(`Module ${moduleId} not found in tutor's modules`)
        }
        return module as LocalModule
        
      } else {
        // For students, first try enrolled modules
        console.log('Fetching enrollments for student...')
        try {
          const enrollments = await getEnrollments()
          console.log('Student enrollments response:', enrollments)
          console.log('Response type:', typeof enrollments)
          console.log('Is array:', Array.isArray(enrollments))
          
          // Log the structure of each enrollment for debugging
          if (Array.isArray(enrollments) && enrollments.length > 0) {
            console.log('First enrollment structure:', enrollments[0])
            console.log('All enrollment keys:', enrollments.map((e: any, index: number) => 
              `Enrollment ${index}: ${Object.keys(e)}`
            ))
          }
          
          // Try to find the enrollment with more flexible matching
          let enrollment = enrollments.find((e: any) => e.module?.moduleId === moduleId)
          
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
            return (enrollment.module || enrollment) as LocalModule
          }
          
          // If not found in enrollments, log available modules and try fallback
          const availableModuleIds = enrollments
            .map((e: any) => {
              // Try multiple possible structures
              return e.moduleId || e.module?.moduleId || e.id
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
          const allModulesResponse = await axiosInstance.get('/api/modules')
          console.log('All modules response:', allModulesResponse.data)
          const allModules = allModulesResponse.data
          const foundModule = allModules.find((m: any) => m.moduleId === moduleId)
          console.log('Found module in all modules:', foundModule)
          
          if (foundModule) {
            console.log('Using module from all modules API as fallback')
            return foundModule as LocalModule
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

  // Fetch enrollment details to check payment status
  const fetchEnrollmentDetails = async (moduleId: string): Promise<EnrollmentDetails | null> => {
    try {
      console.log('Fetching enrollment details for moduleId:', moduleId)
      const response = await axiosInstance.get('/api/enrollment/get-enrollments')
      const enrollments = response.data
      console.log('Enrollments fetched:', enrollments)
      
      const enrollmentData = enrollments.find((e: any) => 
        e.moduleDetails?.moduleId === moduleId || e.moduleId === moduleId || e.module?.moduleId === moduleId
      )
      
      if (enrollmentData) {
        console.log('=== ENROLLMENT PAYMENT STATUS DEBUG ===')
        console.log('Raw enrollment data:', enrollmentData)
        console.log('enrollmentData.isPaid:', enrollmentData.isPaid)
        console.log('enrollmentData.is_paid:', enrollmentData.is_paid)
        console.log('Final isPaid value:', enrollmentData.is_paid || enrollmentData.isPaid || false)
        console.log('======================================')
        
        return {
          enrollmentId: enrollmentData.enrollmentId || enrollmentData.id,
          moduleDetails: enrollmentData.moduleDetails || enrollmentData.module || enrollmentData,
          isPaid: enrollmentData.is_paid || enrollmentData.isPaid || false,
          enrollmentDate: enrollmentData.enrollmentDate || enrollmentData.createdAt
        }
      }
      return null
    } catch (error: any) {
      console.error('Error fetching enrollment details:', error)
      return null
    }
  }

  // Fetch user profile for payment checkout
  const fetchUserProfile = async (): Promise<UserProfile | null> => {
    try {
      console.log('Fetching user profile for payment')
      const response = await axiosInstance.get('/api/student-profile/me')
      const profile = response.data
      
      return {
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        address: profile.address || '',
        city: profile.city || '',
        country: profile.country || '',
        phoneNumber: profile.phoneNumber || ''
      }
    } catch (error: any) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  // Create payment and redirect to PayHere
  const startPayment = async () => {
    if (!moduleDetails || !user) {
      console.error("Missing required data:", { 
        hasModuleDetails: !!moduleDetails, 
        hasUser: !!user,
        userId: user?.id,
        moduleId: moduleDetails?.moduleId
      })
      return
    }
    
    setIsProcessingPayment(true)
    try {
      console.log('Creating payment for module:', moduleDetails.moduleId)
      const token = Cookies.get('jwt_token')
      console.log('Using auth token:', token)
      // Prepare payload
      const paymentPayload = {
        moduleId: moduleDetails.moduleId,
        amount: course?.fee || moduleDetails?.fee
      }
      
      console.log("=== PAYMENT PAYLOAD ===")
      console.log("Raw payload object:", paymentPayload)

      const paymentResponse = await axiosInstance.post('/api/payments/create', 
        paymentPayload,
        { headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
          }
        }
      
      )

      const paymentData = paymentResponse.data
      console.log('Payment creation response:', paymentData)

      if (paymentResponse.status === 200 && paymentData) {
        // Create a form and submit to PayHere
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = 'https://sandbox.payhere.lk/pay/checkout'
        
        // Add all payment data as form inputs
        Object.keys(paymentData).forEach(key => {
          const input = document.createElement('input')
          input.type = 'hidden'
          input.name = key
          input.value = paymentData[key]
          form.appendChild(input)
        })
        
        document.body.appendChild(form)
        form.submit()
      } else {
        toast({
          title: "Error",
          description: paymentData.message || "Payment creation failed. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error('Error creating payment:', error)
      toast({
        title: "Payment Error",
        description: "Failed to create payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessingPayment(false)
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

  useEffect(() => {
    const { moduleId } = params

    if (typeof window === "undefined") return // SSR safety

    const urlParams = new URLSearchParams(window.location.search)
    const orderId = urlParams.get("order_id")

    if (orderId) {
      console.log("PayHere return detected with order_id:", orderId)

      // Clean up URL (remove query params) - use params.id instead of undefined moduleId
      const moduleId = params.id as string
      const cleanUrl = `${window.location.origin}/dashboard/courses/${moduleId}`
      console.log("Cleaning URL to:", cleanUrl)
      window.history.replaceState({}, document.title, cleanUrl)

      // Show toast
      toast({
        title: "Payment Processing",
        description: "Your payment is being verified...",
        duration: 4000,
      })

      // 🔑 Instead of hard reload, trigger a re-fetch of enrollment/payment data
      // (for example, call your backend API again)
      fetch(`/api/enrollments/${moduleId}?user=${user?.id}`)
        .then(res => res.json())
        .then(data => {
          console.log("Updated enrollment data:", data)
          // optionally update state here
        })
        .catch(err => console.error("Error fetching updated enrollment", err))
    }
  }, [params, params.id, toast, user])

  // Fetch module details on component mount
  useEffect(() => {
    const loadModule = async () => {
      // Wait for both params and user to be available
      if (!params.id || !user) {
        console.log('Waiting for params.id and user:', { paramsId: params.id, user: !!user })
        return
      }
      console.log("heeeeeeeeeeeeeee:", user?.id)
    console.log("moduleid:", moduleDetails?.moduleId)
    console.log("course fee:", course?.fee)
      setLoading(true)
      setError(null)
      
      try {
        console.log('Loading module details for:', params.id, 'User role:', user.role)
        const details = await fetchModule(params.id as string)
        console.log('Successfully loaded module details:', details)
        setModuleDetails(details)
        
        // For students, also fetch enrollment and user profile
        if (user.role === 'STUDENT') {
          
          const enrollmentData = await getEnrollmentDetails(params.id as string)
          console.log('Payment_status:', enrollmentData?.isPaid)
          
          console.log('=== PAYMENT DIALOG DECISION =======================================')
          console.log('enrollmentData.isPaid:', enrollmentData?.isPaid)
          
          
          // If not paid, show payment dialog
          if (enrollmentData && !enrollmentData.isPaid) {
            console.log('Showing payment dialog - student not paid')
            const profile = await fetchUserProfile()
            setUserProfile(profile)
            setEditableProfile(profile) // Set editable copy
            setShowPaymentDialog(true)
          } else if (enrollmentData && enrollmentData.isPaid) {
            console.log('Student has paid - not showing payment dialog')
          } else {
            console.log('No enrollment data found')
          }
        }
        
        console.log('Course object for rendering:========================', moduleDetails)
        setModule(details)
        console.log('Course object for rendering:========================', module)
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

    loadModule()
  }, [params.id, user, toast]) // Added toast to dependencies

  // Create display object from module details
  const course = module ? {
    id: module.moduleId,
    title: module.name,
    tutor: 'Loading...', // We can fetch tutor info later if needed
    description: module.description || `Learn ${module.name} in the ${module.domain} domain.`,
    rating: module.averageRatings || 0,
    students: 0, // We don't have this data yet
    duration: `${Math.floor(module.duration / 60)}h ${module.duration % 60}m`,
    progress: 0, // We don't have progress data yet
    image: getDomainImage(module.domain),
    domain: module.domain,
    fee: module.fee,
    status: module.status
  } : null
  console.log('Courseii object for rendering:========================', course)
  console.log('couser eded : ',module?.moduleId )


  // Fetch materials for a module
  const fetchMaterials = async (moduleId: string) => {
    try {
      console.log('Fetching materials for moduleId:', moduleId)
      const response = await getMaterials(moduleId)
      console.log('Materials API response:', response)
      console.log('Materials count:', Array.isArray(response) ? response.length : 'Not an array')
      
      // The API returns materials directly as an array, not nested in response.materials
      const materials = Array.isArray(response) ? response : []
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
      // Only pass moduleId as query param to meeting page
      router.push(`/meeting?module=${encodeURIComponent(params.id as string)}`)
      toast({
        title: "Joining Meeting",
        description: "Redirecting to meeting room...",
      })
    } finally {
      setIsJoiningMeeting(false)
    }
  }


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
            <CardContent className="p-6 ">
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
                    Back to Courses
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content - Only show when course data is loaded */}
        {!loading && !error && course && (
          <>
            {/* Payment Status Check for Students */}
            {user?.role === 'STUDENT' && enrollment && !enrollment.isPaid ? (
              <Card className="mx-auto max-w-md">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl text-red-600">Payment Required</CardTitle>
                  <CardDescription>
                    Sorry, you need to pay for this course to view the content.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold">{course.title}</h3>
                      <p className="text-sm text-gray-600">{course.domain}</p>
                      <p className="text-lg font-bold text-green-600 mt-2">
                        ${course.fee} USD
                      </p>
                    </div>
                    <Button 
                      onClick={() => setShowPaymentDialog(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      size="lg"
                    >
                      Pay for Course
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Show course content only if paid or user is tutor */}
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
              </>
            )}

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
                      
                      const urlToNavigate = `/dashboard/schedul?moduleId=${module?.moduleId}`
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

                  {/* Schedules Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Schedules</CardTitle>
                      <CardDescription>All upcoming and past schedules for this module</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {schedulesLoading ? (
                        <div className="text-center py-4"><Loader2 className="animate-spin inline mr-2" />Loading schedules...</div>
                      ) : schedulesError ? (
                        <div className="text-red-500 text-center py-4">{schedulesError}</div>
                      ) : schedules.length === 0 ? (
                        <div className="text-center py-4">No schedules found for this module.</div>
                      ) : (
                        <div className="space-y-3">
                          {schedules.map((session) => (
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
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Payment Dialog */}
<Dialog open={showPaymentDialog} onOpenChange={() => {}}>
  <DialogContent 
    className="sm:max-w-4xl" 
    onPointerDownOutside={(e) => e.preventDefault()} 
    onEscapeKeyDown={(e) => e.preventDefault()}
  >
    {/* Custom Close Button */}
    <DialogClose asChild>
      <button
        onClick={() => router.push("/dashboard/courses")}
        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background 
                  transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 
                  focus:ring-ring focus:ring-offset-2 z-50"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </DialogClose>

    <DialogHeader className="pb-4">
      <DialogTitle className="text-xl">Complete Your Purchase</DialogTitle>
      <DialogDescription>
        Review your details and proceed with payment
      </DialogDescription>
    </DialogHeader>

    <div className="grid md:grid-cols-3 gap-6">
      {/* Left Column - Course Details */}
      <div className="md:col-span-1">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100 h-full">
          <p className="text-sm text-gray-600 mb-3">{course?.domain}</p>
          <h1 className="font-semibold text-gray-900 mb-1">{course?.title}</h1>
          <div className="mt-auto pt-2 border-t border-blue-200">
            <p className="text-xs text-gray-500 mb-1">Total Amount</p>
            <p className="text-2xl font-bold text-[#f0ae16]">
              ${course?.fee}
            </p>
            <p className="text-xs text-gray-500">USD</p>
          </div>
        </div>
      </div>

      {/* Right Column - Billing Information */}
      {editableProfile && (
        <div className="md:col-span-2 space-y-4">
          <h4 className="font-semibold text-gray-900">Billing Information</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="firstName" className="text-xs font-medium">First Name *</Label>
              <Input 
                id="firstName" 
                value={editableProfile.firstName} 
                onChange={(e) => setEditableProfile({
                  ...editableProfile,
                  firstName: e.target.value
                })}
                placeholder="John"
                className="h-9"
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-xs font-medium">Last Name *</Label>
              <Input 
                id="lastName" 
                value={editableProfile.lastName} 
                onChange={(e) => setEditableProfile({
                  ...editableProfile,
                  lastName: e.target.value
                })}
                placeholder="Doe"
                className="h-9"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address" className="text-xs font-medium">Address *</Label>
            <Input 
              id="address" 
              value={editableProfile.address} 
              onChange={(e) => setEditableProfile({
                ...editableProfile,
                address: e.target.value
              })}
              placeholder="123 Main Street"
              className="h-9"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="city" className="text-xs font-medium">City *</Label>
              <Input 
                id="city" 
                value={editableProfile.city} 
                onChange={(e) => setEditableProfile({
                  ...editableProfile,
                  city: e.target.value
                })}
                placeholder="New York"
                className="h-9"
              />
            </div>
            <div>
              <Label htmlFor="country" className="text-xs font-medium">Country *</Label>
              <Input 
                id="country" 
                value={editableProfile.country} 
                onChange={(e) => setEditableProfile({
                  ...editableProfile,
                  country: e.target.value
                })}
                placeholder="United States"
                className="h-9"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone" className="text-xs font-medium">Phone Number *</Label>
            <Input 
              id="phone" 
              value={editableProfile.phoneNumber} 
              onChange={(e) => setEditableProfile({
                ...editableProfile,
                phoneNumber: e.target.value
              })}
              placeholder="+1 (555) 000-0000"
              className="h-9"
            />
          </div>
        </div>
      )}
    </div>

    {/* Action Buttons */}
    <div className="flex gap-3 pt-6 border-t">
      <Button 
        onClick={() => router.push('/dashboard/courses')}
        variant="outline"
        disabled={isProcessingPayment}
        className="flex-1"
      >
        Cancel
      </Button>
      <Button 
        onClick={startPayment}
        disabled={isProcessingPayment}
        className="flex-1 bg-[#f0ae16] hover:bg-[#d99e00]"
      >
        {isProcessingPayment ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          'Proceed to Payment'
        )}
      </Button>
    </div>
  </DialogContent>
</Dialog>
      </div>
    </DashboardLayout>
  )
}