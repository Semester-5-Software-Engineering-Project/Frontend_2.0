import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { checkProfile } from '@/services/api'
import { useToast } from '@/hooks/use-toast'

interface ProfileStatus {
  hasTutorProfile: boolean
  userId: string
  hasStudentProfile: boolean
  hasAnyProfile: boolean
}

export const useProfileCheck = () => {
  const [profileStatus, setProfileStatus] = useState<ProfileStatus | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const checkUserProfile = async () => {
    if (!user) return
    
    setIsChecking(true)
    try {
      const status = await checkProfile()
      setProfileStatus(status)
      
      // If user has no profile, redirect to profile creation
      if (!status.hasAnyProfile) {
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
        }
        return false
      }
      
      return true
    } catch (error) {
      console.error('Error checking profile status:', error)
      toast({
        title: "Error",
        description: "Failed to check profile status",
        variant: "destructive",
      })
      return false
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    if (user) {
      checkUserProfile()
    }
  }, [user])

  return {
    profileStatus,
    isChecking,
    checkUserProfile,
    hasProfile: profileStatus?.hasAnyProfile || false
  }
}

export default useProfileCheck