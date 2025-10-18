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
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { X, Upload, Plus, Save, Trash2 } from "lucide-react"
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
import { getModulesForTutor, getEnrollments, getAllModulesPublic, getMaterials, joinMeeting, upcomingSchedulesByModule, uploadMaterial } from '@/services/api'
// Schedules section state
import { UpcomingSessionResponse } from '@/types/api'
  // Schedules state

import { useToast } from '@/hooks/use-toast'
import { getCurrentDateTime } from '@/utils/dateUtils'
import { useAuth } from '@/contexts/AuthContext'
import ModuleRatingModal from '@/components/ui/ratingmodal'
import { EnrollmentApi } from '@/apis/EnrollmentApi'
import RatingApi, { RatingGetDto } from '@/apis/RatingApi'
import axiosInstance from '@/app/utils/axiosInstance'
import ModuleDescriptionApi, { ModuleDescriptionDto } from '@/apis/ModuleDescriptionApi'

import { createReport } from '@/apis/ReportApi'

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
        const { date, time } = getCurrentDateTime();
        const req: UpcomingSessionsRequest = {
          date,
          time,
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

  // Fetch enrollment ID using EnrollmentApi
  useEffect(() => {
    const fetchEnrollmentId = async () => {
      if (!params.id) {
        console.log('No module ID available in params')
        return
      }

      try {
        console.log('=== Fetching Enrollment ID ===')
        console.log('Module ID:', params.id)
        
        const fetchedEnrollmentId = await EnrollmentApi.getEnrollmentId(String(params.id))
        console.log('Enrollment ID:', fetchedEnrollmentId)
        console.log('================================')
        
        // Store the enrollment ID in state
        setEnrollmentId(fetchedEnrollmentId)
      } catch (error) {
        console.error('Error fetching enrollment ID:', error)
        setEnrollmentId(null)
      }
    }

    // Only fetch if user is a student (enrollment is for students)
    if (user?.role === 'STUDENT' && params.id) {
      fetchEnrollmentId()
    }
  }, [params.id, user?.role])

  // Fetch module ratings
  useEffect(() => {
    const fetchModuleRatings = async () => {
      if (!params.id) {
        console.log('No module ID available for fetching ratings')
        return
      }

      setRatingsLoading(true)
      try {
        console.log('=== Fetching Module Ratings ===')
        console.log('Module ID:', params.id)
        
        const ratings = await RatingApi.getRatingsByModuleId(String(params.id))
        console.log('Fetched ratings:', ratings)
        console.log('Number of ratings:', ratings.length)
        
        setModuleRatings(ratings)
      } catch (error) {
        console.error('Error fetching module ratings:', error)
        setModuleRatings([])
      } finally {
        setRatingsLoading(false)
      }
    }

    if (params.id) {
      fetchModuleRatings()
    }
  }, [params.id])

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [isJoiningMeeting, setIsJoiningMeeting] = useState(false)
  const [moduleDetails, setModuleDetails] = useState<LocalModule | null>(null)
  const [enrollment, setEnrollment] = useState<EnrollmentDetails | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [module, setModule] = useState<LocalModule | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false)
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null)
  const [moduleRatings, setModuleRatings] = useState<RatingGetDto[]>([])
  const [ratingsLoading, setRatingsLoading] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [editableProfile, setEditableProfile] = useState<UserProfile | null>(null)
  // Report Module state
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [isReporting, setIsReporting] = useState(false)
  
  // Module Description state
  const [showDescriptionDialog, setShowDescriptionDialog] = useState(false)
  const [moduleDescription, setModuleDescription] = useState<ModuleDescriptionDto | null>(null)
  const [descriptionExists, setDescriptionExists] = useState(false)
  const [descriptionPoints, setDescriptionPoints] = useState<string[]>([''])
  const [isLoadingDescription, setIsLoadingDescription] = useState(false)
  const [isSavingDescription, setIsSavingDescription] = useState(false)
  
  // Upload materials state
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadMaterials, setUploadMaterials] = useState<any[]>([])
  const [newMaterial, setNewMaterial] = useState({
    type: 'Document',
    title: '',
    description: '',
    url: '',
    file: null as File | null
  })
  const materialRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Helper function to convert ISO 8601 duration to readable format
  const formatDuration = (isoDuration: any): string => {
    // Handle null, undefined, or non-string values
    if (!isoDuration) return 'N/A'
    
    // Convert to string if it's not already
    const durationStr = String(isoDuration)
    
    // Parse PT2H30M format
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?/
    const match = durationStr.match(regex)
    if (!match) return durationStr

    const hours = parseInt(match[1] || '0')
    const minutes = parseInt(match[2] || '0')
    
    if (hours && minutes) {
      return `${hours}h ${minutes}m`
    } else if (hours) {
      return `${hours}h`
    } else if (minutes) {
      return `${minutes}m`
    }
    return durationStr
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
        const foundModule = modules.find((m: any) => m.moduleId === moduleId)
        console.log('Found module for tutor:', foundModule)
        // if (!foundModule) {
        // response = await axiosInstance.get('/api/modules/get-modulesfortutor')
        // console.log('Tutor modules response:', response.data)
        // const modules = response.data
        // const foundModule = modules.find((m: any) => m.moduleId === moduleId)
        // console.log('Found module for tutor:', foundModule)
        if (!foundModule) {
          throw new Error(`Module ${moduleId} not found in tutor's modules`)
        }
        return foundModule as LocalModule
        
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

  // Check if module description exists when module is loaded
  useEffect(() => {
    const checkDescriptionExists = async () => {
      if (!params.id || user?.role !== 'TUTOR') return
      
      try {
        const exists = await ModuleDescriptionApi.exists(String(params.id))
        setDescriptionExists(exists)
      } catch (error) {
        console.error('Error checking description existence:', error)
      }
    }

    checkDescriptionExists()
  }, [params.id, user?.role])

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


  // Handle rating submission
  const handleRatingSubmission = async (ratingData: { rating: number; feedback: string }) => {
    try {
      if (!enrollmentId) {
        toast({
          title: "Error",
          description: "Enrollment ID not found. Please try refreshing the page.",
          variant: "destructive",
        })
        return
      }

      console.log('=== Submitting Rating ===')
      console.log('Enrollment ID:', enrollmentId)
      console.log('Rating Data:', ratingData)

      const response = await RatingApi.createRating({
        enrolmentId: enrollmentId,
        rating: ratingData.rating,
        feedback: ratingData.feedback,
      })

      console.log('Rating submitted successfully:', response)
      toast({
        title: "Success",
        description: "Rating submitted successfully! Thank you for your feedback.",
      })
    } catch (error: any) {
      console.error('Error submitting rating:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to submit rating. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Module Description Functions
  const fetchModuleDescription = async (moduleId: string) => {
    setIsLoadingDescription(true)
    try {
      const exists = await ModuleDescriptionApi.exists(moduleId)
      setDescriptionExists(exists)
      
      if (exists) {
        const description = await ModuleDescriptionApi.getByModuleId(moduleId)
        setModuleDescription(description)
        setDescriptionPoints(description.descriptionPoints.length > 0 ? description.descriptionPoints : [''])
      } else {
        setDescriptionPoints([''])
      }
    } catch (error: any) {
      console.error('Error fetching module description:', error)
      setDescriptionPoints([''])
    } finally {
      setIsLoadingDescription(false)
    }
  }

  const handleOpenDescriptionDialog = async () => {
    if (!params.id) return
    setShowDescriptionDialog(true)
    await fetchModuleDescription(String(params.id))
  }

  const handleAddDescriptionPoint = () => {
    setDescriptionPoints([...descriptionPoints, ''])
  }

  const handleRemoveDescriptionPoint = (index: number) => {
    if (descriptionPoints.length === 1) {
      toast({
        title: "Warning",
        description: "At least one description point is required",
        variant: "destructive",
      })
      return
    }
    const newPoints = descriptionPoints.filter((_, i) => i !== index)
    setDescriptionPoints(newPoints)
  }

  const handleDescriptionPointChange = (index: number, value: string) => {
    const newPoints = [...descriptionPoints]
    newPoints[index] = value
    setDescriptionPoints(newPoints)
  }

  const handleSaveDescription = async () => {
    if (!params.id || !moduleDetails) {
      toast({
        title: "Error",
        description: "Module information is missing",
        variant: "destructive",
      })
      return
    }

    // Filter out empty points
    const filteredPoints = descriptionPoints.filter(point => point.trim() !== '')
    
    if (filteredPoints.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one description point",
        variant: "destructive",
      })
      return
    }

    setIsSavingDescription(true)
    try {
      const dto: ModuleDescriptionDto = {
        moduleId: String(params.id),
        name: moduleDetails.name,
        domain: moduleDetails.domain,
        price: moduleDetails.fee,
        tutorName: user?.name || '',
        descriptionPoints: filteredPoints
      }

      if (descriptionExists) {
        await ModuleDescriptionApi.update(String(params.id), dto)
        toast({
          title: "Success",
          description: "Module description updated successfully!",
        })
      } else {
        await ModuleDescriptionApi.create(dto)
        toast({
          title: "Success",
          description: "Module description created successfully!",
        })
        setDescriptionExists(true)
      }

      await fetchModuleDescription(String(params.id))
      setShowDescriptionDialog(false)
    } catch (error: any) {
      console.error('Error saving module description:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to save module description",
        variant: "destructive",
      })
    } finally {
      setIsSavingDescription(false)
    }
  }

  // When the dialog opens, fetch and prefill existing description points
  useEffect(() => {
    if (showDescriptionDialog && params.id) {
      fetchModuleDescription(String(params.id))
    }
  }, [showDescriptionDialog, params.id])

  const handleDeleteDescription = async () => {
    if (!params.id) return

    if (!confirm('Are you sure you want to delete this module description? This action cannot be undone.')) {
      return
    }

    setIsSavingDescription(true)
    try {
      await ModuleDescriptionApi.delete(String(params.id))
      toast({
        title: "Success",
        description: "Module description deleted successfully!",
      })
      setDescriptionExists(false)
      setModuleDescription(null)
      setDescriptionPoints([''])
      setShowDescriptionDialog(false)
    } catch (error: any) {
      console.error('Error deleting module description:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete module description",
        variant: "destructive",
      })
    } finally {
      setIsSavingDescription(false)
    }
  }

  // Upload Materials Functions
  const handleAddMaterial = () => {
    if (!newMaterial.title.trim()) {
      toast({
        title: "Error",
        description: 'Please enter a title for the material',
        variant: "destructive",
      })
      return
    }

    const material = {
      id: Date.now(),
      ...newMaterial,
      uploadDate: new Date().toISOString()
    }

    setUploadMaterials([...uploadMaterials, material])
    setNewMaterial({
      type: 'Document',
      title: '',
      description: '',
      url: '',
      file: null
    })
    toast({
      title: "Success",
      description: 'Material added successfully!',
    })
  }

  const handleRemoveMaterial = (id: number) => {
    setUploadMaterials(uploadMaterials.filter(m => m.id !== id))
    toast({
      title: "Success",
      description: 'Material removed',
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewMaterial({ ...newMaterial, file })
    }
  }

  const handleSaveAllMaterials = async () => {
    if (!params.id) {
      toast({
        title: "Error",
        description: "Module ID not found",
        variant: "destructive",
      })
      return
    }

    try {
      for (const material of uploadMaterials) {
        const formData = new FormData()
        formData.append('module_id', String(params.id))
        formData.append('title', material.title)
        formData.append('description', material.description || '')
        formData.append('type', material.type)

        if (material.type === 'Link') {
          formData.append('link', material.url || '')
        } else if (material.file) {
          formData.append('file', material.file)
        }

        console.log(
          'Uploading material:',
          formData.get('title'),
          formData.get('type'),
          formData.get('module_id'),
          formData.get('link') 
        )

        await uploadMaterial(formData)
      }

      toast({
        title: "Success",
        description: 'All materials uploaded successfully!',
      })
      setUploadMaterials([])
      setShowUploadDialog(false)
      // Refresh materials list
      if (params.id) {
        const refreshedMaterials = await getMaterials(String(params.id))
        setLectureMaterials(refreshedMaterials || [])
      }
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: 'Failed to upload materials',
        variant: "destructive",
      })
    }
  }

  const getIconForMaterialType = (type: string) => {
    switch (type) {
      case 'Document':
        return <FileText className="w-5 h-5 text-red-500" />
      case 'Video':
        return <Video className="w-5 h-5 text-blue-500" />
      case 'Link':
        return <LinkIcon className="w-5 h-5 text-green-500" />
      default:
        return <FileText className="w-5 h-5 text-gray-500" />
    }
  }

 
  // Helper function to render stars for rating display
  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`full-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      )
    }
    
    // Half star
    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />
      )
    }
    
    // Empty stars
    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      )
    }
    
    return stars
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-16 h-16 text-[#FBBF24] animate-spin" />
              <span className="text-lg font-semibold text-gray-900">Loading module details...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="border-none shadow-md">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <h3 className="text-2xl font-bold text-red-600">❌</h3>
                </div>
                <h3 className="text-xl font-bold text-red-600 mb-3">Error Loading Module</h3>
                <p className="text-gray-700 mb-6 max-w-2xl mx-auto">{error}</p>
                
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
                  <div className="text-left bg-yellow-50 border-2 border-[#FBBF24] p-6 rounded-xl mb-6 max-w-2xl mx-auto">
                    <h4 className="font-bold mb-3 text-gray-900 flex items-center">
                      💡 <span className="ml-2">Possible Solutions:</span>
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-2">
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>You might not be enrolled in this module yet</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>The module ID in the URL might be incorrect</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Try going back to the main courses page and clicking the module from there</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Contact your tutor or administrator for enrollment assistance</span>
                      </li>
                    </ul>
                  </div>
                )}
                
                <div className="flex space-x-3 justify-center">
                  <Button 
                    onClick={() => window.location.reload()} 
                    className="mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold"
                  >
                    Try Again
                  </Button>
                  <Button 
                    onClick={() => router.push('/dashboard/courses')}
                    variant="outline"
                    className="mt-4 border-gray-300 hover:bg-gray-50"
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
              <Card className="mx-auto max-w-md border-none shadow-lg">
                <CardHeader className="text-center bg-gradient-to-r from-yellow-50 to-white border-b">
                  <CardTitle className="text-2xl text-[#FBBF24] font-bold">💳 Payment Required</CardTitle>
                  <CardDescription className="text-gray-700 mt-2">
                    You need to pay for this course to view the content.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center p-6">
                  <div className="space-y-6">
                    <div className="p-6 bg-gradient-to-r from-gray-50 to-white rounded-xl border-2 border-[#FBBF24]">
                      <h3 className="font-bold text-lg text-gray-900">{course.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{course.domain}</p>
                      <p className="text-3xl font-bold text-[#FBBF24] mt-4">
                        Rs. {course.fee} <span className="text-sm text-gray-500">LKR</span>
                      </p>
                    </div>
                    <Button 
                      onClick={() => setShowPaymentDialog(true)}
                      className="w-full bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-bold"
                      size="lg"
                    >
                      💳 Pay for Course
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
                <div className={`fixed top-20 left-4 z-50 transition-all duration-300 ease-in-out ${
                  sidebarCollapsed ? 'translate-x-0' : '-translate-x-full'
                }`}>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="rounded-full w-10 h-10 shadow-lg bg-[#FBBF24] hover:bg-[#F59E0B] text-black"
                  >
                    <ChevronRight className="w-5 h-5"/>
                  </Button>
                </div>
              </>
            )}

            {/* Top Actions */}
            <div className={`flex justify-between items-center space-x-4 ${sidebarCollapsed ? 'ml-0' : 'ml-0 lg:ml-80 md:ml-72 sm:ml-64'}`}>
              <Button 
                onClick={() => router.push('/dashboard/courses')}
                variant="outline"
                className="flex items-center space-x-2 border-gray-300 hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Modules</span>
              </Button>
              
              <div className="flex items-center space-x-2 flex-wrap">
                {user?.role === 'TUTOR' && (
                  <>
                    <Button 
                      onClick={() => setShowUploadDialog(true)}
                      variant="outline"
                      className="flex items-center space-x-2 border-gray-300 hover:bg-yellow-50"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Materials</span>
                    </Button>
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
                      className="flex items-center space-x-2 border-gray-300 hover:bg-yellow-50"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Schedule Meeting</span>
                    </Button>
                    <Button 
                      onClick={handleOpenDescriptionDialog}
                      variant="outline"
                      className="flex items-center space-x-2 border-gray-300 hover:bg-yellow-50"
                    >
                      <FileText className="w-4 h-4" />
                      <span>{descriptionExists ? 'Edit Description' : 'Add Description'}</span>
                    </Button>
                  </>
                )}
                
                {user?.role === 'STUDENT' && (
                  <>
                    <Button 
                      onClick={() => setIsRatingModalOpen(true)}
                      variant="outline"
                      className="flex items-center space-x-2 border-[#FBBF24] text-gray-700 hover:bg-yellow-50"
                    >
                      <Star className="w-4 h-4 text-[#FBBF24]" />
                      <span>Rate Module</span>
                    </Button>
                    <Button
                      onClick={() => setShowReportDialog(true)}
                      variant="outline"
                      className="flex items-center space-x-2 border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Report Module</span>
                    </Button>
                  </>
                )}
                
                <Button 
                  onClick={handleJoinMeeting}
                  disabled={isJoiningMeeting}
                  className="flex items-center space-x-2 bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-semibold"
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
              <div className="relative overflow-hidden rounded-2xl shadow-lg">
                <img 
                  src={course.image} 
                  alt={course.title}
                  className="w-full h-72 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end">
                  <div className="p-8 text-white w-full">
                    <h1 className="text-4xl font-bold mb-3">{course.title}</h1>
                    <p className="text-lg text-gray-200 mb-4">{course.description}</p>
                    <div className="flex items-center space-x-6 flex-wrap">
                      <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                        <Star className="w-5 h-5 text-[#FBBF24] fill-current" />
                        <span className="font-semibold">{course.rating.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-white border-white bg-white/20 backdrop-blur-sm">
                          {course.domain}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 bg-[#FBBF24]/90 backdrop-blur-sm px-4 py-1 rounded-full">
                        <span className="text-lg font-bold text-black">Rs. {course.fee}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Module Information */}
              <Card className="border-none shadow-md">
                <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl text-gray-900">Module Information</CardTitle>
                      <CardDescription className="text-gray-600">Details about this learning module</CardDescription>
                    </div>
                    {user?.role === 'TUTOR' && descriptionExists && (
                      <Button 
                        onClick={handleDeleteDescription}
                        variant="outline"
                        className="flex items-center space-x-2 border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Description</span>
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">Status</h4>
                      <Badge 
                        variant={course.status === 'active' ? 'default' : 'secondary'}
                        className={course.status === 'active' ? 'bg-green-100 text-green-700 border-green-300 font-semibold' : 'bg-gray-100 text-gray-700 font-semibold'}
                      >
                        {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">Domain</h4>
                      <p className="font-bold text-gray-900">{course.domain}</p>
                    </div>
                    
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                {/* Materials Sidebar */}
                <div className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 ease-in-out ${
                  sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'
                }`}>
                  <Card className="h-full w-80 lg:w-80 md:w-72 sm:w-64 rounded-none border-r border-b border-l-0 border-t-0 shadow-xl">
                    <CardHeader className="pb-3 border-b bg-gradient-to-r from-yellow-50 to-white">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold text-gray-900">Module Materials</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSidebarCollapsed(true)}
                          className="p-2 h-8 w-8 hover:bg-yellow-100 rounded-full"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="overflow-y-auto h-[calc(100vh-80px)] p-0">
                      {lectureMaterials.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                          <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <BookOpen className="w-8 h-8 text-[#FBBF24]" />
                          </div>
                          <p className="text-sm font-medium">No materials available yet</p>
                        </div>
                      ) : (
                        lectureMaterials.map((material) => (
                          <button
                            key={material.id || material.material_id}
                            onClick={() => handleMaterialClick(material.id || material.material_id)}
                            className="w-full text-left p-4 hover:bg-yellow-50 transition-colors flex items-center justify-between border-b border-gray-100"
                          >
                            <div className="flex items-center space-x-3">
                              {material.type === 'Document' && (
                                <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                                  <FileText className="w-4 h-4 text-red-500" />
                                </div>
                              )}
                              {material.type === 'Link' && (
                                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                                  <LinkIcon className="w-4 h-4 text-green-500" />
                                </div>
                              )}
                              {material.type === 'Video' && (
                                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                  <Video className="w-4 h-4 text-blue-500" />
                                </div>
                              )}
                              {material.type !== 'Document' && material.type !== 'Link' && material.type !== 'Video' && (
                                <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                                  <FileText className="w-4 h-4 text-gray-500" />
                                </div>
                              )}
                              <div>
                                <h4 className="font-semibold text-sm text-gray-900">{material.title}</h4>
                                <p className="text-xs text-gray-500">
                                  {material.type === 'Document' && 'PDF Document'}
                                  {material.type === 'Link' && 'External Resource'}
                                  {material.type === 'Video' && 'Video Content'}
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
                    <Card className="border-none shadow-md">
                      <CardContent className="p-12 text-center">
                        <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <BookOpen className="w-10 h-10 text-[#FBBF24]" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Materials Yet</h3>
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
                        className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl hover:shadow-md hover:border-[#FBBF24] transition-all bg-white"
                      >
                        {material.type === 'Document' && (
                          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                            <FileText className="w-6 h-6 text-red-500" />
                          </div>
                        )}
                        {material.type === 'Link' && (
                          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                            <LinkIcon className="w-6 h-6 text-green-500" />
                          </div>
                        )}
                        {material.type === 'Video' && (
                          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                            <Video className="w-6 h-6 text-blue-500" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-bold text-sm text-gray-900">{material.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {material.type === 'Document' && 'PDF Document'}
                            {material.type === 'Link' && 'External Resource'}
                            {material.type === 'Video' && 'Video Content'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {material.type === 'Video' && (
                            <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                              <Play className="w-4 h-4 mr-1" />
                              Watch
                            </Button>
                          )}
                          {material.type === 'Link' && (
                            <Button size="sm" variant="outline" className="border-green-300 text-green-700 hover:bg-green-50" asChild>
                              <a href={material.url} target="_blank" rel="noopener noreferrer">
                                <LinkIcon className="w-4 h-4 mr-1" />
                                Open
                              </a>
                            </Button>
                          )}
                          {material.type === 'Document' && (
                            <Button size="sm" className="bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-semibold" onClick={() => handleDownload(material.id || material.material_id)}>
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}

                  {/* Schedules Section */}
                  <Card className="border-none shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-black rounded-t-xl">
                      <CardTitle className="text-2xl font-bold">Schedules</CardTitle>
                      <CardDescription className="text-black/80">All upcoming and past schedules for this module</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      {schedulesLoading ? (
                        <div className="text-center py-8">
                          <Loader2 className="animate-spin inline w-8 h-8 text-[#FBBF24] mb-2" />
                          <p className="text-gray-600">Loading schedules...</p>
                        </div>
                      ) : schedulesError ? (
                        <div className="text-red-500 text-center py-8 bg-red-50 rounded-lg p-4">
                          <p className="font-semibold">{schedulesError}</p>
                        </div>
                      ) : schedules.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-10 h-10 text-gray-400" />
                          </div>
                          <p className="text-gray-600 font-medium">No schedules found for this module.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {schedules.map((session) => (
                            <div key={session.schedule_id} className="border-l-4 border-[#FBBF24] pl-6 py-3 bg-yellow-50 rounded-r-lg hover:shadow-md transition-shadow">
                              <h4 className="font-bold text-base text-gray-900">{session.tutor}</h4>
                              <p className="text-sm text-gray-600 mt-1">{session.course}</p>
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-gray-500" />
                                  <p className="text-sm text-gray-700 font-medium">{session.Date} {session.time}</p>
                                </div>
                                <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs font-semibold">{session.duration}min</Badge>
                              </div>
                              <Button
                                size="sm"
                                className={`w-full mt-3 font-semibold ${
                                  session.active 
                                    ? 'bg-[#FBBF24] hover:bg-[#F59E0B] text-black' 
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
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
                {/* Ratings & Feedback Section */}
                <div>
                  <Card className="border-none shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-black rounded-t-xl">
                      <CardTitle className="flex items-center space-x-2 text-2xl font-bold">
                        <Star className="w-6 h-6 fill-black" />
                        <span>Student Ratings & Feedback</span>
                      </CardTitle>
                      <CardDescription className="text-black/80">
                        Reviews from students who have taken this module
                        {moduleRatings.length > 0 && (
                          <span className="ml-2 text-sm font-bold">
                            ({moduleRatings.length} review{moduleRatings.length !== 1 ? 's' : ''})
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Loading State */}
                        {ratingsLoading && (
                          <div className="flex items-center justify-center py-12">
                            <div className="flex flex-col items-center space-y-3">
                              <Loader2 className="w-10 h-10 animate-spin text-[#FBBF24]" />
                              <span className="text-gray-600">Loading ratings...</span>
                            </div>
                          </div>
                        )}

                        {/* Ratings List */}
                        {!ratingsLoading && moduleRatings.length > 0 && (
                          <>
                            {moduleRatings.map((rating, index) => (
                              <div key={`${rating.enrolmentId}-${index}`} className="border border-gray-200 rounded-xl p-6 bg-white hover:shadow-lg hover:border-[#FBBF24] transition-all">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-[#FBBF24] to-[#F59E0B] rounded-full flex items-center justify-center">
                                      <span className="text-black font-bold text-lg">
                                        {(rating.studentName || 'A').charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-base text-gray-900">
                                        {rating.studentName || 'Anonymous Student'}
                                      </h4>
                                      <div className="flex items-center space-x-1 mt-1">
                                        {renderStars(rating.rating)}
                                        <span className="ml-2 text-sm font-bold text-[#FBBF24]">
                                          {rating.rating}/5
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  {rating.createdAt && (
                                    <Badge className="bg-gray-100 text-gray-600 border-gray-200">
                                      {new Date(rating.createdAt).toLocaleDateString()}
                                    </Badge>
                                  )}
                                </div>
                                {rating.feedback && (
                                  <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                                    &quot;{rating.feedback}&quot;
                                  </p>
                                )}
                                {!rating.feedback && (
                                  <p className="text-sm text-gray-400 italic">
                                    No written feedback provided
                                  </p>
                                )}
                              </div>
                            ))}
                          </>
                        )}

                        {/* No Ratings State */}
                        {!ratingsLoading && moduleRatings.length === 0 && (
                          <div className="text-center py-16">
                            <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Star className="w-12 h-12 text-[#FBBF24]" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-gray-900">No Ratings Yet</h3>
                            <p className="text-gray-600 max-w-md mx-auto">
                              This module hasn&apos;t received any student ratings yet. Be the first to share your experience!
                            </p>
                          </div>
                        )}
                      </div>
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
    className="sm:max-w-4xl border-none shadow-2xl" 
    onPointerDownOutside={(e) => e.preventDefault()} 
    onEscapeKeyDown={(e) => e.preventDefault()}
  >
    {/* Custom Close Button */}
    <DialogClose asChild>
      <button
        onClick={() => router.push("/dashboard/courses")}
        className="absolute right-4 top-4 rounded-full bg-gray-100 p-2 opacity-70 
                  transition-all hover:opacity-100 hover:bg-gray-200 focus:outline-none z-50"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </DialogClose>

    <DialogHeader className="pb-6">
      <DialogTitle className="text-2xl font-bold text-gray-900">Complete Your Purchase</DialogTitle>
      <DialogDescription className="text-gray-600">
        Review your details and proceed with payment
      </DialogDescription>
    </DialogHeader>

    <div className="grid md:grid-cols-3 gap-6">
      {/* Left Column - Course Details */}
      <div className="md:col-span-1">
        <div className="p-6 bg-gradient-to-br from-[#FBBF24] to-[#F59E0B] rounded-xl h-full shadow-lg">
          <p className="text-sm text-black/70 mb-3 font-medium uppercase tracking-wide">{course?.domain}</p>
          <h1 className="font-bold text-xl text-black mb-6">{course?.title}</h1>
          <div className="mt-auto pt-4 border-t border-black/20">
            <p className="text-xs text-black/70 mb-1 uppercase tracking-wide">Total Amount</p>
            <p className="text-4xl font-bold text-black">
              Rs. {course?.fee}
            </p>
            <p className="text-sm text-black/70 mt-1">LKR</p>
          </div>
        </div>
      </div>

      {/* Right Column - Billing Information */}
      {editableProfile && (
        <div className="md:col-span-2 space-y-5">
          <h4 className="font-bold text-lg text-gray-900">Billing Information</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700">First Name *</Label>
              <Input 
                id="firstName" 
                value={editableProfile.firstName} 
                onChange={(e) => setEditableProfile({
                  ...editableProfile,
                  firstName: e.target.value
                })}
                placeholder="John"
                className="h-11 mt-1 border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]"
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700">Last Name *</Label>
              <Input 
                id="lastName" 
                value={editableProfile.lastName} 
                onChange={(e) => setEditableProfile({
                  ...editableProfile,
                  lastName: e.target.value
                })}
                placeholder="Doe"
                className="h-11 mt-1 border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address" className="text-sm font-semibold text-gray-700">Address *</Label>
            <Input 
              id="address" 
              value={editableProfile.address} 
              onChange={(e) => setEditableProfile({
                ...editableProfile,
                address: e.target.value
              })}
              placeholder="123 Main Street"
              className="h-11 mt-1 border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city" className="text-sm font-semibold text-gray-700">City *</Label>
              <Input 
                id="city" 
                value={editableProfile.city} 
                onChange={(e) => setEditableProfile({
                  ...editableProfile,
                  city: e.target.value
                })}
                placeholder="New York"
                className="h-11 mt-1 border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]"
              />
            </div>
            <div>
              <Label htmlFor="country" className="text-sm font-semibold text-gray-700">Country *</Label>
              <Input 
                id="country" 
                value={editableProfile.country} 
                onChange={(e) => setEditableProfile({
                  ...editableProfile,
                  country: e.target.value
                })}
                placeholder="United States"
                className="h-11 mt-1 border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone Number *</Label>
            <Input 
              id="phone" 
              value={editableProfile.phoneNumber} 
              onChange={(e) => setEditableProfile({
                ...editableProfile,
                phoneNumber: e.target.value
              })}
              placeholder="+1 (555) 000-0000"
              className="h-11 mt-1 border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]"
            />
          </div>
        </div>
      )}
    </div>

    {/* Action Buttons */}
    <div className="flex gap-4 pt-6 border-t border-gray-200">
      <Button 
        onClick={() => router.push('/dashboard/courses')}
        variant="outline"
        disabled={isProcessingPayment}
        className="flex-1 h-12 font-semibold border-gray-300 hover:bg-gray-100"
      >
        Cancel
      </Button>
      <Button 
        onClick={startPayment}
        disabled={isProcessingPayment}
        className="flex-1 h-12 bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-bold text-base"
      >
        {isProcessingPayment ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
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
      
      {/* Upload Materials Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto border-none shadow-2xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl font-bold text-gray-900">Upload Course Materials</DialogTitle>
            <DialogDescription className="text-gray-600">
              Add documents, videos, or links for this module
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload Form */}
            <div className="lg:col-span-2">
              <Card className="border-none shadow-lg">
                <CardHeader className="bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-black rounded-t-xl">
                  <CardTitle className="text-xl font-bold">Add New Material</CardTitle>
                  <CardDescription className="text-black/80">Upload documents, videos, or add links</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  {/* Material Type */}
                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-gray-700">Material Type</Label>
                    <Tabs 
                      value={newMaterial.type} 
                      onValueChange={(value) => setNewMaterial({...newMaterial, type: value})}
                    >
                      <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1">
                        <TabsTrigger value="Document" className="data-[state=active]:bg-[#FBBF24] data-[state=active]:text-black font-semibold">Document</TabsTrigger>
                        <TabsTrigger value="Video" className="data-[state=active]:bg-[#FBBF24] data-[state=active]:text-black font-semibold">Video</TabsTrigger>
                        <TabsTrigger value="Link" className="data-[state=active]:bg-[#FBBF24] data-[state=active]:text-black font-semibold">Link</TabsTrigger>
                      </TabsList>

                      <TabsContent value="Document" className="mt-4">
                        <Label className="text-sm font-semibold text-gray-700">Upload Document</Label>
                        <Input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={handleFileChange} className="mt-2 h-11 border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]" />
                      </TabsContent>

                      <TabsContent value="Video" className="mt-4">
                        <Label className="text-sm font-semibold text-gray-700">Upload Video</Label>
                        <Input type="file" accept=".mp4,.mov,.avi,.wmv" onChange={handleFileChange} className="mt-2 h-11 border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]" />
                      </TabsContent>

                      <TabsContent value="Link" className="mt-4">
                        <Label className="text-sm font-semibold text-gray-700">External Link</Label>
                        <Input 
                          type="url" 
                          placeholder="https://example.com"
                          value={newMaterial.url}
                          onChange={(e) => setNewMaterial({...newMaterial, url: e.target.value})}
                          className="mt-2 h-11 border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]"
                        />
                      </TabsContent>
                    </Tabs>
                  </div>

                  {/* Material Details */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title" className="text-sm font-bold text-gray-700">Material Title</Label>
                      <Input 
                        id="title"
                        value={newMaterial.title}
                        onChange={(e) => setNewMaterial({...newMaterial, title: e.target.value})}
                        placeholder="Enter material title"
                        className="mt-2 h-11 border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-bold text-gray-700">Description</Label>
                      <Textarea 
                        value={newMaterial.description}
                        onChange={(e) => setNewMaterial({...newMaterial, description: e.target.value})}
                        placeholder="Enter material description"
                        className="mt-2 border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]"
                        rows={4}
                      />
                    </div>
                  </div>

                  <Button onClick={handleAddMaterial} className="w-full h-12 bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-bold text-base">
                    <Plus className="w-5 h-5 mr-2" /> Add Material
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Preview */}
            <div className="space-y-6">
              <Card className="border-none shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-xl">
                  <CardTitle className="text-lg font-bold">Upload Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Materials Added</span>
                    <Badge className="bg-[#FBBF24] text-black font-bold text-base px-3 py-1">{uploadMaterials.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Current Module</span>
                    <span className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">{moduleDetails?.name || 'Loading...'}</span>
                  </div>
                  <Button 
                    onClick={handleSaveAllMaterials}
                    disabled={uploadMaterials.length === 0}
                    className="w-full h-11 bg-green-500 hover:bg-green-600 text-white font-bold disabled:bg-gray-300"
                  >
                    <Save className="w-4 h-4 mr-2" /> Save Materials
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Materials */}
              <Card className="border-none shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-xl">
                  <CardTitle className="text-lg font-bold">Added Materials</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {uploadMaterials.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-10 h-10 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No materials added yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {uploadMaterials.map((m) => (
                        <div key={m.id} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl hover:shadow-md hover:border-[#FBBF24] transition-all bg-white">
                          {getIconForMaterialType(m.type)}
                          <div className="flex-1">
                            <h4 className="font-bold text-sm text-gray-900">{m.title}</h4>
                            <p className="text-xs text-gray-500 capitalize mt-1">{m.type}</p>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => handleRemoveMaterial(m.id)} className="hover:bg-red-50">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Module Description Dialog */}
      <Dialog open={showDescriptionDialog} onOpenChange={setShowDescriptionDialog}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto border-none shadow-2xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {descriptionExists ? 'Edit Module Description' : 'Create Module Description'}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Add detailed description points for this module. Each point will be displayed separately.
            </DialogDescription>
          </DialogHeader>

          {isLoadingDescription ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-3">
                <Loader2 className="w-10 h-10 animate-spin text-[#FBBF24]" />
                <span className="text-gray-600">Loading description...</span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Description Points */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-bold text-gray-900">Description Points</Label>
                  <Button
                    onClick={handleAddDescriptionPoint}
                    variant="outline"
                    size="sm"
                    className="border-[#FBBF24] text-gray-700 hover:bg-yellow-50"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Point
                  </Button>
                </div>

                <div className="space-y-3">
                  {descriptionPoints.map((point, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-[#FBBF24] rounded-full flex items-center justify-center text-black font-bold mt-2">
                        {index + 1}
                      </div>
                      <Textarea
                        value={point}
                        onChange={(e) => handleDescriptionPointChange(index, e.target.value)}
                        placeholder={`Enter description point ${index + 1}...`}
                        className="flex-1 w-full max-w-full border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24] min-h-[80px] resize-y overflow-wrap break-words"
                        style={{ resize: 'vertical' }}
                        rows={3}
                      />
                      {descriptionPoints.length > 1 && (
                        <Button
                          onClick={() => handleRemoveDescriptionPoint(index)}
                          variant="ghost"
                          size="sm"
                          className="hover:bg-red-50 mt-2 flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {descriptionPoints.length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500">No description points added yet. Click &quot;Add Point&quot; to start.</p>
                  </div>
                )}
              </div>

              {/* Preview Section */}
              <Card className="border-none shadow-lg bg-gradient-to-br from-yellow-50 to-white">
                <CardHeader className="bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-black rounded-t-xl">
                  <CardTitle className="text-lg font-bold">Preview</CardTitle>
                  <CardDescription className="text-black/80">
                    How your description will appear to students
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {descriptionPoints.filter(p => p.trim() !== '').length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No description points to preview</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {descriptionPoints
                        .filter(point => point.trim() !== '')
                        .map((point, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                            <div className="flex-shrink-0 w-6 h-6 bg-[#FBBF24] rounded-full flex items-center justify-center text-black font-bold text-sm">
                              {index + 1}
                            </div>
                            <p className="flex-1 text-gray-700 leading-relaxed">{point}</p>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                {descriptionExists && (
                  <Button
                    onClick={handleDeleteDescription}
                    variant="outline"
                    disabled={isSavingDescription}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                )}
                <Button
                  onClick={() => setShowDescriptionDialog(false)}
                  variant="outline"
                  disabled={isSavingDescription}
                  className="flex-1 h-12 font-semibold border-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveDescription}
                  disabled={isSavingDescription || descriptionPoints.filter(p => p.trim() !== '').length === 0}
                  className="flex-1 h-12 bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-bold text-base"
                >
                  {isSavingDescription ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      {descriptionExists ? 'Update Description' : 'Create Description'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Rating Modal */}
      <ModuleRatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        moduleTitle={moduleDetails?.name || 'Module'}
        onSubmitRating={handleRatingSubmission}
      />

      {/* Report Module Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="sm:max-w-lg border-none shadow-2xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl font-bold text-gray-900">Report Module</DialogTitle>
            <DialogDescription className="text-gray-600">
              Please describe the reason for reporting this module. Your report will be reviewed by our team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Label htmlFor="report-reason" className="text-sm font-semibold text-gray-700">Reason *</Label>
            <Textarea
              id="report-reason"
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
              placeholder="Describe the issue with this module..."
              className="min-h-[100px] border-gray-300 focus:border-red-400 focus:ring-red-400"
              rows={4}
            />
          </div>
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <Button
              onClick={() => setShowReportDialog(false)}
              variant="outline"
              disabled={isReporting}
              className="flex-1 h-12 font-semibold border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                // Validate UUID format for moduleId
                const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
                if (!reportReason.trim() || !params.id || !uuidRegex.test(String(params.id))) {
                  toast({
                    title: 'Error',
                    description: 'Please provide a valid reason and valid module ID (UUID).',
                    variant: 'destructive',
                  });
                  return;
                }
                setIsReporting(true);
                try {
                  await createReport({
                    moduleId: String(params.id),
                    reason: reportReason.trim(),
                  });
                  toast({
                    title: 'Report Submitted',
                    description: 'Thank you for reporting. We will review your report shortly.',
                    variant: 'default',
                  });
                  setShowReportDialog(false);
                  setReportReason('');
                } catch (error: any) {
                  toast({
                    title: 'Error',
                    description: error?.message || 'Failed to submit report. Please try again.',
                    variant: 'destructive',
                  });
                } finally {
                  setIsReporting(false);
                }
              }}
              disabled={isReporting || !reportReason.trim()}
              className="flex-1 h-12 bg-red-500 hover:bg-red-600 text-white font-bold text-base"
            >
              {isReporting ? 'Reporting...' : 'Submit Report'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}