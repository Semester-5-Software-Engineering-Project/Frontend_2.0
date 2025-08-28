'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import axiosInstance from '@/app/utils/axiosInstance'

interface User {
  id: string
  name: string
  email: string
  role: 'student' | 'tutor'
  avatar?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, role: 'student' | 'tutor') => Promise<void>
  register: (name: string, email: string, password: string, role: 'student' | 'tutor') => Promise<void>
  logout: () => void
  isLoading: boolean
  googleLogin : (role:'student' | 'tutor') => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const mapApiRoleToAppRole = (apiRole: any): 'student' | 'tutor' => {
    const value = String(apiRole || '').toLowerCase()
    if (value.includes('student')) return 'student'
    if (value.includes('tutor')) return 'tutor'
    // Fallback: default to student to avoid over-permissioning
    return 'student'
  }

  useEffect(() => {
    // Check for stored auth data
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
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
      // Check if user is authenticated via cookies (after OAuth redirect)
      checkAuthStatus()
    }
  }, [])

  const checkAuthStatus = async () => {
    try {
      const res = await axiosInstance.get("/api/getuser", { withCredentials: true });
      const userData: any = res.data.user;
      console.log(userData)
      const role = mapApiRoleToAppRole(userData.role)
      
      if (userData) {
        // Add avatar based on role
        userData.avatar = `https://images.unsplash.com/photo-${role === 'tutor' ? '1494790108755-2616c0479506' : '1507003211169-0a1dd7228f2d'}?w=150&h=150&fit=crop&crop=face`
        userData.role = role
        
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        // Reflect role in a cookie for middleware
        document.cookie = `role=${role}; path=/; SameSite=Lax`
      }
    } catch (error) {
      console.log('No authenticated user found')
    } finally {
      setIsLoading(false)
    }
  }

  const googleLogin = async (role:"student" | "tutor") =>{
    setIsLoading(true);
    try{
      // Redirect to OAuth endpoint with success redirect URL
      const redirectUrl = encodeURIComponent(`${window.location.origin}/dashboard`)
      console.log(role)
      window.location.href = `http://localhost:8080/oauth2/login/${role}?redirect_uri=${redirectUrl}`
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
    // Note: setIsLoading(false) is not needed here because the page will redirect
  }

  const login = async (email: string, password: string, role: 'student' | 'tutor') => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      await axiosInstance.post("/api/auth/login", { email, password }, { withCredentials: true });

      const res = await axiosInstance.get("/api/getuser");
      const userData: any = res.data.user;
      const normalizedRole = mapApiRoleToAppRole(userData.role)
      
      // const userData: User = {
      //   id: '1',
      //   name: role === 'tutor' ? 'Dr. Sarah Johnson' : 'Alex Smith',
      //   email,
      //   role,
      //   avatar: `https://images.unsplash.com/photo-${role === 'tutor' ? '1494790108755-2616c0479506' : '1507003211169-0a1dd7228f2d'}?w=150&h=150&fit=crop&crop=face`
      // }
      userData.avatar = `https://images.unsplash.com/photo-${normalizedRole === 'tutor' ? '1494790108755-2616c0479506' : '1507003211169-0a1dd7228f2d'}?w=150&h=150&fit=crop&crop=face`
      userData.role = normalizedRole
      
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      document.cookie = `role=${normalizedRole}; path=/; SameSite=Lax`
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string, role: 'student' | 'tutor') => {
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
        const res = await axiosInstance.get("/api/getuser");
        const userData: any = res.data.user;
        const normalizedRole = mapApiRoleToAppRole(userData.role)
        
        userData.avatar = `https://images.unsplash.com/photo-${normalizedRole === 'tutor' ? '1494790108755-2616c0479506' : '1507003211169-0a1dd7228f2d'}?w=150&h=150&fit=crop&crop=face`
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
    setUser(null)
    localStorage.removeItem('user')
    // Clear role cookie
    document.cookie = 'role=; path=/; Max-Age=0; SameSite=Lax'
    await axiosInstance.get("/api/logout");
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading ,googleLogin}}>
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