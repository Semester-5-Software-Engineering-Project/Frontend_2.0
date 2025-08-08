'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, Users, Video, Star, Clock, Shield } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export default function LandingPage() {
  const { login, register, isLoading } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' as 'student' | 'tutor'
  })

  const handleSubmit = async (type: 'login' | 'register') => {
    try {
      if (type === 'register') {
        await register(formData.name, formData.email, formData.password, formData.role)
        toast.success('Account created successfully!')
      } else {
        await login(formData.email, formData.password, formData.role)
        toast.success('Logged in successfully!')
      }
    } catch (error) {
      toast.error('Authentication failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">TutorConnect</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-600 hover:text-green-600 transition-colors">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-green-600 transition-colors">How it Works</a>
            <a href="#pricing" className="text-gray-600 hover:text-green-600 transition-colors">Pricing</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Connect with Expert
            <span className="text-gradient block">Tutors Online</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Join thousands of students and tutors on our platform. Schedule sessions, 
            access course materials, and learn from anywhere with integrated video conferencing.
          </p>
          
          {/* Auth Forms */}
          <div className="max-w-md mx-auto">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Welcome back</CardTitle>
                    <CardDescription>
                      Sign in to your account to continue learning
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                      />
                    </div>
                                          <div className="space-y-2">
                        <Label>Account Type</Label>
                        <div className="flex justify-center">
                          <div className="bg-gray-200 rounded-full p-1 h-8 flex items-center w-40">
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, role: 'student'})}
                            className={`flex-1 h-8 rounded-full flex items-center justify-center font-medium transition-all duration-300 ease-in-out ${
                              formData.role === 'student' 
                                ? 'bg-green-600 text-white shadow-lg transform scale-105' 
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            Student
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, role: 'tutor'})}
                            className={`flex-1 h-8 rounded-full flex items-center justify-center font-medium transition-all duration-300 ease-in-out ${
                              formData.role === 'tutor' 
                                ? 'bg-green-600 text-white shadow-lg transform scale-105' 
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            Tutor
                          </button>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleSubmit('login')} 
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>Create account</CardTitle>
                    <CardDescription>
                      Join our community of learners and tutors
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-register">Email</Label>
                      <Input
                        id="email-register"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-register">Password</Label>
                      <Input
                        id="password-register"
                        type="password"
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>I want to</Label>
                      <div className="flex justify-center">
                        <div className="bg-gray-200 rounded-full p-1 h-12 flex items-center w-40">
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, role: 'student'})}
                            className={`flex-1 h-10 rounded-full flex items-center justify-center font-medium transition-all duration-300 ease-in-out ${
                              formData.role === 'student' 
                                ? 'bg-green-600 text-white shadow-lg transform scale-105' 
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            Learn
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, role: 'tutor'})}
                            className={`flex-1 h-10 rounded-full flex items-center justify-center font-medium transition-all duration-300 ease-in-out ${
                              formData.role === 'tutor' 
                                ? 'bg-green-600 text-white shadow-lg transform scale-105' 
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            Teach
                          </button>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleSubmit('register')} 
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need to Learn</h2>
            <p className="text-xl text-gray-600">Comprehensive tools for modern online education</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Video className="w-12 h-12 text-green-600 mb-4" />
                <CardTitle>HD Video Sessions</CardTitle>
                <CardDescription>
                  High-quality video conferencing with Jitsi integration for seamless learning
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Users className="w-12 h-12 text-green-600 mb-4" />
                <CardTitle>Expert Tutors</CardTitle>
                <CardDescription>
                  Connect with qualified tutors across various subjects and skill levels
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Clock className="w-12 h-12 text-green-600 mb-4" />
                <CardTitle>Flexible Scheduling</CardTitle>
                <CardDescription>
                  Book sessions at your convenience with automated reminders and notifications
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <BookOpen className="w-12 h-12 text-green-600 mb-4" />
                <CardTitle>Course Materials</CardTitle>
                <CardDescription>
                  Access comprehensive learning materials, documents, and resources
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Shield className="w-12 h-12 text-green-600 mb-4" />
                <CardTitle>Secure Payments</CardTitle>
                <CardDescription>
                  Safe and secure payment processing for all your learning needs
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Star className="w-12 h-12 text-green-600 mb-4" />
                <CardTitle>Reviews & Ratings</CardTitle>
                <CardDescription>
                  Rate your experience and help others find the best tutors
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold">TutorConnect</span>
          </div>
          <p className="text-gray-400 mb-6">Connecting learners with expert tutors worldwide</p>
          <div className="flex justify-center space-x-8 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  )
}