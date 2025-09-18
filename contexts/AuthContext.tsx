'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import axiosInstance from '@/app/utils/axiosInstance'

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
    const initializeAuth = async () => {
      console.log('Initializing authentication...');
      
      // Check for stored auth data
      const storedUser = localStorage.getItem('user')
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };
      
      // Check for both possible cookie names
      const jwtToken = getCookie('jwtToken') || getCookie('jwt_token');
      console.log('Stored user exists:', !!storedUser);
      console.log('JWT token exists:', !!jwtToken);

      // If we have both stored user and token, try to validate
      if (storedUser && jwtToken) {
        try {
          console.log('Validating existing session...');
          const isValid = await checkAuthStatus();
          if (!isValid) {
            console.log('Session validation failed, clearing data');
            // If validation fails, clear everything
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setUser(null);
          }
        } catch (error) {
          console.error('Auth validation error:', error);
          // Clear all auth data on error
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        console.log('No stored session, checking backend...');
        // No stored data, try checking with backend once
        try {
          await checkAuthStatus();
        } catch (error) {
          console.log('No valid backend session found');
          // Ensure we're in a clean state
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []) // Only run once on mount

  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      console.log('Checking auth status with backend...');
      const res = await axiosInstance.get("/api/getuser", { withCredentials: true });
      const userData: any = res.data.user;
      console.log('Raw user data from API:', userData)
      
      if (userData) {
        const role = mapApiRoleToAppRole(userData.role)
        console.log('Mapped role:', role)
        
        // Extract JWT token from cookie and store in localStorage for easier access
        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(';').shift();
          return null;
        };
        
        // Check for both possible cookie names
        const jwtToken = getCookie('jwtToken') || getCookie('jwt_token');
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
        
        return true;
      } else {
        console.log('No user data received from backend');
        return false;
      }
    } catch (error: any) {
      console.log('Auth status check failed:', error.response?.status || error.message);
      // Clear any stale data
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
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
      // Clear any previous session data first
      console.log('Clearing previous session data...');
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Attempting login...');
      const loginResponse = await axiosInstance.post("/api/auth/login", { email, password }, { withCredentials: true });
      console.log('Login API response:', loginResponse.status)

      // Extract JWT token from cookie and store in localStorage for easier access
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };
      
      // Check for both possible cookie names
      const jwtToken = getCookie('jwtToken') || getCookie('jwt_token');
      if (jwtToken) {
        localStorage.setItem('token', jwtToken);
        console.log('JWT token stored in localStorage');
      } else {
        console.warn('No JWT token found in cookies after login');
      }

      console.log('Fetching user data...');
      const res = await axiosInstance.get("/api/getuser");
      console.log('Get user API response:', res.data)
      const userData: any = res.data.user;
      
      if (!userData) {
        throw new Error('No user data received after login');
      }
      
      const normalizedRole = mapApiRoleToAppRole(userData.role)
      console.log('Normalized role:', normalizedRole)
      
      userData.avatar = `https://images.unsplash.com/photo-${normalizedRole === 'TUTOR' ? '1494790108755-2616c0479506' : '1507003211169-0a1dd7228f2d'}?w=150&h=150&fit=crop&crop=face`
      userData.role = normalizedRole
      
      console.log('Setting user data:', userData)
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      document.cookie = `role=${normalizedRole}; path=/; SameSite=Lax`
      console.log('Login completed successfully')
    } catch (error: any) {
      console.error('Login error:', error)
      // Clear any partial data on error
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
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
        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(';').shift();
          return null;
        };
        
        const jwtToken = getCookie('jwt_token');
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
    setIsLoading(true);
    
    try {
      // Call backend logout endpoint first
      await axiosInstance.get("/api/logout", { withCredentials: true });
      console.log('Backend logout successful')
    } catch (error) {
      console.error('Backend logout error:', error)
      // Continue with client-side cleanup even if backend fails
    }
    
    // Comprehensive client-side cleanup
    console.log('Starting comprehensive client-side cleanup...');
    
    // Clear React state
    setUser(null)
    
    // Clear localStorage completely
    const keysToRemove = ['user', 'token', 'jwtToken', 'meetingData'];
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Clear sessionStorage completely
    sessionStorage.clear();
    
    // Clear all authentication-related cookies with multiple domain/path combinations
    const clearCookie = (name: string) => {
      const domain = window.location.hostname;
      const paths = ['/', '/auth', '/dashboard'];
      const variations = [
        // Basic clearing
        `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`,
        `${name}=; Max-Age=0; path=/;`,
        // With current domain
        `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`,
        `${name}=; Max-Age=0; path=/; domain=${domain};`,
        // With dot domain (for subdomains)
        `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain};`,
        `${name}=; Max-Age=0; path=/; domain=.${domain};`,
        // With SameSite variations
        `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax;`,
        `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=None; Secure;`,
        `${name}=; Max-Age=0; path=/; SameSite=Lax;`,
        `${name}=; Max-Age=0; path=/; SameSite=None; Secure;`,
      ];
      
      // Also try different paths
      paths.forEach(path => {
        variations.push(
          `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`,
          `${name}=; Max-Age=0; path=${path};`
        );
      });
      
      variations.forEach(cookieString => {
        try {
          document.cookie = cookieString;
        } catch (e) {
          // Ignore cookie setting errors
        }
      });
    };
    
    // Clear all possible cookie names
    const cookieNames = ['jwtToken', 'jwt_token', 'role', 'JSESSIONID', 'sessionId', 'auth_token'];
    cookieNames.forEach(clearCookie);
    
    console.log('All client-side data cleared');
    setIsLoading(false);
    
    // Force a hard redirect to clear any cached states
    setTimeout(() => {
      window.location.replace('/auth?cleared=true&t=' + Date.now());
    }, 100);
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