import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { checkProfile } from '@/services/api'
import { useToast } from '@/hooks/use-toast'

interface UseProfileRedirectResult {
  redirectIfNoProfile: () => Promise<boolean>
  checkAndRedirect: () => Promise<boolean>
}

export const useProfileRedirect = (): UseProfileRedirectResult => {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const redirectIfNoProfile = async (): Promise<boolean> => {
    if (!user) return false

    try {
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
        
        return false // No profile
      }
      
      return true // Has profile
    } catch (error) {
      console.error('Error checking profile:', error)
      toast({
        title: "Error",
        description: "Failed to verify profile status",
        variant: "destructive",
      })
      return true // Allow access on error
    }
  }

  return {
    redirectIfNoProfile,
    checkAndRedirect: redirectIfNoProfile
  }
}

export default useProfileRedirect