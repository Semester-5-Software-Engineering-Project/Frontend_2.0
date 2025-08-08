'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import StudentDashboard from '@/components/dashboard/StudentDashboard'
import TutorDashboard from '@/components/dashboard/TutorDashboard'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

export default function Dashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout>
      {user.role === 'student' ? <StudentDashboard /> : <TutorDashboard />}
    </DashboardLayout>
  )
}