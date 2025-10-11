'use client'

import { useState } from 'react'
import Cookies from "js-cookie";
import { useSearchParams, useRouter } from 'next/navigation'
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
  const moduleId = searchParams.get('moduleId')

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

  // Redirect if not a tutor
  if (user?.role !== 'TUTOR') {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Alert variant="destructive" className="max-w-2xl border-red-300 bg-red-50 shadow-lg">
            <ShieldAlert className="h-5 w-5 text-red-600" />
            <AlertTitle className="font-bold text-lg">Access Restricted</AlertTitle>
            <AlertDescription className="text-red-800 font-medium">
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
          <Alert variant="destructive" className="max-w-2xl border-red-300 bg-red-50 shadow-lg">
            <ShieldAlert className="h-5 w-5 text-red-600" />
            <AlertTitle className="font-bold text-lg">Invalid Request</AlertTitle>
            <AlertDescription className="text-red-800 font-medium">
              No module selected for scheduling. Please go back and select a module.
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => router.push('/dashboard/courses')}
            className="mt-4 h-11 bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-semibold"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back to Modules
          </Button>
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
        <div className="bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] rounded-2xl p-8 shadow-lg">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => router.push(`/dashboard/courses/${moduleId}`)}
              className="bg-black/20 hover:bg-black/30 text-black font-semibold h-11 border-none"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              <span>Back to Module</span>
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-black">Schedule Meeting</h1>
              <p className="text-black/80 mt-1 text-lg">Create a new meeting schedule for your module</p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl">
          {submitStatus.type && (
            <Alert 
              variant={submitStatus.type === 'success' ? 'default' : 'destructive'} 
              className={`mb-6 shadow-lg ${
                submitStatus.type === 'success' 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-red-300 bg-red-50'
              }`}
            >
              {submitStatus.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <AlertTitle className="font-bold text-lg">
                {submitStatus.type === 'success' ? 'Success' : 'Error'}
              </AlertTitle>
              <AlertDescription className={`font-medium ${
                submitStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {submitStatus.message}
              </AlertDescription>
            </Alert>
          )}

          <Card className="border-none shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-black rounded-t-xl">
              <CardTitle className="text-2xl font-bold">Meeting Details</CardTitle>
              <CardDescription className="text-black/80 text-base">
                Set up the date, time, and recurrence for your meeting
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="date" className="text-base font-bold text-gray-800">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      className="h-12 border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="time" className="text-base font-bold text-gray-800">Time *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      required
                      className="h-12 border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="duration" className="text-base font-bold text-gray-800">Duration (minutes) *</Label>
                  <Select
                    value={formData.duration.toString()}
                    onValueChange={(value) => handleInputChange('duration', parseInt(value))}
                  >
                    <SelectTrigger className="h-12 border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]">
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

                <div className="space-y-3">
                  <Label htmlFor="recurrence" className="text-base font-bold text-gray-800">Recurrence Type *</Label>
                  <Select
                    value={formData.recurrenceType}
                    onValueChange={(value: 'specific' | 'daily' | 'weekly') => {
                      handleInputChange('recurrenceType', value)
                      if (value !== 'weekly') {
                        setFormData(prev => ({ ...prev, weekDay: undefined }))
                      }
                    }}
                  >
                    <SelectTrigger className="h-12 border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]">
                      <SelectValue placeholder="Select recurrence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="specific">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                          <span className="font-medium">One-time meeting</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="weekly">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          <span className="font-medium">Weekly recurring</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="daily">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-purple-500" />
                          <span className="font-medium">Daily recurring</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.recurrenceType === 'weekly' && (
                  <div className="space-y-3 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <Label htmlFor="weekDay" className="text-base font-bold text-gray-800">Day of Week *</Label>
                    <Select
                      value={formData.weekDay?.toString() || ''}
                      onValueChange={(value) => handleInputChange('weekDay', parseInt(value))}
                    >
                      <SelectTrigger className="h-12 border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24] bg-white">
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
                    className="h-12 bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-bold text-base flex items-center space-x-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <CalendarIcon className="w-5 h-5" />
                    <span>{isSubmitting ? 'Scheduling...' : 'Schedule Meeting'}</span>
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/dashboard/courses/${moduleId}`)}
                    disabled={isSubmitting}
                    className="h-12 font-semibold border-gray-300 hover:bg-gray-100"
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