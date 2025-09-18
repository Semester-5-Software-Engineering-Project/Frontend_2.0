'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useStudentProfile } from '@/contexts/StudentProfileContex'
import { useTutorProfile } from '@/contexts/TutorProfileContex'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Save, Edit, Star, BookOpen, Award, Key, Upload } from 'lucide-react'

export default function Profile() {
  const { user } = useAuth()
  const studentCtx = useStudentProfile()
  const tutorCtx = useTutorProfile()
  const isTutor = user?.role === 'TUTOR'
  const profile = isTutor ? tutorCtx.profile as any : studentCtx.profile as any
  const profileLoading = isTutor ? tutorCtx.isLoading : studentCtx.isLoading
  const hasProfile = !!profile

  const [isEditing, setIsEditing] = useState(false)
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
  phone: '',
  birthday: '',
  isActive: false,
  // Tutor fields
  firstName: '',
  lastName: '',
  phoneNo: '',
  gender: '',
  dob: '',
  image: '',
  portfolio: '',
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
        }))
      } else {
        setProfileData(prev => ({
          ...prev,
          name: profile.name || user.name || '',
          email: user.email || '',
          phone: profile.phoneNumber || '',
          bio: profile.bio || '',
          imageUrl: profile.imageUrl || profile.image_url || '',
          birthday: profile.birthday || '',
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
          })
          toast.success('Tutor profile created')
        }
        await tutorCtx.refresh()
      } else {
        if (profile) {
          await studentCtx.updateProfile({
            name: profileData.name,
            phoneNumber: profileData.phone,
            bio: profileData.bio,
            imageUrl: profileData.imageUrl,
            birthday: profileData.birthday,
            isActive: profileData.isActive,
          })
          toast.success('Profile updated')
        } else {
          await studentCtx.createProfile({
            name: profileData.name,
            phoneNumber: profileData.phone,
            bio: profileData.bio,
            imageUrl: profileData.imageUrl,
            birthday: profileData.birthday,
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
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-gray-600 text-sm">{profileLoading ? 'Loading profile...' : 'Manage your profile information'}</p>
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={profileLoading}>
                  <Key className="w-4 h-4 mr-2" />Change Password
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>Update your account password. Make sure your new password is secure.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" value={passwordData.currentPassword} onChange={e => setPasswordData(p => ({...p, currentPassword: e.target.value}))} placeholder="Enter your current password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" value={passwordData.newPassword} onChange={e => setPasswordData(p => ({...p, newPassword: e.target.value}))} placeholder="Enter your new password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" value={passwordData.confirmPassword} onChange={e => setPasswordData(p => ({...p, confirmPassword: e.target.value}))} placeholder="Confirm your new password" />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleChangePassword} className="bg-blue-600 hover:bg-blue-700"><Key className="w-4 h-4 mr-2" />Update Password</Button>
                    <Button onClick={() => { setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }) }} variant="outline">Cancel</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            {hasProfile ? (
              <Button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className={isEditing ? 'bg-green-600 hover:bg-green-700' : ''}
                variant={isEditing ? 'default' : 'outline'}
                disabled={profileLoading}
              >
                {isEditing ? (<><Save className="w-4 h-4 mr-2" />Save</>) : (<><Edit className="w-4 h-4 mr-2" />Edit</>)}
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={profileLoading} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />Create Profile
              </Button>
            )}
          </div>
        </div>

        {!profileLoading && !hasProfile && (
          <div className="p-4 border border-dashed rounded bg-muted/40 text-sm">
            No profile found yet. Fill in the form below and click <span className="font-semibold">Create Profile</span> to save your information.
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Basic details for your {isTutor ? 'tutor' : 'student'} profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24 relative group">
                <AvatarImage src={profileData.imageUrl || undefined} />
                <AvatarFallback>{profileData.name?.charAt(0) || user?.name?.charAt(0) || '?'}</AvatarFallback>
                {isEditing && (
                  <label className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-medium cursor-pointer transition-opacity">
                    <Upload className="w-5 h-5 mb-1" />
                    Change
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
              <div>
                <p className="font-semibold text-xl">{profileData.name || 'Unnamed'}</p>
                <p className="text-xs text-gray-500">Role: {user?.role}</p>
                {profile?.updatedAt && (
                  <p className="text-xs text-gray-500">Last updated: {new Date(profile.updatedAt).toLocaleString()}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isTutor ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" value={profileData.firstName} disabled={!isEditing && hasProfile} onChange={e => setProfileData(p => ({...p, firstName: e.target.value, name: `${e.target.value} ${p.lastName}`.trim()}))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" value={profileData.lastName} disabled={!isEditing && hasProfile} onChange={e => setProfileData(p => ({...p, lastName: e.target.value, name: `${p.firstName} ${e.target.value}`.trim()}))} />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={profileData.name} disabled={!isEditing && hasProfile} onChange={e => setProfileData(p => ({...p, name: e.target.value}))} />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={profileData.email} disabled readOnly />
              </div>
              {isTutor ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNo">Phone</Label>
                    <Input id="phoneNo" value={profileData.phoneNo} disabled={!isEditing && hasProfile} onChange={e => setProfileData(p => ({...p, phoneNo: e.target.value}))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input id="dob" type="date" value={profileData.dob} disabled={!isEditing && hasProfile} onChange={e => setProfileData(p => ({...p, dob: e.target.value}))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Input id="gender" value={profileData.gender} disabled={!isEditing && hasProfile} onChange={e => setProfileData(p => ({...p, gender: e.target.value}))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="portfolio">Portfolio URL</Label>
                    <Input id="portfolio" value={profileData.portfolio} disabled={!isEditing && hasProfile} onChange={e => setProfileData(p => ({...p, portfolio: e.target.value}))} />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={profileData.phone} disabled={!isEditing && hasProfile} onChange={e => setProfileData(p => ({...p, phone: e.target.value}))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthday">Birthday</Label>
                    <Input id="birthday" type="date" value={profileData.birthday} disabled={!isEditing && hasProfile} onChange={e => setProfileData(p => ({...p, birthday: e.target.value}))} />
                  </div>
                </>
              )}

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" rows={4} value={profileData.bio} disabled={!isEditing && hasProfile} onChange={e => setProfileData(p => ({...p, bio: e.target.value}))} placeholder="Tell us about yourself..." />
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