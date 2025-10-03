'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import LandingPage from '@/components/LandingPage'

export default function Home() {
  const { user} = useAuth()
  const router = useRouter()

  useEffect(() => {
    const checkAndRedirect = async () => {
      if (user) {
        router.push('/dashboard')
      }
    }
    checkAndRedirect()
  }, [user, router])

  if (user) {
    return null // Will redirect to dashboard
  }

  return <LandingPage />
}