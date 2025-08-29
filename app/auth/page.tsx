'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, Users } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const { login, register, isLoading, googleLogin } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: 'admin@admin.com',
    password: '*****',
    role: 'STUDENT' as 'STUDENT' | 'TUTOR'
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
    } catch (error: any) {
      const errorMessage = error.message || 'Authentication failed. Please try again.'
      toast.error(errorMessage)
    }
  }

  const handleGoogleLogin = async () => {
    await googleLogin(formData.role)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Compact Content */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-600/20"></div>
        <Image
          src="/hero.jpeg"
          alt="STUDENTs learning together"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Right Side - Compact Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-card">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">TutorVerse</span>
            </div>
          </div>

          {/* Auth Tabs */}
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 h-8">
              <TabsTrigger value="login" className="text-sm">Log In</TabsTrigger>
              <TabsTrigger value="register" className="text-sm">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card className="border-0 shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-foreground text-center">Log In</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    
                  
                  

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="email" className="text-sm">Email:</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="border-input focus:border-primary h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="password" className="text-sm">Password:</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="border-input focus:border-primary h-8 text-sm"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <Label className="text-sm align-center items-center justify-center">Login As</Label>
                      <div className="flex justify-center">
                        <div className="bg-muted rounded-full p-0.5 h-7 flex items-center w-36">
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, role: 'STUDENT'})}
                            className={`flex-1 h-6 rounded-full flex items-center justify-center font-medium transition-all duration-300 ease-in-out text-xs ${
                              formData.role === 'STUDENT' 
                                ? 'bg-primary text-primary-foreground shadow-lg transform scale-105' 
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            STUDENT
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, role: 'TUTOR'})}
                            className={`flex-1 h-6 rounded-full flex items-center justify-center font-medium transition-all duration-300 ease-in-out text-xs ${
                              formData.role === 'TUTOR' 
                                ? 'bg-primary text-primary-foreground shadow-lg transform scale-105' 
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            TUTOR
                          </button>
                        </div>
                      </div>
                    </div>


                    <Button 
                      onClick={() => handleSubmit('login')} 
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 h-9 text-sm"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Signing in...' : 'Log in'}
                    </Button>



                    <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-card px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>

                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2 h-9 text-sm"
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                    >
                      <svg width="16" height="16" viewBox="0 0 48 48" className="mr-2">
                        <g>
                          <path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C36.13 2.69 30.46 0 24 0 14.61 0 6.36 5.74 2.44 14.09l7.98 6.21C12.18 13.13 17.61 9.5 24 9.5z"/>
                          <path fill="#34A853" d="M46.1 24.55c0-1.62-.15-3.18-.43-4.68H24v9.13h12.44c-.54 2.91-2.18 5.38-4.65 7.03l7.21 5.6C43.94 37.13 46.1 31.36 46.1 24.55z"/>
                          <path fill="#FBBC05" d="M10.42 28.3c-.62-1.85-.98-3.81-.98-5.8s.36-3.95.98-5.8l-7.98-6.21C.89 13.97 0 18.81 0 24s.89 10.03 2.44 14.09l7.98-6.21z"/>
                          <path fill="#EA4335" d="M24 48c6.46 0 11.89-2.13 15.85-5.81l-7.21-5.6c-2.01 1.35-4.59 2.15-8.64 2.15-6.39 0-11.82-3.63-14.58-8.89l-7.98 6.21C6.36 42.26 14.61 48 24 48z"/>
                        </g>
                      </svg>
                      Sign in with Google
                    </Button>
                  </div>
                    
                    
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card className="border-0 shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-foreground text-center">Create Account</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  
                  
                 

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="name" className="text-sm">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="border-input focus:border-primary h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="email-register" className="text-sm">Email</Label>
                      <Input
                        id="email-register"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="border-input focus:border-primary h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="password-register" className="text-sm">Password</Label>
                      <Input
                        id="password-register"
                        type="password"
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="border-input focus:border-primary h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm">I want to</Label>
                      <div className="flex justify-center">
                        <div className="bg-muted rounded-full p-0.5 h-9 flex items-center w-36">
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, role: 'STUDENT'})}
                            className={`flex-1 h-8 rounded-full flex items-center justify-center font-medium transition-all duration-300 ease-in-out text-xs ${
                              formData.role === 'STUDENT' 
                                ? 'bg-primary text-primary-foreground shadow-lg transform scale-105' 
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            Learn
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, role: 'TUTOR'})}
                            className={`flex-1 h-8 rounded-full flex items-center justify-center font-medium transition-all duration-300 ease-in-out text-xs ${
                              formData.role === 'TUTOR' 
                                ? 'bg-primary text-primary-foreground shadow-lg transform scale-105' 
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
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 h-9 text-sm"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating account...' : 'Create Account'}
                    </Button>


                     <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs ">
                      <span className="bg-card px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>


                    <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2 h-9 text-sm"
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                    >
                      <svg width="16" height="16" viewBox="0 0 48 48" className="mr-2">
                        <g>
                          <path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C36.13 2.69 30.46 0 24 0 14.61 0 6.36 5.74 2.44 14.09l7.98 6.21C12.18 13.13 17.61 9.5 24 9.5z"/>
                          <path fill="#34A853" d="M46.1 24.55c0-1.62-.15-3.18-.43-4.68H24v9.13h12.44c-.54 2.91-2.18 5.38-4.65 7.03l7.21 5.6C43.94 37.13 46.1 31.36 46.1 24.55z"/>
                          <path fill="#FBBC05" d="M10.42 28.3c-.62-1.85-.98-3.81-.98-5.8s.36-3.95.98-5.8l-7.98-6.21C.89 13.97 0 18.81 0 24s.89 10.03 2.44 14.09l7.98-6.21z"/>
                          <path fill="#EA4335" d="M24 48c6.46 0 11.89-2.13 15.85-5.81l-7.21-5.6c-2.01 1.35-4.59 2.15-8.64 2.15-6.39 0-11.82-3.63-14.58-8.89l-7.98 6.21C6.36 42.26 14.61 48 24 48z"/>
                        </g>
                      </svg>
                      Sign up with Google
                    </Button>
                  </div>



                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
