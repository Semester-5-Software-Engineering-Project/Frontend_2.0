'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import axiosInstance from '@/app/utils/axiosInstance'
import CookieManager from '@/utils/cookieManager'

interface User {
  id: string
  name: string
  email: string
  role: 'STUDENT' | 'TUTOR'
  avatar?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, role: 'STUDENT' | 'TUTOR') => Promise<void>
  register: (name: string, email: string, password: string, role: 'STUDENT' | 'TUTOR') => Promise<void>
  logout: () => void
  isLoading: boolean
  googleLogin : (role:'STUDENT' | 'TUTOR') => Promise<void>
  checkAuthStatus: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const mapApiRoleToAppRole = (apiRole: any): 'STUDENT' | 'TUTOR' => {
    const value = String(apiRole || '').toUpperCase().trim()
    console.log('Raw API Role:', apiRole, 'Processed Value:', value)
    
    if (value === 'STUDENT') return 'STUDENT'
    if (value === 'TUTOR') return 'TUTOR'
    
    // Also check for variants
    if (value.includes('STUDENT')) return 'STUDENT'
    if (value.includes('TUTOR') || value.includes('TEACHER')) return 'TUTOR'
    
    // Fallback: default to STUDENT to avoid over-permissioning
    console.warn('Unknown role received from API:', apiRole, 'defaulting to STUDENT')
    return 'STUDENT'
  }

  useEffect(() => {
    // Check for stored auth data
    const storedUser = localStorage.getItem('user')
    const jwtToken = CookieManager.getJWTToken();

    if (storedUser && jwtToken) {
      try {
        checkAuthStatus() // Verify with backend
        const parsed = JSON.parse(storedUser)
        const normalizedRole = mapApiRoleToAppRole(parsed.role)
        const normalizedUser = { ...parsed, role: normalizedRole }
        setUser(normalizedUser)
        localStorage.setItem('user', JSON.stringify(normalizedUser))
        document.cookie = `role=${normalizedRole}; path=/; SameSite=Lax`
        setIsLoading(false)
      } catch {
        localStorage.removeItem('user')
        checkAuthStatus()
      }
    } else {
      checkAuthStatus()
    }
  }, [])

  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      const res = await axiosInstance.get("/api/getuser", { withCredentials: true });
      const userData: any = res.data.user;
      console.log('Raw user data from API:', userData)
      const role = mapApiRoleToAppRole(userData.role)
      console.log('Mapped role:', role)
      
      if (userData) {
        // Extract JWT token from cookie and store in localStorage for easier access
        const jwtToken = CookieManager.getJWTToken();
        if (jwtToken) {
          localStorage.setItem('token', jwtToken);
          console.log('JWT token stored in localStorage during auth check');
        }

        // Add avatar based on role
        userData.avatar = `https://images.unsplash.com/photo-${role === 'TUTOR' ? '1494790108755-2616c0479506' : '1507003211169-0a1dd7228f2d'}?w=150&h=150&fit=crop&crop=face`
        userData.role = role
        
        console.log('Final user data being set:', userData)
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        // Reflect role in a cookie for middleware
        document.cookie = `role=${role}; path=/; SameSite=Lax`
        setIsLoading(false)
        return true;
      }
      setIsLoading(false)
      return false;
    } catch (error) {
      console.log('No authenticated user found')
      setIsLoading(false)
      return false;
    }
  }

  const googleLogin = async (role:"STUDENT" | "TUTOR") =>{
    setIsLoading(true);
    try{
      // Redirect to OAuth endpoint with success redirect URL
      const redirectUrl = encodeURIComponent(`${window.location.origin}/dashboard`)
      console.log(role)
      window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/oauth2/login/${role}?redirect_uri=${redirectUrl}`
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
    // Note: setIsLoading(false) is not needed here because the page will redirect
  }

  const login = async (email: string, password: string, role: 'STUDENT' | 'TUTOR') => {
    console.log('Login started with:', { email, role })
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const loginResponse = await axiosInstance.post("/api/auth/login", { email, password }, { withCredentials: true });
      console.log('Login API response:', loginResponse.status)

      // Extract JWT token from cookie and store in localStorage for easier access
      // Extract JWT token from cookie and store in localStorage for easier access
      const jwtToken = CookieManager.getJWTToken();
      if (jwtToken) {
        localStorage.setItem('token', jwtToken);
        console.log('JWT token stored in localStorage');
      }

      const res = await axiosInstance.get("/api/getuser");
      console.log('Get user API response:', res.data)
      const userData: any = res.data.user;
      const normalizedRole = mapApiRoleToAppRole(userData.role)
      console.log('Normalized role:', normalizedRole)
      
      userData.avatar = `https://images.unsplash.com/photo-${normalizedRole === 'TUTOR' ? '1494790108755-2616c0479506' : '1507003211169-0a1dd7228f2d'}?w=150&h=150&fit=crop&crop=face`
      userData.role = normalizedRole
      
      console.log('Setting user data:', userData)
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      document.cookie = `role=${normalizedRole}; path=/; SameSite=Lax`
      console.log('Login completed successfully')
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string, role: 'STUDENT' | 'TUTOR') => {
    setIsLoading(true)
    try {
      const response = await axiosInstance.post('/api/register', {
        name,
        email,
        password,
        role
      })

      // Only try to get user data if registration was successful
      if (response.status === 200 || response.status === 201) {
        // Extract JWT token from cookie and store in localStorage for easier access
        // Extract JWT token from cookie and store in localStorage for easier access
        const jwtToken = CookieManager.getJWTToken();
        if (jwtToken) {
          localStorage.setItem('token', jwtToken);
          console.log('JWT token stored in localStorage after registration');
        }

        const res = await axiosInstance.get("/api/getuser");
        const userData: any = res.data.user;
        const normalizedRole = mapApiRoleToAppRole(userData.role)
        
        userData.avatar = `https://images.unsplash.com/photo-${normalizedRole === 'TUTOR' ? '1494790108755-2616c0479506' : '1507003211169-0a1dd7228f2d'}?w=150&h=150&fit=crop&crop=face`
        userData.role = normalizedRole
        
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        document.cookie = `role=${normalizedRole}; path=/; SameSite=Lax`
      }
    } catch (error: any) {
      // Handle specific error cases
      if (error.response?.status === 409) {
        throw new Error('An account with this email already exists. Please try logging in instead.')
      } else if (error.response?.status === 400) {
        throw new Error('Invalid registration data. Please check your inputs.')
      } else {
        throw new Error('Registration failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async() => {
    console.log('Logout started')
    
    // Debug cookies before logout
    CookieManager.debugCookies();
    
    try {
      // Call backend logout endpoint first
      await axiosInstance.get("/api/logout", { withCredentials: true });
      console.log('Backend logout successful')
    } catch (error) {
      console.error('Backend logout error:', error)
    }
    
    // Clear client-side data
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token') // Clear JWT token from localStorage
    sessionStorage.clear() // Clear all session storage
    
    // Clear all authentication cookies using the comprehensive method
    CookieManager.clearAuthCookies();
    
    console.log('All cookies cleared')
    console.log('Client-side logout completed')
    
    // Debug cookies after logout
    CookieManager.debugCookies();
    
    // Small delay to ensure cookie clearing is processed
    setTimeout(() => {
      // Redirect to auth page with cache busting
      window.location.href = '/auth?logout=true&t=' + Date.now()
    }, 100)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading ,googleLogin,checkAuthStatus}}>
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