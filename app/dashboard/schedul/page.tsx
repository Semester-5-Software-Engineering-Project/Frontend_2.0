'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar as CalendarIcon, ChevronLeft } from 'lucide-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ShieldAlert, CheckCircle, XCircle } from 'lucide-react'
import { useAuth, userType } from '@/contexts/AuthContext'
import { createSchedule } from '@/services/api'
import { DateTimePicker, formatDateTimeForLegacyAPI } from '@/components/ui/datetime-picker'
import { addDays } from 'date-fns'
import { useToast } from '@/hooks/use-toast'

interface ScheduleFormData {
  dateTime: Date | undefined
  duration: number
  recurrenceType: 'specific' | 'daily' | 'weekly'
  weekDay?: number // For weekly recurrence: 1=Monday, 2=Tuesday, ..., 7=Sunday
}

export default function Schedule() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [moduleId, setModuleId] = useState<string | null>(null)

  const [formData, setFormData] = useState<ScheduleFormData>({
    dateTime: undefined,
    duration: 60,
    recurrenceType: 'specific'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  // Get moduleId from localStorage or URL parameters as fallback
  useEffect(() => {
    console.log('=== Schedule Page Debug ===')
    
    // First try localStorage
    const storedModuleId = localStorage.getItem('scheduleModuleId')
    console.log('localStorage scheduleModuleId:', storedModuleId)
    
    // Then try URL parameters as fallback
    const urlModuleId = searchParams.get('moduleId')
    console.log('URL moduleId parameter:', urlModuleId)
    
    const finalModuleId = storedModuleId || urlModuleId
    console.log('Final moduleId to use:', finalModuleId)
    console.log('Final moduleId type:', typeof finalModuleId)
    console.log('Final moduleId length:', finalModuleId?.length)
    
    // Check if it looks like a UUID (36 characters with dashes)
    const isValidUUID = finalModuleId && finalModuleId.length === 36 && finalModuleId.includes('-')
    console.log('Is valid UUID format:', isValidUUID)
    
    if (finalModuleId) {
      // Check if it looks like a UUID (36 characters with dashes)
      const isValidUUID = finalModuleId.length === 36 && finalModuleId.includes('-')
      
      if (!isValidUUID) {
        console.warn('⚠️ WARNING: moduleId is not a valid UUID format:', finalModuleId)
        console.warn('Expected format: 550e8400-e29b-41d4-a716-446655440000')
        console.warn('Received format:', finalModuleId)
        console.warn('This may cause backend API errors')
      }
      
      setModuleId(finalModuleId)
      console.log('Set moduleId to:', finalModuleId)
      
      // If we got it from URL, store it in localStorage for future use
      if (!storedModuleId && urlModuleId) {
        localStorage.setItem('scheduleModuleId', urlModuleId)
        console.log('Stored URL moduleId to localStorage')
      }
    } else {
      console.log('No moduleId found in localStorage or URL')
    }
    
    console.log('=== End Debug ===')
  }, [searchParams])

  // Redirect if not a tutor
  if (user?.role !== userType.TUTOR) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-2xl mx-auto mt-12">
          <Alert variant="destructive" className="border-2 border-red-200 shadow-md">
            <ShieldAlert className="h-5 w-5" />
            <AlertTitle className="font-bold text-lg">Access Restricted</AlertTitle>
            <AlertDescription className="font-medium">
              Scheduling is available to tutors only.
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    )
  }

  // Redirect if no moduleId
  if (!moduleId) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-2xl mx-auto mt-12">
          <Alert variant="destructive" className="border-2 border-red-200 shadow-md">
            <ShieldAlert className="h-5 w-5" />
            <AlertTitle className="font-bold text-lg">Invalid Request</AlertTitle>
            <AlertDescription className="font-medium">
              No module selected for scheduling. Please go back and select a module.
            </AlertDescription>
          </Alert>
          <div className="mt-6 flex items-center space-x-4">
            <Button 
              onClick={() => router.push('/dashboard/courses')}
              variant="outline"
              className="border-gray-300 hover:bg-gray-50 font-semibold"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Modules
            </Button>
            {searchParams.get('moduleId') && (
              <Button 
                onClick={() => {
                  const urlModuleId = searchParams.get('moduleId')
                  if (urlModuleId) {
                    localStorage.setItem('scheduleModuleId', urlModuleId)
                    setModuleId(urlModuleId)
                  }
                }}
                className="bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-semibold"
              >
                Try Again
              </Button>
            )}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const handleInputChange = (field: keyof ScheduleFormData, value: string | number | Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setSubmitStatus({ type: null, message: '' })
  }

  const handleDateTimeChange = (dateTime: Date | undefined) => {
    setFormData(prev => ({ ...prev, dateTime }))
    setSubmitStatus({ type: null, message: '' })
  }

  const getWeekNumber = (recurrenceType: string, weekDay?: number): number => {
    switch (recurrenceType) {
      case 'specific':
        return 0
      case 'daily':
        return 8
      case 'weekly':
        return weekDay || 1 // Default to Monday if not specified
      default:
        return 0
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('=== Schedule Page Debug ============================================================================')
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      // Add debugging for moduleId
      console.log('Raw moduleId from localStorage:', moduleId)
      console.log('moduleId type:', typeof moduleId)
      console.log('moduleId length:', moduleId?.length)

      // const token = getAuthToken();
      // if (!token) {
      //   throw new Error('Authentication token not found. Please log in again.')
      // }

      // Validate dateTime
      if (!formData.dateTime) {
        throw new Error('Please select a date and time for the meeting.')
      }

      // Convert DateTime to separate date and time for backend compatibility
      const { date, time } = formatDateTimeForLegacyAPI(formData.dateTime)
      
      console.log('Selected DateTime:', formData.dateTime)
      console.log('Formatted date:', date)
      console.log('Formatted time:', time)
      console.log('ISO String:', formData.dateTime.toISOString())

      // Prepare the payload
      const payload = {
        moduleId: moduleId, // Keep as string UUID, don't parse as integer
        date: date,
        time: time,
        duration: formData.duration,
        weekNumber: getWeekNumber(formData.recurrenceType, formData.weekDay),
        recurrentType: formData.recurrenceType
      }
      console.log('Scheduling payload:', payload)
      // console.log('Using token:', token)

      // Make the API request
      const response = await createSchedule(payload as any)
      
      console.log('API Response:', response)
      console.log('Response success:', response.success)

      // Check for success - if we get a response without error, it means 201 status (success)
      if (response && (response.success !== false)) {
        const successMessage = 'Meeting scheduled successfully! Your schedule has been saved.'
        setSubmitStatus({
          type: 'success',
          message: successMessage
        })
        // Reset form
        setFormData({
          dateTime: undefined,
          duration: 60,
          recurrenceType: 'specific'
        })
        // Clear localStorage after successful scheduling
        localStorage.removeItem('scheduleModuleId')
      } else {
        // If response exists but success is explicitly false
        throw new Error((response as any)?.message || 'Failed to schedule meeting, Clashes with another schedule.')
      }
    } catch (error: any) {
      console.error('Error scheduling meeting:', error)
      console.error('Error status:', error.response?.status)
      console.error('Error data:', error.response?.data)
      console.error('Error message:', error.message)
      
      // Get all possible error messages
      const serverMessage = error.response?.data?.message || error.response?.data?.error || error.response?.data
      const errorMessage = serverMessage || error.message || ''
      const statusCode = error.response?.status
      
      console.log('Server message:', serverMessage)
      console.log('Full error message for checking:', errorMessage)
      console.log('Status code:', statusCode)
      
      let displayMessage = ''
      
      // Check for scheduling conflict in various ways
      const messageStr = String(errorMessage).toLowerCase()
      const isConflictError = 
        messageStr.includes('conflict') || 
        messageStr.includes('clash') ||
        messageStr.includes('overlap') ||
        messageStr.includes('already scheduled') ||
        messageStr.includes('time slot') ||
        messageStr.includes('duplicate') ||
        statusCode === 409 ||
        statusCode === 400 // Sometimes conflicts return 400
      
      if (isConflictError) {
        displayMessage = 'Schedule is clash with other schedule. Please choose a different time slot.'
      } else if (statusCode >= 400 && statusCode < 500) {
        // For client errors (400-499), assume it's likely a scheduling conflict
        displayMessage = 'Schedule is clash with other schedule. Please choose a different time slot.'
      } else {
        displayMessage = String(errorMessage) || 'Failed to schedule meeting. Please try again.'
      }
      
      console.log('Final display message:', displayMessage)
      
      setSubmitStatus({
        type: 'error',
        message: displayMessage
      })
      
      // ...no toast, only alert
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = formData.dateTime && formData.duration > 0 &&
                     (formData.recurrenceType !== 'weekly' || formData.weekDay)

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => router.push(`/dashboard/courses/${moduleId}`)}
              variant="outline"
              className="border-gray-300 hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Module
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Schedule Meeting</h1>
              <p className="text-gray-600 mt-1">Create a new meeting schedule for your module</p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl">
          {submitStatus.type && (
            <Alert 
              variant={submitStatus.type === 'success' ? 'default' : 'destructive'} 
              className={`mb-6 border-2 ${
                submitStatus.type === 'success' 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-red-200'
              }`}
            >
              {submitStatus.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <AlertTitle className="font-bold">
                {submitStatus.type === 'success' ? 'Success' : 'Error'}
              </AlertTitle>
              <AlertDescription className="font-medium">{submitStatus.message}</AlertDescription>
            </Alert>
          )}

          <Card className="border-none shadow-md">
            <CardHeader className="border-b border-gray-200 bg-gray-50">
              <CardTitle className="text-xl font-bold text-gray-900">Meeting Details</CardTitle>
              <CardDescription className="text-gray-600">
                Set up the date, time, and recurrence for your meeting
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* DateTime Picker */}
                <div className="space-y-2">
                  <Label htmlFor="datetime" className="text-sm font-semibold text-gray-900">
                    Meeting Date & Time
                  </Label>
                  <DateTimePicker
                    id="datetime"
                    value={formData.dateTime}
                    onChange={handleDateTimeChange}
                    placeholder="Select date and time for the meeting"
                    minDate={new Date()}
                    maxDate={addDays(new Date(), 365)} // 1 year ahead
                    required
                    className="w-full"
                  />
                  <p className="text-sm text-gray-600">
                    Select both date and time for your meeting. Times around midnight (00:00) are handled correctly.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-sm font-semibold text-gray-900">
                    Duration (minutes)
                  </Label>
                  <Select
                    value={formData.duration.toString()}
                    onValueChange={(value) => handleInputChange('duration', parseInt(value))}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recurrence" className="text-sm font-semibold text-gray-900">
                    Recurrence Type
                  </Label>
                  <Select
                    value={formData.recurrenceType}
                    onValueChange={(value: 'specific' | 'daily' | 'weekly') => {
                      handleInputChange('recurrenceType', value)
                      if (value !== 'weekly') {
                        setFormData(prev => ({ ...prev, weekDay: undefined }))
                      }
                    }}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]">
                      <SelectValue placeholder="Select recurrence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="specific">One-time meeting</SelectItem>
                      <SelectItem value="weekly">Weekly recurring</SelectItem>
                      <SelectItem value="daily">Daily recurring</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.recurrenceType === 'weekly' && (
                  <div className="space-y-2">
                    <Label htmlFor="weekDay" className="text-sm font-semibold text-gray-900">
                      Day of Week
                    </Label>
                    <Select
                      value={formData.weekDay?.toString() || ''}
                      onValueChange={(value) => handleInputChange('weekDay', parseInt(value))}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]">
                        <SelectValue placeholder="Select day of week" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Monday</SelectItem>
                        <SelectItem value="2">Tuesday</SelectItem>
                        <SelectItem value="3">Wednesday</SelectItem>
                        <SelectItem value="4">Thursday</SelectItem>
                        <SelectItem value="5">Friday</SelectItem>
                        <SelectItem value="6">Saturday</SelectItem>
                        <SelectItem value="7">Sunday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-center space-x-4 pt-6 border-t border-gray-200">
                  <Button
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    className="bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-semibold shadow-md"
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Scheduling...' : 'Schedule Meeting'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/dashboard/courses/${moduleId}`)}
                    disabled={isSubmitting}
                    className="border-gray-300 hover:bg-gray-50 font-semibold"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}