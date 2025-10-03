'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getUser, login as apiLogin, register as apiRegister, logout as apiLogout, googleLogin as apiGoogleLogin, checkProfile } from '@/services/api'
import { UserType } from '@/types/api'
import { useToast } from '@/hooks/use-toast'

export enum userType {
  STUDENT = 'STUDENT',
  TUTOR = 'TUTOR'
}

export interface User {
  id: string
  name: string
  email: string
  role: userType
  avatar?: string
}

interface ProfileStatus {
  hasTutorProfile: boolean
  userId: string
  hasStudentProfile: boolean
  hasAnyProfile: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, role: userType) => Promise<void>
  register: (name: string, email: string, password: string, role: userType) => Promise<void>
  logout: () => void
  isLoading: boolean
  googleLogin: (role: userType) => Promise<void>
  profileStatus: ProfileStatus | null
  checkUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [profileStatus, setProfileStatus] = useState<ProfileStatus | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
      checkAuth();
    } else {
      setIsLoading(false);
    }
  }, [])

  const checkAuth = async () => {
    try {
      const res = await getUser()
      const userData = res.user
      
      if (userData) {
        setUser({
          ...userData,
          role: userData.role.toUpperCase() as userType,
          avatar: getAvatarUrl(userData.role)
        })
      } else {
        setUser(null)
      }
    } catch (error: any) {
      console.log('Auth check failed:', error.response?.status)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }
  const getAvatarUrl = (role: string) => {
    const isTutor = role.toUpperCase().includes('TUTOR') || role.toUpperCase().includes('TEACHER')
    return `https://images.unsplash.com/photo-${isTutor ? '1494790108755-2616c0479506' : '1507003211169-0a1dd7228f2d'}?w=150&h=150&fit=crop&crop=face`
  }
  
  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      await apiLogin(email, password)
      await checkAuth() // Refresh user data
    } catch (error) {
      setUser(null)
      throw error
    } finally {
      setIsLoading(false)
    }
  }
  const register = async (name: string, email: string, password: string, role: userType) => {
    setIsLoading(true)
    try {
      await apiRegister({ name, email, password, role: role as unknown as UserType })
      await checkAuth() // Refresh user data
    } catch (error: any) {
      setUser(null)
      if (error.response?.status === 409) {
        throw new Error('Email already exists')
      }
      throw new Error('Registration failed')
    } finally {
      setIsLoading(false)
    }
  }
  const logout = async () => {
    try {
      await apiLogout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      window.location.href = '/auth'
    }
  }
  const googleLogin = async (role?: userType) => {
    apiGoogleLogin(role as unknown as UserType)
  }

  const checkUserProfile = async () => {
    if (!user) return

    try {
      const status = await checkProfile()
      setProfileStatus(status)
      
      // Check if we're on a protected route that requires profile
      const protectedRoutes = ['/dashboard', '/dashboard/courses', '/dashboard/sessions', '/dashboard/payments']
      const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
      const isProfileRoute = pathname.startsWith('/dashboard/profile')
      
      if (!status.hasAnyProfile && isProtectedRoute && !isProfileRoute) {
        toast({
          title: "Profile Required",
          description: "You need to fill your profile first",
          variant: "destructive",
        })
        
        // Redirect based on user role
        if (user.role === userType.STUDENT) {
          router.push('/dashboard/profile?create=student')
        } else if (user.role === userType.TUTOR) {
          router.push('/dashboard/profile?create=tutor')
        } else {
          router.push('/dashboard/profile')
        }
      }
    } catch (error) {
      console.error('Error checking profile status:', error)
    }
  }

  // Check profile when user changes or when navigating to protected routes
  useEffect(() => {
    if (user && !isLoading) {
      checkUserProfile()
    }
  }, [user, pathname, isLoading])

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, googleLogin, profileStatus, checkUserProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}