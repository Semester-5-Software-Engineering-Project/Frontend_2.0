import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { checkProfile } from '@/services/api'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

interface ProfileGuardProps {
  children: React.ReactNode
}

const ProfileGuard: React.FC<ProfileGuardProps> = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true)
  const [hasProfile, setHasProfile] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  // Routes that don't require profile check
  const exemptRoutes = [
    '/auth',
    '/dashboard/profile',
    '/',
    '/login',
    '/register'
  ]

  const isExemptRoute = exemptRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  )

  useEffect(() => {
    const checkUserProfile = async () => {
      // Skip profile check for exempt routes or if no user
      if (!user || isExemptRoute) {
        setIsChecking(false)
        setHasProfile(true) // Allow access to exempt routes
        return
      }

      try {
        setIsChecking(true)
        const profileStatus = await checkProfile()
        
        if (!profileStatus.hasAnyProfile) {
          toast({
            title: "Profile Required",
            description: "You need to fill your profile first",
            variant: "destructive",
          })
          
          // Redirect based on user role
          if (user.role === 'STUDENT') {
            router.push('/dashboard/profile?create=student')
          } else if (user.role === 'TUTOR') {
            router.push('/dashboard/profile?create=tutor')
          } else {
            router.push('/dashboard/profile')
          }
          
          setHasProfile(false)
        } else {
          setHasProfile(true)
        }
      } catch (error) {
        console.error('Error checking profile status:', error)
        
        // On error, allow access but show warning
        toast({
          title: "Warning",
          description: "Could not verify profile status. Please check your profile.",
          variant: "destructive",
        })
        setHasProfile(true)
      } finally {
        setIsChecking(false)
      }
    }

    checkUserProfile()
  }, [user, pathname, isExemptRoute, router, toast])

  // Show loading spinner while checking
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-gray-600">Checking profile status...</p>
        </div>
      </div>
    )
  }

  // If no profile and not on exempt route, don't render children
  if (!hasProfile && !isExemptRoute) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Profile Required</h2>
          <p className="text-gray-600">Redirecting to profile setup...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default ProfileGuard