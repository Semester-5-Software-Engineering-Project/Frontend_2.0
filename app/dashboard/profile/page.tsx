'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Phone, 
  Globe,
  Star,
  BookOpen,
  Award,
  Edit,
  Save,
  Camera,
  Clock
} from 'lucide-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export default function Profile() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    website: 'https://portfolio.example.com',
    bio: user?.role === 'tutor' 
      ? 'Passionate mathematics tutor with 8+ years of experience teaching calculus and advanced mathematics. PhD in Mathematics from MIT.'
      : 'Computer Science student passionate about learning and technology. Currently pursuing advanced mathematics and physics.',
    specializations: user?.role === 'tutor' 
      ? ['Advanced Mathematics', 'Calculus', 'Linear Algebra', 'Statistics']
      : ['Computer Science', 'Mathematics', 'Physics'],
    education: user?.role === 'tutor'
      ? 'PhD in Mathematics - MIT, MS in Applied Mathematics - Stanford'
      : 'BS Computer Science - University of California (In Progress)',
    experience: user?.role === 'tutor' ? '8 years' : 'Student',
    hourlyRate: user?.role === 'tutor' ? '$75' : null
  })

  const handleSave = () => {
    setIsEditing(false)
    toast.success('Profile updated successfully!')
  }

  const achievements = [
    { title: 'Top Rated Tutor', description: '4.9+ average rating', icon: Star },
    { title: 'Expert Educator', description: '500+ hours taught', icon: BookOpen },
    { title: 'Student Favorite', description: '50+ positive reviews', icon: Award }
  ]

  const stats = user?.role === 'tutor' 
    ? [
        { label: 'Total Students', value: '156', icon: User },
        { label: 'Hours Taught', value: '1,240', icon: Clock },
        { label: 'Average Rating', value: '4.9', icon: Star },
        { label: 'Courses Created', value: '8', icon: BookOpen }
      ]
    : [
        { label: 'Courses Enrolled', value: '3', icon: BookOpen },
        { label: 'Hours Learned', value: '45', icon: Clock },
        { label: 'Sessions Attended', value: '12', icon: Calendar },
        { label: 'Certificates', value: '2', icon: Award }
      ]

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-gray-600">Manage your account information and preferences</p>
          </div>
          <Button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className={isEditing ? 'bg-green-600 hover:bg-green-700' : ''}
            variant={isEditing ? 'default' : 'outline'}
          >
            {isEditing ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            ) : (
              <>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="text-2xl">{user?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button 
                        size="sm" 
                        className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                        variant="secondary"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{user?.name}</h3>
                    <p className="text-gray-600 capitalize">{user?.role}</p>
                    <Badge className="mt-1 bg-green-100 text-green-700">
                      {user?.role === 'tutor' ? 'Verified Tutor' : 'Active Student'}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input 
                      id="location"
                      value={profileData.location}
                      onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {user?.role === 'tutor' && (
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate</Label>
                    <Input 
                      id="hourlyRate"
                      value={profileData.hourlyRate || ''}
                      onChange={(e) => setProfileData({...profileData, hourlyRate: e.target.value})}
                      disabled={!isEditing}
                      placeholder="$0"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input 
                    id="website"
                    type="url"
                    value={profileData.website}
                    onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                    disabled={!isEditing}
                    placeholder="https://"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    disabled={!isEditing}
                    rows={4}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="education">Education</Label>
                  <Input 
                    id="education"
                    value={profileData.education}
                    onChange={(e) => setProfileData({...profileData, education: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>

                {/* Specializations */}
                <div className="space-y-2">
                  <Label>
                    {user?.role === 'tutor' ? 'Specializations' : 'Interests'}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {profileData.specializations.map((spec, index) => (
                      <Badge key={index} variant="secondary" className="bg-green-100 text-green-700">
                        {spec}
                      </Badge>
                    ))}
                    {isEditing && (
                      <Button size="sm" variant="outline" className="h-6">
                        + Add
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements (for tutors) */}
            {user?.role === 'tutor' && (
              <Card>
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                  <CardDescription>Your teaching milestones and recognitions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <achievement.icon className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{achievement.title}</h4>
                          <p className="text-xs text-gray-500">{achievement.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profile Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.map((stat, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                      <p className="font-semibold">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  View Schedule
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  Message Center
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Star className="w-4 h-4 mr-2" />
                  Reviews & Ratings
                </Button>
                {user?.role === 'tutor' && (
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Course Analytics
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{profileData.email}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{profileData.phone}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{profileData.location}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <a 
                    href={profileData.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-green-600 hover:underline"
                  >
                    Portfolio Website
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}