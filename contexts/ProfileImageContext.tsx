'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

interface ProfileImageContextValue {
  profileImageUrl: string | null
  setProfileImageUrl: (url: string | null) => void
  refreshProfileImage: () => void
}

const ProfileImageContext = createContext<ProfileImageContextValue | null>(null)

export function ProfileImageProvider({ children }: { children: React.ReactNode }) {
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const refreshProfileImage = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  const value: ProfileImageContextValue = {
    profileImageUrl,
    setProfileImageUrl,
    refreshProfileImage,
  }

  return (
    <ProfileImageContext.Provider value={value}>
      {children}
    </ProfileImageContext.Provider>
  )
}

export function useProfileImage() {
  const context = useContext(ProfileImageContext)
  if (!context) {
    throw new Error('useProfileImage must be used within a ProfileImageProvider')
  }
  return context
}