'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { BookOpen, Users, ArrowRight, Mail, Lock, ArrowLeft } from 'lucide-react'
import { useAuth, userType } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AuthPage() {
  const { login, register, isLoading, googleLogin } = useAuth()
  const router = useRouter()
  const lottieContainer = useRef<HTMLDivElement>(null)
  const animationRef = useRef<any>(null)
  const hasLoadedRef = useRef(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: userType.STUDENT as userType
  })
  
  const [rememberMe, setRememberMe] = useState(false)

  useEffect(() => {
    // Prevent double loading in strict mode
    if (hasLoadedRef.current) return
    hasLoadedRef.current = true
    
    // Dynamically load Lottie player
    const container = lottieContainer.current
    
    const loadLottie = async () => {
      if (typeof window !== 'undefined' && container) {
        // Destroy any existing animation first
        if (animationRef.current) {
          animationRef.current.destroy()
          animationRef.current = null
        }
        
        // Clear container
        container.innerHTML = ''
        
        const lottie = (await import('lottie-web')).default
        
        animationRef.current = lottie.loadAnimation({
          container: container,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          path: '/STUDENT.json',
          rendererSettings: {
            preserveAspectRatio: 'xMidYMid meet'
          }
        })

        // Hide background groups after animation loads (conservative)
        animationRef.current.addEventListener('DOMLoaded', () => {
          const svgElement = container.querySelector('svg')
          if (!svgElement) return

          // Debug: list top-level group names/ids so we can target reliably
          const topGroups = Array.from(svgElement.querySelectorAll(':scope > g'))
          // eslint-disable-next-line no-console
          console.log('[Lottie] Top groups:', topGroups.map(g => ({
            name: g.getAttribute('data-name'), id: g.getAttribute('id')
          })))

          // Only hide exact-named background groups
          const exactNames = new Set(['Background', 'Background Complete'])
          topGroups.forEach(g => {
            const name = g.getAttribute('data-name') || ''
            const id = g.getAttribute('id') || ''
            if (exactNames.has(name) || exactNames.has(id)) {
              ;(g as unknown as HTMLElement).style.display = 'none'
            }
          })

          // Hide only very specific light beige rects (common background fills)
          const rects = svgElement.querySelectorAll('rect')
          rects.forEach((rect) => {
            const fill = (rect.getAttribute('fill') || '').toLowerCase()
            const isLightBG = ['#f4e3c7', '#f4e3c6', '#f4e3c8', '#fff7cc', '#fff6d8', '#fef7e6', '#fffbf0'].includes(fill)
            if (isLightBG) {
              ;(rect as unknown as HTMLElement).style.display = 'none'
            }
          })
        })
      }
    }
    
    loadLottie()
    
    // Cleanup function
    return () => {
      if (animationRef.current) {
        animationRef.current.destroy()
        animationRef.current = null
      }
      if (container) {
        container.innerHTML = ''
      }
      hasLoadedRef.current = false
    }
  }, [])
  
  const handleInputChange = (field: string, value: string) => {
    setFormData({...formData, [field]: value})
  }

  const handleSubmit = async (action: 'login' | 'register') => {
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      console.log('Auth form submit started:', { action, email: formData.email, role: formData.role })
      
      if (action === 'login') {
        await login(formData.email, formData.password, formData.role)
        console.log('Login successful, redirecting to dashboard')
        router.push('/dashboard')
      } else {
        await register(formData.name, formData.email, formData.password, formData.role)
        console.log('Register successful, redirecting to dashboard')
        router.push('/dashboard')
      }
      
      toast.success(`${action === 'login' ? 'Logged in' : 'Registered'} successfully`)
    } catch (error) {
      console.error('Auth error:', error)
      toast.error(`Failed to ${action}`)
    }
  }

  const handleGoogleLogin = async () => {
    await googleLogin(formData.role)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Animation */}
      <div className="hidden lg:flex lg:w-1/2 relative ">
        <div className="absolute inset-0 flex items-center justify-center p-12">
            <div ref={lottieContainer} className="w-full h-full max-w-2xl lottie-animation overflow-hidden"></div>
        </div>
      </div>

      {/* Right Side - Compact Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-card">
        <div className="w-full max-w-sm">
          {/* Back to Landing */}
          <div className="mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 px-2">
                <ArrowLeft className="w-4 h-4" />
                Back to landing page
              </Button>
            </Link>
          </div>
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-xl transform rotate-6">
                  <BookOpen className="w-7 h-7 text-black transform -rotate-6" strokeWidth={2.5} />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-black rounded-full"></div>
              </div>
              <div>
                <span className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                  Tutor
                </span>
                <span className="text-3xl font-bold text-black">
                  Verse
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 font-medium">
              Your gateway to personalized learning
            </p>
          </div>

          {/* Auth Tabs */}
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 h-10 bg-gray-100">
              <TabsTrigger 
                value="login" 
                className="text-sm data-[state=active]:bg-yellow-400 data-[state=active]:text-black font-semibold"
              >
                Log In
              </TabsTrigger>
              <TabsTrigger 
                value="register" 
                className="text-sm data-[state=active]:bg-yellow-400 data-[state=active]:text-black font-semibold"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card className="border-0 shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-foreground text-center">Log In</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-base font-normal text-foreground">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          placeholder="superadmin@example.com"
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="pl-12 h-12 bg-blue-50/50 border-blue-100 focus:border-primary focus:bg-blue-50 text-base"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-base font-normal text-foreground">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          placeholder="••••••••••"
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          className="pl-12 h-12 bg-blue-50/50 border-blue-100 focus:border-primary focus:bg-blue-50 text-base"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="remember" 
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        />
                        <label
                          htmlFor="remember"
                          className="text-sm font-normal text-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Remember me
                        </label>
                      </div>
                      <button 
                        type="button"
                        className="text-sm font-normal text-orange-500 hover:text-orange-600"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <Button 
                      onClick={() => handleSubmit('login')} 
                      className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold h-12 text-base rounded-lg group"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Signing in...' : (
                        <>
                          Continue
                          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
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
                      className="w-full flex items-center justify-center gap-2 h-11 text-sm"
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
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card className="border-0 shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-foreground text-center">Create Account</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-base font-normal text-foreground">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="h-12 bg-blue-50/50 border-blue-100 focus:border-primary focus:bg-blue-50 text-base"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email-register" className="text-base font-normal text-foreground">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="email-register"
                          type="email"
                          placeholder="john.doe@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="pl-12 h-12 bg-blue-50/50 border-blue-100 focus:border-primary focus:bg-blue-50 text-base"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password-register" className="text-base font-normal text-foreground">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="password-register"
                          type="password"
                          placeholder="Create a strong password"
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          className="pl-12 h-12 bg-blue-50/50 border-blue-100 focus:border-primary focus:bg-blue-50 text-base"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-base font-normal text-foreground">I want to</Label>
                      <div className="flex justify-center">
                        <div className="bg-muted rounded-full p-0.5 h-11 flex items-center w-40">
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, role: userType.STUDENT})}
                            className={`flex-1 h-10 rounded-full flex items-center justify-center font-medium transition-all duration-300 ease-in-out text-sm ${
                              formData.role === userType.STUDENT 
                                ? 'bg-primary text-primary-foreground shadow-lg transform scale-105' 
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            Learn
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, role: userType.TUTOR})}
                            className={`flex-1 h-10 rounded-full flex items-center justify-center font-medium transition-all duration-300 ease-in-out text-sm ${
                              formData.role === userType.TUTOR 
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
                      className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold h-12 text-base rounded-lg group"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating account...' : (
                        <>
                          Create Account
                          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
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
                      className="w-full flex items-center justify-center gap-2 h-11 text-sm"
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
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
