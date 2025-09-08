'use client'

import { useState, useEffect } from 'react'
import Cookies from "js-cookie";
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
import { useAuth } from '@/contexts/AuthContext'
import axios from 'axios'

interface ScheduleFormData {
  date: string
  time: string
  duration: number
  recurrenceType: 'specific' | 'daily' | 'weekly'
  weekDay?: number // For weekly recurrence: 1=Monday, 2=Tuesday, ..., 7=Sunday
}

export default function Schedule() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [moduleId, setModuleId] = useState<string | null>(null)

  const [formData, setFormData] = useState<ScheduleFormData>({
    date: '',
    time: '',
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
  if (user?.role !== 'TUTOR') {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Alert variant="destructive" className="max-w-2xl">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Access Restricted</AlertTitle>
            <AlertDescription>
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
        <div className="p-6">
          <Alert variant="destructive" className="max-w-2xl">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Invalid Request</AlertTitle>
            <AlertDescription>
              No module selected for scheduling. Please go back and select a module.
            </AlertDescription>
          </Alert>
          <div className="mt-4 space-x-2">
            <Button 
              onClick={() => router.push('/dashboard/courses')}
              variant="outline"
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
                variant="default"
              >
                Try Again
              </Button>
            )}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const handleInputChange = (field: keyof ScheduleFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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

      const token = Cookies.get('jwt_token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.')
      }

      // Prepare the payload
      const payload = {
        moduleId: moduleId, // Keep as string UUID, don't parse as integer
        date: formData.date,
        time: formData.time,
        duration: formData.duration,
        weekNumber: getWeekNumber(formData.recurrenceType, formData.weekDay),
        recurrentType: formData.recurrenceType
      }
      console.log('Scheduling payload:', payload)
      console.log('Using token:', token)

      // Make the API request WITHOUT credentials
      const response = await axios.post(
        'http://localhost:8080/api/schedules/create',
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true // Explicitly set to false
        }
      )

      if (response.status === 200 || response.status === 201) {
        setSubmitStatus({
          type: 'success',
          message: 'Meeting scheduled successfully!'
        })
        
        // Reset form
        setFormData({
          date: '',
          time: '',
          duration: 60,
          recurrenceType: 'specific'
        })
        
        // Clear localStorage after successful scheduling
        localStorage.removeItem('scheduleModuleId')
      }
    } catch (error: any) {
      console.error('Error scheduling meeting:', error)
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.message || error.message || 'Failed to schedule meeting. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = formData.date && formData.time && formData.duration > 0 &&
                     (formData.recurrenceType !== 'weekly' || formData.weekDay)

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Button 
            onClick={() => router.push(`/dashboard/courses/${moduleId}`)}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Module</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Schedule Meeting</h1>
            <p className="text-gray-600">Create a new meeting schedule for Module {moduleId}</p>
          </div>
        </div>

        <div className="max-w-2xl">
          {submitStatus.type && (
            <Alert variant={submitStatus.type === 'success' ? 'default' : 'destructive'} className="mb-6">
              {submitStatus.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {submitStatus.type === 'success' ? 'Success' : 'Error'}
              </AlertTitle>
              <AlertDescription>{submitStatus.message}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Meeting Details</CardTitle>
              <CardDescription>
                Set up the date, time, and recurrence for your meeting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Select
                    value={formData.duration.toString()}
                    onValueChange={(value) => handleInputChange('duration', parseInt(value))}
                  >
                    <SelectTrigger>
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
                  <Label htmlFor="recurrence">Recurrence Type</Label>
                  <Select
                    value={formData.recurrenceType}
                    onValueChange={(value: 'specific' | 'daily' | 'weekly') => {
                      handleInputChange('recurrenceType', value)
                      if (value !== 'weekly') {
                        setFormData(prev => ({ ...prev, weekDay: undefined }))
                      }
                    }}
                  >
                    <SelectTrigger>
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
                    <Label htmlFor="weekDay">Day of Week</Label>
                    <Select
                      value={formData.weekDay?.toString() || ''}
                      onValueChange={(value) => handleInputChange('weekDay', parseInt(value))}
                    >
                      <SelectTrigger>
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

                <div className="flex items-center space-x-4 pt-4">
                  <Button
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    className="flex items-center space-x-2"
                  >
                    <CalendarIcon className="w-4 h-4" />
                    <span>{isSubmitting ? 'Scheduling...' : 'Schedule Meeting'}</span>
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/dashboard/courses/${moduleId}`)}
                    disabled={isSubmitting}
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