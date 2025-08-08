'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored auth data
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string, role: 'student' | 'tutor') => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const userData: User = {
        id: '1',
        name: role === 'tutor' ? 'Dr. Sarah Johnson' : 'Alex Smith',
        email,
        role,
        avatar: `https://images.unsplash.com/photo-${role === 'tutor' ? '1494790108755-2616c0479506' : '1507003211169-0a1dd7228f2d'}?w=150&h=150&fit=crop&crop=face`
      }
      
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string, role: 'student' | 'tutor') => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const userData: User = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        role,
        avatar: `https://images.unsplash.com/photo-${role === 'tutor' ? '1494790108755-2616c0479506' : '1507003211169-0a1dd7228f2d'}?w=150&h=150&fit=crop&crop=face`
      }
      
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
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