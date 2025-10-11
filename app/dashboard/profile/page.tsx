'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useStudentProfile } from '@/contexts/StudentProfileContex'
import { useTutorProfile } from '@/contexts/TutorProfileContex'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Save, Edit, Star, BookOpen, Award, Key, Upload, AlertCircle } from 'lucide-react'

export default function Profile() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const createMode = searchParams.get('create') // 'student' or 'tutor'
  const studentCtx = useStudentProfile()
  const tutorCtx = useTutorProfile()
  const isTutor = user?.role === 'TUTOR'
  const profile = isTutor ? tutorCtx.profile as any : studentCtx.profile as any
  const profileLoading = isTutor ? tutorCtx.isLoading : studentCtx.isLoading
  const hasProfile = !!profile

  const [isEditing, setIsEditing] = useState(createMode ? true : false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [profileData, setProfileData] = useState({
  // Common
  name: '',
  email: '',
  bio: '',
  imageUrl: '',
  // Student fields
  firstName: '',
  lastName: '',
  phone: '',
  birthday: '',
  isActive: false,
  // Tutor fields
  phoneNo: '',
  gender: '',
  dob: '',
  image: '',
  portfolio: '',
  address: '',
  city: '',
  country: '',
  hourlyRate: '', // still local until backend supports
  education: '',
  experience: '',
  specializations: [] as string[],
  })

  useEffect(() => {
    if (profile && user) {
      if (isTutor) {
        setProfileData(prev => ({
          ...prev,
            name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || user.name || '',
            email: user.email || '',
            bio: profile.bio || '',
            imageUrl: profile.image || '',
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            phoneNo: profile.phoneNo || '',
            gender: profile.gender || '',
            dob: profile.dob || '',
            portfolio: profile.portfolio || '',
            address: profile.address || '',
            city: profile.city || '',
            country: profile.country || ''
        }))
      } else {
        setProfileData(prev => ({
          ...prev,
          name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || user.name || '',
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          email: user.email || '',
          phone: profile.phoneNumber || '',
          bio: profile.bio || '',
          imageUrl: profile.imageUrl || profile.image_url || '',
          birthday: profile.birthday || '',
          address: profile.address || '',
          city: profile.city || '',
          country: profile.country || '',
          isActive: !!profile.isActive,
        }))
      }
  // When a profile exists ensure we are NOT stuck in editing unless user chose it
  setIsEditing(false)
    } else if (user) {
      setProfileData(prev => ({ ...prev, name: user.name || '', email: user.email || '' }))
  // Auto-enable editing mode if no profile so user can create immediately
  if (!profile) setIsEditing(true)
    }
  }, [profile, user, isTutor])

  const handleSave = async () => {
    try {
      if (isTutor) {
        if (profile) {
          await tutorCtx.updateProfile({
            firstName: profileData.firstName || profileData.name.split(' ')[0],
            lastName: profileData.lastName || profileData.name.split(' ').slice(1).join(' '),
            phoneNo: profileData.phoneNo,
            gender: profileData.gender,
            dob: profileData.dob,
            image: profileData.imageUrl,
            portfolio: profileData.portfolio,
            bio: profileData.bio,
            address: profileData.address,
            city: profileData.city,
            country: profileData.country,
          })
          toast.success('Tutor profile updated')
        } else {
          await tutorCtx.createProfile({
            firstName: profileData.firstName || profileData.name.split(' ')[0],
            lastName: profileData.lastName || profileData.name.split(' ').slice(1).join(' '),
            phoneNo: profileData.phoneNo,
            gender: profileData.gender,
            dob: profileData.dob,
            image: profileData.imageUrl,
            portfolio: profileData.portfolio,
            bio: profileData.bio,
            address: profileData.address,
            city: profileData.city,
            country: profileData.country,
          })
          toast.success('Tutor profile created')
        }
        await tutorCtx.refresh()
      } else {
        if (profile) {
          await studentCtx.updateProfile({
            firstName: profileData.firstName || profileData.name.split(' ')[0],
            lastName: profileData.lastName || profileData.name.split(' ').slice(1).join(' '),
            phoneNumber: profileData.phone,
            bio: profileData.bio,
            imageUrl: profileData.imageUrl,
            birthday: profileData.birthday,
            address: profileData.address,
            city: profileData.city,
            country: profileData.country,
            isActive: profileData.isActive,
          })
          toast.success('Profile updated')
        } else {
          await studentCtx.createProfile({
            firstName: profileData.firstName || profileData.name.split(' ')[0],
            lastName: profileData.lastName || profileData.name.split(' ').slice(1).join(' '),
            phoneNumber: profileData.phone,
            bio: profileData.bio,
            imageUrl: profileData.imageUrl,
            birthday: profileData.birthday,
            address: profileData.address,
            city: profileData.city,
            country: profileData.country,
            isActive: profileData.isActive,
          })
          toast.success('Profile created')
        }
        await studentCtx.refresh()
      }
      setIsEditing(false)
    } catch (e: any) {
      toast.error(e.message || 'Save failed')
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    try {
      if (isTutor) {
        await tutorCtx.changePassword(passwordData.newPassword)
      } else {
        await studentCtx.changePassword(passwordData.newPassword)
      }
      toast.success('Password changed successfully')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (e: any) {
      toast.error(e.message || 'Failed to change password')
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        {/* Profile Creation Alert */}
        {createMode && !hasProfile && (
          <Alert className="border-[#FBBF24] bg-yellow-50 shadow-sm">
            <AlertCircle className="h-5 w-5 text-[#FBBF24]" />
            <AlertDescription className="text-gray-800 ml-2">
              <strong className="font-semibold">Profile Required:</strong> Complete your profile to unlock all features. Fill in the required information below.
            </AlertDescription>
          </Alert>
        )}

        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 text-sm mt-1">
                {profileLoading ? 'Loading profile...' : 'Manage your personal information and settings'}
              </p>
            </div>
            <div className="flex gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={profileLoading} className="border-gray-300 hover:bg-gray-50">
                    <Key className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Change Password</DialogTitle>
                    <DialogDescription className="text-gray-600">
                      Update your account password. Make sure your new password is secure.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-gray-700 font-medium">Current Password</Label>
                      <Input 
                        id="currentPassword" 
                        type="password" 
                        value={passwordData.currentPassword} 
                        onChange={e => setPasswordData(p => ({...p, currentPassword: e.target.value}))} 
                        placeholder="Enter your current password"
                        className="border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-gray-700 font-medium">New Password</Label>
                      <Input 
                        id="newPassword" 
                        type="password" 
                        value={passwordData.newPassword} 
                        onChange={e => setPasswordData(p => ({...p, newPassword: e.target.value}))} 
                        placeholder="Enter your new password"
                        className="border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm New Password</Label>
                      <Input 
                        id="confirmPassword" 
                        type="password" 
                        value={passwordData.confirmPassword} 
                        onChange={e => setPasswordData(p => ({...p, confirmPassword: e.target.value}))} 
                        placeholder="Confirm your new password"
                        className="border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]"
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button 
                        onClick={handleChangePassword} 
                        className="bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-semibold"
                      >
                        <Key className="w-4 h-4 mr-2" />
                        Update Password
                      </Button>
                      <Button 
                        onClick={() => { setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }) }} 
                        variant="outline"
                        className="border-gray-300"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              {hasProfile ? (
                <Button
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  className={isEditing ? 'bg-green-600 hover:bg-green-700 text-white font-semibold' : 'bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-semibold'}
                  disabled={profileLoading}
                >
                  {isEditing ? (<><Save className="w-4 h-4 mr-2" />Save Changes</>) : (<><Edit className="w-4 h-4 mr-2" />Edit Profile</>)}
                </Button>
              ) : (
                <Button 
                  onClick={handleSave} 
                  disabled={profileLoading} 
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Create Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        {!profileLoading && !hasProfile && (
          <div className="p-6 border-2 border-dashed border-[#FBBF24] rounded-xl bg-yellow-50 text-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#FBBF24] mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 mb-1">No profile found yet</p>
                <p className="text-gray-600">Fill in the form below and click <span className="font-semibold text-[#FBBF24]">Create Profile</span> to save your information.</p>
              </div>
            </div>
          </div>
        )}

        <Card className="border-none shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white pb-6">
            <CardTitle className="text-2xl text-gray-900">Personal Information</CardTitle>
            <CardDescription className="text-gray-600">
              Basic details for your {isTutor ? 'tutor' : 'student'} profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-yellow-50 to-white rounded-xl border border-yellow-100">
              <Avatar className="w-28 h-28 relative group ring-4 ring-[#FBBF24] ring-offset-2">
                <AvatarImage src={profileData.imageUrl || undefined} />
                <AvatarFallback className="text-2xl font-bold bg-[#FBBF24] text-black">
                  {profileData.name?.charAt(0) || user?.name?.charAt(0) || '?'}
                </AvatarFallback>
                {isEditing && (
                  <label className="absolute inset-0 rounded-full bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-semibold cursor-pointer transition-all">
                    <Upload className="w-6 h-6 mb-1" />
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        if (file.size > 3 * 1024 * 1024) { // 3MB limit
                          toast.error('Image must be under 3MB')
                          return
                        }
                        
                        try {
                          // Create FormData to send the file
                          const formData = new FormData()
                          formData.append('file', file)
                          
                          // Upload to backend
                          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/materials/upload/image`, {
                            method: 'POST',
                            body: formData,
                            credentials: 'include'
                          })
                          
                          if (!response.ok) {
                            const errorText = await response.text()
                            console.error('Upload failed:', response.status, response.statusText, errorText)
                            throw new Error(`Upload failed: ${response.status} - ${errorText || response.statusText}`)
                          }
                          
                          const imageUrl = await response.text()
                          console.log('Upload successful, URL:', imageUrl)
                          setProfileData(p => ({ ...p, imageUrl: imageUrl }))
                          toast.success('Image uploaded successfully')
                        } catch (error: any) {
                          console.error('Upload error:', error)
                          toast.error(error.message || 'Failed to upload image')
                        } finally {
                          e.target.value = '' // reset input so same file can be re-selected
                        }
                      }}
                    />
                  </label>
                )}
              </Avatar>
              <div className="flex-1">
                <p className="font-bold text-2xl text-gray-900">{profileData.name || 'Unnamed User'}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#FBBF24] text-black">
                    {user?.role}
                  </span>
                  {profile?.updatedAt && (
                    <span className="text-xs text-gray-500">
                      Last updated: {new Date(profile.updatedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {isEditing && (
                  <p className="text-xs text-gray-500 mt-2">
                    Click on your avatar to upload a new profile picture
                  </p>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isTutor ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-700 font-semibold">First Name</Label>
                    <Input 
                      id="firstName" 
                      value={profileData.firstName} 
                      disabled={!isEditing && hasProfile} 
                      onChange={e => setProfileData(p => ({...p, firstName: e.target.value, name: `${e.target.value} ${p.lastName}`.trim()}))} 
                      className={`${!isEditing && hasProfile ? 'bg-gray-50' : 'border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]'}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-700 font-semibold">Last Name</Label>
                    <Input 
                      id="lastName" 
                      value={profileData.lastName} 
                      disabled={!isEditing && hasProfile} 
                      onChange={e => setProfileData(p => ({...p, lastName: e.target.value, name: `${p.firstName} ${e.target.value}`.trim()}))} 
                      className={`${!isEditing && hasProfile ? 'bg-gray-50' : 'border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]'}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-semibold">Email</Label>
                    <Input 
                      id="email" 
                      value={profileData.email} 
                      disabled 
                      readOnly 
                      className="bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                </>
              ) : (
                <></>
              )}
              
              {isTutor ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNo" className="text-gray-700 font-semibold">Phone</Label>
                    <Input 
                      id="phoneNo" 
                      value={profileData.phoneNo} 
                      disabled={!isEditing && hasProfile} 
                      onChange={e => setProfileData(p => ({...p, phoneNo: e.target.value}))} 
                      className={`${!isEditing && hasProfile ? 'bg-gray-50' : 'border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]'}`}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob" className="text-gray-700 font-semibold">Date of Birth</Label>
                    <Input 
                      id="dob" 
                      type="date" 
                      value={profileData.dob} 
                      disabled={!isEditing && hasProfile} 
                      onChange={e => setProfileData(p => ({...p, dob: e.target.value}))} 
                      className={`${!isEditing && hasProfile ? 'bg-gray-50' : 'border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]'}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-gray-700 font-semibold">Gender</Label>
                    <Select
                      value={profileData.gender}
                      onValueChange={(value) => setProfileData(p => ({...p, gender: value}))}
                      disabled={!isEditing && hasProfile}
                    >
                      <SelectTrigger className={`${!isEditing && hasProfile ? 'bg-gray-50' : 'border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]'}`}>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="portfolio" className="text-gray-700 font-semibold">Portfolio URL</Label>
                    <Input 
                      id="portfolio" 
                      value={profileData.portfolio} 
                      disabled={!isEditing && hasProfile} 
                      onChange={e => setProfileData(p => ({...p, portfolio: e.target.value}))} 
                      className={`${!isEditing && hasProfile ? 'bg-gray-50' : 'border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]'}`}
                      placeholder="https://yourportfolio.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-gray-700 font-semibold">Address</Label>
                    <Input 
                      id="address" 
                      value={profileData.address} 
                      disabled={!isEditing && hasProfile} 
                      onChange={e => setProfileData(p => ({...p, address: e.target.value}))} 
                      placeholder="e.g. Home 1, Street Name" 
                      className={`${!isEditing && hasProfile ? 'bg-gray-50' : 'border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]'}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-gray-700 font-semibold">City</Label>
                    <Input 
                      id="city" 
                      value={profileData.city} 
                      disabled={!isEditing && hasProfile} 
                      onChange={e => setProfileData(p => ({...p, city: e.target.value}))} 
                      placeholder="e.g. Matara" 
                      className={`${!isEditing && hasProfile ? 'bg-gray-50' : 'border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]'}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-gray-700 font-semibold">Country</Label>
                    <Input 
                      id="country" 
                      value={profileData.country} 
                      disabled={!isEditing && hasProfile} 
                      onChange={e => setProfileData(p => ({...p, country: e.target.value}))} 
                      placeholder="e.g. Sri Lanka" 
                      className={`${!isEditing && hasProfile ? 'bg-gray-50' : 'border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]'}`}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="student-firstName" className="text-gray-700 font-semibold">First Name</Label>
                    <Input 
                      id="student-firstName" 
                      value={profileData.firstName} 
                      disabled={!isEditing && hasProfile} 
                      onChange={e => setProfileData(p => ({...p, firstName: e.target.value, name: `${e.target.value} ${p.lastName}`.trim()}))} 
                      className={`${!isEditing && hasProfile ? 'bg-gray-50' : 'border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]'}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-lastName" className="text-gray-700 font-semibold">Last Name</Label>
                    <Input 
                      id="student-lastName" 
                      value={profileData.lastName} 
                      disabled={!isEditing && hasProfile} 
                      onChange={e => setProfileData(p => ({...p, lastName: e.target.value, name: `${p.firstName} ${e.target.value}`.trim()}))} 
                      className={`${!isEditing && hasProfile ? 'bg-gray-50' : 'border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]'}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-semibold">Email</Label>
                    <Input 
                      id="email" 
                      value={profileData.email} 
                      disabled 
                      readOnly 
                      className="bg-gray-50 cursor-not-allowed"
                    />
                  </div>
              
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700 font-semibold">Phone</Label>
                    <Input 
                      id="phone" 
                      value={profileData.phone} 
                      disabled={!isEditing && hasProfile} 
                      onChange={e => setProfileData(p => ({...p, phone: e.target.value}))} 
                      className={`${!isEditing && hasProfile ? 'bg-gray-50' : 'border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]'}`}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthday" className="text-gray-700 font-semibold">Birthday</Label>
                    <Input 
                      id="birthday" 
                      type="date" 
                      value={profileData.birthday} 
                      disabled={!isEditing && hasProfile} 
                      onChange={e => setProfileData(p => ({...p, birthday: e.target.value}))} 
                      className={`${!isEditing && hasProfile ? 'bg-gray-50' : 'border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]'}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-address" className="text-gray-700 font-semibold">Address</Label>
                    <Input 
                      id="student-address" 
                      value={profileData.address} 
                      disabled={!isEditing && hasProfile} 
                      onChange={e => setProfileData(p => ({...p, address: e.target.value}))} 
                      placeholder="e.g. Home 1, Street Name" 
                      className={`${!isEditing && hasProfile ? 'bg-gray-50' : 'border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]'}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-city" className="text-gray-700 font-semibold">City</Label>
                    <Input 
                      id="student-city" 
                      value={profileData.city} 
                      disabled={!isEditing && hasProfile} 
                      onChange={e => setProfileData(p => ({...p, city: e.target.value}))} 
                      placeholder="e.g. Matara" 
                      className={`${!isEditing && hasProfile ? 'bg-gray-50' : 'border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]'}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-country" className="text-gray-700 font-semibold">Country</Label>
                    <Input 
                      id="student-country" 
                      value={profileData.country} 
                      disabled={!isEditing && hasProfile} 
                      onChange={e => setProfileData(p => ({...p, country: e.target.value}))} 
                      placeholder="e.g. Sri Lanka" 
                      className={`${!isEditing && hasProfile ? 'bg-gray-50' : 'border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]'}`}
                    />
                  </div>
                </>
              )}

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio" className="text-gray-700 font-semibold">Bio</Label>
                <Textarea 
                  id="bio" 
                  rows={5} 
                  value={profileData.bio} 
                  disabled={!isEditing && hasProfile} 
                  onChange={e => setProfileData(p => ({...p, bio: e.target.value}))} 
                  placeholder="Tell us about yourself..." 
                  className={`${!isEditing && hasProfile ? 'bg-gray-50' : 'border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]'} resize-none`}
                />
              </div>
              {/* {isTutor && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate (local)</Label>
                    <Input id="hourlyRate" placeholder="$0" value={profileData.hourlyRate} disabled={!isEditing} onChange={e => setProfileData(p => ({...p, hourlyRate: e.target.value}))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="education">Education (local)</Label>
                    <Input id="education" value={profileData.education} disabled={!isEditing} onChange={e => setProfileData(p => ({...p, education: e.target.value}))} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="experience">Experience (local)</Label>
                    <Input id="experience" value={profileData.experience} disabled={!isEditing} onChange={e => setProfileData(p => ({...p, experience: e.target.value}))} placeholder="e.g. 5 years" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Specializations (local)</Label>
                    <div className="flex flex-wrap gap-2">
                      {profileData.specializations.map((s, i) => (
                        <span key={i} className="text-xs bg-muted px-2 py-1 rounded">
                          {s}
                        </span>
                      ))}
                      {isEditing && (
                        <Button type="button" size="sm" variant="outline" onClick={() => {
                          const value = prompt('Add specialization')?.trim()
                          if (value) setProfileData(p => ({...p, specializations: [...p.specializations, value]}))
                        }}>+ Add</Button>
                      )}
                    </div>
                  </div>
                </>
              )} */}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}