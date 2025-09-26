'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import axiosInstance from '@/app/utils/axiosInstance'

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

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, role: userType) => Promise<void>
  register: (name: string, email: string, password: string, role: userType) => Promise<void>
  logout: () => void
  isLoading: boolean
  googleLogin: (role: userType) => Promise<void>
  // checkAuth: () => Promise<>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const mapApiRoleToAppRole = (apiRole: any): userType => {
    console.log('Mapping API role to app role:', apiRole)
    const value = typeof apiRole === 'string' ? apiRole.toUpperCase() : String(apiRole).toUpperCase()
    console.log('Processed value:', value)
    if (value === userType.STUDENT) return userType.STUDENT
    if (value === userType.TUTOR) return userType.TUTOR
    if (value.includes('STUDENT')) return userType.STUDENT
    if (value.includes('TUTOR') || value.includes('TEACHER')) return userType.TUTOR
    console.log('Defaulting to STUDENT for role:', apiRole)
    return userType.STUDENT
  }

  useEffect(() => {
    // Only check auth if not already on auth page
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
      checkAuth();
      console.log('Auth check initiated on mount');
    } else {
      setIsLoading(false);
      console.log('Skipping auth check - already on auth page');
    }
  }, [])
  const checkAuth = async () => {
    try {
      const res = await axiosInstance.get("/api/getuser", { withCredentials: true })
      const userData = res.data.user
      
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
  // const checkAuthStatus = async () => {
  //   try {
  //     const res = await axiosInstance.get("/api/getuser", { withCredentials: true });
  //     const userData: any = res.data.user;
  //     console.log('Raw user data from API:', userData)
  //     const role = mapApiRoleToAppRole(userData.role)
  //     console.log('Mapped role:', role)

  //     if (userData) {
  //       // Extract JWT token from cookie and store in localStorage for easier access
  //       const getCookie = (name: string) => {
  //         const value = `; ${document.cookie}`;
  //         const parts = value.split(`; ${name}=`);
  //         if (parts.length === 2) return parts.pop()?.split(';').shift();
  //         return null;
  //       };

  //       const jwtToken = getCookie('jwt_token');
  //       if (jwtToken) {
  //         localStorage.setItem('token', jwtToken);
  //         console.log('JWT token stored in localStorage during auth check');
  //       }

  //       // Add avatar based on role
  //       userData.avatar = `https://images.unsplash.com/photo-${role === userType.TUTOR ? '1494790108755-2616c0479506' : '1507003211169-0a1dd7228f2d'}?w=150&h=150&fit=crop&crop=face`
  //       userData.role = role

  //       console.log('Final user data being set:', userData)
  //       setUser(userData)
  //       localStorage.setItem('user', JSON.stringify(userData))
  //       // Reflect role in a cookie for middleware
  //       document.cookie = `role=${role}; path=/; SameSite=Lax`
  //       setIsLoading(false)
  //       return true;
  //     }
  //     setIsLoading(false)
  //     return false;
  //   } catch (error) {
  //     console.log('No authenticated user found')
  //     setIsLoading(false)
  //     return false;
  //   }
  // }

  // const googleLogin = async (role: userType) => {
  //   setIsLoading(true);
  //   try {
  //     // Redirect to OAuth endpoint with success redirect URL
  //     const redirectUrl = encodeURIComponent(`${window.location.origin}/dashboard`)
  //     console.log(role)
  //     window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/oauth2/login/${role}?redirect_uri=${redirectUrl}`
  //   } catch (error) {
  //     setIsLoading(false);
  //     throw error;
  //   }
  //   // Note: setIsLoading(false) is not needed here because the page will redirect
  // }

  // const login = async (email: string, password: string, role: userType) => { // need to remove role section from login
  //   console.log('Login started with:', { email, role })
  //   setIsLoading(true)

  //   try {
  //     // Clear any existing user data first
  //     console.log('Clearing existing session data...')
  //     setUser(null)
  //     localStorage.clear()
  //     sessionStorage.clear()

  //     await new Promise(resolve => setTimeout(resolve, 1000));
  //     const loginResponse = await axiosInstance.post("/api/auth/login", { email, password }, { withCredentials: true });
  //     console.log('Login API response:', loginResponse.status)

  //     // Extract JWT token from cookie and store in localStorage for easier access
  //     const getCookie = (name: string) => {
  //       const value = `; ${document.cookie}`;
  //       const parts = value.split(`; ${name}=`);
  //       if (parts.length === 2) return parts.pop()?.split(';').shift();
  //       return null;
  //     };

  //     // Check both possible cookie names
  //     const jwtToken = getCookie('jwt_token') || getCookie('jwtToken');
  //     if (jwtToken) {
  //       localStorage.setItem('token', jwtToken);
  //       console.log('JWT token stored in localStorage');
  //     } else {
  //       console.warn('No JWT token found after login')
  //     }

  //     const res = await axiosInstance.get("/api/getuser");
  //     console.log('Get user API response:', res.data)
  //     const userData: any = res.data.user;

  //     if (!userData) {
  //       throw new Error('No user data received after login')
  //     }

  //     const normalizedRole = mapApiRoleToAppRole(userData.role)
  //     console.log('Normalized role:', normalizedRole)

  //     userData.avatar = `https://images.unsplash.com/photo-${normalizedRole === userType.TUTOR ? '1494790108755-2616c0479506' : '1507003211169-0a1dd7228f2d'}?w=150&h=150&fit=crop&crop=face`
  //     userData.role = normalizedRole

  //     console.log('Setting user data:', userData)
  //     setUser(userData)
  //     localStorage.setItem('user', JSON.stringify(userData))
  //     document.cookie = `role=${normalizedRole}; path=/; SameSite=Lax`
  //     console.log('Login completed successfully')
  //   } catch (error) {
  //     console.error('Login error:', error)
  //     throw error
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }
  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      await axiosInstance.post("/api/auth/login", { email, password }, { withCredentials: true })
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
      await axiosInstance.post('/api/register', { name, email, password, role }, { withCredentials: true })
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
      await axiosInstance.get("/api/logout", { withCredentials: true })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      window.location.href = '/auth'
    }
  }
  const googleLogin = async (role?: userType) => {
    const redirectUrl = encodeURIComponent(`${window.location.origin}/dashboard`)
    const roleParam = role ? `/${role}` : ''
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/oauth2/login${roleParam}?redirect_uri=${redirectUrl}`
  }

  // const register = async (name: string, email: string, password: string, role: userType) => {
  //   setIsLoading(true)
  //   try {
  //     const response = await axiosInstance.post('/api/register', {
  //       name,
  //       email,
  //       password,
  //       role
  //     })

  //     // Only try to get user data if registration was successful
  //     if (response.status === 200 || response.status === 201) {
  //       // Extract JWT token from cookie and store in localStorage for easier access
  //       const getCookie = (name: string) => {
  //         const value = `; ${document.cookie}`;
  //         const parts = value.split(`; ${name}=`);
  //         if (parts.length === 2) return parts.pop()?.split(';').shift();
  //         return null;
  //       };

  //       const jwtToken = getCookie('jwt_token');
  //       if (jwtToken) {
  //         localStorage.setItem('token', jwtToken);
  //         console.log('JWT token stored in localStorage after registration');
  //       }

  //       const res = await axiosInstance.get("/api/getuser");
  //       const userData: any = res.data.user;
  //       const normalizedRole = mapApiRoleToAppRole(userData.role)

  //       userData.avatar = `https://images.unsplash.com/photo-${normalizedRole === userType.TUTOR ? '1494790108755-2616c0479506' : '1507003211169-0a1dd7228f2d'}?w=150&h=150&fit=crop&crop=face`
  //       userData.role = normalizedRole

  //       setUser(userData)
  //       localStorage.setItem('user', JSON.stringify(userData))
  //       document.cookie = `role=${normalizedRole}; path=/; SameSite=Lax`
  //     }
  //   } catch (error: any) {
  //     // Handle specific error cases
  //     if (error.response?.status === 409) {
  //       throw new Error('An account with this email already exists. Please try logging in instead.')
  //     } else if (error.response?.status === 400) {
  //       throw new Error('Invalid registration data. Please check your inputs.')
  //     } else {
  //       throw new Error('Registration failed. Please try again.')
  //     }
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  // const logout = async () => {
  //   console.log('Logout started')
  //   try {
  //     // Call backend logout endpoint first
  //     await axiosInstance.get("/api/logout", { withCredentials: true });
  //     console.log('Backend logout successful')
  //   } catch (error) {
  //     console.error('Backend logout error:', error)
  //   }

  //   // Clear React state first
  //   setUser(null)

  //   // Clear ALL localStorage items
  //   localStorage.clear()

  //   // Clear sessionStorage as well
  //   sessionStorage.clear()

  //   // Function to clear cookies thoroughly
  //   const clearCookie = (name: string) => {
  //     const domain = window.location.hostname
  //     // Try multiple combinations to ensure complete clearing
  //     const cookieConfigs = [
  //       `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`,
  //       `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`,
  //       `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain};`,
  //       `${name}=; Max-Age=0; path=/;`,
  //       `${name}=; Max-Age=0; path=/; domain=${domain};`,
  //       `${name}=; Max-Age=0; path=/; domain=.${domain};`,
  //       `${name}=; Max-Age=0; path=/; SameSite=Lax;`,
  //       `${name}=; Max-Age=0; path=/; SameSite=None; Secure;`
  //     ]

  //     cookieConfigs.forEach(config => {
  //       try {
  //         document.cookie = config
  //       } catch (e) {
  //         // Ignore cookie setting errors
  //       }
  //     })
  //   }

  //   // Clear all possible authentication cookies
  //   const cookiesToClear = ['jwt_token', 'jwtToken', 'role', 'JSESSIONID', 'sessionId', 'auth_token']
  //   cookiesToClear.forEach(clearCookie)

  //   console.log('All client-side data cleared')
  //   console.log('localStorage cleared:', Object.keys(localStorage).length === 0)
  //   console.log('Cookies after clear:', document.cookie)

  //   // Force page reload and redirect to clear any cached state
  //   window.location.replace('/auth?logout=true')
  // }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, googleLogin }}>
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